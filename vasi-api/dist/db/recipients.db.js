"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByMessage = findByMessage;
exports.create = create;
exports.remove = remove;
async function findByMessage(env, messageId, userId) {
    const stmt = env.DB.prepare(`SELECT * FROM recipients WHERE message_id = ? AND user_id = ?`).bind(messageId, userId);
    return await stmt.all();
}
async function create(env, messageId, userId, data) {
    const { full_name, email, phone } = data;
    const stmt = env.DB.prepare(`
    INSERT INTO recipients (id, message_id, user_id, full_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), messageId, userId, full_name, email, phone ?? null);
    return await stmt.run();
}
async function remove(env, id, messageId, userId) {
    const stmt = env.DB.prepare(`
    DELETE FROM recipients WHERE id = ? AND message_id = ? AND user_id = ?
  `).bind(id, messageId, userId);
    return await stmt.run();
}
