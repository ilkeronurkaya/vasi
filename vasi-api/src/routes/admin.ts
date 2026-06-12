

import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { adminMiddleware } from '../middleware/adminAuth'
import { findByEmail } from '../db/users.db'
import { generateAccessToken } from '../lib/jwt'
import { verifyPassword } from '../lib/password'
import { DeliveryService } from '../services/delivery.service'
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

  // Şifre doğrulama — auth ile aynı PBKDF2 yolu (lib/password.ts)
  const valid = await verifyPassword(password, user.password_hash as string)
  if (!valid) {
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

// ── İstatistikler ─────────────────────────────────────────────────────────────
admin.use('/stats*', adminMiddleware)

// GET /admin/stats/overview — Genel bakış
admin.get('/stats/overview', async (c) => {
  const row = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE status != 'deleted') AS total_users,
      (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
      (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type != 'free') AS paid_subs,
      (SELECT COUNT(*) FROM messages WHERE status = 'delivered') AS total_delivered,
      (SELECT COUNT(*) FROM messages WHERE status = 'error') AS total_failed,
      (SELECT COUNT(*) FROM messages WHERE date(created_at) = date('now')) AS messages_today,
      ROUND(
        (SELECT COUNT(*) FROM messages WHERE status = 'delivered') * 100.0 /
        NULLIF((SELECT COUNT(*) FROM messages WHERE status NOT IN ('draft','cancelled')), 0),
      2) AS delivery_rate_pct
  `).first()
  return c.json(row)
})

// GET /admin/stats/messages — Günlük/aylık mesaj istatistiği (?period=daily|monthly)
admin.get('/stats/messages', async (c) => {
  const period = c.req.query('period') ?? 'daily'
  const groupBy = period === 'monthly' ? `strftime('%Y-%m', created_at)` : `date(created_at)`

  const result = await c.env.DB.prepare(`
    SELECT
      ${groupBy} AS period,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft
    FROM messages
    WHERE created_at >= datetime('now', '${period === 'monthly' ? '-12 months' : '-30 days'}')
    GROUP BY ${groupBy}
    ORDER BY period DESC
  `).all()

  return c.json({ period, data: result.results })
})

// GET /admin/stats/plans — Plan dağılımı
admin.get('/stats/plans', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT
      COALESCE(s.plan_type, 'free') AS plan_type,
      COUNT(DISTINCT u.id) AS user_count
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.status != 'deleted'
    GROUP BY COALESCE(s.plan_type, 'free')
    ORDER BY user_count DESC
  `).all()
  return c.json({ plans: result.results })
})

// ── Raporlar ──────────────────────────────────────────────────────────────────
admin.use('/reports*', adminMiddleware)

