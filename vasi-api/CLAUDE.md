# vasi-api — Geliştirme Kuralları

Bu dosya, vasi-api projesinde yapılan **her değişiklikte** uyulması zorunlu kurallardır.
Referans dokümanlar: `../Vasi_Technical_Architecture.md`, `../Vasi_PRD_v2.md`, `../Vasi_MVP_Scope.md`

---

## ⚠️ KONTROL LİSTESİ — Her Değişiklik Öncesi

- [ ] Yeni endpoint'te `authMiddleware` kullanıldı mı? (public endpoint'ler hariç)
- [ ] D1 sorgusu `prepare().bind()` pattern'ı ile mi yazıldı?
- [ ] Hassas veri (`content_text`, `email`, `phone`, `storage_key`) şifrelendi mi?
- [ ] Hata response'ları standart formatta mı? `{ error: string, code?: string }`
- [ ] Node.js built-in (`fs`, `path`, `crypto`) kullanılmadı mı? Web Crypto API kullan.
- [ ] Yeni binding varsa `wrangler.toml` ve `Env` tipine eklendi mi?

---

## 1. Proje Yapısı

```
vasi-api/src/
├── index.ts              # Entry point — fetch, scheduled, queue handler'ları
├── routes/               # Her domain için ayrı route dosyası
│   ├── auth.ts
│   ├── users.ts
│   ├── messages.ts
│   ├── recipients.ts
│   ├── subscriptions.ts
│   └── delivery.ts       # Public — auth gerektirmez
├── middleware/
│   ├── auth.ts           # JWT doğrulama
│   └── ratelimit.ts      # Rate limiting
├── services/             # İş mantığı — route'dan bağımsız
│   ├── auth.service.ts
│   ├── message.service.ts
│   ├── delivery.service.ts
│   └── iyzico.service.ts
├── db/                   # D1 sorguları — saf SQL, business logic yok
│   ├── users.db.ts
│   ├── messages.db.ts
│   ├── recipients.db.ts
│   └── triggers.db.ts
├── lib/                  # Yardımcı fonksiyonlar
│   ├── crypto.ts         # AES-256-GCM şifreleme/çözme
│   ├── jwt.ts            # Token üretme/doğrulama
│   ├── otp.ts            # OTP üretme/hashleme
│   └── uuid.ts           # UUID üretme (crypto.randomUUID)
└── types/
    └── index.ts          # Paylaşılan tipler
```

---

## 2. Hono Kuralları

### Route Pattern

```ts
// routes/messages.ts
import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { authMiddleware } from '../middleware/auth'
import { MessageService } from '../services/message.service'
import type { Env } from '../types'   // ✅ DOĞRU — index.ts'ten değil!

// ✅ Hono generic tipi ZORUNLU — yoksa c.env tipi 'unknown' olur
const messages = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

messages.use('*', authMiddleware)

messages.get('/', async (c) => {
  const userId = c.get('userId')
  const result = await MessageService.list(c.env.DB, userId)
  return c.json(result)
})

messages.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json()
  // Validasyon
  if (!body.message_type) return c.json({ error: 'message_type zorunlu' }, 400)
  const message = await MessageService.create(c.env.DB, userId, body)
  return c.json(message, 201)
})

export { messages as messageRoutes }
```

### Hata Response Formatı

Her hata aynı formatta dönmeli:
```ts
// 400 — Validation
c.json({ error: 'title zorunlu', code: 'VALIDATION_ERROR' }, 400)

// 401 — Auth
c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)

// 403 — Yetki
c.json({ error: 'Bu mesaj size ait değil', code: 'FORBIDDEN' }, 403)

// 404
c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)

// 500
c.json({ error: 'Sunucu hatası', code: 'INTERNAL_ERROR' }, 500)
```

---

## 3. D1 Sorgu Kuralları

### Her zaman prepare + bind kullan (SQL injection koruması)

```ts
// DOĞRU
const user = await env.DB
  .prepare('SELECT * FROM users WHERE id = ? AND status = ?')
  .bind(userId, 'active')
  .first()

// YANLIŞ
const user = await env.DB
  .prepare(`SELECT * FROM users WHERE id = '${userId}'`)
  .first()
```

### Sonuç kontrolü

```ts
const message = await MessageDB.findById(env.DB, id, userId)
if (!message) return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
```

### UUID üretimi

```ts
// Edge'de çalışan yol
const id = crypto.randomUUID()
```

---

## 4. Şifreleme — ZORUNLU

Şu alanlar D1'e yazılmadan önce şifrelenmeli:
- `messages.content_text`
- `message_files.storage_key`
- `recipients.email`
- `recipients.phone`
- `subscriptions.iyzico_card_user_key`
- `subscriptions.iyzico_card_token`

