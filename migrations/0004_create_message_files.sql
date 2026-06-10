-- Migration: 0004_create_message_files
-- Tablo: message_files
-- Açıklama: Mesaja eklenen ses ve fotoğraf dosyaları (R2'de saklanır).
--
-- migrate:up

CREATE TABLE IF NOT EXISTS message_files (
  id              TEXT PRIMARY KEY,
  message_id      TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_type       TEXT NOT NULL
                  CHECK (file_type IN ('audio', 'photo')),
  storage_key     TEXT NOT NULL,                         -- AES-256-GCM şifreli R2 key
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  duration_sec    INTEGER,                               -- Yalnızca ses için
  mime_type       TEXT,                                  -- Örn: image/jpeg, audio/mp4
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_message_files_message_id ON message_files(message_id);

-- migrate:down
DROP TABLE IF EXISTS message_files;
