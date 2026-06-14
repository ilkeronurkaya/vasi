-- Migration: 0016_set_admin_flag
-- Açıklama: test@vasi.app'i admin yap (is_admin migration'da set edilmiyordu — admin login 403)
UPDATE users SET is_admin = 1 WHERE email = 'test@vasi.app';
