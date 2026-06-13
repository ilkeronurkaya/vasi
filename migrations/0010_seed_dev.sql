-- Yalnızca local dev için. Production'a uygulanmaz.
-- Migration: 0010_seed_dev
-- Açıklama: Geliştirme ortamı test verisi

-- ── Kullanıcılar ─────────────────────────────────────────────────────────────
-- Kullanıcı 1: Ücretsiz plan
INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'test.free@vasi.app',
  'pbkdf2:sha256:260000$dev_salt_free$hashedpassword_free_user_dev_only',
  'Ayşe',
  'Yılmaz',
  'active',
  1
);

-- Kullanıcı 2: Kişisel plan
INSERT INTO users (id, email, password_hash, first_name, last_name, status, email_verified)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'test.personal@vasi.app',
  'pbkdf2:sha256:260000$dev_salt_personal$hashedpassword_personal_user_dev_only',
  'Mehmet',
  'Kaya',
  'active',
  1
);

-- ── Abonelikler ───────────────────────────────────────────────────────────────
-- Ücretsiz kullanıcı aboneliği
INSERT INTO subscriptions (id, user_id, plan_type, status, started_at, expires_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'free',
  'active',
  datetime('now'),
  NULL
);

-- Kişisel plan aboneliği (1 yıllık)
INSERT INTO subscriptions (id, user_id, plan_type, status, started_at, expires_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  'personal',
  'active',
  datetime('now'),
  datetime('now', '+1 year')
);

-- ── Mesajlar ──────────────────────────────────────────────────────────────────
-- Ücretsiz kullanıcının taslak mesajı
INSERT INTO messages (id, user_id, title, message_type, content_text, is_locked, status)
VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'Gelecekteki Kendime',
  'text',
  'Merhaba! Bu mesaj sadece test amaçlıdır.',
  0,
  'draft'
);

-- Test kullanıcısı — şifre: Test1234!
INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, status, email_verified)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'test@vasi.app',
  'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33',
  'Test',
  'User',
  'active',
  1
);
-- Kullanıcı 3: Premium test kullanıcısı
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, status, email_verified)
VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  'premium.test@vasi.app',
  'pbkdf2:sha256:260000$dev_salt_premium$hashedpassword_premium_user_dev_only',
  'Premium',
  'Test',
  'active',
  1
);

INSERT OR IGNORE INTO subscriptions (id, user_id, plan_type, status, started_at, expires_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440004',
  'personal',
  'active',
  datetime('now'),
  datetime('now', '+1 year')
);

