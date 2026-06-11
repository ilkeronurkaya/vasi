"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const auth_1 = require("./routes/auth");
const auth_2 = require("./middleware/auth");
const messages_1 = require("./routes/messages");
const delivery_1 = require("./routes/delivery");
const me_1 = require("./routes/me");
const admin_1 = require("./routes/admin");
const delivery_service_1 = require("./services/delivery.service");
const app = new hono_1.Hono();
app.route('/api/v1/auth', auth_1.authRoutes);
app.use('/api/v1/messages*', auth_2.authMiddleware);
app.route('/api/v1/messages', messages_1.messageRoutes);
app.route('/api/v1/messages', delivery_1.deliveryRoutes);
app.route('/api/v1/me', me_1.meRoutes);
app.route('/api/v1/admin', admin_1.adminRoutes);
exports.default = {
    fetch: app.fetch,
    scheduled: async (event, env, ctx) => {
        ctx.waitUntil(delivery_service_1.DeliveryService.deliverDueMessages(env));
    }
};
