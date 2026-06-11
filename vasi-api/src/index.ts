
import { Hono } from 'hono'
import type { Env } from './types'
import { authRoutes } from './routes/auth'
import { authMiddleware } from './middleware/auth'
import { messageRoutes } from './routes/messages'
import { deliveryRoutes } from './routes/delivery'
import { meRoutes } from './routes/me'
import { adminRoutes } from './routes/admin'
import { publicRoutes } from './routes/public'

import { DeliveryService } from './services/delivery.service'

const app = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

app.route('/api/v1/auth', authRoutes)

app.use('/api/v1/messages*', authMiddleware)
app.route('/api/v1/messages', messageRoutes)
app.route('/api/v1/messages', deliveryRoutes)
app.route('/api/v1/me', meRoutes)
app.route('/api/v1/admin', adminRoutes)
app.route('/api/v1/public', publicRoutes)


export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
    ctx.waitUntil(DeliveryService.deliverDueMessages(env))
  }
}
