-- Migration: 0011_add_is_admin
-- Açıklama: Admin panel — users tablosuna yönetici bayrağı

ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;
