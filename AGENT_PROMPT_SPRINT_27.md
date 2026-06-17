# OpenHands Ajan Promtu — Sprint 27 (Güvenlik + OTP & UX + lint), MINI-TUR / DOSYA DOSYA

> HER promtu AYRI/YENİ bir OpenHands konuşmasına yapıştır. Her promt kendi içinde tamdır (ortak kural bloğu her birinin başında).
> Repo `/workspace/vasi-web` ve `/workspace/vasi-api` altında. Dosyalar mutlak yolla verildi. `file_editor`'da parantezler `(dashboard)` olduğu gibi yazılır.
> iko: her tur öncesi bayat kilit varsa → `rm -f ~/Projects/vasi-agent/.git/index.lock`. Tur bitince Claude diff'i doğrular, sonra sıradaki promt.
> SIRA ÖNEMLİ: PROMT 1 (B5) → 2,3 (B6) → 4 (B7) → 5 (B8) → 6 (B9+B2) → 7+ (B3 lint, en son).

---

## === PROMT 1 — B5 (P0) cross-context OTP açığı (migration + db + 3 rota) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda listelenen dosyalara dokun; başka dosya açma/değiştirme. Edge runtime (Cloudflare Workers): Node `crypto/http/https` KULLANMA — sadece Web Crypto/`fetch`. Şema değişikliği = KÖK `migrations/`'a yeni dosya. Düzenleyeceğin her dosyayı önce KENDİN oku. Küçük, hedefli `str_replace` yap. Bitince değişen dosya listesi + `git status` + her dosyanın diff'ini ver. "Bitti" demeden önce HER maddeyi gerçekten uyguladığından emin ol.

Amaç: `email_verifications` OTP'lerine **amaç (purpose)** ekleyip, doğrulamayı amaca göre kapsamak. Şu an `findActiveByUser` amaç gözetmiyor → profil/şifre OTP'si admin girişinde kabul ediliyor (güvenlik açığı).

1. **Yeni migration** `/workspace/migrations/0018_email_verifications_purpose.sql` oluştur. Mevcut bir migration dosyasının (`/workspace/migrations/0008_*`) başlık/`migrate:up` biçimini örnek al. İçerik:
   - `ALTER TABLE email_verifications ADD COLUMN purpose TEXT NOT NULL DEFAULT 'email_verify';`
   - `CREATE INDEX IF NOT EXISTS idx_email_verifications_user_purpose ON email_verifications(user_id, purpose);`

2. `/workspace/vasi-api/src/db/email-verifications.db.ts`:
   - `create` imzası: `create(env: Env, userId: string, codeHash: string, purpose: string)`. INSERT'e `purpose` kolonunu ekle: `INSERT INTO email_verifications (id, user_id, code_hash, purpose, expires_at) VALUES (?, ?, ?, ?, datetime('now', '+10 minutes'))` ve `.bind(id, userId, codeHash, purpose)`.
   - `findActiveByUser` imzası: `findActiveByUser(env: Env, userId: string, purpose: string)`. Sorgu: `SELECT * FROM email_verifications WHERE user_id = ? AND purpose = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC, rowid DESC LIMIT 1` ve `.bind(userId, purpose)`.
   - `markUsed` AYNEN kalır.

3. `/workspace/vasi-api/src/services/auth.service.ts`:
   - `EmailVerificationsDB.create(env, userId as string, otpHash)` → sona `, 'email_verify'` ekle.
   - `EmailVerificationsDB.findActiveByUser(env, user.id as string)` → `, 'email_verify'` ekle.

4. `/workspace/vasi-api/src/routes/admin.ts`:
   - `EmailVerificationsDB.create(c.env, user.id, otpHash)` (admin login) → `, 'admin_login'` ekle.
   - `EmailVerificationsDB.findActiveByUser(c.env, user.id)` (verify-otp) → `, 'admin_login'` ekle.

5. `/workspace/vasi-api/src/routes/me.ts`:
   - `EmailVerificationsDB.create(c.env, userId, otpHash)` (request-otp) → `, 'profile'` ekle.
   - `EmailVerificationsDB.findActiveByUser(c.env, userId)` (PATCH /profile) → `, 'profile'` ekle.
   - `EmailVerificationsDB.create(c.env, userId, newOtpHash)` (yeni e-posta) → `, 'email_verify'` ekle.

DOKUNMA: hata mesajları, başka rotalar, `markUsed` çağrıları. Mümkünse `/workspace/vasi-api` kökünde `pnpm exec tsc --noEmit` koşup çıktıyı rapora ekle. Smoke'u SEN koşma.

---

## === PROMT 2 — B6 server: şifre politikası + OTP'den ÖNCE doğrulama (vasi-api) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE listelenen 2 dosyaya dokun. Edge runtime kuralları geçerli. Dosyaları önce KENDİN oku. Küçük `str_replace`. Bitince diff + `git status`. Her maddeyi gerçekten uygula.

Amaç: şifre değişiminde (a) güçlü politika, (c) doğrulamayı OTP **tüketilmeden ÖNCE** yapmak. Şu an `me.ts` şifreyi `markUsed`'tan SONRA kontrol ediyor → zayıf şifrede OTP boşa gidiyor.

