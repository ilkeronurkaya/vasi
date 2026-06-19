
// db/users.db.ts
import type { Env } from '../types'

export async function findByEmail(env: Env, email: string): Promise<any | null> {
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first()
  return user || null
}

export async function findById(env: Env, id: string): Promise<any | null> {
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first()
  return user || null
}

export async function create(env: Env, userData: any): Promise<string> {
  const { email, password_hash, first_name, last_name, phone, status } = userData
  const id = crypto.randomUUID()

  // D1 undefined kabul etmez (D1_TYPE_ERROR) — opsiyonel alanlar null'a düşer
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, first_name, last_name, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, email, password_hash, first_name ?? null, last_name ?? null, phone ?? null, status)
    .run()

  return id
}

export async function updateEmailVerified(env: Env, userId: string): Promise<void> {
  await env.DB.prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
    .bind(userId)
    .run()
}

export async function updateLanguage(env: Env, userId: string, language: string): Promise<void> {
  await env.DB.prepare('UPDATE users SET language = ? WHERE id = ?')
    .bind(language, userId)
    .run()
}

export async function updateProfile(env: Env, userId: string, fields: { first_name?: string; last_name?: string; phone?: string }): Promise<void> {
  const parts: string[] = []
  const bindings: any[] = []

  if (fields.first_name !== undefined) { parts.push('first_name = ?'); bindings.push(fields.first_name ?? null) }
  if (fields.last_name !== undefined) { parts.push('last_name = ?'); bindings.push(fields.last_name ?? null) }
  if (fields.phone !== undefined) { parts.push('phone = ?'); bindings.push(fields.phone ?? null) }

  if (parts.length === 0) return
  parts.push("updated_at = datetime('now')")
  bindings.push(userId)

  await env.DB.prepare(
    `UPDATE users SET ${parts.join(', ')} WHERE id = ?`
  ).bind(...bindings).run()
}

export async function updateEmail(env: Env, userId: string, newEmail: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE users SET email = ?, email_verified = 0, updated_at = datetime('now') WHERE id = ?"
  ).bind(newEmail, userId).run()
}

export async function updatePassword(env: Env, userId: string, passwordHash: string): Promise<void> {
  await env.DB.prepare(
    "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(passwordHash, userId).run()
}
