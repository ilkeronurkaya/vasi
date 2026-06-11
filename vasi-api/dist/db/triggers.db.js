export async function findDueMessages(env) {
    const stmt = env.DB.prepare("SELECT * FROM messages WHERE status = ? AND scheduled_at <= datetime('now')").bind('scheduled');
    return await stmt.all();
}
export async function setTrigger(env, messageId, scheduledAt) {
    const stmt = env.DB.prepare('UPDATE messages SET status = ?, scheduled_at = ? WHERE id = ?')
        .bind('scheduled', scheduledAt, messageId);
    return await stmt.run();
}
export async function markDelivered(env, messageId) {
    const stmt = env.DB.prepare("UPDATE messages SET status = ?, delivered_at = datetime('now') WHERE id = ?")
        .bind('delivered', messageId);
    return await stmt.run();
}
export async function markFailed(env, messageId, reason) {
    const stmt = env.DB.prepare('UPDATE messages SET status = ?, failed_reason = ? WHERE id = ?')
        .bind('failed', reason, messageId);
    return await stmt.run();
}
