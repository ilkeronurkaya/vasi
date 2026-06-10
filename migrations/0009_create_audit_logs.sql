-- Migration: 0009_create_audit_logs
-- Tablo: audit_logs
-- Açıklama: Güvenlik ve KVKK uyumu için kullanıcı işlem günlüğü.
--
-- migrate:up

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT,                                      -- NULL olabilir (anonim işlemler)
  action      TEXT NOT NULL,                             -- Örn: 'message.create', 'auth.login'
  entity_type TEXT,                                      -- Örn: 'message', 'recipient'
  entity_id   TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
