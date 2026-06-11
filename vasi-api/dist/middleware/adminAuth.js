import { verifyToken } from '../lib/jwt';
export async function adminMiddleware(c, next) {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }
    const token = authHeader.substring(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (!payload) {
        return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
    }
    if (payload.role !== 'admin') {
        return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
    }
    c.set('userId', payload.userId);
    c.set('role', 'admin');
    await next();
}
