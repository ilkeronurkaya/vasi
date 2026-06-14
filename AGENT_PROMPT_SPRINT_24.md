# OpenHands Ajan Promtu — Sprint 24 (Hesap Güvenliği & OTP)

> Bunu OpenHands'te YENİ konuşmaya yapıştır. Repo kökü `/workspace`. Model: yerel Qwen3.6-35B-A3B.

---

Sen YALNIZCA kod+test yazan uygulayıcısın. Kurallar (İHLAL = BAŞARISIZ):
1. Git'e HİÇ dokunma — branch/commit/push/checkout YOK. Sadece `/workspace` içindeki dosyaları düzenle.
2. Dosyaları KENDİN oku. Düzenleyeceğin/örnek alacağın her dosyayı önce kendi araçlarınla OKU. Bana asla dosya içeriği / "context dump" yapıştırmamı isteme.
3. HALÜSİNASYON YASAK. Görmediğin dosya/fonksiyon hakkında varsayım yapma. Test/komut KOŞMADIYSAN "geçti" DEME.
4. **EMİN DEĞİLSEN YAPMA — DUR ve SOR.** Bir adımın nasıl yapılacağından, mevcut bir kalıptan ya da bir kararın doğruluğundan emin değilsen: o adımı bırak, neyden emin olmadığını net yaz, sor. Tahminle ilerleme — kararsızlıkları iko+Claude çözer. Emin olduklarını yap, emin olmadıklarını listele.
5. Kapsam kilidi: sadece aşağıda sayılan dosyalar. Başka dosyayı "iyileştirme" diye değiştirme. **Migration EKLEME — bu sprintte şema değişmiyor.**
6. Mevcut testleri silme/zayıflatma. Edge runtime: Node `crypto/http/https` yok; mevcut `lib/otp.ts`/`lib/password.ts`/Web Crypto kullan.
7. Bitince ver: (a) değişen/eklenen dosya listesi, (b) `git status`, (c) her madde 1 satır özet, (d) her dosyanın diff'i.

## Önce OKU (kalıpları buradan al)
`/workspace/AGENTS.md`, `vasi-api/src/routes/admin.ts` (login handler), `vasi-api/src/routes/me.ts`, `vasi-api/src/services/auth.service.ts` (OTP üret+gönder+doğrula kalıbı: register/verifyEmail), `vasi-api/src/db/users.db.ts`, `vasi-api/src/db/email-verifications.db.ts`, `vasi-api/src/lib/otp.ts`, `vasi-api/src/lib/password.ts`, `vasi-web/src/app/admin/login/page.tsx`, `vasi-web/src/app/(dashboard)/layout.tsx` (NAV), `vasi-web/src/app/(dashboard)/upgrade/page.tsx` (kullanıcı sayfası + `@/lib/api` kalıbı için örnek), `crew/tests/api_smoke.py` (OTP test kalıbı: satır ~286-298 ve ~428-443).

Tam tasarım ve kabul kriterleri: `/workspace/SPRINT_24_ACCOUNT_OTP.md` — OKU. Tüm OTP'ler email; SMS yok.

## Görevler

### 1) Admin login OTP — `vasi-api/src/routes/admin.ts`
- `/auth/login` handler'ını değiştir: şifre + `is_admin` doğrula (mevcut mantık), AMA token döndürme. `generateOTP()` + `hashOTP()` (lib/otp.ts) → `EmailVerificationsDB.create(env, user.id, otpHash)` → `DeliveryService.sendOtpEmail(env, {name: user.first_name, email: user.email}, otp)` → `console.log` ile OTP'yi de yaz (dev) → `{ otpRequired: true }` dön. Hatalı kimlik/yetki yine 401/403.
- YENİ `admin.post('/auth/verify-otp', ...)` (public, adminMiddleware YOK): `{email, otp}` → `findByEmail` + `is_admin` doğrula → `EmailVerificationsDB.findActiveByUser` → yoksa 401 `INVALID_OTP` → `hashOTP(otp) !== code_hash` ise 401 → eşleşirse `markUsed` + admin token (eski login'deki `generateAccessToken({userId, role:'admin', exp: now+8h}, JWT_SECRET)` ile AYNI) → `{ accessToken, role:'admin' }`.

### 2) Profil OTP endpoint'leri — `vasi-api/src/routes/me.ts`
(`me.use('*', authMiddleware)` zaten var — yeni rotalar korumalı olur.)
- YENİ `me.post('/profile/request-otp', ...)`: `c.get('userId')` → kullanıcıyı `findById` → `generateOTP`+`hashOTP` → `EmailVerificationsDB.create` → `sendOtpEmail(env,{name:first_name,email},otp)` → `console.log(otp)` → `{otpRequired:true}`.
- YENİ `me.patch('/profile', ...)`: body `{first_name?, last_name?, phone?, email?, current_password?, new_password?, otp}`.
  - `otp` yoksa/yanlışsa (`findActiveByUser`+hash) → 401 `INVALID_OTP`. Doğruysa `markUsed`.
  - ad/soyad/telefon verilmişse → `UsersDB.updateProfile`.
  - `email` verilmiş ve mevcuttan farklıysa → `findByEmail(email)` doluysa 409 `EMAIL_TAKEN`; değilse `UsersDB.updateEmail` (email + `email_verified=0`) + yeni e-postaya doğrulama OTP'si (register kalıbı: yeni OTP üret+create+sendOtpEmail yeni email'e).
  - `new_password` verilmişse → `current_password` zorunlu, `verifyPassword(current_password, user.password_hash)` yanlışsa 401 `INVALID_PASSWORD`; min 8 hane; `hashPassword(new_password)` → `UsersDB.updatePassword`.
  - Dön: `{ user: {id,email,first_name,last_name}, emailVerificationRequired: <email değişti mi> }`.