1. `/workspace/vasi-api/src/lib/password.ts`: yeni export ekle:
```
export function isValidPassword(pw: string): boolean {
  return typeof pw === 'string'
    && /^[A-Za-z0-9]+$/.test(pw)      // yalnız alfanümerik, özel karakter YOK
    && pw.length >= 8
    && /[a-z]/.test(pw)
    && /[A-Z]/.test(pw)
    && /[0-9]/.test(pw)
}
```

2. `/workspace/vasi-api/src/routes/me.ts`:
   - Üstte `verifyPassword, hashPassword` import satırına `isValidPassword` ekle: `import { verifyPassword, hashPassword, isValidPassword } from '../lib/password'`.
   - PATCH `/profile` içinde, `// OTP kullanıldı işaretle` ve `await EmailVerificationsDB.markUsed(...)` satırlarından HEMEN ÖNCE şu bloğu ekle:
```
  // B6: şifre doğrulaması OTP TÜKETİLMEDEN ÖNCE
  if (new_password !== undefined && new_password !== '') {
    if (typeof new_password !== 'string' || !isValidPassword(new_password as string)) {
      return c.json({ error: 'Şifre en az 8 hane; en az 1 küçük, 1 büyük harf ve 1 rakam; özel karakter içeremez.', code: 'WEAK_PASSWORD' }, 400)
    }
    if (!current_password || typeof current_password !== 'string') {
      return c.json({ error: 'Mevcut şifre zorunlu', code: 'VALIDATION_ERROR' }, 400)
    }
    const ok = await verifyPassword(current_password as string, user.password_hash as string)
    if (!ok) {
      return c.json({ error: 'Geçersiz mevcut şifre', code: 'INVALID_PASSWORD' }, 401)
    }
  }
```
   - Aşağıdaki mevcut "Şifre değişikliği" bloğunda `if (new_password.length < 8) { ... }` kontrolünü `if (!isValidPassword(new_password)) { return c.json({ error: 'Şifre en az 8 hane; en az 1 küçük, 1 büyük harf ve 1 rakam; özel karakter içeremez.', code: 'WEAK_PASSWORD' }, 400) }` ile değiştir. Bloğun geri kalanı (verifyPassword + hashPassword + updatePassword) AYNEN kalır.

DOKUNMA: profil/email mantığı, OTP karşılaştırması, diğer rotalar. `pnpm exec tsc --noEmit` koş, çıktıyı rapora ekle.

---

## === PROMT 3 — B6 client: canlı şifre kuralları + OTP'den önce engel (settings) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE TEK dosyaya dokun. Dosyayı önce KENDİN oku. Bitince diff + `git status`.

Dosya: `/workspace/vasi-web/src/app/(dashboard)/settings/page.tsx`

Amaç: şifre bölümünde kuralları canlı göstermek ve kural sağlanmadan OTP istenmesini engellemek.

1. Bileşen içine saf yardımcı ekle (render dışında, üstte):
```
const PW_RULES = (pw: string) => ({
  len: pw.length >= 8,
  lower: /[a-z]/.test(pw),
  upper: /[A-Z]/.test(pw),
  digit: /[0-9]/.test(pw),
  alnum: pw.length > 0 && /^[A-Za-z0-9]+$/.test(pw),
});
const PW_OK = (pw: string) => Object.values(PW_RULES(pw)).every(Boolean);
```
2. Yeni şifre `<input type="password" ...>` (placeholder "En az 8 karakter") ALTINA, sadece şifre bölümünde, kuralları canlı gösteren küçük bir liste render et: her kural için ✓/✗ ve metin (≥8 karakter / en az 1 küçük harf / en az 1 büyük harf / en az 1 rakam / yalnız harf+rakam). `PW_RULES(newPassword)` ile hesapla. Stil mevcut `inputStyle`/tema değişkenleriyle uyumlu, sade.
3. Şifre bölümünün "Kaydet"/OTP iste butonunu, `!PW_OK(newPassword) || !currentPassword` iken `disabled` yap.
4. `handleRequestOtp('password')` çağrılmadan önce (veya fonksiyonun başında, section==='password' için) `if (!PW_OK(newPassword)) { hata mesajı set et + return }` ekle — OTP isteği gitmesin.

DOKUNMA: profil/email bölümleri, OTP input mantığı (B7 ayrı promtta), API çağrı imzaları, i18n anahtarları (kural metinleri TR olabilir; istenirse sonra i18n). Yeni `any` veya `useEffect` içi `setState` EKLEME.

---

## === PROMT 4 — B7 OTP alanı maskeleme (4 dosya) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE listelenen 4 dosyadaki OTP input'una dokun. Her dosyayı önce KENDİN oku. Tek satırlık `str_replace`. Bitince diff + `git status`.

OTP/doğrulama kodu input'larında `type="text"` → `type="password"` yap; `inputMode="numeric"` yoksa ekle. maxLength + sadece-rakam + value/onChange mantığına DOKUNMA.

