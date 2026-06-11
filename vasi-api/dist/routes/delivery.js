"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryRoutes = void 0;
const hono_1 = require("hono");
const auth_1 = require("../middleware/auth");
const delivery_service_1 = require("../services/delivery.service");
const deliveryRoutes = new hono_1.Hono();
exports.deliveryRoutes = deliveryRoutes;
deliveryRoutes.use('*', auth_1.authMiddleware);
deliveryRoutes.post('/:id/schedule', async (c) => {
    const messageId = c.req.param('id');
    const userId = c.get('userId');
    const body = await c.req.json();
    if (!body.scheduled_at)
        return c.json({ error: 'scheduled_at zorunlu', code: 'VALIDATION_ERROR' }, 400);
    const result = await delivery_service_1.DeliveryService.scheduleMessage(c.env, messageId, userId, body.scheduled_at);
    if (result.status) {
        return c.json(result, result.status);
    }
    return c.json(result, 200);
});
