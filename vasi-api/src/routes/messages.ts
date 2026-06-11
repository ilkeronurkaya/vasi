
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { MessageService } from '../services/message.service'
import type { Env } from '../types'

const messages = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

messages.use('*', authMiddleware)

messages.get('/', async (c) => {
  const userId = c.get('userId')
  try {
    const result = await MessageService.listMessages(c.env, userId)
    return c.json(result)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.post('/', async (c) => {
  const userId = c.get('userId')
  try {
    const body = await c.req.json()
    // Validation
    if (!body.title || !body.message_type || !body.content_text) return c.json({ error: 'title, message_type, and content_text are required', code: 'VALIDATION_ERROR' }, 400)
    const planRow = await c.env.DB.prepare(
  `SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`
).bind(userId).first()
const plan = (planRow?.plan_type as string) ?? 'free'
const limitKey = plan === 'free' ? 'plan_limit_free'
  : plan === 'personal' ? 'plan_limit_personal'
  : 'plan_limit_unlimited'
const limitRow = await c.env.DB.prepare(
  `SELECT value FROM admin_settings WHERE key = ?`
).bind(limitKey).first()
const limit = parseInt((limitRow?.value as string) ?? (plan === 'free' ? '10' : plan === 'personal' ? '100' : '1000'))
const countRow = await c.env.DB.prepare(
  `SELECT COUNT(*) AS n FROM messages WHERE user_id = ? AND status != 'cancelled'`
).bind(userId).first()
if (((countRow?.n as number) ?? 0) >= limit) {
  return c.json({ error: 'Mesaj limitine ulaştın', code: 'LIMIT_REACHED', limit }, 403)
}
const message = await MessageService.createMessage(c.env, userId, body)
    return c.json(message, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.get('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  try {
    const message = await MessageService.getMessage(c.env, id, userId)
    return c.json(message)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    // Validation
    if (!body.title || !body.message_type || !body.content_text) return c.json({ error: 'title, message_type, and content_text are required', code: 'VALIDATION_ERROR' }, 400)
    const message = await MessageService.updateMessage(c.env, id, userId, body)
    return c.json(message)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  try {
    await MessageService.deleteMessage(c.env, id, userId)
    return c.json({ message: 'Message deleted' })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.post('/:id/recipients', async (c) => {
  const userId = c.get('userId')
  const messageId = c.req.param('id')
  try {
    const body = await c.req.json()
    // Validation
    if (!body.full_name || !body.email) return c.json({ error: 'full_name and email are required', code: 'VALIDATION_ERROR' }, 400)
    const recipient = await MessageService.addRecipient(c.env, messageId, userId, body)
    return c.json(recipient, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

messages.delete('/:id/recipients/:rid', async (c) => {
  const userId = c.get('userId')
  const messageId = c.req.param('id')
  const recipientId = c.req.param('rid')
  try {
    await MessageService.removeRecipient(c.env, recipientId, messageId, userId)
    return c.json({ message: 'Recipient deleted' })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

export { messages as messageRoutes }
