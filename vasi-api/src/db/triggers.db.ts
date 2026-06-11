
import type { Env } from '../types';

export async function findDueMessages(env: Env) {
  const stmt = env.DB.prepare("SELECT * FROM messages WHERE status = ? AND scheduled_at <= datetime('now')").bind('scheduled');
  return await stmt.all();
}

export async function setTrigger(env: Env, messageId: string, scheduledAt: string) {
  const stmt = env.DB.prepare('UPDATE messages SET status = ?, scheduled_at = ? WHERE id = ?')
    .bind('scheduled', scheduledAt, messageId);
  return await stmt.run();
}

export async function markDelivered(env: Env, messageId: string) {
  const stmt = env.DB.prepare("UPDATE messages SET status = ?, delivered_at = datetime('now') WHERE id = ?")
    .bind('delivered', messageId);
  return await stmt.run();
}

export async function markFailed(env: Env, messageId: string, reason: string) {
  // Şemadaki CHECK kısıtı 'failed' değil 'error' kabul eder (0003_create_messages.sql);
  // admin istatistikleri de status='error' sayar.
  const stmt = env.DB.prepare('UPDATE messages SET status = ?, failed_reason = ? WHERE id = ?')
    .bind('error', reason, messageId);
  return await stmt.run();
}
