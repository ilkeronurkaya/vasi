-- Migration: 0002_create_subscriptions
-- Tablo: subscriptions
-- Açıklama: Kullanıcı abonelik ve kart bilgileri (İyzico tokenizasyonu).
--
-- migrate:up

CREATE TABLE IF NOT EXISTS subscriptions (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type             TEXT NOT NULL DEFAULT 'free'
                        CHECK (plan_type IN ('free', 'personal')),
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at            TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at            TEXT,                            -- NULL = ücretsiz plan (süresiz)
  -- İyzico kart saklama
  iyzico_card_user_key  TEXT,                            -- Şifreli; kart için token
  iyzico_card_token     TEXT,                            -- Şifreli; son kullanılan kart
  -- Ödeme referansı
  last_payment_ref      TEXT,
  last_payment_at       TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status  ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON subscriptions(expires_at);

-- migrate:down
DROP TABLE IF EXISTS subscriptions;
