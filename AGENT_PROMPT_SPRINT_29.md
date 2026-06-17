# OpenHands Ajan Promtu — Sprint 29 (Çerez onayı banner'ı + /cerez-politikasi)

> Her promtu AYRI/YENİ OpenHands konuşmasına yapıştır. Repo `/workspace` altında. iko: tur öncesi `rm -f ~/Projects/vasi-agent/.git/index.lock`.
> İçerik metinleri (6 dil) `/workspace/SPRINT_29_COOKIE.md`'de HAZIR — model oradan BİREBİR kopyalar, metni kendi UYDURMAZ/ÇEVİRMEZ.
> SIRA: PROMT 1 (banner) → PROMT 2 (politika sayfası + footer linki). İkisi de saf frontend.

---

## === PROMT 1 — Çerez bilgilendirme banner'ı ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push YOK). task_tracker KULLANMA. SADECE listelenen 2 dosyaya dokun. Dosyaları/metni önce KENDİN oku. Bitince diff + `git status` + `pnpm exec tsc --noEmit` çıktısı.

Önce oku: `/workspace/SPRINT_29_COOKIE.md` → "İÇERİK — Banner kopyası (6 dil)" bölümü (tr/en/de/fr/es/ar için `text`/`link`/`btn`).

**Dosya 1 (YENİ):** `/workspace/vasi-web/src/components/CookieConsent.tsx`
- `'use client'`. React `useState`+`useEffect`, `Link` (`next/link`).
- Kendi 6 dilli sözlüğü: `const COPY: Record<string, { text: string; link: string; btn: string }> = { tr:{...}, en:{...}, de:{...}, fr:{...}, es:{...}, ar:{...} }` — metinler SPRINT_29'dan birebir. `const RTL = new Set(['ar'])`.
- **Hydration güvenli:** `const [visible, setVisible] = useState(false)`, `const [lang, setLang] = useState('tr')`. `useEffect(() => { try { const ack = localStorage.getItem('vasi_cookie_notice'); const l = localStorage.getItem('vasi_lang') || 'tr'; setLang(COPY[l] ? l : 'tr'); if (!ack) setVisible(true) } catch {} }, [])`. `if (!visible) return null`.
- Render: ekran altı sabit kutu — `position:'fixed', left:0, right:0, bottom:0, zIndex:200`, `dir={RTL.has(lang)?'rtl':'ltr'}`. İç: Vasi token'larıyla (`background:'var(--midnight)'`, `border-top:'var(--border-subtle)'` veya `1px solid var(--horizon)'`, `color:'var(--cream)'`, padding ~16px, ortalı flex, gap). Metin `{t.text}`; yanında `<Link href="/cerez-politikasi" style={{ color:'var(--copper)' }}>{t.link}</Link>`; buton `<button className="btn btn-primary btn-sm" onClick={accept}>{t.btn}</button>`.
- `const t = COPY[lang]`. `const accept = () => { try { localStorage.setItem('vasi_cookie_notice','v1') } catch {}; setVisible(false) }`.
- Yeni `any` KULLANMA. Inline `style` objesi React.CSSProperties uyumlu olsun.

**Dosya 2 (DÜZENLE):** `/workspace/vasi-web/src/app/layout.tsx`
- `import { CookieConsent } from '@/components/CookieConsent'` ekle.
- `<body ...>{children}</body>` → `<body ...>{children}<CookieConsent /></body>` (children'dan SONRA, body içinde).
- `<html lang="tr">`, font, başka hiçbir şeyi DEĞİŞTİRME.

DOKUNMA: `lib/i18n.ts`, landing, başka component/sayfa. Smoke'u SEN koşma.

---

## === PROMT 2 — Çerez Politikası sayfası + footer linki ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE listelenen 2 dosyaya dokun. Dosyaları/metni önce KENDİN oku. Bitince diff + `git status` + `pnpm exec tsc --noEmit` çıktısı.

Önce oku: `/workspace/SPRINT_29_COOKIE.md` → "İÇERİK — Çerez Politikası sayfası (6 dil)" bölümü (anahtarlar: `title`/`updated`/`intro`/`s1_title`/`s1_session`/`s1_verify`/`s1_lang`/`s2_title`/`s2_body`/`s3_title`/`s3_body`/`s4_title`/`s4_body`/`back`). Metinleri (placeholder `{{CONTACT_EPOSTA}}` dahil) BİREBİR kopyala.

**Dosya 1 (YENİ):** `/workspace/vasi-web/src/app/cerez-politikasi/page.tsx`
- `'use client'`. `export const runtime = 'edge'`. `Link` (`next/link`).
- Kendi 6 dilli sözlüğü `const CONTENT: Record<string, Record<string,string>> = { tr:{...}, en:{...}, de:{...}, fr:{...}, es:{...}, ar:{...} }` — SPRINT_29'dan birebir. `const RTL = new Set(['ar'])`.
- Hydration güvenli dil okuması: `const [lang, setLang] = useState('tr'); useEffect(() => { try { const l = localStorage.getItem('vasi_lang') || 'tr'; setLang(CONTENT[l] ? l : 'tr') } catch {} }, [])`. `const t = CONTENT[lang]`.
- Render: ortalı okunur kapsayıcı (`maxWidth ~760px, margin '0 auto', padding '48px 24px'`, `dir={RTL.has(lang)?'rtl':'ltr'}`, Vasi token renkleri). Başlık `{t.title}` (h1), `{t.updated}` (küçük/mist), `{t.intro}` (p). Bölümler: her biri h2 `{t.sX_title}` + p('ler). s1 altında üç madde: `{t.s1_session}`, `{t.s1_verify}`, `{t.s1_lang}` (liste veya ardışık p). Sonda `<Link href="/">{t.back}</Link>`.
- Yeni `any` KULLANMA.

**Dosya 2 (DÜZENLE):** `/workspace/vasi-web/src/app/page.tsx` (footer)
- ~Satır 693: `<a href="#">{t.fl4}</a>` → `<Link href="/cerez-politikasi">{t.fl4}</Link>`. `Link` zaten import'lu (dosyanın başında `import Link from 'next/link'`).
- `fl1`/`fl2`/`fl3` linklerine ve başka hiçbir şeye DOKUNMA.

DOKUNMA: diğer sayfalar, `lib/i18n.ts`, banner. Smoke'u SEN koşma.

---

## Her tur sonrası (Claude doğrular)
Claude diff'i doğrular (yalnız hedef dosyalar, yeni `any` yok, iç linkler `<Link>`, metin SPRINT_29 ile birebir). iko: dev stack'i açıp Chrome'dan 6 dilde banner (ilk ziyaret → Anladım → kaybolur → yenile → çıkmaz) + `/cerez-politikasi` + footer linki + AR rtl kontrol; `tsc` 0 + `next lint` 0 + smoke 58/58. Sonra kapanış ritüeli + commit/push. iko canlıdan önce `{{CONTACT_EPOSTA}}` placeholder'ını gerçek adresle değiştirir.
