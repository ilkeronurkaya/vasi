-- Migration: 0019_fix_premium_seed_hash
-- Açıklama: premium.test@vasi.app seed'inin sahte ($ ayraçlı, 260000) hash'i giriş 401
-- veriyordu. test@vasi.app ile aynı gerçek hash'i ver (parola Test1234!) — mevcut DB'leri düzelt.
UPDATE users SET password_hash = 'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33'
WHERE email = 'premium.test@vasi.app';
