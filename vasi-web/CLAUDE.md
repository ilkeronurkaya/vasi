@AGENTS.md

# Vasi Web — Geliştirme Kuralları

Bu dosya, vasi-web projesinde yapılan **her değişiklikte** uyulması zorunlu kurallardır.
Kod yazarken veya mevcut kodu incelerken bu kuralları kontrol et.

---

## ⚠️ KONTROL LİSTESİ — Her PR / Commit Öncesi

Aşağıdaki her maddeyi işaretle:

- [ ] Yeni metin var mı? → `LANGS` objesine tüm dillere eklendi mi? (TR, EN, DE, FR, ES, AR)
- [ ] Yeni sayfa mı? → `export const runtime = 'edge'` var mı?
- [ ] Yeni bağımlılık mı? → Paket boyutu ve lisans kontrol edildi mi?
- [ ] Tasarım token'ı doğru mu? → Hardcode renk/font yok mu?
- [ ] Türkçe karakter / RTL desteği düşünüldü mü?
- [ ] KVKK gerektiren veri işleme var mı? → Hukuk onayı alındı mı?

---

## 1. Çoklu Dil Desteği (i18n) — ZORUNLU

### Kural
Projede desteklenen diller: **TR · EN · DE · FR · ES · AR**

Yeni her sayfa, bileşen veya UI metni için bu kurallara uy:

### 1a. Metin ekleme
- Uygulama içindeki **hiçbir metin hardcode yazılmaz.**
- Tüm metinler `page.tsx` içindeki `LANGS` objesine eklenir.
- Her yeni anahtar için **tüm 6 dil** doldurulur. Boş bırakma; bilmiyorsan TR'yi kopyala ama yorum ekle: `// TODO: translate`.

```ts
// DOĞRU
const t = LANGS[lang]
<h1>{t.sayfa_basligi}</h1>

// YANLIŞ
<h1>Mesajlarım</h1>
```

### 1b. RTL desteği (Arapça)
- `RTL_LANGS` set'ine `'ar'` dahildir.
- `useEffect` ile `document.documentElement.dir` güncellenir — bu mantığı her yeni sayfaya taşı.
- CSS'de yönsel property kullanırken `margin-left/right` yerine `margin-inline-start/end` tercih et.

### 1c. Yeni sayfa ekleme
Yeni bir route eklendiğinde:
1. `LANGS` objesine bu sayfaya ait tüm anahtarları ekle.
2. `lang` state'ini parent'tan prop olarak al ya da context/store kullan.
3. Dil geçişinin sayfalar arası çalıştığını test et.

### 1d. Dil testi
- Her UI değişikliğinde en az TR ve AR dilini manuel kontrol et (en kısa ve RTL).
- AR modunda layout bozulmamalı.

---

## 2. Maliyet Optimizasyonu — ZORUNLU

### 2a. Edge Runtime
Her sayfa ve API route dosyasının en üstüne ekle:
```ts
export const runtime = 'edge'
```
Bu yoksa Cloudflare Pages build reddeder veya Node.js serverless'a düşer (daha pahalı).

### 2b. Bağımlılık (Dependency) Kuralı
Yeni `npm install` yapmadan önce şunu sor:
1. **Gerçekten gerekli mi?** Standart Web API veya React ile yapılamaz mı?
2. **Boyutu nedir?** `bundlephobia.com` ile kontrol et. Edge bundle limiti: **1 MB**.
3. **Edge uyumlu mu?** Node.js built-in (`fs`, `crypto`, `path`) kullanan paketler **çalışmaz**.

