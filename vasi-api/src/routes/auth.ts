
// routes/auth.ts
import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { Env } from '../types'
import { AuthService } from '../services/auth.service'

const authRoutes = new Hono<{ Bindings: Env }>()

function statusCode(result: Record<string, unknown>): ContentfulStatusCode {
  return ((result.status as number) || 400) as ContentfulStatusCode
}

authRoutes.post('/register', async (c) => {
  const body = await c.req.json()
  const result = await AuthService.register(c.env, body)
  if (result.error) return c.json(result, statusCode(result))
  return c.json(result, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json()
  const { email, password } = body
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return c.json({ error: 'E-posta ve şifre zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }
  const result = await AuthService.login(c.env, email, password)
  if (result.error) return c.json(result, statusCode(result))
  return c.json(result, 200)
})

authRoutes.post('/verify-email', async (c) => {
  const { email, otp } = await c.req.json()
  const result = await AuthService.verifyEmail(c.env, email, otp)
  if (result.error) return c.json(result, statusCode(result))
  return c.json(result, 200)
})

authRoutes.post('/logout', async (c) => {
  const { refreshToken } = await c.req.json()
  const result = await AuthService.logout(c.env, refreshToken)
  if (result.error) return c.json(result, statusCode(result))
  return c.json(result, 200)
})

authRoutes.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json()
  const result = await AuthService.refresh(c.env, refreshToken)
  if (result.error) return c.json(result, statusCode(result))
  return c.json(result, 200)
})

export { authRoutes }
