
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { findById } from '../db/users.db'
import type { Env } from '../types'

const me = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

me.use('*', authMiddleware)

me.get('/', async (c) => {
  const userId = c.get('userId')
  
  try {
    // Fetch user details
    const user = await findById(c.env, userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    
    // Fetch subscription plan type
    const planResult = await c.env.DB.prepare(`SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`).bind(userId).first()
    const planSlug = (planResult?.plan_type as string) ?? 'free'
    
    // Fetch plan details
    const plan = await c.env.DB.prepare(`SELECT * FROM plans WHERE slug = ?`).bind(planSlug).first()
    const messages_limit = (plan?.message_limit as number) ?? 10
    
    // Calculate messages used
    const messagesUsedResult = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM messages WHERE user_id = ? AND status != 'cancelled'`).bind(userId).first()
    const messages_used = (messagesUsedResult?.n as number) ?? 0
    
    // Return the response
    return c.json({
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      plan: planSlug,
      usage: { messages_used: messages_used, messages_limit: messages_limit }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

export { me as meRoutes }
