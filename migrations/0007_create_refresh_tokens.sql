-- Migration: 0007_create_refresh_tokens
-- Tablo: refresh_tokens
-- Açıklama: JWT refresh token yönetimi. Logout'ta veya yeni login'de iptal edilir.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,                      -- SHA-256 hash; token kendisi cookie'de
  expires_at  TEXT NOT NULL,                             -- 7 gün
  revoked     INTEGER NOT NULL DEFAULT 0,                -- 1 = iptal edildi
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- migrate:down
DROP TABLE IF EXISTS refresh_tokens;
