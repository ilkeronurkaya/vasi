

import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { adminMiddleware } from '../middleware/adminAuth'
import { findByEmail } from '../db/users.db'
import { generateAccessToken } from '../lib/jwt'
import type { Env } from '../types'

const admin = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>()

// ── Admin Login (public) ──────────────────────────────────────────────────
admin.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ error: 'email ve password zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }

  // Kullanıcıyı bul
  const user = await findByEmail(c.env, email)
  if (!user) {
    return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401)
  }

  // is_admin kontrolü
  if (!user.is_admin) {
    return c.json({ error: 'Yetkisiz erişim', code: 'FORBIDDEN' }, 403)
  }

  // Şifre doğrulama — Web Crypto API (mevcut auth.service.ts'deki pattern):
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (passwordHash !== user.password_hash) {
    return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401)
  }

  // role: 'admin' ile token üret
  const accessToken = await generateAccessToken(
    { userId: user.id, role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 },
    c.env.JWT_SECRET
  )

  return c.json({ accessToken, role: 'admin' }, 200)
})

export { admin as adminRoutes }


// ── Admin User Management ───────────────────────────────────────────────

admin.use('/users*', adminMiddleware)

// 1. GET /admin/users — Kullanıcı listesi (sayfalı, filtrelenebilir)
admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '20')
  const offset = (page - 1) * limit
  const status = c.req.query('status')   // 'active' | 'suspended' | 'deleted' | undefined
  const plan = c.req.query('plan')       // 'free' | 'personal' | undefined
  const q = c.req.query('q')            // email veya ad arama

  let query = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.status, u.email_verified,
           u.is_admin, u.created_at,
           COALESCE(s.plan_type, 'free') AS plan_type, s.status AS sub_status,
           COUNT(DISTINCT m.id) AS message_count
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN messages m ON m.user_id = u.id AND m.status != 'cancelled'
    WHERE 1=1
  `
  const bindings: any[] = []

  if (status) { query += ` AND u.status = ?`; bindings.push(status) }
  if (plan === 'free') { query += ` AND (s.plan_type IS NULL OR s.plan_type = 'free')`; }
  else if (plan) { query += ` AND s.plan_type = ?`; bindings.push(plan) }
  if (q) { query += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`; bindings.push(`%${q}%`, `%${q}%`, `%${q}%`) }

  query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
  bindings.push(limit, offset)

  const result = await c.env.DB.prepare(query).bind(...bindings).all()

  const countQuery = `SELECT COUNT(DISTINCT u.id) AS total FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE 1=1`
  const totalRow = await c.env.DB.prepare(countQuery).first()

  return c.json({ users: result.results, total: totalRow?.total ?? 0, page, limit })
})

// 2. GET /admin/users/:id — Kullanıcı detayı
admin.get('/users/:id', async (c) => {
  const id = c.req.param('id')

  const user = await c.env.DB.prepare(`
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
           u.status, u.email_verified, u.is_admin, u.created_at, u.updated_at,
           COALESCE(s.plan_type, 'free') AS plan_type, s.status AS sub_status,
           s.started_at, s.expires_at, s.last_payment_at
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.id = ?
  `).bind(id).first()

  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT m.id) AS message_count,
      SUM(CASE WHEN m.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
      SUM(CASE WHEN m.status = 'error' THEN 1 ELSE 0 END) AS failed_count,
      COUNT(DISTINCT r.id) AS recipient_count
    FROM messages m
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE m.user_id = ? AND m.status != 'cancelled'
  `).bind(id).first()

  return c.json({ user, stats })
})

// 3. PATCH /admin/users/:id/status — Askıya al / aktifleştir
admin.patch('/users/:id/status', async (c) => {
  const id = c.req.param('id')
  const adminId = c.get('userId')
  const { status } = await c.req.json()

  if (!['active', 'suspended'].includes(status)) {
    return c.json({ error: 'Geçersiz status. active veya suspended olmalı.', code: 'VALIDATION_ERROR' }, 400)
  }

  const user = await c.env.DB.prepare(`SELECT id FROM users WHERE id = ?`).bind(id).first()
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  await c.env.DB.prepare(
    `UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(status, id).run()

  // Audit log
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES (?, ?, ?, 'user', ?, ?, datetime('now'))
  `).bind(crypto.randomUUID(), adminId, `admin_status_change_${status}`, id, c.req.header('CF-Connecting-IP') ?? '').run()

  return c.json({ success: true, status })
})

// 4. PATCH /admin/users/:id/plan — Plan değiştir
admin.patch('/users/:id/plan', async (c) => {
  const id = c.req.param('id')
  const adminId = c.get('userId')
  const { plan_type } = await c.req.json()

  if (!['free', 'personal'].includes(plan_type)) {
    return c.json({ error: 'Geçersiz plan_type. free veya personal olmalı.', code: 'VALIDATION_ERROR' }, 400)
  }

  const user = await c.env.DB.prepare(`SELECT id FROM users WHERE id = ?`).bind(id).first()
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  // Aktif subscription varsa güncelle, yoksa oluştur
  const existing = await c.env.DB.prepare(
    `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'`
  ).bind(id).first()

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE subscriptions SET plan_type = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(plan_type, existing.id).run()
  } else {
    await c.env.DB.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_type, status, started_at, created_at, updated_at)
      VALUES (?, ?, ?, 'active', datetime('now'), datetime('now'), datetime('now'))
    `).bind(crypto.randomUUID(), id, plan_type).run()
  }

  // Audit log
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES (?, ?, ?, 'subscription', ?, ?, datetime('now'))
  `).bind(crypto.randomUUID(), adminId, `admin_plan_change_${plan_type}`, id, c.req.header('CF-Connecting-IP') ?? '').run()

  return c.json({ success: true, plan_type })
})
