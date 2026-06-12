# Vasi — Ajan Çalışma Kuralları

Geleceğe mesaj bırakma uygulaması. Monorepo: `vasi-web` (Next.js 15, koyu Apple-dili tasarım — bkz. DESIGN.md), `vasi-api` (Cloudflare Workers + Hono + D1), `migrations/` (D1 şema), `crew/tests/api_smoke.py` (deterministik smoke testler).

## Mutlak Kurallar

1. **Kod + test AYNI commit'te.** Yeni davranış eklediğinde `crew/tests/api_smoke.py`'a testini de ekle ve aynı commit'e koy. Test eklemeden commit atma.
2. **Şema değişikliği = yeni migration dosyası** (`migrations/00XX_*.sql`). Elle `ALTER TABLE` veya doğrudan DB değişikliği YASAK.
3. **Asla `git push` yapma.** Push her zaman proje sahibinden gelir.
4. **Her commit'ten önce `git branch --show-current` çalıştır** ve görev tanımındaki branch'te olduğunu doğrula.
5. **Commit'ten önce testleri koştur:** `python3 crew/tests/api_smoke.py` — tümü geçmeden commit atma. Mevcut testleri silme/zayıflatma.
6. `api_smoke.py`'ı düzenlerken girintiye dikkat et; değişiklik sonrası `python3 -m py_compile crew/tests/api_smoke.py` ile doğrula.

## Bilinen Tuzaklar

- D1 `undefined` bind kabul etmez (`D1_TYPE_ERROR`) — opsiyonel değerleri `?? null` ile bağla.
- `messages.status` CHECK kısıtı `'failed'` değil **`'error'`** kabul eder (bkz. `markFailed`, 0003 migration).
- Tarih karşılaştırmalarını SQL'de `datetime(...)` ile normalize et (ISO 'T'li ↔ SQLite boşluklu format uyuşmazlığı).
- Client component'lerde dosya başına `'use client'` gerekli — smoke testin statik kontrolü bunu denetler.
- `navigator`/`localStorage`'ı useState initializer'da OKUMA (hydration mismatch) — `useEffect` içinde oku.
- Admin fetch: `@/lib/api`'deki `adminFetch` kullanılır (Bearer token ekler).

## Komutlar

```bash
pnpm dev:api / dev:web            # :8787 / :3000
pnpm db:migrate:local             # D1 migration uygula
python3 crew/tests/api_smoke.py   # smoke testler (izole DB, :8788)
```

## Sık Kullanılan Dosyalar

- API rotaları: `vasi-api/src/routes/` (auth, messages, me, admin, public, delivery)
- Servisler: `vasi-api/src/services/` · DB erişimi: `vasi-api/src/db/`
- Web sayfaları: `vasi-web/src/app/` — admin: `app/admin/`, alıcı görüntüleme: `app/m/[token]/`
- Tasarım kuralları: `DESIGN.md` (mevcut CSS değişkenlerini ve `btn` sınıflarını kullan, inline yeni renk üretme)
