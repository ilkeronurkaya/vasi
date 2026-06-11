"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.findActiveByUser = findActiveByUser;
exports.markUsed = markUsed;
async function create(env, userId, tokenHash) {
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO email_verifications (id, user_id, token_hash) VALUES (?, ?, ?)')
        .bind(id, userId, tokenHash)
        .run();
    return id;
}
async function findActiveByUser(env, userId) {
    const verification = await env.DB.prepare('SELECT * FROM email_verifications WHERE user_id = ? AND used = 0')
        .bind(userId)
        .first();
    return verification || null;
}
async function markUsed(env, verificationId) {
    await env.DB.prepare('UPDATE email_verifications SET used = 1 WHERE id = ?')
        .bind(verificationId)
        .run();
}
