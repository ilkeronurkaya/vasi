
// db/email-verifications.db.ts
import type { Env } from '../types'

export async function create(env: Env, userId: string, codeHash: string, purpose: string): Promise<string> {
  const id = crypto.randomUUID()
  // Şema sütunu code_hash (0008) — token_hash diye sütun yok; expires_at NOT NULL (10 dk); purpose (0018)
  await env.DB.prepare(
    "INSERT INTO email_verifications (id, user_id, code_hash, purpose, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))"
  )
    .bind(id, userId, codeHash, purpose)
    .run()
  return id
}

export async function findActiveByUser(env: Env, userId: string, purpose: string): Promise<any | null> {
  // Süre kontrolü SQL'de — süresi geçmiş kod (expires_at <= now) aktif sayılmaz; purpose (0018)
  const verification = await env.DB.prepare(
    "SELECT * FROM email_verifications WHERE user_id = ? AND purpose = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC, rowid DESC LIMIT 1"
  )
    .bind(userId, purpose)
    .first()
  return verification || null
}

export async function markUsed(env: Env, verificationId: string): Promise<void> {
  await env.DB.prepare('UPDATE email_verifications SET used = 1 WHERE id = ?')
    .bind(verificationId)
    .run()
}
