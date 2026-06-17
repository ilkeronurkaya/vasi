# Vasi — Bug Listesi

> Yaşayan liste. Her elle/otomatik test turunda bulunan buglar buraya yazılır.
> Her bug bir sprinte (`ROADMAP.md`) **adım** olarak atanır; düzeltilince "Kapalı"ya taşınır.
> Şiddet: **P0** bloke/kritik · **P1** önemli · **P2** küçük/kozmetik.
> İş akışı: iko test eder → bulguyu buraya ekle → iko+Claude triage → hedef sprinte adım → düzeltme doğrulanınca Kapalı.

## Açık buglar

| ID | Şiddet | Açıklama | Bulundu | Hedef sprint | Durum |
|----|--------|----------|---------|--------------|-------|
| B1 | P2 | `premium.test@vasi.app` seed kullanıcısının şifre hash'i sahte → onunla **giriş yapılamıyor** (panelde sadece görünür). Giriş gerekirse `test@vasi.app`'inki gibi gerçek PBKDF2 hash koy. | S20 | S28 | Açık |
| B4 | P1 | Smoke, payment callback'i başarı 302'siyle `APP_URL`=:3000'e yönlenince, **3000'de bir şey çalışıyorsa** HTML'i JSON sanıp `JSONDecodeError` ile TÜM smoke'u çökertiyor (web kapalıyken URLError yutuluyordu). `req()` redirect'i izlememeli ya da non-JSON'u tolere etmeli. Geçici workaround: smoke öncesi `:3000`'i kapat. | S24 (review) | S28 | Açık |
| B6d | P1 | **OTP SMS kanalı (B6'nın ertelenen parçası).** Şifre kuralları sağlanınca OTP'nin e-posta yerine **SMS** ile gelmesi (NetGSM). S27'de a–c (politika + canlı kural + OTP'den önce doğrulama) kapandı; d (SMS) **NetGSM hesabı + mesaj başına maliyet** gerektirdiği için ertelendi. | (06-15) | ileride (NetGSM hazır olunca) | Açık |
| B10 | P1 | **Landing fiyat bölümü DB'den gelmiyor, admin'le tutarsız.** `page.tsx` fiyat kartları **sabit kodlu** (yalnız Free+Personal, çok-dilli küratör maddeler) ve API yanıtının yanlış alanını okuyor: `setPricing(d.pricing ?? {})` ama `/public/pricing` artık `{plans:[...]}` döndürüyor (S21'de değişti) → fiyat hep `₺49`/`₺0` fallback. Admin `plans` tablosunu canlı okuyor → ikisi farklı. **Fix (karar: tam dinamik):** landing'i `/upgrade` gibi `d.plans`'ten her aktif plan için dinamik kart üretecek şekilde yeniden yaz; küratör maddeler yerine isim+fiyat+mesaj/alıcı limiti. | (06-16) ikotest | S28 | Açık |
| B11 | P2 | **Yeni paket landing/upgrade'de geç/hiç görünmüyor.** Landing sabit olduğu için yeni plan hiç düşmez (B10 ile çözülür). `/upgrade` dinamik ama `/public/pricing` `Cache-Control: max-age=300` → yeni plan 5 dk'ya kadar gecikir. **Fix:** `public.ts` `/pricing` cache'ini kısalt/kaldır (örn. `max-age=30` veya `no-store`). Plan kaydı doğru (`is_active=1` default+form+API). | (06-16) ikotest | S28 | Açık |

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
| B-h1 | P0 | UI kayıt kırık — `register/page.tsx` camelCase (`firstName`) gönderiyordu, API snake_case bekliyor → 400. | snake_case'e çevrildi. | (06-13) `e2eae52` |
| B-h2 | P0 | UI e-posta doğrulama kırık — `verify-email` body'de email göndermiyordu. | email `localStorage('verifyEmail')` ile taşınıyor. | (06-13) `e2eae52` |

## Triage notu
Yeni bug eklerken: ID ver, şiddet biç, hangi test turunda bulunduğunu yaz, sonra iko+Claude ile bir sprinte bağla. P0 bulgular sıradaki sprinti **kesip** öne alınabilir; P2'ler uygun sprinte iliştirilir.
