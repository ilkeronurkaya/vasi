
import type { Env } from '../types';

export async function findById(env: Env, id: string, userId: string) {
  const stmt = env.DB.prepare(`SELECT * FROM messages WHERE id = ? AND user_id = ?`).bind(id, userId);
  return await stmt.first();
}

export async function findAllByUser(env: Env, userId: string) {
  const stmt = env.DB.prepare(`SELECT m.*, COUNT(r.id) AS recipient_count FROM messages m LEFT JOIN recipients r ON r.message_id = m.id WHERE m.user_id = ? GROUP BY m.id ORDER BY m.created_at DESC`).bind(userId);
  const result = await stmt.all();
  return result.results;
}

export async function create(env: Env, userId: string, data: any) {
  const { title, message_type, content_text } = data;
  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO messages (id, user_id, title, message_type, content_text, status)
    VALUES (?, ?, ?, ?, ?, 'draft')
  `).bind(id, userId, title, message_type, content_text).run();
  // Oluşan satırı döndür — frontend response.id bekliyor
  return await findById(env, id, userId);
}

export async function update(env: Env, id: string, userId: string, data: any) {
  const { title, message_type, content_text } = data;
  const stmt = env.DB.prepare(`
    UPDATE messages SET title = ?, message_type = ?, content_text = ?
    WHERE id = ? AND user_id = ? AND status IN ('draft', 'unlocked')
  `).bind(title, message_type, content_text, id, userId);
  return await stmt.run();
}

export async function remove(env: Env, id: string, userId: string) {
  const stmt = env.DB.prepare(`
    UPDATE messages SET status = 'cancelled'
    WHERE id = ? AND user_id = ?
  `).bind(id, userId);
  return await stmt.run();
}
