
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
