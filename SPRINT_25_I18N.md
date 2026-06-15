# Sprint 25 — Çok Dillilik (i18n) + Ayrı Admin Hesabı

> Tasarım + kabul kriterleri. Kaynak: ROADMAP S25 (ikotest #5, #6) + S24 review carryover (ayrı admin).
> Uygulayıcı: yerel Qwen3.6-35B-A3B. Ajan promtu: `AGENT_PROMPT_SPRINT_25.md`.
> İlke: stabil + en az maliyet. i18n için backend/migration YOK (Part B hariç tek migration).

## Part A — i18n (ikotest #5, #6)
**Hedef:** Login/kayıt ekranı + Dashboard çok dilli; kullanıcı settings'ten dil seçebilsin (kalıcı).

**Kapsam kararı (DAR tut):** Bu sprint **TR + EN** (genişletilebilir yapı). Diller: login, register, dashboard **layout (nav + etiketler)**, dashboard **ana sayfa**, settings dil seçici. **Kapsam DIŞI** (sonraki i18n turu): mesaj sihirbazı, upgrade, admin panel, /m/[token]. Landing zaten çok dilli (TR/EN/FR/ES) — ona dokunma.

**Tasarım:**
1. Yeni `vasi-web/src/lib/i18n.ts`: `type Lang = 'tr' | 'en'`; sözlük `DICT: Record<Lang, Record<string, string>>` (login/register/dashboard/settings anahtarları); `getLang(): Lang` (localStorage `'lang'`'ten oku, yoksa `'tr'`); `useLang()` hook (state + localStorage senkronu); `t(key, lang)`. Landing ile AYNI `'lang'` anahtarını kullan (tutarlılık).
2. Login + register sayfaları: sabit Türkçe metinleri `t(...)` ile değiştir (mevcut çeviri objeleri varsa onları DICT'e taşı).
3. Dashboard `layout.tsx`: NAV etiketleri + "Mesaj Hakkı"/"Ayarlar" vb. `t(...)`.
4. Dashboard ana sayfa (`(dashboard)/dashboard/page.tsx`): başlık/etiketler `t(...)`.
5. Settings'e **"Dil" bölümü**: TR/EN dropdown → seçince `localStorage('lang')` yazar + anında uygular (**OTP YOK** — dil hassas değil, mevcut OTP akışından bağımsız).

**Kabul (A):**
- localStorage `'lang'='en'` iken login/register/dashboard nav/ana sayfa İngilizce; `'tr'` iken Türkçe.
- Settings'te dil seçimi anında dili değiştirir ve yenilemede kalır.
- Kapsam dışı sayfalar (mesaj sihirbazı vb.) bozulmaz (TR kalabilir).
- Hardcoded string kalmadıysa kapsam içi sayfalarda; eksik anahtar TR fallback.

## Part B — Ayrı admin hesabı (S24 carryover)
**Hedef:** Admin'i test kullanıcısından ayır; iko'nun gerçek e-postasıyla gerçek admin (Resend OTP'yi gerçekten yollar).
**Migration `migrations/0017_seed_real_admin.sql`** (KÖK migrations/):
```sql
-- Migration: 0017_seed_real_admin
-- Açıklama: iko'nun kişisel e-postasıyla gerçek admin (Resend test modu yalnız bu adrese gerçekten yollar)
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, status, email_verified, is_admin)
VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'ilkeronurkaya@gmail.com',
  'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33',
  'Ilker', 'Onur Kaya', 'active', 1, 1
);
```
(Hash = `test@vasi.app` ile aynı → şifre **`Test1234!`**. `test@vasi.app` admin olarak KALIR — smoke onu kullanıyor, bozma.)
**Kabul (B):** Migrate sonrası `ilkeronurkaya@gmail.com / Test1234!` ile `/admin/login` → OTP gerçekten Gmail'e düşer → panel açılır. `test@vasi.app` admin'liği bozulmaz (smoke yeşil).

## Smoke
- i18n saf frontend → smoke API testlerini ETKİLEMEZ. Yeni API testi gerekmez.
- Part B: istersen küçük bir test — `ilkeronurkaya@gmail.com` ile admin login `otpRequired` döner (opsiyonel). Mevcut admin testlerini (test@vasi.app) BOZMA.
- Web tsc temiz olmalı (`pnpm --filter vasi-web build` "Compiled successfully"). Yeni `any` ekleme (B3 borcu büyütme).

## Beklenen dosyalar
`lib/i18n.ts` (yeni), `(auth)/login/page.tsx`, `(auth)/register/page.tsx`, `(dashboard)/layout.tsx`, `(dashboard)/dashboard/page.tsx`, `(dashboard)/settings/page.tsx`, `migrations/0017_seed_real_admin.sql` (yeni). Başka dosya değişmemeli.

## Notlar
- Dil değişimi OTP gerektirmez; settings'in OTP'li bölümlerinden (profil/email/şifre) AYRI bir kontrol.
- Dual-rol OTP çakışması (B-caveat): iko artık kendi admin hesabını kullanacağı için pratikte ortadan kalkar; `email_verifications` purpose kolonu yine eklenmiyor (maliyet).
