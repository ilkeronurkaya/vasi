import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { messageRoutes } from './routes/messages';
const app = new Hono();
app.route('/api/v1/auth', authRoutes);
app.use('/api/v1/messages/*', authMiddleware);
app.route('/api/v1/messages', messageRoutes);
app.route('/api/v1/messages', deliveryRoutes);
export default {
    fetch: app.fetch,
    scheduled: async (event, env, ctx) => {
        ctx.waitUntil(DeliveryService.deliverDueMessages(env));
    }
};
