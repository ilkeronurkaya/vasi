
// middleware/auth.ts
import type { Next } from 'hono'
import { verifyToken } from '../lib/jwt'

export async function authMiddleware(c: any, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)

  if (!payload) {
    return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401)
  }

  c.set('userId', (payload as any).userId)
  c.set('role', (payload as any).role)

  await next()
}
