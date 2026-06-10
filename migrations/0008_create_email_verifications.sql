-- Migration: 0008_create_email_verifications
-- Tablo: email_verifications
-- Açıklama: Kayıt sırasında e-posta doğrulama OTP kodları.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS email_verifications (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,                             -- 6 haneli OTP'nin SHA-256 hash'i
  expires_at  TEXT NOT NULL,                             -- 10 dakika
  used        INTEGER NOT NULL DEFAULT 0,                -- 1 = kullanıldı
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
