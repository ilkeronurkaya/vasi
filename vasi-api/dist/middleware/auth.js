// middleware/auth.ts
import { verifyToken } from '../lib/jwt';
export async function authMiddleware(c) {
    const authHeader = c.req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
    }
    const token = authHeader.substring(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (!payload) {
        return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
    }
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    return c.next();
}
