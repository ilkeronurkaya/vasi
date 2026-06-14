# Sprint 24 — Hesap Güvenliği & OTP (email)

> Tasarım + kabul kriterleri. Kaynak: `ROADMAP.md` S24 (ikotest #3, #4). Uygulayıcı: yerel Qwen3.6-35B-A3B.
> Ajan promtu: `AGENT_PROMPT_SPRINT_24.md`.
> **Tüm OTP'ler email üzerinden** (SMS yok; SMS geldiğinde ayrı sprintte SMS-OTP eklenecek).
> ⚠️ Bu sprint büyükçe (admin OTP + tam profil düzenleme + smoke refactor, ~9 dosya). Yerel model tökezlerse: böl ya da Devstral/Flash'a yükselt.

## Mevcut altyapı (yeniden kullanılacak — yeni şey icat etme)
- `lib/otp.ts`: `generateOTP()` (6 hane), `hashOTP(otp)` = `base64(sha256(otp))`.
- `email_verifications` tablosu: `id, user_id, code_hash, expires_at (+10dk), used`. DB: `EmailVerificationsDB.create(env,userId,codeHash)`, `findActiveByUser(env,userId)`, `markUsed(env,id)`.
- `DeliveryService.sendOtpEmail(env, {name, email}, otp)` → Resend (test modu yalnız hesap sahibine yollar; diğer adresler kodu `console.log` + D1'den okunur).
- `users`: `email UNIQUE NOT NULL`, `first_name/last_name NOT NULL`, `phone` (ops.), `email_verified` (0/1), `password_hash`. `lib/password.ts`: `hashPassword`, `verifyPassword`.
- **Migration GEREKMEZ** — tüm kolonlar var, email_verifications olduğu gibi kullanılır.

## A — Admin login email OTP (ikotest #3)
Mevcut `admin.ts` `/auth/login` şifre+is_admin doğrulayıp **doğrudan token** dönüyor. İki adıma böl:

1. `POST /api/v1/admin/auth/login` `{email, password}` (değiştir): şifre + `is_admin` doğrula. Token DÖNDÜRME. OTP üret → `EmailVerificationsDB.create` → `sendOtpEmail` (admin'in kendi e-postasına) → `{ otpRequired: true }` dön. Hatalı kimlik → eskisi gibi 401/403.
2. `POST /api/v1/admin/auth/verify-otp` `{email, otp}` (YENİ, public): kullanıcıyı bul + `is_admin` tekrar doğrula → `findActiveByUser` → `hashOTP(otp) === code_hash` değilse 401 `INVALID_OTP` → eşleşirse `markUsed` + admin token üret (eski login'deki gibi `role:'admin'`, exp 8 saat) → `{ accessToken, role:'admin' }`.

**Web** `admin/login/page.tsx`: 2 aşamalı durum — (1) email+şifre → login → `otpRequired` ise (2) OTP girişi ekranı → `verify-otp` → token → `localStorage.adminToken` + `/admin`'e yönlen.

### Kabul (A)
- login artık token DÖNMEZ, `{otpRequired:true}` döner; OTP e-postalanır/loglanır.
- verify-otp doğru OTP'de admin token, yanlışta 401, kullanılmış/expired'da 401.
- Admin olmayan kullanıcı login'de 403 (OTP üretilmez).
- Web: email+şifre → OTP ekranı → giriş; yanlış OTP hata gösterir.

## B — Settings profil düzenleme + OTP (ikotest #4)
Yeni kullanıcı ayar sayfası + her kaydetmede tek OTP.

### Endpoint'ler (me.ts — `authMiddleware` zaten `*`'da)
1. `POST /api/v1/me/profile/request-otp` (YENİ): oturum kullanıcısına OTP üret + gönder (kendi mevcut e-postasına) → `{ otpRequired:true }`.
2. `PATCH /api/v1/me/profile` (YENİ) `{ first_name?, last_name?, phone?, email?, current_password?, new_password?, otp }`:
   - OTP zorunlu → `findActiveByUser` + hash eşleşmesi yoksa 401 `INVALID_OTP`.
   - Eşleşirse `markUsed`, sonra değişen alanları uygula:
     - **ad/soyad/telefon**: `UsersDB.updateProfile`.
     - **email** (yeni): mevcut email'den farklıysa → `findByEmail(yeni)` doluysa 409 `EMAIL_TAKEN`; değilse email güncelle + `email_verified=0` + yeni e-postaya doğrulama OTP'si gönder (register kalıbı). Kullanıcıya "yeni e-postanı doğrula" mesajı (sonraki login email_verified=0 ise 403 verir — bu kasıtlı).
     - **şifre**: `new_password` varsa `current_password` zorunlu → `verifyPassword(current_password, mevcut hash)` yanlışsa 401 `INVALID_PASSWORD`; doğruysa `hashPassword(new_password)` (min 8 hane) → güncelle.
   - Dönen: güncel `{ user }` + email değiştiyse `emailVerificationRequired:true` bayrağı.

### DB (`users.db.ts`)
- `updateProfile(env, userId, {first_name?, last_name?, phone?})` — yalnız verilen alanları günceller + `updated_at`.
- `updateEmail(env, userId, newEmail)` — email + `email_verified=0`.
- `updatePassword(env, userId, passwordHash)`.

### Web — yeni `(dashboard)/settings/page.tsx`
- `'use client'` + `export const runtime='edge'`. `adminFetch` değil, kullanıcı `apiFetch`/`@/lib/api` kullan (Bearer).
- Bölümler: **Profil** (ad/soyad/telefon), **E-posta** (yeni email), **Şifre** (mevcut + yeni). Her bölümün "Kaydet"i → önce `request-otp` → OTP girişi (modal/satır) → `PATCH /me/profile` ilgili alan(lar) + otp.
- Mevcut değerleri `GET /me`'den doldur. Tasarım `DESIGN.md` (koyu Apple dili, `var(--*)`, `btn btn-primary`).
- Nav'a ekle: `(dashboard)/layout.tsx` `NAV` dizisine `{ href: '/settings', label: 'Ayarlar' }`.

### Kabul (B)
- `/settings` sayfası `GET /me` ile dolu; nav'da "Ayarlar" var.
- Ad/soyad/telefon değişikliği OTP'siz KAYDEDİLMEZ; doğru OTP'de kaydeder.
- Email değişikliği: alınmış email → 409; yeni email → güncellenir + `email_verified=0` + yeni adrese doğrulama OTP'si.
- Şifre değişikliği: yanlış mevcut şifre → 401; doğru + OTP → yeni şifreyle giriş yapılır.
- OTP yanlış/eksik → 401, değişiklik uygulanmaz.

## Smoke (crew/tests/api_smoke.py) — MEVCUT OTP KALIBINI İZLE
Var olan kalıp (satır ~286-298, 428-443): OTP isteğini tetikle → D1'e bilinen hash yaz (`base64(sha256("123456"))`) → bilinen OTP ile doğrula. AYNISINI yap, yeni desen icat etme.
- **Admin login refactor (KRİTİK):** smoke'ta admin token'ı `/admin/auth/login`'den alan İKİ yer var (~136 ve ~320). Artık login `otpRequired` dönüyor → her ikisinde: login çağır (otpRequired bekle) → admin user'ın `email_verifications` code_hash'ini `sha256("123456")` ile yaz (`UPDATE ... WHERE user_id=(SELECT id FROM users WHERE email='test@vasi.app') AND used=0`) → `/admin/auth/verify-otp {email, otp:"123456"}` → accessToken al. Sonraki admin testleri bu token'la devam.
- **Yeni testler:** (a) admin login `otpRequired` dönüyor; (b) verify-otp yanlış OTP 401; (c) verify-otp doğru OTP token; (d) `/me/profile/request-otp` 200; (e) `PATCH /me/profile` yanlış OTP 401; (f) doğru OTP'de ad değişiyor (sonra `GET /me` ile doğrula).
- Mevcut hiçbir testi silme/zayıflatma; sadece kırılan admin-login adımını 2 adıma çevir.

## Kapsam DIŞI
SMS-OTP (S27), i18n (S25), cookie (S26). Email değişiminde yeni-email OTP'siyle tam yeniden doğrulama akışının UI'si minimal (mesaj göster + mevcut /verify-email sayfasına yönlendir yeterli).

## Güvenlik notları (kabul tartışması)
- OTP'ler email_verifications'ta paylaşımlı (purpose kolonu yok) — tek admin + kısa ömür (10dk) nedeniyle çakışma pratikte yok; migration eklemiyoruz (maliyet).
- Email değişince `email_verified=0` → kullanıcı yeni email'i doğrulayana dek login bloklanır (kasıtlı, güvenli).
- Şifre değişimi: mevcut şifre + OTP (çift kapı).