```ts
// lib/crypto.ts kullan
import { encrypt, decrypt } from '../lib/crypto'

// Kaydetmeden önce
const encryptedEmail = await encrypt(recipient.email, env.ENCRYPTION_KEY)

// Okuduktan sonra
const email = await decrypt(record.email, env.ENCRYPTION_KEY)
```

### Şifreleme implementasyonu (Web Crypto API)

```ts
// lib/crypto.ts
export async function encrypt(text: string, keyHex: string): Promise<string> {
  const key = await importKey(keyHex)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array([...iv, ...new Uint8Array(cipher)])
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(cipherB64: string, keyHex: string): Promise<string> {
  const key = await importKey(keyHex)
  const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(plain)
}

async function importKey(keyHex: string): Promise<CryptoKey> {
  const keyBytes = hexToBytes(keyHex)
  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt', 'decrypt'])
}
```

---

## 5. JWT Kuralları

```ts
// lib/jwt.ts — Web Crypto API ile (node:crypto değil)

// Access token: 1 saat
// Refresh token: 7 gün (D1'de saklanır)

// Cookie ayarları — XSS koruması için httpOnly zorunlu
setCookie(c, 'vasi_token', accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  path: '/',
  maxAge: 60 * 60, // 1 saat
})
```

---

## 6. OTP Kuralları

```ts
// lib/otp.ts

// 6 haneli OTP üretimi
export function generateOTP(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1000000).padStart(6, '0')
}

// Hash ile sakla — asla plain text
export async function hashOTP(otp: string): Promise<string> {
  const encoded = new TextEncoder().encode(otp)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

// Geçerlilik süresi: 10 dakika
// Yanlış deneme limiti: 5 (recipients.otp_attempts)
```

---

## 7. Tip Kuralları — Sprint 2'den Öğrenilen Hatalar

### Env tipi
```ts
// ✅ DOĞRU — src/types.ts'ten import et
import type { Env } from '../types'

// ❌ YANLIŞ — index.ts Env export etmez
import type { Env } from '../index'
```

### Service fonksiyonları hata döndürme
```ts
// ✅ DOĞRU — status sayısal alan olarak objeye dahil et
return { error: 'E-posta zaten kayıtlı', code: 'EMAIL_ALREADY_REGISTERED', status: 409 }

// ❌ YANLIŞ — virgül operatörü, TS'de çalışmaz
return { error: 'E-posta zaten kayıtlı' }, 409
```

### Route'larda dinamik status kodu
```ts
// ✅ DOĞRU — ContentfulStatusCode'a cast et
import type { ContentfulStatusCode } from 'hono/utils/http-status'
return c.json(result, (result.status as number) as ContentfulStatusCode)

// ❌ YANLIŞ — number tipi ContentfulStatusCode'a atanamaz
return c.json(result, result.status as number)
```

### Env secret anahtarları
```ts
// ✅ DOĞRU
env.JWT_SECRET

// ❌ YANLIŞ — bu binding yoktur
env.SECRET_KEY
```

### DB fonksiyon imzaları
```ts
// ✅ DOĞRU — recipients.db.ts create() userId ister
RecipientsDB.create(env, messageId, userId, data)

// ❌ YANLIŞ — userId eksik
RecipientsDB.create(env, messageId, data)
```

---

## 8. Neyi Yapma (Anti-Patterns)

```ts
// ❌ Node.js built-in
import crypto from 'node:crypto'
import fs from 'fs'

// ❌ SQL injection riski
.prepare(`SELECT * FROM users WHERE email = '${email}'`)

// ❌ Şifresiz hassas veri kaydetme
await db.prepare('INSERT INTO recipients (email) VALUES (?)').bind(email).run()

// ❌ console.log ile hassas veri
console.log('OTP:', otpCode, 'User:', user.email)

// ❌ any tipi
const body: any = await c.req.json()

// ❌ Herkese açık endpoint'e authMiddleware eksikliği
messages.get('/:id', async (c) => { ... })  // middleware yok!
```

---

## Referans Dokümanlar

| Doküman | Yol |
|---------|-----|
| Teknik Mimari | `../Vasi_Technical_Architecture.md` |
| PRD v2 | `../Vasi_PRD_v2.md` |
| MVP Kapsamı | `../Vasi_MVP_Scope.md` |
| DB Migrations | `../migrations/` |
| Hono Docs | https://hono.dev/docs |
| Cloudflare Workers | https://developers.cloudflare.com/workers/ |
| D1 Docs | https://developers.cloudflare.com/d1/ |

---

*Son güncelleme: Haziran 2026*
