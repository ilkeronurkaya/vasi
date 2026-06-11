export async function create(env, userId, tokenHash) {
    const id = crypto.randomUUID();
    // expires_at: 30 gün
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)')
        .bind(id, userId, tokenHash, expiresAt)
        .run();
    return id;
}
export async function findByHash(env, hash) {
    const token = await env.DB.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?')
        .bind(hash)
        .first();
    return token || null;
}
export async function revoke(env, tokenId) {
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE id = ?')
        .bind(tokenId)
        .run();
}
export async function revokeAllForUser(env, userId) {
    await env.DB.prepare('DELETE FROM refresh_tokens WHERE user_id = ?')
        .bind(userId)
        .run();
}
