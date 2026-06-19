-- B14: per-user arayüz dili tercihi. Login'de yüklenir, yalnız dashboard ayarlarından değişir.
-- Varsayılan 'tr'. Mevcut satırlar 'tr' alır.
ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'tr';
