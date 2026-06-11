
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

// Alıcı mesaj görüntüleme — e-postadaki linkin hedefi (token bazlı, auth yok)
pub.get('/view/:token', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Geçersiz bağlantı', code: 'NOT_FOUND' }, 404)
  }
  const row = await c.env.DB.prepare(`
    SELECT r.id AS recipient_id, r.full_name AS recipient_name,
           m.title, m.content_text, m.delivered_at,
           u.first_name AS sender_name
    FROM recipients r
    JOIN messages m ON m.id = r.message_id
    JOIN users u ON u.id = m.user_id
    WHERE r.access_token = ?
  `).bind(token).first()
  if (!row) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }
  await c.env.DB.prepare(
    "UPDATE recipients SET accessed_at = datetime('now') WHERE id = ?"
  ).bind(row.recipient_id).run()
  return c.json({
    title: row.title,
    content_text: row.content_text,
    sender_name: row.sender_name,
    recipient_name: row.recipient_name,
    delivered_at: row.delivered_at,
  })
})

export { pub as publicRoutes }
