-- Migration: 0013_add_delivery_columns
-- Açıklama: Teslimat akışının kullandığı ama şemada eksik olan kolonlar
-- (triggers.db.ts scheduled_at/delivered_at/failed_reason güncelliyor — Tester Ajani bulgusu)

ALTER TABLE messages ADD COLUMN scheduled_at TEXT;
ALTER TABLE messages ADD COLUMN delivered_at TEXT;
ALTER TABLE messages ADD COLUMN failed_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_scheduled_at ON messages(scheduled_at);
