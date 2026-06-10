-- Migration: 0003_create_messages
-- Tablo: messages
-- Açıklama: Kullanıcıların oluşturduğu mesajlar.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS messages (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT,
  message_type  TEXT NOT NULL
                CHECK (message_type IN ('text', 'audio', 'photo', 'mixed')),
  content_text  TEXT,                                    -- AES-256-GCM şifreli; text/mixed için
  is_locked     INTEGER NOT NULL DEFAULT 0,              -- 0 = düzenlenebilir, 1 = kilitli
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'scheduled', 'delivered', 'cancelled', 'error')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status  ON messages(status);
