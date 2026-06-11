-- Migration: 0012_create_admin_settings
-- Açıklama: Admin panel — çalışma anında değiştirilebilir ayarlar (plan limitleri, fiyatlar)

CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO admin_settings (key, value) VALUES
  ('plan_limit_free',        '10'),
  ('plan_limit_personal',    '100'),
  ('plan_limit_unlimited',   '1000'),
  ('recipient_limit_free',   '10'),
  ('recipient_limit_personal','50'),
  ('price_personal_monthly', '49'),
  ('price_family_monthly',   '99');
