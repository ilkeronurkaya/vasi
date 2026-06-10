-- Migration: 0005_create_recipients
-- Tablo: recipients
-- Açıklama: Mesaj alıcıları ve OTP doğrulama bilgileri.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS recipients (
  id              TEXT PRIMARY KEY,
  message_id      TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,                         -- AES-256-GCM şifreli
  phone           TEXT,                                  -- AES-256-GCM şifreli; opsiyonel
  -- Erişim
  access_token    TEXT UNIQUE,                           -- İletim sonrası üretilir (URL'de kullanılır)
  -- OTP (alıcı doğrulama)
  otp_code        TEXT,                                  -- 6 haneli, hash olarak saklanır
  otp_expires_at  TEXT,                                  -- OTP geçerlilik süresi (10 dakika)
  otp_attempts    INTEGER NOT NULL DEFAULT 0,            -- Yanlış deneme sayısı (max 5)
  -- Durum
  delivered_at    TEXT,                                  -- E-posta/SMS gönderildiği an
  accessed_at     TEXT,                                  -- Alıcının mesajı açtığı an
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_recipients_message_id   ON recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_recipients_access_token ON recipients(access_token);
