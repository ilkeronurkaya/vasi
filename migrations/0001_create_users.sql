-- Migration: 0001_create_users
-- Tablo: users
-- Açıklama: Kayıtlı kullanıcılar. TC Kimlik No alınmıyor (PRD v2).
--
-- migrate:up

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                        -- UUID (uygulamada üretilir)
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,                           -- PBKDF2 + salt
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  phone         TEXT,                                    -- Opsiyonel, şifreli
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'suspended', 'deleted')),
  email_verified INTEGER NOT NULL DEFAULT 0,             -- 0 = false, 1 = true
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