### 3) DB — `vasi-api/src/db/users.db.ts`
Yeni fonksiyonlar (mevcut kalıba uy, D1 `?? null`):
- `updateProfile(env, userId, fields)` — sadece verilen `first_name/last_name/phone` alanlarını + `updated_at=datetime('now')` günceller.
- `updateEmail(env, userId, newEmail)` — `email=?, email_verified=0, updated_at=...`.
- `updatePassword(env, userId, passwordHash)` — `password_hash=?, updated_at=...`.

### 4) Web — admin login 2 adım — `vasi-web/src/app/admin/login/page.tsx`
State'e `step` ('credentials' | 'otp') + `otp` ekle. Mevcut submit → login; cevap `otpRequired` ise `step='otp'`. OTP formu → `POST /api/v1/admin/auth/verify-otp {email, otp}` → `localStorage.adminToken = accessToken` → `/admin`. Hata gösterimi mevcut kalıpla. Mevcut stil/tasarım korunur.

### 5) Web — yeni settings sayfası — `vasi-web/src/app/(dashboard)/settings/page.tsx` (YENİ)
- `'use client'` + `export const runtime = 'edge'`. `@/lib/api` (`apiFetch`, Bearer). `GET /me` ile mevcut değerleri doldur.
- Üç bölüm: Profil (ad/soyad/telefon) · E-posta (yeni email) · Şifre (mevcut+yeni). Her bölümün "Kaydet"i: önce `POST /me/profile/request-otp` → OTP giriş alanı görünür → `PATCH /me/profile` ilgili alan(lar)+otp. Başarı/hata mesajı.
- Tasarım: `DESIGN.md` (koyu Apple dili, `var(--*)`, `btn btn-primary btn-md`, inputlar upgrade/login sayfalarındaki stil). Emin değilsen mevcut bir sayfadaki stil objelerini örnek al.

### 6) Web — nav — `vasi-web/src/app/(dashboard)/layout.tsx`
`NAV` dizisine ekle: `{ href: '/settings', label: 'Ayarlar' }`.

### 7) Smoke — `crew/tests/api_smoke.py` (MEVCUT KALIBI İZLE, yeni desen icat etme)
- Admin token alan İKİ yeri (~136 ve ~320) 2 adıma çevir: `/admin/auth/login` (artık `otpRequired`) → admin user'ın email_verifications code_hash'ini bilinen hash'le yaz (`base64(sha256("123456"))`, `wrangler_cmd` ile, satır ~287 kalıbı) → `/admin/auth/verify-otp {email, otp:"123456"}` → accessToken. Sonraki admin testleri bu token'la.
- Yeni testler: admin login `otpRequired`; verify-otp yanlış 401; verify-otp doğru token; `/me/profile/request-otp` 200; `PATCH /me/profile` yanlış OTP 401; doğru OTP'de `first_name` değişiyor (`GET /me` ile doğrula). Hepsi `record(...)` ile.
- Hiçbir mevcut testi silme. OTP'yi brute-force ETME — bilinen hash'i D1'e yaz.

## Beklenen değişen dosyalar
`admin.ts`, `me.ts`, `users.db.ts`, `admin/login/page.tsx`, `(dashboard)/settings/page.tsx` (yeni), `(dashboard)/layout.tsx`, `crew/tests/api_smoke.py`. **Migration YOK.** Başka dosya değişmemeli.

Büyük bir sprint — bir adımda mevcut kalıbı net göremezsen DUR ve sor, uydurma. Emin olduğun adımları yap, belirsizleri listele.
