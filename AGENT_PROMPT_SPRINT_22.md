# OpenHands Ajan Promtu — Sprint 22 (İyzico Checkout Form)

> Bunu OpenHands'te YENİ bir konuşmaya yapıştır. Repo kökü `/workspace`. Önce `/workspace/AGENTS.md` oku.

---

Sen bu sprint'te YALNIZCA kod ve test yazıyorsun. **Branch açma, commit, merge, push YAPMA.** Sadece çalışma ağacında (`/workspace`) dosyaları düzenle. Bitince bana (1) değiştirdiğin/eklediğin dosyaların listesini ve (2) `git status` çıktısını ver. Git'e hiç dokunma. İlk iş: `/workspace/AGENTS.md`'yi oku ve kurallarına uy (kod+test aynı değişiklikte; şema değişikliği = yeni migration; mevcut testleri silme/zayıflatma).

## Görev
Vasi'ye İyzico **Checkout Form** ile **tek seferlik** ücretli plana yükseltme ekle. Başarılı ödeme kullanıcıyı `personal` (Premium) planına 30 günlüğüne yükseltsin. Kart saklama / recurring / webhook **KAPSAM DIŞI**.

İyzico merchant kimlik bilgileri henüz YOK. Bu yüzden kod, `IYZICO_MODE=mock` ile **ağ olmadan, deterministik** çalışmalı (smoke böyle geçecek). Gerçek İyzico'ya `fetch` yalnız `IYZICO_MODE=sandbox|production`'da yapılır.

## KRİTİK kısıt — edge runtime
API Cloudflare Workers (edge) üzerinde çalışır. **`iyzipay` npm paketini, Node `crypto`/`http`/`https` modüllerini KULLANMA** — edge'de çalışmaz. İmzalamayı **Web Crypto API** (`crypto.subtle`) ile yap. Sadece `fetch` + Web Crypto.

### İyzico v2 imza (IYZWSv2) — birebir uygula
```
randomKey = String(Date.now()) + <rastgele rakamlar>
payload   = randomKey + uriPath + requestBodyString   (body yoksa: randomKey + uriPath)
signature = HEX( HMAC_SHA256(payload, secretKey) )      // HEX (lowercase). base64 DEĞİL.
authStr   = "apiKey:" + apiKey + "&randomKey:" + randomKey + "&signature:" + signature
Authorization header = "IYZWSv2 " + base64(authStr)      // IYZWSv2 ile base64 arası TEK boşluk
ek header'lar: "x-iyzi-rnd: " + randomKey  ve  "Content-Type: application/json"
```
- `requestBodyString`, gövdede gönderdiğin JSON string'in TIPATIP aynısı olmalı (imza ile gönderilen body birebir eşleşmeli — `JSON.stringify` çıktısını bir kez üretip hem imzaya hem body'ye ver).
- Web Crypto ile hex: `importKey('raw', enc(secretKey), {name:'HMAC',hash:'SHA-256'}, false, ['sign'])` → `sign('HMAC', key, enc(payload))` → ArrayBuffer'ı baytları 2 haneli hex'e çevirerek birleştir.

### İyzico endpoint'leri
- base URL: sandbox `https://sandbox-api.iyzipay.com` (Env `IYZICO_BASE_URL` ile override edilebilir, default sandbox).
- Initialize: `POST {base}/payment/iyzipos/checkoutform/initialize/auth/ecom`
- Retrieve:   `POST {base}/payment/iyzipos/checkoutform/auth/ecom/detail`  body: `{locale:"tr", conversationId, token}`
- `uriPath` imzada sorgu parametresiz path'tir (ör. `/payment/iyzipos/checkoutform/initialize/auth/ecom`).

## Yapılacaklar

