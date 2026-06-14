-- Migration: 0015_create_payments
-- Tablo: payments
-- Açıklama: İyzico ödeme denemeleri ve sonuçları (audit + idempotency).

-- migrate:up
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  conversation_id TEXT NOT NULL,
  iyzico_token TEXT,
  iyzico_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failure')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_user  ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_token ON payments(iyzico_token);
