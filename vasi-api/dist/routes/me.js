"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meRoutes = void 0;
const hono_1 = require("hono");
const auth_1 = require("../middleware/auth");
const users_db_1 = require("../db/users.db");
const me = new hono_1.Hono();
exports.meRoutes = me;
me.use('*', auth_1.authMiddleware);
me.get('/', async (c) => {
    const userId = c.get('userId');
    try {
        // Fetch user details
        const user = await (0, users_db_1.findById)(c.env, userId);
        if (!user)
            return c.json({ error: 'User not found' }, 404);
        // Fetch subscription plan type
        const planResult = await c.env.DB.prepare(`SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`).bind(userId).all();
        const plan = planResult.results && planResult.results.length > 0 ? planResult.results[0].plan_type : 'free';
        // Calculate messages used
        const messagesUsedResult = await c.env.DB.prepare(`SELECT COUNT(*) FROM messages WHERE user_id = ? AND status != 'cancelled'`).bind(userId).all();
        const messages_used = messagesUsedResult.results && messagesUsedResult.results.length > 0 ? messagesUsedResult.results[0]['COUNT(*)'] : 0;
        // Determine message limit
        let messages_limit;
        switch (plan) {
            case 'free':
                messages_limit = 10;
                break;
            case 'personal':
                messages_limit = 100;
                break;
            default:
                messages_limit = 1000;
                break;
        }
        // Return the response
        return c.json({
            user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
            plan: plan,
            usage: { messages_used: messages_used, messages_limit: messages_limit }
        });
    }
    catch (error) {
        return c.json({ error: error.message }, 400);
    }
});
