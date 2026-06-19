# SPRINT 32 (Faz 1) — Dil tercihi kalıcılığı (B14)

> Kaynak: BUGS **B14**. iko kararı: sunucu tarafı per-user dil + yalnız dashboard'dan değişsin. **Bu sprint = Faz 1 (kalıcılık + bağlama).** Faz 2 (6 dil i18n altyapısı) ve Faz 3 (DE/FR/ES/AR çevirileri) AYRI sprintler.
> Uygulayıcı: yerel Qwen (TS kodu). Migration + smoke = Claude (placement/test footgun). Doğrulama: tsc + lint + smoke.

## Amaç
Kullanıcının dil tercihi DB'de saklansın (`users.language`), login'de yüklenip uygulansın, dashboard ayarlarından değişince DB'ye yazılsın. Böylece landing'de yapılan değişiklik giriş yapan kullanıcının dilini EZMEZ (B14 düzelir). Faz 1'de uygulama dili hâlâ TR/EN; API 6 kodu kabul eder (Faz 2 hazır olsun diye).

## Değişiklikler
**Backend (yerel ajan):**
1. `vasi-api/src/db/users.db.ts` — `updateLanguage(env, userId, language)`.
2. `vasi-api/src/routes/me.ts` — (a) GET `/me` dönüşüne `language` ekle; (b) `updateLanguage` import; (c) YENİ `PATCH /me/language` (auth var, **OTP YOK**) — dili `['tr','en','de','fr','es','ar']` içinde doğrula, kaydet.

**Web (yerel ajan):**
4. `vasi-web/src/app/(dashboard)/layout.tsx` — `Me.user`'a `language`; `setStoredLang` import; `/me` yüklenince `setStoredLang(data.user.language)`.
5. `vasi-web/src/app/(dashboard)/settings/page.tsx` — dil seçici `onChange`'i: `setLang` + `apiFetch PATCH /me/language` ile DB'ye yaz.

**Claude (footgun):**
6. `migrations/0020_add_user_language.sql` — `ALTER TABLE users ADD COLUMN language TEXT NOT NULL DEFAULT 'tr'` (KÖK migrations/). ✅ yazıldı.
7. `crew/tests/api_smoke.py` — PATCH /me/language 200 + GET /me language yansıyor + geçersiz dil 400 testleri.

## Kabul kriterleri
- [ ] `vasi-api` tsc 0; `vasi-web` tsc 0 + lint 0 (mevcut admin uyarıları hariç).
- [ ] Migration kökte; smoke otomatik uygular; **smoke yeşil + yeni dil testleri geçer**.
- [ ] Dashboard'da dil değiştir → DB'ye yazılır; çıkış/giriş sonrası tercih korunur (landing'de değiştirsen bile login DB'den yükler).
- [ ] `PATCH /me/language` OTP istemez; geçersiz dil 400.
- [ ] `git diff` kapsam temiz; yeni `any` yok.

## Faz 2/3 (bu sprint DIŞI)
- Faz 2: `lib/i18n.ts` Lang→6 + AR RTL + dashboard seçici 6 dil.
- Faz 3: DE/FR/ES/AR tam DICT çevirisi (Claude yazar — yerel model çeviri driftliyor).
