
// db/email-verifications.db.ts
import type { Env } from '../types'

export async function create(env: Env, userId: string, tokenHash: string): Promise<string> {
  const id = crypto.randomUUID()
  await env.DB.prepare('INSERT INTO email_verifications (id, user_id, token_hash) VALUES (?, ?, ?)')
    .bind(id, userId, tokenHash)
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
