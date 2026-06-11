
import { Hono } from 'hono'
import type { Env } from '../types'

// Herkese açık endpoint'ler — auth YOK (landing page kullanır)
const pub = new Hono<{ Bindings: Env }>()

pub.get('/pricing', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value FROM admin_settings WHERE key IN
     ('plan_limit_free','plan_limit_personal','recipient_limit_free',
      'recipient_limit_personal','price_personal_monthly','price_family_monthly')`
  ).all()
  const pricing: Record<string, string> = {}
  for (const row of (result.results ?? []) as Array<{ key: string; value: string }>) {
    pricing[row.key] = row.value
  }
  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ pricing })
})

export { pub as publicRoutes }
