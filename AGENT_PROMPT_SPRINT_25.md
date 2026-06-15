# AGENT_PROMPT — Sprint 25 (i18n + ayrı admin hesabı)

> Uygulayıcı: **yerel Qwen3.6-35B-A3B** (LM Studio + OpenHands), klonda (`/workspace`).
> Bu promtu OpenHands'te YENİ konuşmaya yapıştır. Repo kökü `/workspace`. Önce `/workspace/AGENTS.md` oku.
> Tasarım: `SPRINT_25_I18N.md`. Bu prompt onun satır-seviyesi uygulama planıdır.

---

## 0. KURALLAR (İHLAL = BAŞARISIZ) — önce bunu oku

Sen YALNIZCA kod+test yazan bir uygulayıcısın. Kurallar:

1. **Git'e HİÇ dokunma** — branch/commit/push/checkout YOK. Sadece `/workspace` içindeki dosyaları düzenle.
2. **SADECE aşağıda madde madde verilen dosya ve satırlara dokun.** Başka dosyayı açma, refactor etme, "iyileştirme" yapma. İstenmeyen yerde tek karakter bile değiştirme.
3. **Dosyaları KENDİN oku.** Düzenleyeceğin her dosyayı önce kendi araçlarınla `/workspace`'ten OKU. Bana dosya içeriği yapıştırmamı isteme. Erişemiyorsan tam yolunu söyle ve dur.
4. **HALÜSİNASYON YASAK.** Görmediğin dosya/satır/fonksiyon hakkında varsayım yapma. Test/komut KOŞMADIYSAN "koştum/geçti" DEME. "tamamlandı" demeden önce gerçekten yaptığından emin ol. Yanlış rapor, hatalı koddan kötüdür.
5. **EMİN DEĞİLSEN YAPMA — SOR.** Bir maddenin nasıl yapılacağından emin değilsen: DUR, neyden emin olmadığını yaz, sor. Tahminle ilerleme.
6. **Şema değişikliği = KÖK `/workspace/migrations/`'a yeni dosya** (`vasi-api/migrations/` DEĞİL). Elle ALTER yok.
7. **OpenHands `task_tracker`/planlama aracını KULLANMA.** Plan yapma, doğrudan dosyaları düzenle.
8. **Edge runtime (Cloudflare Workers):** Node `crypto/http/https` KULLANMA — sadece `fetch` + Web Crypto. (Bu sprintte API koduna dokunmuyorsun zaten.)
9. **B3 borcunu büyütme:** YENİ `any` ekleme, yeni `<a href>`'le iç sayfaya link verme, yeni unescaped `'`/`"` JSX'e koyma.
10. Bitince ver: (a) değişen/eklenen dosya listesi, (b) `git status` çıktısı, (c) her madde için 1 satır özet, (d) her dosyanın diff'i.

---

## 1. DOKUNULACAK DOSYALAR — TAM LİSTE (başka dosya değişmeyecek)

**YENİ (2):**
1. `vasi-web/src/lib/i18n.ts`
2. `migrations/0017_seed_real_admin.sql`

**DÜZENLENECEK (5):**
3. `vasi-web/src/app/(auth)/login/page.tsx`
4. `vasi-web/src/app/(auth)/register/page.tsx`
5. `vasi-web/src/app/(dashboard)/layout.tsx`
6. `vasi-web/src/app/(dashboard)/dashboard/page.tsx`
7. `vasi-web/src/app/(dashboard)/settings/page.tsx`

