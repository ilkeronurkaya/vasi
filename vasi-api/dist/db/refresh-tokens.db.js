export async function create(env, userId, tokenHash) {
    const id = crypto.randomUUID();
    await env.DB.prepare('INSERT INTO refresh_tokens (id, user_id, token_hash) VALUES (?, ?, ?)')
        .bind(id, userId, tokenHash)
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
