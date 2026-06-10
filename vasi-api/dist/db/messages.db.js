export async function findById(env, id, userId) {
    const stmt = env.DB.prepare(`SELECT * FROM messages WHERE id = ? AND user_id = ?`).bind(id, userId);
    return await stmt.first();
}
export async function findAllByUser(env, userId) {
    const stmt = env.DB.prepare(`SELECT * FROM messages WHERE user_id = ?`).bind(userId);
    return await stmt.all();
}
export async function create(env, userId, data) {
    const { title, message_type, content_text } = data;
    const stmt = env.DB.prepare(`
    INSERT INTO messages (id, user_id, title, message_type, content_text, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).bind(crypto.randomUUID(), userId, title, message_type, content_text);
    return await stmt.run();
}
export async function update(env, id, userId, data) {
    const { title, message_type, content_text } = data;
    const stmt = env.DB.prepare(`
    UPDATE messages SET title = ?, message_type = ?, content_text = ?
    WHERE id = ? AND user_id = ? AND status IN ('draft', 'unlocked')
  `).bind(title, message_type, content_text, id, userId);
    return await stmt.run();
}
export async function remove(env, id, userId) {
    const stmt = env.DB.prepare(`
    UPDATE messages SET status = 'cancelled'
    WHERE id = ? AND user_id = ?
  `).bind(id, userId);
    return await stmt.run();
}
