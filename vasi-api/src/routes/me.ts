
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
    const planResult = await c.env.DB.prepare(`SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`).bind(userId).all()
    const plan = planResult.results && planResult.results.length > 0 ? planResult.results[0].plan_type : 'free'
    
    // Calculate messages used
    const messagesUsedResult = await c.env.DB.prepare(`SELECT COUNT(*) FROM messages WHERE user_id = ? AND status != 'cancelled'`).bind(userId).all()
    const messages_used = messagesUsedResult.results && messagesUsedResult.results.length > 0 ? messagesUsedResult.results[0]['COUNT(*)'] : 0
    
    // Determine message limit
    let messages_limit
    switch (plan) {
      case 'free':
        messages_limit = 10
        break
      case 'personal':
        messages_limit = 100
        break
      default:
        messages_limit = 1000
        break
    }
    
    // Return the response
    return c.json({
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
      plan: plan,
      usage: { messages_used: messages_used, messages_limit: messages_limit }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

export { me as meRoutes }
