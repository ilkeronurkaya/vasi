-- Migration: 0006_create_triggers
-- Tablo: triggers
-- Açıklama: Mesaj gönderim zamanlaması. MVP'de yalnızca one_time.
-- Not: Uzun vadeli mesajlar (10+ yıl) D1'de saklanır;
--      cron job her sabah bu tabloyu kontrol eder.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS triggers (
  id            TEXT PRIMARY KEY,
  message_id    TEXT NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
  trigger_type  TEXT NOT NULL DEFAULT 'one_time'
                CHECK (trigger_type IN ('one_time')),    -- Gelecekte: 'recurring' eklenecek
  scheduled_at  TEXT NOT NULL,                           -- ISO 8601; gönderilecek zaman
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'processing', 'completed', 'cancelled', 'error')),
  processed_at  TEXT,                                    -- Queue'ya eklendiği an
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_triggers_scheduled_at ON triggers(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_triggers_status       ON triggers(status);

-- migrate:down
DROP TABLE IF EXISTS triggers;