Onaylı kütüphaneler (zaten package.json'da):
- `next` · `react` · `react-dom`
- `tailwindcss` · `@tailwindcss/postcss`

Yeni paket için önce onay alınır, sonra eklenir.

### 2c. Resim ve Medya
- Görseller `next/image` ile kullan (otomatik optimizasyon).
- SVG'leri inline komponent olarak yaz (network request yok).
- Harici CDN bağlantısı ekleme (Google Fonts dahil — zaten CSS'de tanımlı olmalı).

### 2d. API Çağrıları
- Client-side fetch'i minimize et; mümkünse server component veya SSG kullan.
- Aynı veriye birden fazla çağrı yapma — cache veya state kullan.
- Rate limit aşmamak için debounce/throttle uygula.

### 2e. Cloudflare Pages Limitleri
| Limit | Değer |
|-------|-------|
| Edge bundle | 1 MB |
| CPU time / request | 50 ms |
| Environment variables | 1 KB / değişken |
| KV okuma (ücretsiz) | 100.000 / gün |

---

## 3. Tasarım Sistemi — ZORUNLU

Tüm renkler, fontlar ve spacing değerleri `Vasi_Figma_Design_Reference.md` ve brand guideline'dan gelir.

### 3a. Renkler
Hardcode renk yasak. Mevcut CSS class'larını veya CSS variable'larını kullan:

```
Obsidian   #0C1525   (ana arka plan)
Midnight   #162033   (yüzey / kart)
Horizon    #1F2D45   (border)
Copper     #D4763B   (aksan, CTA)
Cream      #EDE9E0   (birincil metin)
Mist       #8B9BB4   (ikincil metin)
```

### 3b. Tipografi
- Font: **Plus Jakarta Sans** (zaten yüklü)
- Başka font ekleme.
- Font size: Tasarım referansındaki type scale'e göre (`display/xl` → `caption/sm`).

### 3c. Bileşenler
- Mevcut CSS class'larını tekrar kullan: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.badge`, vb.
- Aynı görünen yeni class yazmadan önce mevcut class'ları kontrol et.
- Yeni bileşen ekleniyorsa `globals.css`'e eklenir ve tüm sayfalarda kullanılabilir hale getirilir.

---

## 4. Kod Kalitesi — ZORUNLU

### 4a. TypeScript
- `any` kullanma. Tip bilmiyorsan `unknown` kullan ve daralt.
- Her fonksiyonun giriş/çıkış tipi açık olmalı.
- `tsconfig.json`'daki ayarları gevşetme.

### 4b. Bileşen Yapısı
- Bir dosya tek bir sorumluluğa sahip olmalı.
- 200 satırı aşan `page.tsx` bileşenlere bölünmeli.
- `'use client'` direktifini sadece gerçekten interaktif olan bileşenlere ekle. Server component varsayılan olmalı.
- `useState`, `useEffect`, `useRouter` kullanan **her dosyanın** başında `'use client'` ZORUNLUDUR — yoksa build patlar.
- Router için **her zaman** `next/navigation` kullan, `next/router` değil (App Router uyumsuz).
- Dinamik route'larda (`[id]/page.tsx`) **`'use client'` bileşenler** `params` prop ALAMAZ. Bunun yerine `useParams()` hook kullan:

```ts
// ✅ DOĞRU — 'use client' sayfada
import { useParams } from 'next/navigation';
const params = useParams<{ id: string }>();

// ❌ YANLIŞ — Next.js 15'te 'use client' sayfaya params prop gelemez
const Page: React.FC<{ params: { id: string } }> = ({ params }) => { ... }
```

```ts
// ✅ DOĞRU
'use client';
import { useRouter } from 'next/navigation';

// ❌ YANLIŞ — App Router'da çalışmaz
import { useRouter } from 'next/router';
```

### 4b-2. useState Tip Zorunluluğu

`useState([])` boş başlangıç değeri TS'de `never[]` çıkarır — **her zaman açık tip ver:**

```ts
// ✅ DOĞRU
type Message = { id: string; title: string; content_text: string; status: string }
type Recipient = { id: string; name: string; email: string }
const [messages, setMessages] = useState<Message[]>([])
const [message, setMessage] = useState<Message | null>(null)
const [recipients, setRecipients] = useState<Recipient[]>([])

// ✅ Callback parametrelerine de tip ver
const handleDelete = async (id: string) => { ... }

// ❌ YANLIŞ — never[] veya implicit any
const [messages, setMessages] = useState([])
const handleDelete = async (id) => { ... }
```

### 4c. Dosya Organizasyonu
```
src/
  app/
    (pages)/           # Route'lar
    components/        # Paylaşılan UI bileşenleri
    lib/               # Yardımcı fonksiyonlar, sabitler
    i18n/              # Dil dosyaları (büyüdükçe buraya taşı)
```

### 4d. Naming
- Dosyalar: `kebab-case.tsx`
- Bileşenler: `PascalCase`
- Fonksiyonlar/değişkenler: `camelCase`
- CSS class'ları: `kebab-case`
- i18n anahtarları: `snake_case` (örn: `hero_title`, `nav_features`)

### 4e. Yorum / Dokümantasyon
- Karmaşık mantığı (tetikleme akışı, şifreleme, ödeme) yorumla.
- TODO'lar: `// TODO: [konu] — [neden ötelendi]` formatında.

---

## 5. Güvenlik & KVKK

### 5a. Hassas Veri
- TC Kimlik No, e-posta, telefon asla client-side log'a yazılmaz.
- `console.log` ile PII (kişisel veri) basma.
- Environment variable'ları `NEXT_PUBLIC_` prefix'i olmadan tanımla (client'a sızmasın).

### 5b. Form Güvenliği
- Her form input'u sunucu tarafında validate edilmeli.
- `dangerouslySetInnerHTML` kullanma.
- API route'larında CSRF token kontrolü.

### 5c. Harici Servisler
Yeni bir harici servis (ödeme, SMS, e-posta) eklemeden önce:
1. KVKK kapsamında veri işleme sözleşmesi gerekli mi? → Hukuk onayı.
2. Türkiye'de veri yerelleştirme (data residency) gerekliliği var mı?
3. Servis SLA'si proje gereksinimlerini (%99.5 uptime) karşılıyor mu?

### 5d. Dependency Güvenliği
Yeni bağımlılık eklemesinden önce `npm audit` çalıştır. HIGH/CRITICAL açıkları kabul edilmez.

---

## 6. Git & Versiyon Kontrolü

### Branch Yapısı
```
main    → Production (Cloudflare Pages)
DEV     → Aktif geliştirme
TEST    → QA/test ortamı
```

### Commit Mesajı Formatı
```
[kapsam]: kısa açıklama (max 72 karakter)
```
Kapsam örnekleri: `i18n`, `ui`, `api`, `fix`, `perf`, `security`, `deps`

```
i18n: Almanca çeviriler eklendi - pricing sayfası
fix: AR modunda navbar overflow düzeltildi
perf: Hero mockup animasyonu GPU'ya taşındı
```

---

## 7. Test & Kalite Kontrol

### Minimum Kontroller (Her Değişiklik)
1. `npm run build` hatasız tamamlanmalı
2. `npm run lint` sıfır hata
3. TR ve AR dillerinde görsel kontrol
4. Mobil (375px) ve desktop (1440px) breakpoint kontrolü

### Performans Hedefleri
| Metrik | Hedef |
|--------|-------|
| Lighthouse Performance | ≥ 90 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| Edge bundle | < 1 MB |

---

## 8. Neyi Yapma (Anti-Patterns)

```ts
// ❌ Hardcode metin
<p>Hesabınızı silmek istediğinizden emin misiniz?</p>

// ❌ Node.js API (edge'de çalışmaz)
import fs from 'fs'
import crypto from 'crypto'  // Web Crypto API kullan

// ❌ Büyük kütüphane import
import _ from 'lodash'  // Native JS ile yapılabilir

// ❌ Inline style ile renk
<div style={{ color: '#D4763B' }}>

// ❌ any tipi
const data: any = await fetch(...)

// ❌ console.log ile PII
console.log('Kullanıcı TC:', user.tc_identity_no)
```

---

## Referans Dokümanlar

| Doküman | Konum |
|---------|-------|
| PRD | `../Vasi_PRD_v1.md` |
| Design Reference | `../Vasi_Figma_Design_Reference.md` |
| Brand Guideline | `../Vasi_Brand_Guideline_v2.docx` |
| Cloudflare Pages Docs | https://developers.cloudflare.com/pages/ |
| Next.js Edge Runtime | https://nextjs.org/docs/app/api-reference/edge |

---

*Son güncelleme: Haziran 2026 — Kural değişirse bu dosyayı güncelle.*
