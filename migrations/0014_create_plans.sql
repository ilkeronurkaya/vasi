-- Migration: 0014_create_plans
-- Tablo: plans
-- Açıklama: Paket yönetimi ve abonelik planları

-- migrate:up

-- 1. plans tablosunu oluştur
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  message_limit INTEGER NOT NULL DEFAULT 0,
  recipient_limit INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed verileri
INSERT OR IGNORE INTO plans (id, slug, name, price_monthly, message_limit, recipient_limit, is_active, sort_order)
VALUES 
('plan_free', 'free', 'Ücretsiz', 0, 10, 10, 1, 0),
('plan_personal', 'personal', 'Premium', 49, 100, 50, 1, 1);

-- 2. subscriptions tablosunu CHECK'siz yeniden oluştur
PRAGMA foreign_keys=OFF;

CREATE TABLE subscriptions_new (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type             TEXT NOT NULL DEFAULT 'free', -- Artık CHECK yok, slug tutacak
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at            TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at            TEXT,
  iyzico_card_user_key  TEXT,
  iyzico_card_token     TEXT,
  last_payment_ref      TEXT,
  last_payment_at       TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO subscriptions_new SELECT * FROM subscriptions;

DROP TABLE subscriptions;

ALTER TABLE subscriptions_new RENAME TO subscriptions;

-- İndeksleri yeniden oluştur
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);

PRAGMA foreign_keys=ON;
