-- Migration: 0018_email_verifications_purpose
-- Tablo: email_verifications
-- Açıklama: OTP'lere purpose eklenir (profil/şifre vs. admin giriş ayrımı).
--
-- migrate:up

ALTER TABLE email_verifications ADD COLUMN purpose TEXT NOT NULL DEFAULT 'email_verify';
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_purpose ON email_verifications(user_id, purpose);