### 1) Migration — `migrations/0015_create_payments.sql`
`payments` tablosu (audit + idempotency). `IF NOT EXISTS` kullan, elle ALTER YOK:
```sql
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  conversation_id TEXT NOT NULL,
  iyzico_token TEXT,
  iyzico_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failure')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_user  ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_token ON payments(iyzico_token);
```
(Diğer migration'lardaki `-- migrate:up` başlık biçimine uy.)

### 2) `vasi-api/src/lib/iyzico.ts`
İki fonksiyon export et:
- `initializeCheckoutForm(env, { conversationId, price, paidPrice, buyerEmail, basketItemName, callbackUrl })` → `{ token, paymentPageUrl }`.
- `retrieveCheckoutForm(env, token)` → `{ paymentStatus: 'SUCCESS'|'FAILURE', paidPrice, paymentId, raw }`.

Mod ayrımı (`env.IYZICO_MODE`):
- `mock`:
  - initialize → `token = "mock_" + conversationId`; `paymentPageUrl = (env.APP_URL ?? "http://localhost:3000") + "/api/v1/payment/checkout/callback?token=" + token`. Ağ YOK.
  - retrieve → token `"fail"` içeriyorsa `{paymentStatus:'FAILURE'}`; aksi halde `{paymentStatus:'SUCCESS', paidPrice: <istenen fiyat>, paymentId:'mock_pay_'+token}`.
- `sandbox`/`production` (veya mock değilse): gerçek İyzico'ya yukarıdaki IYZWSv2 imzasıyla `fetch`. İyzico request gövdesi en az: `{ locale:"tr", conversationId, price:String, paidPrice:String, currency:"TRY", basketId, paymentGroup:"PRODUCT", callbackUrl, buyer:{...}, shippingAddress:{...}, billingAddress:{...}, basketItems:[{id,name,category1,itemType:"VIRTUAL",price:String}] }`. Eksik zorunlu alanları makul sabit değerlerle doldur (sandbox için ad/soyad/adres placeholder kabul edilir). Fiyatları İyzico string ister (ör. `"49.0"`).

`env.ENCRYPTION_KEY` ile şifreleme bu sprintte GEREKMEZ (kart saklamıyoruz).

### 3) `vasi-api/src/routes/payment.ts`
`Hono` router. `app.route('/api/v1/payment', paymentRoutes)` ile bağlanacak. Auth'u inline ver (Hono nested middleware tuzağı — bkz. AGENTS.md / admin.ts):

- `payment.post('/checkout/init', authMiddleware, handler)`:
  - body `{ plan_slug }`. `plans`'tan slug'ı çek; yoksa veya `is_active=0` ise 400; `price_monthly<=0` ise 400 (ücretsiz plana ödeme yok).
  - kullanıcının aktif subscription'ı `plan_type=plan_slug` ve `status='active'` ise **409 `{error, code:'ALREADY_PREMIUM'}`**.
  - `conversationId = crypto.randomUUID()`. `payments` satırı ekle (status `pending`, amount=price_monthly, plan_slug, conversation_id).
  - `callbackUrl = APP_URL + "/api/v1/payment/checkout/callback"`.
  - `initializeCheckoutForm(...)` çağır; dönen `token`'ı `payments` satırına yaz (`iyzico_token`).
  - `200 { token, paymentPageUrl }`.
- `payment.post('/checkout/callback', handler)` — **authMiddleware YOK** (İyzico/dış çağrı):
  - token'ı önce query (`?token=`), yoksa form/body'den al (İyzico `application/x-www-form-urlencoded` ile `token` postlar — `await c.req.parseBody()` ile oku).
  - token'a karşılık `payments` satırını bul; yoksa `404`.
  - satır zaten `success` ise idempotent: yükseltme YAPMA, doğrudan `APP_URL/upgrade?payment=success`'e 302.
  - `retrieveCheckoutForm(env, token)`:
    - `SUCCESS` ve `paidPrice == payments.amount` (tutar doğrula) → subscription **upsert**: kullanıcının aktif subscription'ı varsa UPDATE, yoksa INSERT — `plan_type=plan_slug, status='active', expires_at = datetime('now','+30 days'), last_payment_ref = paymentId, last_payment_at = datetime('now'), updated_at = datetime('now')`. `payments` satırı → `status='success', iyzico_payment_id=paymentId`. 302 → `APP_URL/upgrade?payment=success`.
    - aksi halde → `payments` satırı `status='failure', error_message=...`; plan DEĞİŞMEZ; 302 → `APP_URL/upgrade?payment=failed`.
  - D1 `undefined` bind etme — opsiyonel değerleri `?? null`.

### 4) `vasi-api/src/index.ts`
`import { paymentRoutes } from './routes/payment'` + `app.route('/api/v1/payment', paymentRoutes)`.

### 5) `vasi-api/src/types.ts`
`Env`'e ekle: `IYZICO_MODE: string` ve `IYZICO_BASE_URL?: string`.

### 6) `vasi-api/.dev.vars`
SAHTE değerlerle ekle (gerçek key GİRME):
```
IYZICO_API_KEY=sandbox-FAKE
IYZICO_SECRET_KEY=sandbox-FAKE
IYZICO_MODE=mock
```

### 7) `vasi-web/src/app/(dashboard)/upgrade/page.tsx`
- Paralı plan kartında (mevcut plan değilse) buton metnini "Yakında" → **"Premium'a Yükselt"**, `disabled` kaldır, `className="btn btn-primary btn-md"`. `onClick` → `apiFetch('/api/v1/payment/checkout/init', { method:'POST', body: JSON.stringify({ plan_slug: plan.slug }) })` → dönen `paymentPageUrl` ile `window.location.href = paymentPageUrl`. Mevcut plan kartı eskisi gibi "Kullanımda" disabled.
- Sayfa yüklenince `useEffect` içinde `URLSearchParams`'tan `payment` oku: `success` → yeşil bilgi bandı "Ödeme başarılı, planın artık Premium." ve `/me`'yi tekrar çek (kart durumu güncellensin); `failed` → kırmızı bant "Ödeme tamamlanamadı, tekrar deneyebilirsin." `navigator`/`localStorage`'ı `useState` initializer'ında OKUMA; `'use client'` zaten var, koru. Yeni inline renk üretme — `DESIGN.md` CSS değişkenlerini ve `btn` sınıflarını kullan.

### 8) `crew/tests/api_smoke.py` — ödeme testleri (AYNI değişiklikte)
Mevcut 45 testi bozmadan ekle. Ödeme testi mevcut `test@vasi.app` kullanıcısının planını kalıcı kirletmemeli — **ya yeni bir kullanıcıyla ya da test sonunda durumu free'ye geri alarak** (admin plan PATCH veya doğrudan reset) izole tut. Test et:
- `POST /api/v1/payment/checkout/init` token'sız → **401**.
- init geçerli token + `{plan_slug:'personal'}` (mock) → **200**, cevapta `token` ve `paymentPageUrl` var.
- init kullanıcı zaten `personal` aktifken → **409**, `code=ALREADY_PREMIUM`.
- `POST /api/v1/payment/checkout/callback?token=<init'ten gelen>` → 302/200; ardından `GET /api/v1/me` → `plan=='personal'`, `usage.messages_limit==100`.
- aynı callback'i ikinci kez çağır → ikinci yükseltme olmaz (idempotent): `/me` hâlâ tutarlı, çift `payments success` yok.
- `callback?token=mock_fail_x` (önce bu token için pending payments satırı kurman gerekirse init'i uygun şekilde kullan ya da failure senaryosunu mock token konvansiyonuyla test et) → plan free kalır.
Sonra `python3 -m py_compile crew/tests/api_smoke.py` ve `python3 crew/tests/api_smoke.py` (veya AGENTS.md'deki komut) ile TÜM testlerin geçtiğini doğrula.

## Bitince ver
1. Değişen/eklenen dosyaların listesi.
2. `git status` çıktısı (aynen).
3. Smoke testin son özet satırları (kaç/kaç geçti).
**Commit/branch/push YAPMA.** Bende.
