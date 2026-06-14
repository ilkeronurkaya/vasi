# Vasi — Bug Listesi

> Yaşayan liste. Her elle/otomatik test turunda bulunan buglar buraya yazılır.
> Her bug bir sprinte (`ROADMAP.md`) **adım** olarak atanır; düzeltilince "Kapalı"ya taşınır.
> Şiddet: **P0** bloke/kritik · **P1** önemli · **P2** küçük/kozmetik.
> İş akışı: iko test eder → bulguyu buraya ekle → iko+Claude triage → hedef sprinte adım → düzeltme doğrulanınca Kapalı.

## Açık buglar

| ID | Şiddet | Açıklama | Bulundu | Hedef sprint | Durum |
|----|--------|----------|---------|--------------|-------|
| B1 | P2 | `premium.test@vasi.app` seed kullanıcısının şifre hash'i sahte → onunla **giriş yapılamıyor** (panelde sadece görünür). Giriş gerekirse `test@vasi.app`'inki gibi gerçek PBKDF2 hash koy. | S20 | — | Açık |
| B2 | P2 | Admin **"Yeni Paket"** formunda sayısal alanlar `0` default'unu temizlemiyor → `099` görünür (kayıt doğru). | S21 | — | Açık |

## Kapalı buglar

| ID | Şiddet | Açıklama | Çözüm | Sprint |
|----|--------|----------|-------|--------|
| B0 | P0 | Admin'e giriş yapılamıyor — hiçbir migration `is_admin=1` atamıyordu (seed `0010` kolonu yokken yazıyor, `0011` `DEFAULT 0` ekliyor) → admin login her zaman **403**. Smoke yeşildi çünkü harness elle UPDATE yapıyordu. | `migrations/0016_set_admin_flag.sql` → `UPDATE users SET is_admin=1 WHERE email='test@vasi.app'`. | S23 |
| B-h1 | P0 | UI kayıt kırık — `register/page.tsx` camelCase (`firstName`) gönderiyordu, API snake_case bekliyor → 400. | snake_case'e çevrildi. | (06-13) `e2eae52` |
| B-h2 | P0 | UI e-posta doğrulama kırık — `verify-email` body'de email göndermiyordu. | email `localStorage('verifyEmail')` ile taşınıyor. | (06-13) `e2eae52` |

## Triage notu
Yeni bug eklerken: ID ver, şiddet biç, hangi test turunda bulunduğunu yaz, sonra iko+Claude ile bir sprinte bağla. P0 bulgular sıradaki sprinti **kesip** öne alınabilir; P2'ler uygun sprinte iliştirilir.
