
import type { Env } from '../types';

// NOT: recipients tablosunda user_id kolonu YOK (bkz. 0005_create_recipients.sql).
// Sahiplik kontrolü message üzerinden yapılır (MessageService önce mesajı doğrular).

export async function findByMessage(env: Env, messageId: string) {
  const stmt = env.DB.prepare(`SELECT * FROM recipients WHERE message_id = ?`).bind(messageId);
  return await stmt.all();
}

export async function create(env: Env, messageId: string, data: Record<string, string>) {
  const { full_name, email, phone } = data;
  const id = crypto.randomUUID();
  await env.DB.prepare(`
    INSERT INTO recipients (id, message_id, full_name, email, phone)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, messageId, full_name, email, phone ?? null).run();
  return await env.DB.prepare(`SELECT id, full_name, email FROM recipients WHERE id = ?`).bind(id).first();
}

export async function remove(env: Env, id: string, messageId: string) {
  const stmt = env.DB.prepare(`
    DELETE FROM recipients WHERE id = ? AND message_id = ?
  `).bind(id, messageId);
  return await stmt.run();
}
