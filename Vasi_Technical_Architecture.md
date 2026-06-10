# Vasi App — Teknik Mimari Dokümanı

**Versiyon:** 1.0  
**Tarih:** Haziran 2026  
**Durum:** MVP  
**Strateji:** Cloudflare ekosistemi ile başla, ileride taşınabilirlik için standart arayüzler kullan.

---

## İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [Servisler ve Roller](#2-servisler-ve-roller)
3. [Monorepo Yapısı](#3-monorepo-yapisi)
4. [Frontend — Next.js](#4-frontend--nextjs)
5. [Backend API — Cloudflare Workers + Hono](#5-backend-api--cloudflare-workers--hono)
6. [Veritabanı — Cloudflare D1](#6-veritabani--cloudflare-d1)
7. [Dosya Depolama — Cloudflare R2](#7-dosya-depolama--cloudflare-r2)
8. [Zamanlama & Mesaj İletimi](#8-zamanlama--mesaj-iletimi)
9. [E-posta — Resend](#9-e-posta--resend)
10. [Kimlik Doğrulama — JWT](#10-kimlik-dogrulama--jwt)
11. [Ortam Yönetimi](#11-ortam-yonetimi)
12. [CI/CD](#12-cicd)
13. [Taşınabilirlik Notları](#13-tasinabilirlik-notlari)
14. [Maliyet Tahmini](#14-maliyet-tahmini)

---

## 1. Genel Mimari

```
┌─────────────────────────────────────────────────────────────┐
│                     KULLANICI (Browser)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Edge Network (CDN)                   │
├──────────────────────┬──────────────────────────────────────┤
│   Cloudflare Pages   │      Cloudflare Workers              │
│   (Next.js Web App)  │      (Hono API — /api/v1/*)          │
│   vasi.co            │      api.vasi.co                     │
└──────────────────────┴──────────┬───────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
     ┌─────────────┐    ┌─────────────────┐  ┌──────────────┐
     │ Cloudflare  │    │  Cloudflare R2  │  │  Cloudflare  │
     │     D1      │    │  (File Storage) │  │   Queues     │
     │ (SQLite DB) │    │                 │  │ (Scheduling) │
     └─────────────┘    └─────────────────┘  └──────┬───────┘
                                                     │
                                             ┌───────▼───────┐
                                             │    Resend     │
                                             │  (E-posta)    │
                                             └───────────────┘
```

---

## 2. Servisler ve Roller

| Servis | Platform | Rol | Taşınabilirlik |
|--------|----------|-----|----------------|
| Web App | Cloudflare Pages | Next.js 15, edge runtime | Herhangi bir hosting'e taşınabilir |
| API | Cloudflare Workers | Hono framework, REST API | Node.js ortamına taşınabilir (Hono evrensel) |
| Veritabanı | Cloudflare D1 | SQLite tabanlı, edge-native | Standart SQL; Postgres'e migrate edilebilir |
| Dosya Depolama | Cloudflare R2 | S3-uyumlu nesne depolama | S3 veya başka S3-uyumlu servise geçilebilir |
| Zamanlama | Cloudflare Queues + Cron | Mesaj gönderim kuyruğu | BullMQ/Redis ile değiştirilebilir |
| E-posta | Resend | Alıcıya mesaj iletimi | SendGrid/SES ile değiştirilebilir |
| SMS | Netgsm | Bildirim | Herhangi bir SMS sağlayıcısıyla değiştirilebilir |

---

## 3. Monorepo Yapısı

```
vasi/
├── apps/
│   ├── web/                  # Next.js — Cloudflare Pages
│   │   ├── src/app/
│   │   ├── package.json
│   │   └── wrangler.toml
│   └── api/                  # Hono — Cloudflare Workers
│       ├── src/
│       │   ├── index.ts      # Worker entry point
│       │   ├── routes/       # Route dosyaları
│       │   ├── middleware/   # Auth, rate limit vb.
│       │   ├── services/     # İş mantığı
│       │   ├── db/           # D1 sorguları
│       │   └── types/        # Paylaşılan tipler
│       ├── package.json
│       └── wrangler.toml
├── packages/
│   └── shared/               # Web ve API arasında paylaşılan tipler
│       └── src/types/
├── migrations/               # D1 SQL migration dosyaları
│   ├── 0001_create_users.sql
│   ├── 0002_create_subscriptions.sql
│   └── ...
├── package.json              # Workspace root (pnpm workspaces)
└── turbo.json                # Turborepo (opsiyonel, build optimizasyonu)
```

### Neden Monorepo?
- Web ve API arasında tip paylaşımı (`packages/shared`)
- Tek komutla build/deploy
- Claude Code için tek context — her şeyi birlikte görür

---

## 4. Frontend — Next.js

**Lokasyon:** `apps/web/`  
**Deploy:** Cloudflare Pages  
**Runtime:** Edge (`export const runtime = 'edge'` her sayfada)

### Routing Yapısı

```
src/app/
├── page.tsx                  # Landing (mevcut)
├── layout.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify/page.tsx
├── (app)/                    # Auth gerektiren sayfalar
│   ├── layout.tsx            # Auth guard
│   ├── dashboard/page.tsx
│   ├── messages/
│   │   ├── page.tsx          # Mesaj listesi
│   │   ├── new/page.tsx      # Yeni mesaj oluştur
│   │   └── [id]/page.tsx     # Mesaj detay
│   ├── recipients/page.tsx
│   └── settings/page.tsx
└── delivery/
    └── [token]/page.tsx      # Alıcı erişim sayfası (auth yok)
```

### State Yönetimi

MVP için harici state kütüphanesi yok. Standart React pattern:
- Server Components: veri fetch
- Client Components: interaktif UI, form state
- Cookie: JWT token saklama (`httpOnly`)

### API İletişimi

```ts
// apps/web/src/lib/api.ts
// Tüm fetch çağrıları buradan geçer
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Cookie tabanlı auth için
  })
  if (!res.ok) throw new ApiError(res.status, await res.json())
  return res.json()
}
```

---

## 5. Backend API — Cloudflare Workers + Hono

**Lokasyon:** `apps/api/`  
**Framework:** [Hono](https://hono.dev) — Express benzeri, edge-native, TypeScript  
**Deploy:** Cloudflare Workers  
**Base URL:** `api.vasi.co/api/v1/`

### Neden Hono?
- Express'e çok benzer → Claude Code kolayca yazar
- Cloudflare Workers + Node.js + Deno'da çalışır (taşınabilir)
- TypeScript-first
- Middleware sistemi Express ile aynı mantıkta

### Entry Point

```ts
// apps/api/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { messageRoutes } from './routes/messages'
import { recipientRoutes } from './routes/recipients'
import { deliveryRoutes } from './routes/delivery'
import { subscriptionRoutes } from './routes/subscriptions'

export type Env = {
  DB: D1Database
  BUCKET: R2Bucket
  QUEUE: Queue
  JWT_SECRET: string
  RESEND_API_KEY: string
  ENCRYPTION_KEY: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', cors({ origin: ['https://vasi.co', 'http://localhost:3000'] }))

app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/messages', messageRoutes)
app.route('/api/v1/messages', recipientRoutes)
app.route('/api/v1/delivery', deliveryRoutes)
app.route('/api/v1/subscriptions', subscriptionRoutes)

export default app
```

### Middleware — Auth

```ts
// apps/api/src/middleware/auth.ts
import { createMiddleware } from 'hono/factory'
import { verifyJWT } from '../lib/jwt'

export const authMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const token = getCookie(c, 'vasi_token')
    if (!token) return c.json({ error: 'Unauthorized' }, 401)
    const payload = await verifyJWT(token, c.env.JWT_SECRET)
    if (!payload) return c.json({ error: 'Invalid token' }, 401)
    c.set('userId', payload.sub)
    await next()
  }
)
```

### Route Örneği

```ts
// apps/api/src/routes/messages.ts
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { MessageService } from '../services/messages'

const messages = new Hono<{ Bindings: Env }>()

messages.use('*', authMiddleware)

messages.get('/', async (c) => {
  const userId = c.get('userId')
  const data = await MessageService.list(c.env.DB, userId)
  return c.json(data)
})

messages.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  const message = await MessageService.create(c.env.DB, userId, body)
  return c.json(message, 201)
})

export { messages as messageRoutes }
```

---

## 6. Veritabanı — Cloudflare D1

**Teknoloji:** SQLite (D1 — Cloudflare managed)  
**Migration:** `wrangler d1 migrations apply`

### Neden D1?
- Cloudflare Workers ile sıfır gecikme (aynı edge node)
- Ücretsiz tier: 5 GB, 5M satır okuma/gün
- Standart SQL — Postgres'e geçmek için yalnızca migration yeterli

### Portability Kuralı
D1'e özgü fonksiyon kullanma. Tüm sorgular standart SQL:
```sql
-- DOĞRU (standart SQL)
SELECT * FROM messages WHERE user_id = ? AND status = ?

-- YANLIŞ (D1'e özgü)
-- (D1 için kritik bir kısıtlama yok ama JSON fonksiyonları dikkatli kullanılmalı)
```

### Migration Stratejisi

```
migrations/
├── 0001_create_users.sql
├── 0002_create_subscriptions.sql
├── 0003_create_messages.sql
├── 0004_create_message_files.sql
├── 0005_create_recipients.sql
├── 0006_create_triggers.sql
└── 0007_create_audit_logs.sql
```

Her migration dosyası tek bir tablo oluşturur. Geri alınabilir (`-- migrate:down` bloğu ile).

### Query Pattern

```ts
// apps/api/src/db/messages.ts
export const MessageDB = {
  async findByUser(db: D1Database, userId: string) {
    return db
      .prepare('SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all()
  },

  async findById(db: D1Database, id: string, userId: string) {
    return db
      .prepare('SELECT * FROM messages WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first()
  },
}
```

---

## 7. Dosya Depolama — Cloudflare R2

**Teknoloji:** Cloudflare R2 (S3-uyumlu)  
**Erişim:** Doğrudan Workers üzerinden (public erişim kapalı)

### Dosya Yükleme Akışı

```
[Client] → POST /api/v1/messages/:id/files
         → [Worker] dosyayı alır
         → AES-256-GCM ile şifreler
         → R2'ye yükler (storage_key = uuid)
         → D1'e metadata kaydeder
         → {fileId, size} döner
```

### Dosya İndirme / Görüntüleme

```
[Alıcı Erişim Sayfası] → GET /api/v1/delivery/:token/files/:fileId
                       → [Worker] token doğrular
                       → R2'den dosyayı çeker
                       → Şifreyi çözer
                       → Stream olarak döner
```

### Storage Key Yapısı

```
{userId}/{messageId}/{uuid}.{ext}
```

R2'de bu key şifreli saklanır (D1'deki `storage_key` alanı AES-256-GCM ile şifrelenir).

---

## 8. Zamanlama & Mesaj İletimi

**Teknoloji:** Cloudflare Queues + Cron Triggers

### Genel Akış

```
[Trigger kaydedildi] → triggers tablosunda next_run_at set edildi
       ↓
[Cron Job — her gün 08:00 UTC] 
       ↓
SELECT * FROM triggers WHERE next_run_at <= NOW() AND status = 'active'
       ↓
Her satır için → Queue'ya mesaj ekle
       ↓
[Queue Consumer Worker]
       ↓
Mesajı al → Alıcılara e-posta gönder → D1 güncelle → next_run_at hesapla
```

### Cron Tanımı

```toml
# apps/api/wrangler.toml
[[triggers.crons]]
crons = ["0 8 * * *"]   # Her gün 08:00 UTC
```

### Queue Consumer

```ts
// apps/api/src/index.ts içine eklenir
export default {
  // HTTP handler
  fetch: app.fetch,

  // Cron handler
  async scheduled(event: ScheduledEvent, env: Env) {
    await processDueMessages(env)
  },

  // Queue handler
  async queue(batch: MessageBatch<QueueMessage>, env: Env) {
    for (const message of batch.messages) {
      await deliverMessage(env, message.body)
      message.ack()
    }
  },
}
```

### Uzun Vadeli Zamanlama (10+ Yıl)

**Sorun:** Cloudflare Queues mesajları uzun süre tutmaz.  
**Çözüm:** Mesaj queue'da saklanmaz; D1'de `next_run_at` ile saklanır. Her gün cron job çalışır ve o güne gelen mesajları queue'ya ekler. Veri D1'de durduğu sürece güvenli.

```
D1: triggers tablosu → next_run_at: 2036-03-15 08:00:00
Cron: 2036-03-15 sabahı çalışır → bu kaydı bulur → queue'ya ekler → iletir
```

---

## 9. E-posta — Resend

**Servis:** [Resend](https://resend.com)  
**Ücretsiz tier:** 3.000 e-posta/ay, 100/gün  
**MVP için yeterli**

### E-posta Türleri

| Tür | Tetikleyici | Şablon |
|-----|------------|--------|
| E-posta doğrulama | Kayıt | `verify-email` |
| Hoş geldin | Kayıt sonrası | `welcome` |
| Mesaj iletimi (alıcıya) | Zamanlama tetiklendi | `message-delivery` |
| Erişim bildirimi | Alıcı mesajı açtı | `message-opened` |
| Abonelik uyarısı | Bitiş T-30/7/1 | `subscription-reminder` |
| Şifre sıfırlama | Kullanıcı talebi | `reset-password` |

### Kullanım

```ts
// apps/api/src/lib/email.ts
import { Resend } from 'resend'

export async function sendDeliveryEmail(
  apiKey: string,
  recipient: { name: string; email: string },
  accessToken: string
) {
  const resend = new Resend(apiKey)
  await resend.emails.send({
    from: 'Vasi <mesaj@vasi.co>',
    to: recipient.email,
    subject: `${recipient.name}, sana bir mesaj var`,
    html: deliveryTemplate({ name: recipient.name, accessToken }),
  })
}
```

---

## 10. Kimlik Doğrulama — JWT

**Yöntem:** Custom JWT (harici auth servisi yok — minimum bağımlılık)  
**Saklama:** `httpOnly` cookie (XSS koruması)

### Token Yapısı

```ts
// Access token: 1 saat
// Refresh token: 7 gün (D1'de refresh_tokens tablosunda)

// Payload
{
  sub: "user-uuid",
  email: "user@example.com",
  plan: "personal",
  iat: 1234567890,
  exp: 1234571490
}
```

### Auth Akışı

```
[Login]
  POST /auth/login → şifre doğrula → JWT üret
  → Set-Cookie: vasi_token=<jwt>; HttpOnly; Secure; SameSite=Strict

[Her istek]
  Cookie otomatik gönderilir → authMiddleware doğrular

[Token yenileme]
  POST /auth/refresh → refresh token kontrol et → yeni access token

[Logout]
  POST /auth/logout → cookie sil + refresh token iptal et
```

### Şifre Hashing

```ts
// Web Crypto API (edge-native, Node.js built-in gerekmez)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key, 256
  )
  return `${toHex(salt)}:${toHex(hash)}`
}
```

---

## 11. Ortam Yönetimi

### Ortamlar

| Ortam | Branch | URL |
|-------|--------|-----|
| Production | `main` | vasi.co / api.vasi.co |
| Test | `TEST` | test.vasi.co / api-test.vasi.co |
| Dev | `DEV` | localhost:3000 / localhost:8787 |

### Environment Variables

**Web (`apps/web/.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

**API (`apps/api/.dev.vars`):**
```
JWT_SECRET=<random-32-byte-hex>
ENCRYPTION_KEY=<random-32-byte-hex>
RESEND_API_KEY=re_xxxx
NETGSM_USER=xxxx
NETGSM_PASS=xxxx
```

**Cloudflare Dashboard'da (production secrets):**
Tüm üretim secret'ları `wrangler secret put` veya Dashboard UI ile ayarlanır. `.env` dosyaları repoya commit edilmez.

---

## 12. CI/CD

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main, TEST]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter api run build
      - run: pnpm wrangler deploy --env ${{ github.ref == 'refs/heads/main' && 'production' || 'test' }}
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm --filter web run build
      # Cloudflare Pages otomatik deploy (Pages GitHub entegrasyonu)
```

### Deploy Akışı

```
DEV branch → local test
TEST branch → otomatik deploy → test.vasi.co
main branch → otomatik deploy → vasi.co
```

---

## 13. Taşınabilirlik Notları

Cloudflare'den çıkış gerekirse değiştirilecekler:

| Bileşen | Değişim | Efor |
|---------|---------|------|
| Pages → Vercel/Netlify | `next.config.ts`'de adapter değiştir | Düşük |
| Workers → Node.js | Hono aynı kodu Node.js'de çalıştırır | Düşük |
| D1 → PostgreSQL | SQL sorguları büyük oranda uyumlu; tip farklılıkları için migration gerekli | Orta |
| R2 → AWS S3 | S3-uyumlu API; endpoint URL değiştir | Çok düşük |
| Queues → BullMQ | Queue consumer mantığı aynı; Redis ekle | Orta |

**Taşınabilirliği korumak için:**
- D1'e özgü JSON fonksiyonlarından kaçın
- `crypto.subtle` kullan (`node:crypto` değil)
- Cloudflare-specific binding'leri interface arkasına sakla

```ts
// DOĞRU — interface arkasında
interface StorageProvider {
  put(key: string, data: ArrayBuffer): Promise<void>
  get(key: string): Promise<ArrayBuffer | null>
}

class R2Storage implements StorageProvider { ... }
class S3Storage implements StorageProvider { ... }  // Gelecekte geçiş için
```

---

## 14. Maliyet Tahmini (MVP — İlk 6 ay)

| Servis | Ücretsiz Limit | Tahmini Kullanım | Maliyet |
|--------|---------------|-----------------|---------|
| Cloudflare Pages | Sınırsız | Web hosting | $0 |
| Cloudflare Workers | 100K req/gün | API istekleri | $0 |
| Cloudflare D1 | 5 GB, 5M okuma/gün | Veritabanı | $0 |
| Cloudflare R2 | 10 GB storage | Dosya depolama | $0–$1 |
| Cloudflare Queues | 1M mesaj/ay | Zamanlama | $0 |
| Resend | 3K e-posta/ay | İletim bildirimleri | $0 |
| Netgsm | — | SMS (opsiyonel) | ~$5–20 |
| Domain (vasi.co) | — | — | ~$15/yıl |
| **Toplam** | | | **~$5–20/ay** |

---

*Vasi App Teknik Mimari v1.0 — Haziran 2026 — Dahili Kullanım*
