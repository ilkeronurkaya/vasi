import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { DeliveryService } from '../services/delivery.service';
const deliveryRoutes = new Hono();
deliveryRoutes.use('*', authMiddleware);
deliveryRoutes.post('/:id/schedule', async (c) => {
    const messageId = c.req.param('id');
    const userId = c.get('userId');
    const body = await c.req.json();
    if (!body.scheduled_at)
        return c.json({ error: 'scheduled_at zorunlu', code: 'VALIDATION_ERROR' }, 400);
    const result = await DeliveryService.scheduleMessage(c.env, messageId, userId, body.scheduled_at);
    if (result.status) {
        return c.json(result, result.status);
    }
    return c.json(result, 200);
});
export { deliveryRoutes };
