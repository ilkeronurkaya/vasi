"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
// routes/auth.ts
const hono_1 = require("hono");
const auth_service_1 = require("../services/auth.service");
const authRoutes = new hono_1.Hono();
exports.authRoutes = authRoutes;
function statusCode(result) {
    return (result.status || 400);
}
authRoutes.post('/register', async (c) => {
    const body = await c.req.json();
    const result = await auth_service_1.AuthService.register(c.env, body);
    if (result.error)
        return c.json(result, statusCode(result));
    return c.json(result, 201);
});
authRoutes.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    const result = await auth_service_1.AuthService.login(c.env, email, password);
    if (result.error)
        return c.json(result, statusCode(result));
    return c.json(result, 200);
});
authRoutes.post('/verify-email', async (c) => {
    const { email, otp } = await c.req.json();
    const result = await auth_service_1.AuthService.verifyEmail(c.env, email, otp);
    if (result.error)
        return c.json(result, statusCode(result));
    return c.json(result, 200);
});
authRoutes.post('/logout', async (c) => {
    const { refreshToken } = await c.req.json();
    const result = await auth_service_1.AuthService.logout(c.env, refreshToken);
    if (result.error)
        return c.json(result, statusCode(result));
    return c.json(result, 200);
});
authRoutes.post('/refresh', async (c) => {
    const { refreshToken } = await c.req.json();
    const result = await auth_service_1.AuthService.refresh(c.env, refreshToken);
    if (result.error)
        return c.json(result, statusCode(result));
    return c.json(result, 200);
});