**DOKUNMA (önemli):** `vasi-web/src/app/(dashboard)/page.tsx` (bu sadece /dashboard'a yönlendiren bir redirect — KARIŞTIRMA), landing `app/page.tsx`, `verify-email`, `messages/*`, `upgrade`, `admin/*`, hiçbir `vasi-api/` dosyası.

**Anahtar kuralı:** localStorage anahtarı **`'vasi_lang'`** (küçük harf değerler `'tr'` / `'en'`). Landing zaten bu anahtarı kullanıyor; aynısını kullan ki dil seçimi sayfalar arası tutarlı olsun. (Not: SPRINT_25_I18N.md'de `'lang'` yazıyordu — DOĞRUSU `'vasi_lang'`, landing ile eşleşmesi için.)

---

## 2. GÖREV A1 — `vasi-web/src/lib/i18n.ts` (YENİ DOSYA)

Bu dosyayı **birebir aşağıdaki içerikle** oluştur. Hiçbir şey ekleme/çıkarma:

```ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export type Lang = 'tr' | 'en';

export const LANG_STORAGE_KEY = 'vasi_lang';
const LANG_CHANGE_EVENT = 'vasi-lang-change';

export const DICT: Record<Lang, Record<string, string>> = {
    tr: {
        // login
        login_title: 'Giriş Yap',
        login_email: 'E-posta',
        login_password: 'Şifre',
        login_forgot: 'Şifremi unuttum',
        login_register_link: 'Hesabınız yok mu? Kayıt ol',
        login_submit: 'Giriş Yap',
        login_loading: 'Giriş yapılıyor...',
        login_error_default: 'E-posta veya şifre hatalı.',
        // register
        register_title: 'Hesap Oluştur',
        register_firstname: 'Ad',
        register_lastname: 'Soyad',
        register_email: 'E-posta',
        register_password: 'Şifre',
        register_password_ph: 'En az 8 karakter',
        register_submit: 'Kayıt Ol',
        register_loading: 'Kaydediliyor...',
        register_error_default: 'Kayıt başarısız. Tekrar deneyin.',
        register_login_link: 'Zaten hesabınız var mı? Giriş yapın',
        // dashboard layout / nav
        nav_home: 'Ana Sayfa',
        nav_messages: 'Mesajlarım',
        nav_new_message: 'Yeni Mesaj',
        nav_settings: 'Ayarlar',
        sidebar_quota: 'Mesaj Hakkı',
        sidebar_quota_warning: 'Hakkın dolmak üzere',
        sidebar_upgrade: "Pro'ya Geç",
        sidebar_logout: 'Çıkış Yap',
        // dashboard home
        dash_greeting: 'Merhaba, %s 👋',
        dash_subtitle: 'Bugün ne bırakmak istiyorsun?',
        dash_new_message: '+ Yeni Mesaj',
        dash_total: 'Toplam',
        dash_scheduled: 'Zamanlanmış',
        dash_sent: 'Gönderildi',
        dash_recent: 'Son Mesajlar',
        dash_view_all: 'Tümünü Gör →',
        dash_loading: 'Yükleniyor...',
        dash_empty_title: 'Henüz mesaj yok',
        dash_empty_subtitle: 'Sevdiklerine geleceğe mesaj bırak',
        dash_create_first: 'İlk Mesajını Oluştur',
        // settings — dil bölümü
        settings_lang_title: 'Dil',
        settings_lang_desc: 'Arayüz dilini seçin. Değişiklik anında uygulanır.',
        settings_lang_tr: 'Türkçe',
        settings_lang_en: 'İngilizce',
    },
    en: {
        login_title: 'Sign In',
        login_email: 'Email',
        login_password: 'Password',
        login_forgot: 'Forgot password?',
        login_register_link: "Don't have an account? Register",
        login_submit: 'Sign In',
        login_loading: 'Signing in...',
        login_error_default: 'Invalid email or password.',
        register_title: 'Create Account',
        register_firstname: 'First name',
        register_lastname: 'Last name',
        register_email: 'Email',
        register_password: 'Password',
        register_password_ph: 'At least 8 characters',
        register_submit: 'Register',
        register_loading: 'Saving...',
        register_error_default: 'Registration failed. Please try again.',
        register_login_link: 'Already have an account? Sign in',
        nav_home: 'Home',
        nav_messages: 'My Messages',
        nav_new_message: 'New Message',
        nav_settings: 'Settings',
        sidebar_quota: 'Message Quota',
        sidebar_quota_warning: 'Almost out of quota',
        sidebar_upgrade: 'Upgrade to Pro',
        sidebar_logout: 'Log Out',
        dash_greeting: 'Hello, %s 👋',
        dash_subtitle: 'What would you like to leave today?',
        dash_new_message: '+ New Message',
        dash_total: 'Total',
        dash_scheduled: 'Scheduled',
        dash_sent: 'Sent',
        dash_recent: 'Recent Messages',
        dash_view_all: 'View All →',
        dash_loading: 'Loading...',
        dash_empty_title: 'No messages yet',
        dash_empty_subtitle: 'Leave a message for your loved ones in the future',
        dash_create_first: 'Create Your First Message',
        settings_lang_title: 'Language',
        settings_lang_desc: 'Choose the interface language. Changes apply instantly.',
        settings_lang_tr: 'Turkish',
        settings_lang_en: 'English',
    },
};

export function getLang(): Lang {
    if (typeof window === 'undefined') return 'tr';
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'tr';
}

export function setStoredLang(lang: Lang): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
}

export function t(key: string, lang: Lang): string {
    return DICT[lang][key] ?? DICT.tr[key] ?? key;
}

// SSR-güvenli: ilk render HER ZAMAN 'tr' (hydration mismatch'i önler — landing ile aynı kalıp).
// Gerçek dil mount SONRASI okunur. setLang çağrısı localStorage'a yazar + tüm useLang örneklerini günceller.
export function useLang(): [Lang, (lang: Lang) => void] {
    const [lang, setLangState] = useState<Lang>('tr');

    useEffect(() => {
        setLangState(getLang());
        const handler = () => setLangState(getLang());
        window.addEventListener(LANG_CHANGE_EVENT, handler);
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener(LANG_CHANGE_EVENT, handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    const update = useCallback((next: Lang) => {
        setStoredLang(next);
        setLangState(next);
    }, []);

    return [lang, update];
}
```

---

## 3. GÖREV A2 — `vasi-web/src/app/(auth)/login/page.tsx` (DÜZENLE)

Bu dosyada şu an kendi `LANGS` objesi var ve dili `navigator.language`'ten alıyor. Onu i18n modülüne taşı.

**A2.1** — `import { apiFetch } from '@/lib/api';` satırının hemen ALTINA ekle:
```ts
import { useLang, t } from '@/lib/i18n';
```

**A2.2** — `LANGS` sabitinin TAMAMINI sil (`const LANGS = { ... };` bloğunun tümü — `TR` ve `EN` objeleri dahil).

**A2.3** — Fonksiyon başındaki lang tespitini değiştir.
SİL:
```ts
    const lang = (typeof navigator !== 'undefined'
        ? navigator.language.split('-')[0].toUpperCase()
        : 'TR') as keyof typeof LANGS;
    const t = LANGS[lang] ?? LANGS.TR;
```
YERİNE:
```ts
    const [lang] = useLang();
```

**A2.4** — `dir`'i AR'a göre ayarlayan `React.useEffect`'i TAMAMEN sil:
```ts
    React.useEffect(() => {
        document.documentElement.dir = (lang as string) === 'AR' ? 'rtl' : 'ltr';
    }, [lang]);
```
(Yalnız tr/en var, ikisi de LTR; bu efekt gereksiz.)

**A2.5** — JSX içindeki çeviri kullanımlarını değiştir (her biri tek tek):
- `setError(err?.data?.error ?? t.error_default);` → `setError(err?.data?.error ?? t('login_error_default', lang));`
- `{t.title}` → `{t('login_title', lang)}`
- `{t.email}` → `{t('login_email', lang)}`
- `{t.password}` → `{t('login_password', lang)}`
- `{loading ? t.loading : t.submit}` → `{loading ? t('login_loading', lang) : t('login_submit', lang)}`
- `{t.forgot}` → `{t('login_forgot', lang)}`
- `{t.register}` → `{t('login_register_link', lang)}`

Başka satıra dokunma. (`React` importu kalır — `React.CSSProperties`/`React.FormEvent` hâlâ kullanılıyor.)

---

## 4. GÖREV A3 — `vasi-web/src/app/(auth)/register/page.tsx` (DÜZENLE)

Bu dosya tamamen sabit Türkçe; i18n ekle.

**A3.1** — `import { apiFetch } from '@/lib/api';` altına ekle:
```ts
import { useLang, t } from '@/lib/i18n';
```

**A3.2** — `const router = useRouter();` satırının ALTINA ekle:
```ts
    const [lang] = useLang();
```

**A3.3** — Metinleri değiştir (her biri tek tek):
- `setError(err?.data?.error ?? 'Kayıt başarısız. Tekrar deneyin.');` → `setError(err?.data?.error ?? t('register_error_default', lang));`
- `>Hesap Oluştur<` (h2 içeriği) → `>{t('register_title', lang)}<`
- `<label style={labelStyle}>Ad</label>` → `<label style={labelStyle}>{t('register_firstname', lang)}</label>`
- `<label style={labelStyle}>Soyad</label>` → `<label style={labelStyle}>{t('register_lastname', lang)}</label>`
- `<label style={labelStyle}>E-posta</label>` → `<label style={labelStyle}>{t('register_email', lang)}</label>`
- `<label style={labelStyle}>Şifre</label>` → `<label style={labelStyle}>{t('register_password', lang)}</label>`
- Şifre input'unda `placeholder="En az 8 karakter"` → `placeholder={t('register_password_ph', lang)}`
- `{loading ? 'Kaydediliyor...' : 'Kayıt Ol'}` → `{loading ? t('register_loading', lang) : t('register_submit', lang)}`
- `Zaten hesabınız var mı? Giriş yapın` (alt linkin metni) → `{t('register_login_link', lang)}`

**DOKUNMA:** input `placeholder="Ali"`, `placeholder="Veli"`, `placeholder="ali@example.com"` (örnek değerler, çeviri değil — bırak).

---

## 5. GÖREV A4 — `vasi-web/src/app/(dashboard)/layout.tsx` (DÜZENLE)

**A4.1** — `import { apiFetch } from '@/lib/api';` altına ekle:
```ts
import { useLang, t } from '@/lib/i18n';
```

**A4.2** — `NAV` sabitini değiştir. SİL:
```ts
const NAV = [
    { href: '/dashboard', label: 'Ana Sayfa' },
    { href: '/messages', label: 'Mesajlarım' },
    { href: '/messages/new', label: 'Yeni Mesaj' },
    { href: '/settings', label: 'Ayarlar' },
];
```
YERİNE:
```ts
const NAV = [
    { href: '/dashboard', key: 'nav_home' },
    { href: '/messages', key: 'nav_messages' },
    { href: '/messages/new', key: 'nav_new_message' },
    { href: '/settings', key: 'nav_settings' },
];
```

**A4.3** — `const [menuOpen, setMenuOpen] = useState(false);` satırının ALTINA ekle:
```ts
    const [lang] = useLang();
```

**A4.4** — Metinleri değiştir:
- NAV map'inde `{item.label}` → `{t(item.key, lang)}`
- `Mesaj Hakkı` (span içeriği) → `{t('sidebar_quota', lang)}`
- `Hakkın dolmak üzere` → `{t('sidebar_quota_warning', lang)}`
- `Pro'ya Geç` (upgrade butonu) → `{t('sidebar_upgrade', lang)}`
- `Çıkış Yap` (logout butonu) → `{t('sidebar_logout', lang)}`

**DOKUNMA:** `Free`, `Pro ✓` rozet metinleri (plan adı), `Vasi` logo metni, `aria-label="Menü"` — bırak.

---

## 6. GÖREV A5 — `vasi-web/src/app/(dashboard)/dashboard/page.tsx` (DÜZENLE)

Bu dosyada kendi `LANGS` objesi ve `const lang = 'TR'` (sabit) var. i18n'e taşı.

**A5.1** — `import { apiFetch } from '@/lib/api';` altına ekle:
```ts
import { useLang, t } from '@/lib/i18n';
```

**A5.2** — `LANGS` sabitinin TAMAMINI sil (`const LANGS = { TR: {...}, EN: {...} };`).

**A5.3** — `const lang = 'TR'; // This should be dynamic ...` satırını şununla değiştir:
```ts
    const [lang] = useLang();
```

**A5.4** — `const t = LANGS[lang];` satırını TAMAMEN sil. (`t` artık i18n'den geliyor.)

**A5.5** — JSX çeviri kullanımlarını değiştir:
- `{t.page_title.replace("%s", userFirstName)}` → `{t('dash_greeting', lang).replace("%s", userFirstName)}`
- `{t.page_subtitle}` → `{t('dash_subtitle', lang)}`
- `{t.new_message_button}` → `{t('dash_new_message', lang)}`
- `{ label: t.total_messages, ...}` → `{ label: t('dash_total', lang), ...}`
- `{ label: t.scheduled_messages, ...}` → `{ label: t('dash_scheduled', lang), ...}`
- `{ label: t.sent_messages, ...}` → `{ label: t('dash_sent', lang), ...}`
- `Son Mesajlar` (h2 içeriği) → `{t('dash_recent', lang)}`
- `{t.view_all_messages}` → `{t('dash_view_all', lang)}`
- `Yükleniyor...` (loading p içeriği) → `{t('dash_loading', lang)}`
- `{t.no_messages_title}` → `{t('dash_empty_title', lang)}`
- `{t.no_messages_subtitle}` → `{t('dash_empty_subtitle', lang)}`
- `{t.create_first_message_button}` → `{t('dash_create_first', lang)}`

**DOKUNMA (bu tur kapsam dışı, TR kalsın):** `STATUS_LABELS` objesi (mesaj durum etiketleri), `" alıcı · "` + `toLocaleDateString("tr-TR")` satırı. Bunları DEĞİŞTİRME.

---

## 7. GÖREV A6 — `vasi-web/src/app/(dashboard)/settings/page.tsx` (DÜZENLE)

Buraya **OTP'siz** bir "Dil" bölümü ekle. **OTP bölümlerine (profil/email/şifre) DOKUNMA.**
> Not: Bu dosya noktalı virgül kullanmıyor — eklediğin satırlarda da kullanma.

**A6.1** — `import React, { useState, useEffect } from 'react'` satırının ALTINA ekle:
```ts
import { useLang, t } from '@/lib/i18n'
```

**A6.2** — `const [meData, setMeData] = useState<MeData | null>(null)` satırının ALTINA ekle:
```ts
    const [lang, setLang] = useLang()
```

**A6.3** — Ana `return`'de, `{error && ( ... )}` bloğunun KAPANIŞINDAN sonra ve `{/* Profil Bölümü */}` yorumundan ÖNCE şu kartı ekle:
```tsx
            {/* Dil Bölümü — OTP YOK (dil hassas değil, OTP'li bölümlerden bağımsız) */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', marginBottom: '4px' }}>{t('settings_lang_title', lang)}</h2>
                <p style={{ fontSize: '13px', color: 'var(--mist)', marginBottom: '20px' }}>{t('settings_lang_desc', lang)}</p>
                <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as 'tr' | 'en')}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                >
                    <option value="tr">{t('settings_lang_tr', lang)}</option>
                    <option value="en">{t('settings_lang_en', lang)}</option>
                </select>
            </div>
```

**DOKUNMA:** `renderSection`, `handleRequestOtp`, `handleSave`, OTP state'leri, profil/email/şifre kartları, "Ayarlar" h1, erken dönüşteki "Yükleniyor..." — hiçbirini DEĞİŞTİRME. Sadece yukarıdaki kartı ve iki satırı (import + hook) ekle.

---

## 8. GÖREV B — `migrations/0017_seed_real_admin.sql` (YENİ DOSYA, KÖK migrations/)

`/workspace/migrations/0017_seed_real_admin.sql` oluştur (KÖK `migrations/` — `vasi-api/migrations/` DEĞİL). Birebir:

```sql
-- Migration: 0017_seed_real_admin
-- Açıklama: iko'nun kişisel e-postasıyla gerçek admin hesabı.
-- Resend test modu YALNIZCA bu adrese gerçekten e-posta yollar → admin OTP gerçekten Gmail'e düşer.
-- test@vasi.app admin OLARAK KALIR (smoke onu kullanıyor) — bu migration ona DOKUNMAZ.
-- Şifre 'Test1234!' (password_hash, test@vasi.app ile birebir aynı).

INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, status, email_verified, is_admin)
VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'ilkeronurkaya@gmail.com',
  'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33',
  'Ilker', 'Onur Kaya', 'active', 1, 1
);

-- Güvence: e-posta zaten kayıtlıysa INSERT atlanır; bu UPDATE her durumda
-- admin yetkisini + doğrulanmışlığı garanti eder (no-op riskini kapatır).
UPDATE users SET is_admin = 1, email_verified = 1, status = 'active'
WHERE email = 'ilkeronurkaya@gmail.com';
```

---

## 9. BİTİRİNCE RAPOR

Şunları ver:
1. Değişen/eklenen dosya listesi (7 dosya: 2 yeni + 5 düzenleme).
2. `git status` çıktısı (git komutu KOŞMA — sadece çalışma ağacının durumunu göster; OpenHands değişiklikleri zaten listeler).
3. Her dosya için 1 satır: ne yaptın.
4. Her dosyanın diff'i.

**KOŞMA / YAPMA:** `pnpm install` (klon node_modules'ünü Linux'a çevirir — host'ta sorun olur), git komutları, migration apply, deploy. Doğrulamayı iko+Claude yapacak.

## 10. NEDEN BÖYLE (bağlam — uygulama için gerekmez)
- Anahtar `'vasi_lang'`: landing switcher'ı da bunu kullanıyor → tek anahtar, tutarlı dil.
- `useLang` ilk render 'tr' + mount sonrası okuma: SSR hydration mismatch'ini önler (TestBulgulari #1 dersi).
- B migration'da INSERT+UPDATE: e-posta canlı testte zaten kayıtlıysa salt INSERT OR IGNORE no-op olurdu → admin atanmazdı.
