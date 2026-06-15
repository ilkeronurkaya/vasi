# Vasi — Bug Listesi

> Yaşayan liste. Her elle/otomatik test turunda bulunan buglar buraya yazılır.
> Her bug bir sprinte (`ROADMAP.md`) **adım** olarak atanır; düzeltilince "Kapalı"ya taşınır.
> Şiddet: **P0** bloke/kritik · **P1** önemli · **P2** küçük/kozmetik.
> İş akışı: iko test eder → bulguyu buraya ekle → iko+Claude triage → hedef sprinte adım → düzeltme doğrulanınca Kapalı.

## Açık buglar

| ID | Şiddet | Açıklama | Bulundu | Hedef sprint | Durum |
|----|--------|----------|---------|--------------|-------|
| B1 | P2 | `premium.test@vasi.app` seed kullanıcısının şifre hash'i sahte → onunla **giriş yapılamıyor** (panelde sadece görünür). Giriş gerekirse `test@vasi.app`'inki gibi gerçek PBKDF2 hash koy. | S20 | — | Açık |
| B2 | P2 | Admin **"Yeni Paket"** formunda sayısal alanlar `0` default'unu temizlemiyor → `099` görünür (kayıt doğru). | S21 | S27 | Açık |
| B3 | P1 | `pnpm --filter vasi-web build` (`next build`) tsc'yi geçiyor ("Compiled successfully") ama **ESLint hatalarında kırılıyor** — kod tabanı geneli (`no-explicit-any`, `react-hooks/set-state-in-effect`, `no-html-link-for-pages`, `no-unescaped-entities`). **Prod deploy `next build` kullanıyorsa şu an bloke.** Çözüm: lint-temizlik sprinti veya `next.config` `eslint.ignoreDuringBuilds` (geçici). Proje CI'ı şu an smoke; build değil. | S24 (review) | S27 | Açık |
| B4 | P1 | Smoke, payment callback'i başarı 302'siyle `APP_URL`=:3000'e yönlenince, **3000'de bir şey çalışıyorsa** HTML'i JSON sanıp `JSONDecodeError` ile TÜM smoke'u çökertiyor (web kapalıyken URLError yutuluyordu). `req()` redirect'i izlememeli ya da non-JSON'u tolere etmeli. Geçici workaround: smoke öncesi `:3000`'i kapat. | S24 (review) | — | Açık |
| B5 | **P0** | **Cross-context OTP auth açığı.** `email_verifications`'ta `purpose`/kapsam kolonu yok (`migrations/0008` + `db/email-verifications.db.ts`); `findActiveByUser(userId)` amaç gözetmeden kullanıcının aktif OTP'sini döndürüyor → kullanıcı **şifre/profil** akışında üretilen OTP, **admin girişinde** kabul ediliyor; birden çok aktif kayıt olunca tek satır çekildiği için admin'in kendi OTP'si reddediliyor. SPRINT_25 notundaki "dual-rol OTP çakışması" borcu gerçekleşti. **Fix:** `purpose` kolonu (yeni migration) + `create`/`findActive` çağrılarını amaca göre kapsamla (admin_login / profile / email_verify ayrı). | (06-15) ikotest | S27 (P0) | Açık |
| B6 | P1 | **Şifre değişimi: doğrulama OTP'den SONRA + zayıf politika.** `me.ts:137` uzunluk kontrolü OTP tüketildikten sonra; settings "Kaydet" şifreyi doğrulamadan `request-otp` çağırıyor → 6 hane girilip OTP alınıyor, sonra "8 hane" hatası, OTP boşa. İstenen: (a) kural seti ≥8 + ≥1 küçük + ≥1 büyük + ≥1 rakam, **özel karakter YOK** (yalnız alfanümerik); (b) kuralları şifre alanı yanında kutuda canlı göster + uygula; (c) doğrulama OTP'den **ÖNCE** (client+server); (d) kurallar sağlanınca OTP **SMS** ile gelsin. | (06-15) | S27 (a–c) · S28 (d, SMS=NetGSM) | Açık |
| B7 | P2 | Doğrulama/OTP kodu giriş alanı maskelenmiyor (`type="text"`) → yapıştırınca açık görünüyor; `*****` gibi maskeli olmalı (settings OTP, verify-email, /m/[token] alıcı OTP alanları). | (06-15) | S27 | Açık |
| B8 | P2 | Admin **"Teslimatları Şimdi Çalıştır"** buton/UI tasarımı uygun değil → Vasi tasarım diline göre yeniden tasarla. | (06-15) | S27 | Açık |
| B9 | P2 | Admin **plan düzenleme** penceresinde sayısal alanların neyi temsil ettiği belirsiz (fiyat / mesaj limiti / alıcı limiti) → her alana label ekle. (B2 ile aynı form ailesi — birlikte düzeltilebilir.) | (06-15) | S27 | Açık |

## Kapalı buglar

| ID | Şiddet | Açıklama | Çözüm | Sprint |
|----|--------|----------|-------|--------|
| B0 | P0 | Admin'e giriş yapılamıyor — hiçbir migration `is_admin=1` atamıyordu (seed `0010` kolonu yokken yazıyor, `0011` `DEFAULT 0` ekliyor) → admin login her zaman **403**. Smoke yeşildi çünkü harness elle UPDATE yapıyordu. | `migrations/0016_set_admin_flag.sql` → `UPDATE users SET is_admin=1 WHERE email='test@vasi.app'`. | S23 |
| B-h1 | P0 | UI kayıt kırık — `register/page.tsx` camelCase (`firstName`) gönderiyordu, API snake_case bekliyor → 400. | snake_case'e çevrildi. | (06-13) `e2eae52` |
| B-h2 | P0 | UI e-posta doğrulama kırık — `verify-email` body'de email göndermiyordu. | email `localStorage('verifyEmail')` ile taşınıyor. | (06-13) `e2eae52` |

## Triage notu
Yeni bug eklerken: ID ver, şiddet biç, hangi test turunda bulunduğunu yaz, sonra iko+Claude ile bir sprinte bağla. P0 bulgular sıradaki sprinti **kesip** öne alınabilir; P2'ler uygun sprinte iliştirilir.
