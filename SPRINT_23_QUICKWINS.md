# Sprint 23 — Hızlı Kazanımlar (ikotest 2. tur, Küme 1)

> Tasarım + kabul kriterleri. Uygulayıcı: OpenHands + **Gemini 3.1 Flash-Lite** (ucuz; net/ufak işler).
> Ajan promtu: `AGENT_PROMPT_SPRINT_23.md`. Repo kökü ajan için `/workspace`.
> İş akışı: ajan SADECE kod+test yazar (klonda); branch/commit/push iko'da; ajan raporuna güvenme → bağımsız doğrula.

## Amaç
`ikotest.md` 2. turun 5 düşük-riskli, sıfır dış-bağımlılıklı maddesini tek sprintte kapat. Hepsi frontend/copy/config + bir migration. Görünür değer, anında ship, en az maliyet.

## Kapsam — 5 madde

### M1 (ikotest #5) — Admin'e giriş yapılamıyor [P0 BUG]
**Kök neden (Claude doğruladı):** Hiçbir migration `is_admin=1` atamıyor. Seed `0010` `test@vasi.app`'i oluştururken `is_admin` kolonu henüz yok; `0011` kolonu `DEFAULT 0` ekliyor. Smoke yeşil çünkü `crew/tests/api_smoke.py:514` DB'yi kurarken elle `UPDATE users SET is_admin=1` yapıyor — ama gerçek lokal DB'de bu yok → `POST /api/v1/admin/auth/login` her zaman **403 FORBIDDEN** (`admin.ts:28`).
**Çözüm:** Yeni migration `migrations/0016_set_admin_flag.sql`:
```sql
-- Migration: 0016_set_admin_flag
-- Açıklama: test@vasi.app'i admin yap (is_admin migration'da set edilmiyordu — admin login 403 veriyordu)
UPDATE users SET is_admin = 1 WHERE email = 'test@vasi.app';
```
Idempotent ve prod-güvenli (kullanıcı yoksa no-op). KÖK `migrations/`'a yazılır.
**Kabul:** Migrate sonrası `test@vasi.app / Test1234!` ile `/admin/login` 200 + accessToken döner; panel açılır.

### M2 (ikotest #6) — Sol-alttaki "N" butonu kaldır
**Kök neden:** Next.js 15.3 dev göstergesi (sol-altta Next logosu/dev tools butonu).
**Çözüm:** `vasi-web/next.config.ts` içine `devIndicators: false` ekle (mevcut `rewrites` korunur).
**Kabul:** `pnpm dev:web` → `http://localhost:3000` sol-altta hiçbir gösterge/buton yok.

### M3 (ikotest #1) — Login/Kayıt CTA metinlerini bold yap
**Yer:**
- `vasi-web/src/app/(auth)/login/page.tsx:142` — "Hesabınız yok mu? Kayıt ol" linki (`<a href="/register">`).
- `vasi-web/src/app/(auth)/register/page.tsx:142` — "Zaten hesabınız var mı? Giriş yapın" linki (`<a href="/login">`).
**Çözüm:** Her iki `<a>` stiline `fontWeight: 700` ekle (mevcut stil korunur, link rengi `--copper` kalır).
**Kabul:** İki sayfada da CTA linki kalın görünür.

### M4 (ikotest #4) — Mesaj sihirbazı son tuş "Gönder" → "Oluştur"
**Gerekçe:** Buton aslında mesajı oluşturup ileri tarihe zamanlıyor, anında "göndermiyor"; "Gönder" yanıltıcı UX.
**Yer:** `vasi-web/src/app/(dashboard)/messages/new/page.tsx`
- `:9` `STEPS` dizisinde `'Gönder'` → `'Oluştur'`
- `:394` buton metni `Gönder ✓` → `Oluştur ✓`
- `:362` `Gönderiliyor...` → `Oluşturuluyor...`
**Kabul:** Sihirbazın 5. adım etiketi, son buton ve yükleniyor metni "Oluştur" diliyle tutarlı. Gönderme davranışı (handleSubmit) DEĞİŞMEZ.

### M5 (ikotest #9) — Mesaj hakkı sayacını rakamla göster (5/100)
**Yer:** `vasi-web/src/app/(dashboard)/layout.tsx:183-194` "Mesaj Hakkı" progress bar bloğu. Şu an sadece dolan bar var, rakam yok.
**Veri:** `me?.usage.messages_used` ve `me?.usage.messages_limit` (zaten mevcut, `GET /me`).
**Çözüm:** "Mesaj Hakkı" başlığının yanına/altına `{used}/{limit}` metni ekle (ör. başlık satırını flex yapıp sağa `5/100`). Mevcut "%80 → Hakkın dolmak üzere" uyarısı korunur.
**Kabul:** Sol menüde "Mesaj Hakkı 5/100" gibi sayısal değer görünür; `me` yüklenmeden `0/0` yerine güvenli fallback.

## Kapsam DIŞI
Google/Apple login (#2), SMS (#3), admin OTP (#7), settings profil+OTP (#8) — sonraki sprintler (S24-26).

## Test / Doğrulama
- **Smoke:** `crew/tests/api_smoke.py` zaten admin login'i test ediyor (`record("Admin login"...)`). Ajan smoke'a **dokunmasın**; sadece kırmamalı. M1 migration'ı uygulandığında smoke'un `:514` elle UPDATE'i artık fazlalık (zararsız) — silme.
- **Bağımsız doğrulama (iko, Mac):**
  1. DB tazele + migrate → `test@vasi.app` ile `/admin/login` → panel açılır (M1).
  2. `pnpm dev:web` → sol-altta gösterge yok (M2).
  3. /login + /register CTA bold (M3).
  4. /messages/new sihirbazı son adım "Oluştur" (M4).
  5. Sol menü "Mesaj Hakkı X/Y" rakam (M5).
- UI değişiklikleri smoke'ta görünmez → Chrome'dan elle doğrula.

## Kabul kriteri özeti (5/5 geçmeli)
M1 admin login 200 · M2 N butonu yok · M3 iki CTA bold · M4 son tuş "Oluştur" · M5 sayaç rakamlı. Smoke yeşil kalır, mevcut testler zayıflatılmaz.
