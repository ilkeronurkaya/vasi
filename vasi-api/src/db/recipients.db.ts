
import type { Env } from '../types';

export async function findByMessage(env: Env, messageId: string, userId: string) {
  const stmt = env.DB.prepare(`SELECT * FROM recipients WHERE message_id = ? AND user_id = ?`).bind(messageId, userId);
  return await stmt.all();
}

export async function create(env: Env, messageId: string, userId: string, data: Record<string, string>) {
  const { full_name, email, phone } = data;
  const stmt = env.DB.prepare(`
    INSERT INTO recipients (id, message_id, user_id, full_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(crypto.randomUUID(), messageId, userId, full_name, email, phone ?? null);
  return await stmt.run();
}

export async function remove(env: Env, id: string, messageId: string, userId: string) {
  const stmt = env.DB.prepare(`
    DELETE FROM recipients WHERE id = ? AND message_id = ? AND user_id = ?
  `).bind(id, messageId, userId);
  return await stmt.run();
}
