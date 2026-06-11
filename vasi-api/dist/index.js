import { Hono } from 'hono';
import { authRoutes } from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { messageRoutes } from './routes/messages';
import { deliveryRoutes } from './routes/delivery';
import { meRoutes } from './routes/me';
import { adminRoutes } from './routes/admin';
import { DeliveryService } from './services/delivery.service';
const app = new Hono();
app.route('/api/v1/auth', authRoutes);
app.use('/api/v1/messages*', authMiddleware);
app.route('/api/v1/messages', messageRoutes);
app.route('/api/v1/messages', deliveryRoutes);
app.route('/api/v1/me', meRoutes);
app.route('/api/v1/admin', adminRoutes);
export default {
    fetch: app.fetch,
    scheduled: async (event, env, ctx) => {
        ctx.waitUntil(DeliveryService.deliverDueMessages(env));
    }
};
