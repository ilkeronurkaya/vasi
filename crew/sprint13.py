"""
Sprint 13 — Admin Panel: Backend (5 Backend Ajani Task)
========================================================
Task 1: Migration + adminMiddleware + admin login endpoint
Task 2: Kullanıcı yönetimi endpoints (GET/PATCH users)
Task 3: İstatistik endpoints (overview, daily, plans)
Task 4: Rapor endpoints (user report, revenue, failed deliveries)
Task 5: admin_settings GET/PUT + messages.ts hardcoded limit → DB'den oku

Kurallar:
- Her task öncesi belirtilen dosyaları OKU.
- Mevcut koda DOKUNMA; sadece görevde belirtilen yerleri değiştir veya ekle.
- Her task sonunda `npx tsc --noEmit` çalıştır (vasi-api/ dizininde). Hata varsa düzelt.
- Commit mesajı görev sonunda verilmiştir — aynen kullan.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Migration + adminMiddleware + admin login
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Admin altyapısı — migration, middleware, login endpoint

### Adım 1: Migration dosyaları oluştur

**`migrations/0011_add_is_admin.sql`** (yeni dosya):
```sql
ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;
```

**`migrations/0012_create_admin_settings.sql`** (yeni dosya):
```sql
CREATE TABLE IF NOT EXISTS admin_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO admin_settings (key, value) VALUES
  ('plan_limit_free',        '10'),
  ('plan_limit_personal',    '100'),
  ('plan_limit_unlimited',   '1000'),
  ('recipient_limit_free',   '10'),
  ('recipient_limit_personal','50'),
  ('price_personal_monthly', '49'),
  ('price_family_monthly',   '99');
```

### Adım 2: adminMiddleware oluştur

**`vasi-api/src/middleware/adminAuth.ts`** (yeni dosya):
```ts
import type { Next } from 'hono'
import { verifyToken } from '../lib/jwt'

export async function adminMiddleware(c: any, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
  }
  const token = authHeader.substring(7)
  const payload = await verifyToken(token, c.env.JWT_SECRET)
  if (!payload) {
    return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401)
  }
  if ((payload as any).role !== 'admin') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403)
  }
  c.set('userId', (payload as any).userId)
  c.set('role', 'admin')
  await next()
}
```

### Adım 3: Admin login route oluştur

**`vasi-api/src/routes/admin.ts`** (yeni dosya — sadece login handler, diğer task'lar genişletecek):
```ts
import { Hono } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { adminMiddleware } from '../middleware/adminAuth'
import { findByEmail } from '../db/users.db'
import { generateAccessToken } from '../lib/jwt'
import type { Env } from '../types'

const admin = new Hono<{ Bindings: Env; Variables: { userId: string; role: string } }>()

// ── Admin Login (public) ──────────────────────────────────────────────────
admin.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  if (!email || !password) {
    return c.json({ error: 'email ve password zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }

  // Kullanıcıyı bul
  const user = await findByEmail(c.env, email)
  if (!user) {
    return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401)
  }

  // is_admin kontrolü
  if (!user.is_admin) {
    return c.json({ error: 'Yetkisiz erişim', code: 'FORBIDDEN' }, 403)
  }

  // Şifre doğrulama — Web Crypto API (mevcut auth.service.ts'deki pattern):
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (passwordHash !== user.password_hash) {
    return c.json({ error: 'Geçersiz kimlik bilgileri', code: 'INVALID_CREDENTIALS' }, 401)
  }

  // role: 'admin' ile token üret
  const accessToken = await generateAccessToken(
    { userId: user.id, role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 },
    c.env.JWT_SECRET
  )

  return c.json({ accessToken, role: 'admin' }, 200)
})

export { admin as adminRoutes }
```

### Adım 4: index.ts'e admin route'u ekle

`vasi-api/src/index.ts` dosyasını oku. Şu satırları ekle:

Import bölümüne:
```ts
import { adminRoutes } from './routes/admin'
```

`app.route('/api/v1/me', meRoutes)` satırından SONRA:
```ts
app.route('/api/v1/admin', adminRoutes)
```

### Doğrulama
`vasi-api/` dizininde `npx tsc --noEmit`. Hata yoksa commit at.

Commit mesajı: `feat(admin): migration (is_admin + admin_settings) + adminMiddleware + login endpoint`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Kullanıcı yönetimi endpoints
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Admin kullanıcı yönetimi endpoints

### Önce oku
- `vasi-api/src/routes/admin.ts` (Task 1'de oluşturuldu — buraya ekleyeceksin)
- `vasi-api/src/middleware/adminAuth.ts`

### Eklenecek 4 endpoint — `admin.ts` dosyasının sonuna ekle (export'tan önce)

Tüm endpointlerde `admin.use('/users*', adminMiddleware)` middleware'ini kullan:

```ts
admin.use('/users*', adminMiddleware)
```

---

**1. GET /admin/users** — Kullanıcı listesi (sayfalı, filtrelenebilir)

Query params: `?page=1&limit=20&status=active&plan=free&q=arama`

```ts
admin.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '20')
  const offset = (page - 1) * limit
  const status = c.req.query('status')   // 'active' | 'suspended' | 'deleted' | undefined
  const plan = c.req.query('plan')       // 'free' | 'personal' | undefined
  const q = c.req.query('q')            // email veya ad arama

  let query = `
    SELECT u.id, u.email, u.first_name, u.last_name, u.status, u.email_verified,
           u.is_admin, u.created_at,
           COALESCE(s.plan_type, 'free') AS plan_type, s.status AS sub_status,
           COUNT(DISTINCT m.id) AS message_count
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN messages m ON m.user_id = u.id AND m.status != 'cancelled'
    WHERE 1=1
  `
  const bindings: any[] = []

  if (status) { query += ` AND u.status = ?`; bindings.push(status) }
  if (plan === 'free') { query += ` AND (s.plan_type IS NULL OR s.plan_type = 'free')`; }
  else if (plan) { query += ` AND s.plan_type = ?`; bindings.push(plan) }
  if (q) { query += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`; bindings.push(`%${q}%`, `%${q}%`, `%${q}%`) }

  query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?`
  bindings.push(limit, offset)

  const result = await c.env.DB.prepare(query).bind(...bindings).all()

  const countQuery = `SELECT COUNT(DISTINCT u.id) AS total FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE 1=1`
  const totalRow = await c.env.DB.prepare(countQuery).first()

  return c.json({ users: result.results, total: totalRow?.total ?? 0, page, limit })
})
```

---

**2. GET /admin/users/:id** — Kullanıcı detayı

```ts
admin.get('/users/:id', async (c) => {
  const id = c.req.param('id')

  const user = await c.env.DB.prepare(`
    SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
           u.status, u.email_verified, u.is_admin, u.created_at, u.updated_at,
           COALESCE(s.plan_type, 'free') AS plan_type, s.status AS sub_status,
           s.started_at, s.expires_at, s.last_payment_at
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.id = ?
  `).bind(id).first()

  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  const stats = await c.env.DB.prepare(`
    SELECT
      COUNT(DISTINCT m.id) AS message_count,
      SUM(CASE WHEN m.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
      SUM(CASE WHEN m.status = 'error' THEN 1 ELSE 0 END) AS failed_count,
      COUNT(DISTINCT r.id) AS recipient_count
    FROM messages m
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE m.user_id = ? AND m.status != 'cancelled'
  `).bind(id).first()

  return c.json({ user, stats })
})
```

---

**3. PATCH /admin/users/:id/status** — Askıya al / aktifleştir

```ts
admin.patch('/users/:id/status', async (c) => {
  const id = c.req.param('id')
  const adminId = c.get('userId')
  const { status } = await c.req.json()

  if (!['active', 'suspended'].includes(status)) {
    return c.json({ error: 'Geçersiz status. active veya suspended olmalı.', code: 'VALIDATION_ERROR' }, 400)
  }

  const user = await c.env.DB.prepare(`SELECT id FROM users WHERE id = ?`).bind(id).first()
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  await c.env.DB.prepare(
    `UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(status, id).run()

  // Audit log
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES (?, ?, ?, 'user', ?, ?, datetime('now'))
  `).bind(crypto.randomUUID(), adminId, `admin_status_change_${status}`, id, c.req.header('CF-Connecting-IP') ?? '').run()

  return c.json({ success: true, status })
})
```

---

**4. PATCH /admin/users/:id/plan** — Plan değiştir

```ts
admin.patch('/users/:id/plan', async (c) => {
  const id = c.req.param('id')
  const adminId = c.get('userId')
  const { plan_type } = await c.req.json()

  if (!['free', 'personal'].includes(plan_type)) {
    return c.json({ error: 'Geçersiz plan_type. free veya personal olmalı.', code: 'VALIDATION_ERROR' }, 400)
  }

  const user = await c.env.DB.prepare(`SELECT id FROM users WHERE id = ?`).bind(id).first()
  if (!user) return c.json({ error: 'Kullanıcı bulunamadı', code: 'NOT_FOUND' }, 404)

  // Aktif subscription varsa güncelle, yoksa oluştur
  const existing = await c.env.DB.prepare(
    `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active'`
  ).bind(id).first()

  if (existing) {
    await c.env.DB.prepare(
      `UPDATE subscriptions SET plan_type = ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(plan_type, existing.id).run()
  } else {
    await c.env.DB.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_type, status, started_at, created_at, updated_at)
      VALUES (?, ?, ?, 'active', datetime('now'), datetime('now'), datetime('now'))
    `).bind(crypto.randomUUID(), id, plan_type).run()
  }

  // Audit log
  await c.env.DB.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, created_at)
    VALUES (?, ?, ?, 'subscription', ?, ?, datetime('now'))
  `).bind(crypto.randomUUID(), adminId, `admin_plan_change_${plan_type}`, id, c.req.header('CF-Connecting-IP') ?? '').run()

  return c.json({ success: true, plan_type })
})
```

### Doğrulama
`vasi-api/` dizininde `npx tsc --noEmit`. Hata yoksa commit at.

Commit mesajı: `feat(admin): kullanıcı yönetimi endpoints — list, detail, status, plan`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: İstatistik endpoints
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Admin istatistik endpoints (3 endpoint)

### Önce oku
`vasi-api/src/routes/admin.ts` (mevcut hali)

### Tüm endpointlerde middleware zaten `admin.use('/users*', adminMiddleware)` ile tanımlı.
Stats için ayrı middleware satırı ekle:

```ts
admin.use('/stats*', adminMiddleware)
```

Ardından 3 endpoint ekle (export'tan önce):

---

**1. GET /admin/stats/overview**

```ts
admin.get('/stats/overview', async (c) => {
  const row = await c.env.DB.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE status != 'deleted') AS total_users,
      (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
      (SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND plan_type != 'free') AS paid_subs,
      (SELECT COUNT(*) FROM messages WHERE status = 'delivered') AS total_delivered,
      (SELECT COUNT(*) FROM messages WHERE status = 'error') AS total_failed,
      (SELECT COUNT(*) FROM messages WHERE date(created_at) = date('now')) AS messages_today,
      ROUND(
        (SELECT COUNT(*) FROM messages WHERE status = 'delivered') * 100.0 /
        NULLIF((SELECT COUNT(*) FROM messages WHERE status NOT IN ('draft','cancelled')), 0),
      2) AS delivery_rate_pct
  `).first()
  return c.json(row)
})
```

---

**2. GET /admin/stats/messages** — Günlük/aylık mesaj istatistiği

Query param: `?period=daily` (varsayılan) veya `?period=monthly`

```ts
admin.get('/stats/messages', async (c) => {
  const period = c.req.query('period') ?? 'daily'

  let groupBy: string
  if (period === 'monthly') {
    groupBy = `strftime('%Y-%m', created_at)`
  } else {
    groupBy = `date(created_at)`
  }

  const result = await c.env.DB.prepare(`
    SELECT
      ${groupBy} AS period,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
      SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
      SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft
    FROM messages
    WHERE created_at >= datetime('now', '${period === 'monthly' ? '-12 months' : '-30 days'}')
    GROUP BY ${groupBy}
    ORDER BY period DESC
  `).all()

  return c.json({ period, data: result.results })
})
```

NOT: `groupBy` değişkeni SQL template literal içinde kullanılıyor — bunu doğrudan string interpolation ile yaz, bind() ile değil (SQL inject riski yok çünkü iki sabit string'den biri, kullanıcı inputu değil).

---

**3. GET /admin/stats/plans** — Plan dağılımı

```ts
admin.get('/stats/plans', async (c) => {
  const result = await c.env.DB.prepare(`
    SELECT
      COALESCE(s.plan_type, 'free') AS plan_type,
      COUNT(DISTINCT u.id) AS user_count
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    WHERE u.status != 'deleted'
    GROUP BY COALESCE(s.plan_type, 'free')
    ORDER BY user_count DESC
  `).all()
  return c.json({ plans: result.results })
})
```

### Doğrulama
`vasi-api/` dizininde `npx tsc --noEmit`. Hata yoksa commit at.

Commit mesajı: `feat(admin): istatistik endpoints — overview, messages, plan dağılımı`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Rapor endpoints
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Admin rapor endpoints (3 endpoint)

### Önce oku
`vasi-api/src/routes/admin.ts` (mevcut hali)

### Middleware satırı ekle (export'tan önce, diğer middleware satırlarının yanına):

```ts
admin.use('/reports*', adminMiddleware)
```

Ardından 3 endpoint ekle:

---

**1. GET /admin/reports/users** — Kullanıcı başına mesaj/alıcı raporu

Query params: `?page=1&limit=50`

```ts
admin.get('/reports/users', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '50')
  const offset = (page - 1) * limit

  const result = await c.env.DB.prepare(`
    SELECT
      u.id, u.email, u.first_name, u.last_name, u.status,
      COALESCE(s.plan_type, 'free') AS plan_type,
      COUNT(DISTINCT m.id) AS message_count,
      SUM(CASE WHEN m.status = 'delivered' THEN 1 ELSE 0 END) AS delivered_count,
      SUM(CASE WHEN m.status = 'error' THEN 1 ELSE 0 END) AS failed_count,
      COUNT(DISTINCT r.id) AS recipient_count,
      MAX(m.created_at) AS last_message_at
    FROM users u
    LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
    LEFT JOIN messages m ON m.user_id = u.id AND m.status != 'cancelled'
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE u.status != 'deleted'
    GROUP BY u.id
    ORDER BY message_count DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  return c.json({ data: result.results, page, limit })
})
```

---

**2. GET /admin/reports/revenue** — Plan bazlı tahmini gelir

```ts
admin.get('/reports/revenue', async (c) => {
  // Plan fiyatlarını admin_settings'ten oku
  const pricePersonal = await c.env.DB.prepare(
    `SELECT value FROM admin_settings WHERE key = 'price_personal_monthly'`
  ).first()
  const priceFamily = await c.env.DB.prepare(
    `SELECT value FROM admin_settings WHERE key = 'price_family_monthly'`
  ).first()

  const personalPrice = parseFloat((pricePersonal?.value as string) ?? '49')
  const familyPrice = parseFloat((priceFamily?.value as string) ?? '99')

  const result = await c.env.DB.prepare(`
    SELECT
      plan_type,
      COUNT(*) AS subscriber_count
    FROM subscriptions
    WHERE status = 'active' AND plan_type != 'free'
    GROUP BY plan_type
  `).all()

  const rows = result.results as Array<{ plan_type: string; subscriber_count: number }>
  const breakdown = rows.map(r => ({
    plan_type: r.plan_type,
    subscriber_count: r.subscriber_count,
    unit_price: r.plan_type === 'personal' ? personalPrice : familyPrice,
    monthly_revenue: r.subscriber_count * (r.plan_type === 'personal' ? personalPrice : familyPrice),
  }))

  const total_monthly = breakdown.reduce((sum, r) => sum + r.monthly_revenue, 0)
  return c.json({ breakdown, total_monthly_revenue: total_monthly })
})
```

---

**3. GET /admin/reports/failed-deliveries** — Başarısız teslimat listesi

```ts
admin.get('/reports/failed-deliveries', async (c) => {
  const page = parseInt(c.req.query('page') ?? '1')
  const limit = parseInt(c.req.query('limit') ?? '30')
  const offset = (page - 1) * limit

  const result = await c.env.DB.prepare(`
    SELECT
      m.id AS message_id, m.title, m.status, m.created_at, m.updated_at,
      u.id AS user_id, u.email AS user_email, u.first_name, u.last_name,
      COUNT(r.id) AS recipient_count
    FROM messages m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN recipients r ON r.message_id = m.id
    WHERE m.status = 'error'
    GROUP BY m.id
    ORDER BY m.updated_at DESC
    LIMIT ? OFFSET ?
  `).bind(limit, offset).all()

  const totalRow = await c.env.DB.prepare(
    `SELECT COUNT(*) AS total FROM messages WHERE status = 'error'`
  ).first()

  return c.json({ data: result.results, total: totalRow?.total ?? 0, page, limit })
})
```

### Doğrulama
`vasi-api/` dizininde `npx tsc --noEmit`. Hata yoksa commit at.

Commit mesajı: `feat(admin): rapor endpoints — user report, revenue, failed deliveries`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 5: admin_settings GET/PUT + messages.ts limit refactor
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: admin_settings endpoint + messages.ts hardcoded limit → DB'den oku

### A) admin_settings endpoints — admin.ts'e ekle

Önce `vasi-api/src/routes/admin.ts` dosyasını oku.

Middleware satırı ekle:
```ts
admin.use('/settings*', adminMiddleware)
```

**GET /admin/settings** — Tüm ayarları döndür:
```ts
admin.get('/settings', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value, updated_at FROM admin_settings ORDER BY key`
  ).all()
  // key-value object'e dönüştür
  const settings: Record<string, string> = {}
  for (const row of result.results as Array<{ key: string; value: string }>) {
    settings[row.key] = row.value
  }
  return c.json({ settings })
})
```

**PUT /admin/settings** — Tek bir ayarı güncelle:
```ts
admin.put('/settings', async (c) => {
  const { key, value } = await c.req.json()
  if (!key || value === undefined) {
    return c.json({ error: 'key ve value zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }
  // Yalnızca mevcut key'lerin güncellenmesine izin ver
  const existing = await c.env.DB.prepare(
    `SELECT key FROM admin_settings WHERE key = ?`
  ).bind(key).first()
  if (!existing) {
    return c.json({ error: 'Bilinmeyen ayar anahtarı', code: 'NOT_FOUND' }, 404)
  }
  await c.env.DB.prepare(
    `UPDATE admin_settings SET value = ?, updated_at = datetime('now') WHERE key = ?`
  ).bind(String(value), key).run()
  return c.json({ success: true, key, value: String(value) })
})
```

---

### B) messages.ts hardcoded limit → admin_settings'ten oku

Önce `vasi-api/src/routes/messages.ts` dosyasını oku.

`messages.post('/')` handler'ında şu bloğu bul:
```ts
const limit = plan === 'free' ? 10 : plan === 'personal' ? 100 : 1000
```

Bu satırı şununla değiştir (DB'den oku):
```ts
const limitKey = plan === 'free' ? 'plan_limit_free'
  : plan === 'personal' ? 'plan_limit_personal'
  : 'plan_limit_unlimited'
const limitRow = await c.env.DB.prepare(
  `SELECT value FROM admin_settings WHERE key = ?`
).bind(limitKey).first()
const limit = parseInt((limitRow?.value as string) ?? (plan === 'free' ? '10' : plan === 'personal' ? '100' : '1000'))
```

Fallback (parseInt'e verilen string): admin_settings tablosu boş veya eksikse hardcoded değerlere düşer — güvenli.

Bu değişiklik `messages.ts` dosyasının YALNIZCA bu satırını etkiliyor. Başka hiçbir şeye DOKUNMA.

---

### Doğrulama
`vasi-api/` dizininde `npx tsc --noEmit`. Hata yoksa commit at.

Commit mesajı: `feat(admin): settings endpoints + messages plan limit DB'den okunuyor`
""",
    ),
]


CLOSED = True  # sprint kapandı — tekrar koşturulamaz
