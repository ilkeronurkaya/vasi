-- Migration: 0017_seed_real_admin
-- Açıklama: iko'nun kişisel e-postasıyla gerçek admin hesabı.
-- Resend test modu YALNIZCA bu adrese gerçekten e-posta yollar → admin OTP gerçekten Gmail'e düşer.
-- test@vasi.app admin OLARAK KALIR (smoke onu kullanıyor) — bu migration ona DOKUNMAZ.
-- Şifre 'Test1234!' (password_hash, test@vasi.app ile birebir aynı).

INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, status, email_verified, is_admin)
VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'ilkeronurkaya@gmail.com',
  'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33',
  'Ilker', 'Onur Kaya', 'active', 1, 1
);

-- Güvence: e-posta zaten kayıtlıysa INSERT atlanır; bu UPDATE her durumda
-- admin yetkisini + doğrulanmışlığı garanti eder (no-op riskini kapatır).
UPDATE users SET is_admin = 1, email_verified = 1, status = 'active'
WHERE email = 'ilkeronurkaya@gmail.com';