// GET /admin/reports/users — Kullanıcı başına mesaj/alıcı raporu (?page=1&limit=50)
admin.get('/reports/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '50')
  const offset = (page - 1) * limit

  const result = await c.env.DB.prepare(`
    SELECT
      u.id, u.email, u.first_name, u.last_name, u.status,
      COALESCE(s.plan_type, 'free') AS plan_type,
      COUNT(DISTINCT m.id) AS message_count,
      SUM(CASE WHEN m.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
      SUM(CASE WHEN m.status = 'error' THEN 1 ELSE 0 END) AS failed_count,
      COUNT(DISTINCT r.id) AS recipient_count,
      MAX(m.created_at) AS last_message_at
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN messages m ON m.user_id = u.id AND m.status != 'cancelled'
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE u.status != 'deleted'
    GROUP BY u.id
    ORDER BY message_count DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  return c.json({ data: result.results, page, limit })
})

// GET /admin/reports/revenue — Plan bazlı tahmini gelir
admin.get('/reports/revenue', async (c) => {
  const pricePersonal = await c.env.DB.prepare(
    `SELECT value FROM admin_settings WHERE key = 'price_personal_monthly'`
  ).first()
  const priceFamily = await c.env.DB.prepare(
    `SELECT value FROM admin_settings WHERE key = 'price_family_monthly'`
  ).first()

  const personalPrice = parseFloat((pricePersonal?.value as string) ?? '49')
  const familyPrice = parseFloat((priceFamily?.value as string) ?? '99')

  const result = await c.env.DB.prepare(`
    SELECT
      plan_type,
      COUNT(*) AS subscriber_count
    FROM subscriptions
    WHERE status = 'active' AND plan_type != 'free'
    GROUP BY plan_type
  `).all()

  const rows = result.results as Array<{ plan_type: string; subscriber_count: number }>
  const breakdown = rows.map(r => ({
    plan_type: r.plan_type,
    subscriber_count: r.subscriber_count,
    unit_price: r.plan_type === 'personal' ? personalPrice : familyPrice,
    monthly_revenue: r.subscriber_count * (r.plan_type === 'personal' ? personalPrice : familyPrice),
  }))

  const total_monthly = breakdown.reduce((sum, r) => sum + r.monthly_revenue, 0)
  return c.json({ breakdown, total_monthly_revenue: total_monthly })
})

// GET /admin/reports/failed-deliveries — Başarısız teslimatlar (?page=1&limit=30)
admin.get('/reports/failed-deliveries', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '30')
  const offset = (page - 1) * limit

  const result = await c.env.DB.prepare(`
    SELECT
      m.id AS message_id, m.title, m.status, m.created_at, m.updated_at,
      u.id AS user_id, u.email AS user_email, u.first_name, u.last_name,
      COUNT(r.id) AS recipient_count
    FROM messages m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE m.status = 'error'
    GROUP BY m.id
    ORDER BY m.updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  const totalRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM messages WHERE status = 'error'`
  ).first()

  return c.json({ data: result.results, total: totalRow?.total ?? 0, page, limit })
})

// ── Ayarlar ───────────────────────────────────────────────────────────────────
admin.use('/settings*', adminMiddleware)

// GET /admin/settings — Tüm ayarlar
admin.get('/settings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value, updated_at FROM admin_settings ORDER BY key`
  ).all()
  const settings: Record<string, string> = {}
  for (const row of result.results as Array<{ key: string; value: string }>) {
    settings[row.key] = row.value
  }
  return c.json({ settings })
})

// PUT /admin/settings — Tek ayar güncelle
admin.put('/settings', async (c) => {
  const { key, value } = await c.req.json()
  if (!key || value === undefined) {
    return c.json({ error: 'key ve value zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }
  const existing = await c.env.DB.prepare(
    `SELECT key FROM admin_settings WHERE key = ?`
  ).bind(key).first()
  if (!existing) {
    return c.json({ error: 'Bilinmeyen ayar anahtarı', code: 'NOT_FOUND' }, 404)
  }
  await c.env.DB.prepare(
    `UPDATE admin_settings SET value = ?, updated_at = datetime('now') WHERE key = ?`
  ).bind(String(value), key).run()
  return c.json({ success: true, key, value: String(value) })
})

// ── Teslimat ──────────────────────────────────────────────────────────────────
admin.use('/delivery*', adminMiddleware)

// POST /admin/delivery/run-due — vadesi gelen mesajları hemen teslim et (test/manuel)
admin.post('/delivery/run-due', async (c) => {
  const result = await DeliveryService.deliverDueMessages(c.env)
  return c.json({ success: true, ...result })
})

// POST /admin/delivery/retry/:messageId — başarısız teslimatları yeniden zamanla/kuyruğa al
admin.post('/delivery/retry/:messageId', async (c) => {
  const messageId = c.req.param('messageId')

  const message = await c.env.DB.prepare(
    'SELECT * FROM messages WHERE id = ?'
  ).bind(messageId).first()

  if (!message) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }

  if (message.status !== 'error') {
    return c.json({ error: 'Mesaj durumu error olmalı', code: 'INVALID_STATUS' }, 409)
  }

  const now = new Date().toISOString()
  await c.env.DB.prepare(
    "UPDATE messages SET status = ?, scheduled_at = ?, failed_reason = NULL, updated_at = datetime('now') WHERE id = ?"
  ).bind('scheduled', now, messageId).run()

  return c.json({ success: true }, 200)
})
