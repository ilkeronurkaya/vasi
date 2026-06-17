# Vasi — Bug Listesi

> Yaşayan liste. Her elle/otomatik test turunda bulunan buglar buraya yazılır.
> Her bug bir sprinte (`ROADMAP.md`) **adım** olarak atanır; düzeltilince "Kapalı"ya taşınır.
> Şiddet: **P0** bloke/kritik · **P1** önemli · **P2** küçük/kozmetik.
> İş akışı: iko test eder → bulguyu buraya ekle → iko+Claude triage → hedef sprinte adım → düzeltme doğrulanınca Kapalı.

## Açık buglar

| ID | Şiddet | Açıklama | Bulundu | Hedef sprint | Durum |
|----|--------|----------|---------|--------------|-------|
| B6d | P1 | **OTP SMS kanalı (B6'nın ertelenen parçası).** Şifre kuralları sağlanınca OTP'nin e-posta yerine **SMS** ile gelmesi (NetGSM). S27'de a–c (politika + canlı kural + OTP'den önce doğrulama) kapandı; d (SMS) **NetGSM hesabı + mesaj başına maliyet** gerektirdiği için ertelendi. | (06-15) | ileride (NetGSM hazır olunca) | Açık |

## Kapalı buglar

| ID | Şiddet | Açıklama | Çözüm | Sprint |
|----|--------|----------|-------|--------|
| B0 | P0 | Admin'e giriş yapılamıyor — hiçbir migration `is_admin=1` atamıyordu (seed `0010` kolonu yokken yazıyor, `0011` `DEFAULT 0` ekliyor) → admin login her zaman **403**. Smoke yeşildi çünkü harness elle UPDATE yapıyordu. | `migrations/0016_set_admin_flag.sql` → `UPDATE users SET is_admin=1 WHERE email='test@vasi.app'`. | S23 |
| B5 | P0 | Cross-context OTP açığı — profil/şifre OTP'si admin girişinde kabul ediliyordu. | Migration `0018` `purpose` kolonu + `findActiveByUser`/`create`'e amaç param + `ORDER BY created_at DESC, rowid DESC LIMIT 1`; 8 çağrı doğru amaçla (admin_login/profile/email_verify). iko elle doğruladı. | S27 |
| B6 (a–c) | P1 | Şifre değişimi: zayıf politika + doğrulama OTP'den SONRA (OTP boşa gidiyordu). | `isValidPassword` (≥8, küçük+büyük+rakam, yalnız alfanümerik), doğrulama `markUsed`'tan ÖNCE (client+server), settings'te canlı kural kutusu + disabled buton. d (SMS) → **B6d (açık)**. | S27 |
| B7 | P2 | OTP/doğrulama kodu alanı maskelenmiyordu (`type="text"`). | 4 alanda `type="password"` + `inputMode="numeric"` (admin login, verify-email, settings, /m/[token]). | S27 |
| B8 | P2 | Admin "Teslimatları Şimdi Çalıştır" buton/UI tasarım dışı. | Buton Sistemi v2 (`btn btn-primary btn-md`) + sonuç/mesaj yerleşimi; davranış değişmedi. | S27 |
| B9 + B2 | P2 | Plan formu: alan label'ları yok + `0` default `099` gösteriyor. | Her sayısal input'a label (Fiyat ₺ / Mesaj / Alıcı Limiti) + `value 0?''` + `parseInt||0`. | S27 |
| B3 | P1 | `next build` ESLint'te kırılıyordu (kod tabanı geneli) → prod deploy bloke. | Kural-kural temizlik (`no-html-link-for-pages`→`<Link>`, `no-explicit-any`→tip, `set-state-in-effect`→`queueMicrotask`/async, `no-unescaped-entities`); `next lint` **0 error**. FIX turu: `fetchPlans` regresyonu `useCallback` ile düzeltildi. | S27 |
| B4 | P1 | Smoke, payment callback 302'siyle `:3000`'e yönlenince web açıksa HTML'i JSON sanıp `JSONDecodeError` ile TÜM smoke'u çökertiyordu. | `req()` başarı yolundaki `json.loads` try/except ile sarıldı; non-JSON → `(status, {})`. `HTTPError`/`URLError` aynen. Doğrulandı: `:3000` açık VE kapalı → 58/58. | S28 |
| B1 | P2 | `premium.test@vasi.app` seed'inin şifre hash'i sahte (`$` ayraçlı, 260000) → giriş **401**. | `migrations/0019` mevcut DB'ler için `UPDATE` (gerçek PBKDF2, parola `Test1234!`); `0010_seed_dev.sql` taze DB için aynı hash. Doğrulandı: apply → DB güncel, `/auth/login` premium **200**+token, yanlış şifre **401**. | S28 |
| B11 | P2 | `/public/pricing` `Cache-Control: max-age=300` → admin'in eklediği yeni plan landing/upgrade'de 5 dk'ya kadar gecikiyordu. | `public.ts` cache `max-age=300`→`30`. | S28 |
| B10 | P1 | Landing fiyat kartları sabit kodlu + yanlış API alanı (`d.pricing`, oysa API `{plans:[...]}` döner) → admin'le tutarsız, fiyat hep fallback. | `page.tsx` `/public/pricing`'ten `plans.map` ile tam dinamik (N plan); isim+fiyat+mesaj/alıcı limiti + CTA. Featured = `{premium,personal}` slug; grid `auto-fit minmax(260px,1fr)` ile N plana ortalanmış responsive; 6 dile `plan_msgs/plan_recips/plan_cta`. Doğrulandı (runtime): 3 plan 3-up + Premium featured, AR rtl, `tsc`/lint 0, smoke 58/58. | S28 |
| B-h1 | P0 | UI kayıt kırık — `register/page.tsx` camelCase (`firstName`) gönderiyordu, API snake_case bekliyor → 400. | snake_case'e çevrildi. | (06-13) `e2eae52` |
| B-h2 | P0 | UI e-posta doğrulama kırık — `verify-email` body'de email göndermiyordu. | email `localStorage('verifyEmail')` ile taşınıyor. | (06-13) `e2eae52` |

## Triage notu
Yeni bug eklerken: ID ver, şiddet biç, hangi test turunda bulunduğunu yaz, sonra iko+Claude ile bir sprinte bağla. P0 bulgular sıradaki sprinti **kesip** öne alınabilir; P2'ler uygun sprinte iliştirilir.
