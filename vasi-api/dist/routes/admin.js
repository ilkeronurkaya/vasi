"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const hono_1 = require("hono");
const users_db_1 = require("../db/users.db");
const jwt_1 = require("../lib/jwt");
const admin = new hono_1.Hono();
exports.adminRoutes = admin;
// ── Admin Login (public) ──────────────────────────────────────────────────
admin.post('/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
        return c.json({ error: 'email ve password zorunlu', code: 'VALIDATION_ERROR' }, 400);
    }
    // Kullanıcıyı bul
    const user = await (0, users_db_1.findByEmail)(c.env, email);
    if (!user) {
        return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401);
    }
    // is_admin kontrolü
    if (!user.is_admin) {
        return c.json({ error: 'Yetkisiz erişim', code: 'FORBIDDEN' }, 403);
    }
    // Şifre doğrulama — Web Crypto API (mevcut auth.service.ts'deki pattern):
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    if (passwordHash !== user.password_hash) {
        return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401);
    }
    // role: 'admin' ile token üret
    const accessToken = await (0, jwt_1.generateAccessToken)({ userId: user.id, role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 }, c.env.JWT_SECRET);
    return c.json({ accessToken, role: 'admin' }, 200);
});