- `/workspace/vasi-web/src/app/admin/login/page.tsx` — OTP input (`value={otpValue}`, `maxLength={10}`).
- `/workspace/vasi-web/src/app/(auth)/verify-email/page.tsx` — OTP input (`value={otp}`, maxLength 6).
- `/workspace/vasi-web/src/app/(dashboard)/settings/page.tsx` — OTP input (`value={state.otpValue}`, ~satır 210).
- `/workspace/vasi-web/src/app/m/[token]/page.tsx` — alıcı OTP input (`value={otpValue}`).

DOKUNMA: başka input'lar (şifre alanları zaten password), buton/mesaj mantığı.

---

## === PROMT 5 — B8 "Teslimatları Şimdi Çalıştır" UI ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE TEK dosyaya dokun. Önce `/workspace/vasi-web/DESIGN.md`'yi ve dosyayı KENDİN oku. Bitince diff + `git status`.

Dosya: `/workspace/vasi-web/src/app/admin/page.tsx`

`runDue` butonunu (label `LANGS[lang].teslimat_calistir` = "Teslimatları Şimdi Çalıştır") Vasi Buton Sistemi v2'ye uydur: uygun `className="btn btn-primary btn-md"` (veya tasarıma uygun varyant), inline gelişigüzel stil yerine tema sınıfları. Sonuç metni (`runDueResult`) ve busy durumu düzgün yerleşsin (buton yanında/altında, okunur). **Davranış değişmez** (run-due çağrısı, sonuç/hata mantığı aynı).

DOKUNMA: `runDue` fonksiyon mantığı, API çağrısı, diğer bölümler.

---

## === PROMT 6 — B9 + B2 plan formu: label + 0-default ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE TEK dosyaya dokun. Dosyayı önce KENDİN oku. Bitince diff + `git status`.

Dosya: `/workspace/vasi-web/src/app/admin/settings/page.tsx`

Plan ekleme/düzenleme formundaki 3 sayısal input (`price_monthly`, `message_limit`, `recipient_limit`; ~satır 127–129):
- **B9:** her input'un ÜSTÜNE görünür label ekle: "Fiyat (₺)", "Mesaj Limiti", "Alıcı Limiti". (Placeholder kalabilir ama label asıl.)
- **B2:** her input'ta `value={editingPlan.price_monthly}` → `value={editingPlan.price_monthly === 0 ? '' : editingPlan.price_monthly}` (üç alan için de). `onChange`'de `parseInt(e.target.value)` → `parseInt(e.target.value) || 0`. Böylece `0` default'u boş görünür, başa yazınca `099` olmaz, boş kalırsa 0 kaydedilir.

DOKUNMA: kayıt/CRUD mantığı, slug/name/is_active alanları, diğer bölümler.

---

## === PROMT 7+ — B3 lint temizliği (EN SON, kural-kural, ayrı turlar) ===

> B3 kod tabanı geneli → TEK promtta YAPMA. Aşağıdaki SIRAYLA, her kural için AYRI konuşma. Her turda önce hatayı listele, sonra düzelt, sonra tekrar koş.

Ortak kural (her alt-tura ekle): Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. Davranışı DEĞİŞTİRME — yalnız lint düzelt. Her dosyayı KENDİN oku. Yeni `any`/yeni borç EKLEME. Bitince diff + `git status` + `pnpm --filter vasi-web build` çıktısının ilgili kısmı.

İlk adım (her turda): `cd /workspace/vasi-web && pnpm build 2>&1 | grep -A2 "Error:\|<kural-adı>"` ile o kuralın bozduğu dosya/satırları listele.

- **7a — `@next/next/no-html-link-for-pages`:** iç sayfa linklerinde `<a href="/...">` → `import Link from 'next/link'` + `<Link href="/...">`. Dış/`mailto`/`target=_blank` linkler AYNEN `<a>` kalır.
- **7b — `react/no-unescaped-entities`:** JSX metnindeki kaçışsız `'`/`"` → `&apos;`/`&quot;` veya değişmez metni `{'...'}` içine al.
- **7c — `@typescript-eslint/no-explicit-any`:** `any` → gerçek tip; bilinmiyorsa `unknown` + daraltma. API yanıtlarında dar arabirim tanımla. Riskli yerde tek satır `// eslint-disable-next-line` SON çare.
- **7d — `react-hooks/set-state-in-effect`:** `useEffect` içinde senkron `setState` kalıbını S25'teki `useSyncExternalStore`/event kalıbına çevir (referans: `vasi-web/src/lib/i18n.ts` `useLang`). Hidrasyon güvenli olsun.

Hedef: `pnpm --filter vasi-web build` ESLint'siz geçer, tsc temiz, smoke 58/58, davranış aynı. Her tur sonrası Claude diff inceler.

---

## Her tur sonrası (Claude doğrular)
Claude `git -C ~/Projects/vasi-agent diff <dosya>` ile kapsam sızıntısı / yeni `any` / davranış bozulması olmadığını kontrol eder. B5/B6 sonrası iko smoke koşar (`:3000` kapalı). Tümü bitince: iko asıl repoya taşır → tsc + smoke + Chrome elle (admin/settings, OTP maskeleme) → sprint kapanış ritüeli.
