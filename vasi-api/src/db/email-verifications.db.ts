
// db/email-verifications.db.ts
import type { Env } from '../types'

export async function create(env: Env, userId: string, codeHash: string): Promise<string> {
  const id = crypto.randomUUID()
  // Şema sütunu code_hash (0008) — token_hash diye sütun yok; expires_at NOT NULL (10 dk)
  await env.DB.prepare(
    "INSERT INTO email_verifications (id, user_id, code_hash, expires_at) VALUES (?, ?, ?, datetime('now', '+10 minutes'))"
  )
    .bind(id, userId, codeHash)
    .run()
  return id
}

export async function findActiveByUser(env: Env, userId: string): Promise<any | null> {
  const verification = await env.DB.prepare('SELECT * FROM email_verifications WHERE user_id = ? AND used = 0')
    .bind(userId)
    .first()
  return verification || null
}

export async function markUsed(env: Env, verificationId: string): Promise<void> {
  await env.DB.prepare('UPDATE email_verifications SET used = 1 WHERE id = ?')
    .bind(verificationId)
    .run()
}
