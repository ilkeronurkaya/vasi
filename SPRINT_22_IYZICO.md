# Sprint 22 — İyzico Sandbox Ödeme (Checkout Form, tek seferlik yükseltme)

_Tasarım + kabul kriterleri · Beyin takımı (iko + Claude) · 2026-06-13_
_Uygulayıcı: OpenHands + Gemini Flash — YALNIZCA klonda kod+test yazar; branch/commit/push iko'da._

## 0. Kararlar (kilitlendi)

| Konu | Karar |
|---|---|
| Entegrasyon | **İyzico Checkout Form** (barındırılan ödeme sayfası, redirect mod). 3DS + PCI İyzico'da. |
| Kapsam | **Tek seferlik yükseltme.** Başarılı ödeme → plan `personal` (Premium), 30 gün. |
| Kart saklama / recurring | **KAPSAM DIŞI** (kolonlar NULL kalır; sonraki sprint). |
| Merchant kimlik bilgileri | **HENÜZ YOK.** Kod credential'sız yazılır; gerçek sandbox testi iko'da askıda. |
| Çözüm | Kod, `IYZICO_MODE=mock` ile **offline/deterministik** çalışacak → smoke ağ bağlantısı olmadan geçer. |

## 1. Mimari özet

Akış (redirect Checkout Form):
1. Kullanıcı `/upgrade`'de **"Premium'a Yükselt"**e tıklar.
2. Web → `POST /api/v1/payment/checkout/init` → API bir `payments` satırı (pending) açar, İyzico `initialize` çağırır, `{token, paymentPageUrl}` döner.
3. Web `paymentPageUrl`'e yönlendirir (mock modda kendi callback'imize otomatik yönlenir).
4. Ödeme bitince İyzico `callbackUrl`'e **POST** atar (form-encoded `token`). API token ile sonucu **retrieve eder** (istemciye güvenmez), başarılıysa subscription'ı upsert eder, `payments` satırını `success` yapar.
5. API kullanıcıyı `APP_URL/upgrade?payment=success|failed`'e 302 yönlendirir. Web `/me`'yi tazeler → Premium görünür.

### Doğrulanan zemin (mevcut kod)
- `subscriptions`: `plan_type` slug tutuyor (CHECK yok), `iyzico_*` + `last_payment_*` kolonları hazır, `status ∈ active/expired/cancelled`.
- **Kayıtta subscription satırı oluşmuyor** — free `?? 'free'` ile varsayılıyor. Yükseltme = upsert (`admin.ts:164-173` kalıbı: varsa UPDATE, yoksa INSERT).
- `Env`'de `IYZICO_API_KEY`, `IYZICO_SECRET_KEY` zaten var. **Eklenecek:** `IYZICO_MODE`, `IYZICO_BASE_URL` (opsiyonel).
- `/me` → `{user, plan, usage}`; limit `plans.message_limit`'ten. Premium = `personal` slug, ₺49, 100 mesaj.
- Rotalar `index.ts`'te `app.route('/api/v1/...', ...)` ile bağlanıyor; smoke statik kontrolü tüm route dosyalarının mount edilmesini şart koşuyor.

### İyzico v2 imza (IYZWSv2) — edge-uyum kritik
Resmi formül (docs.iyzico.com/HMACSHA256-Auth):
```
payload   = randomKey + uriPath + requestBody    (body yoksa randomKey + uriPath)
signature = HEX( HMAC-SHA256(payload, secretKey) )         ← hex, base64 DEĞİL
authStr   = "apiKey:"+apiKey+"&randomKey:"+randomKey+"&signature:"+signature
header    = "IYZWSv2 " + base64(authStr)
+ header  x-iyzi-rnd: randomKey   ·   Content-Type: application/json
```
`randomKey` = ör. `Date.now()+"<rastgele>"`. **Web Crypto** ile yapılır (`crypto.subtle.importKey('raw', secret, {name:'HMAC',hash:'SHA-256'}, ...)` → `sign` → ArrayBuffer → hex). **`iyzipay` npm paketi ve Node `crypto`/`http` YASAK** (edge runtime'da çalışmaz — ana risk).

Endpoint'ler (base: sandbox `https://sandbox-api.iyzipay.com`):
- Initialize: `POST /payment/iyzipos/checkoutform/initialize/auth/ecom`
- Retrieve:   `POST /payment/iyzipos/checkoutform/auth/ecom/detail`  body `{locale, conversationId, token}`

## 2. Dosya envanteri

**Yeni:**
- `migrations/0015_create_payments.sql` — `payments` tablosu (audit + idempotency).
- `vasi-api/src/lib/iyzico.ts` — edge-uyumlu İyzico istemcisi: `initializeCheckoutForm()`, `retrieveCheckoutForm()`, IYZWSv2 imza, **mock mod**.
- `vasi-api/src/routes/payment.ts` — `POST /checkout/init` (auth), `POST /checkout/callback` (auth YOK).

**Değişen:**
- `vasi-api/src/index.ts` — `app.route('/api/v1/payment', paymentRoutes)`.
- `vasi-api/src/types.ts` — `Env`'e `IYZICO_MODE`, `IYZICO_BASE_URL?`.
- `vasi-api/.dev.vars` — sahte `IYZICO_API_KEY/SECRET_KEY` + `IYZICO_MODE=mock` (gerçek key GİRİLMEZ).
- `vasi-web/src/app/(dashboard)/upgrade/page.tsx` — CTA "Yakında" → "Premium'a Yükselt"; init çağrısı + redirect; dönüş bannerı.
- `crew/tests/api_smoke.py` — ödeme testleri (aynı commit).

### payments şeması (öneri)
```sql
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  amount INTEGER NOT NULL,                 -- plans.price_monthly ile aynı birim (TRY)
  currency TEXT NOT NULL DEFAULT 'TRY',
  conversation_id TEXT NOT NULL,           -- bizim ürettiğimiz benzersiz id
  iyzico_token TEXT,                       -- checkout form token
  iyzico_payment_id TEXT,                  -- başarılı sonuçtaki paymentId
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failure')),
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_user  ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_token ON payments(iyzico_token);
```

### Mock mod sözleşmesi (`IYZICO_MODE=mock`)
- `initializeCheckoutForm` → `token = "mock_" + conversationId`, `paymentPageUrl = APP_URL + "/api/v1/payment/checkout/callback?token=" + token` (ağ yok).
- `retrieveCheckoutForm(token)` → token `"fail"` içeriyorsa `paymentStatus=FAILURE`, aksi halde `SUCCESS` + `paidPrice = beklenen plan fiyatı`.
- `sandbox`/`production` modda gerçek İyzico'ya `fetch` atılır. Mod ayrımı tek yerde (iyzico.ts).

## 3. Kabul kriterleri

**Backend**
1. `0015_create_payments.sql` — `IF NOT EXISTS`, elle ALTER yok; `pnpm db:migrate:local` temiz uygular.
2. `iyzico.ts` **yalnızca Web Crypto + fetch** kullanır (iyzipay npm / node crypto/http YOK). IYZWSv2 imzası Böl.1'deki formüle birebir uyar (signature **hex**). `IYZICO_MODE=mock` yolu tamamen offline & deterministik.
3. `payment.ts` `index.ts`'e `app.route('/api/v1/payment', ...)` ile bağlı (statik kontrol mount'u şart koşar):
   - `POST /checkout/init` **auth zorunlu** (401 token'sız); plan slug paralı & aktif değilse 400; kullanıcı zaten aktif Premium ise **409 `ALREADY_PREMIUM`**; `payments` (pending) açar; `{token, paymentPageUrl}` döner.
   - `POST /checkout/callback` (auth YOK) token ile **retrieve eder** (istemci tutarına güvenmez); SUCCESS → subscription upsert (`plan_type='personal'`, `status='active'`, `expires_at=+30 gün`, `last_payment_ref`, `last_payment_at`) + `payments=success` + `iyzico_payment_id`; FAILURE → `payments=failure`, plan değişmez; **idempotent** (aynı token ikinci callback ikinci yükseltme YAPMAZ); bilinmeyen token → 404, yükseltme yok; bitince `APP_URL/upgrade?payment=success|failed`'e 302.
4. `Env`'e `IYZICO_MODE` (+ ops. `IYZICO_BASE_URL`); `.dev.vars`'a sahte değerler + `IYZICO_MODE=mock`. Gerçek key asla commit edilmez.

**Frontend**
5. `/upgrade`: paralı plan (price>0, mevcut değil) kartında buton "Yakında"→**"Premium'a Yükselt"** (`btn btn-primary`, aktif). Tık → init → `paymentPageUrl`'e `window.location` ile git. Mevcut plan kartı "Kullanımda" disabled kalır. Yeni inline renk yok (DESIGN.md token'ları).
6. Dönüş: `?payment=success` → yeşil "Ödeme başarılı, planın Premium." + `/me` tekrar çekilir (Premium görünür); `?payment=failed` → kırmızı hata. `'use client'` var; `navigator`/`localStorage` initializer'da okunmaz (hydration).

**Test (aynı commit)**
7. `api_smoke.py`'a ödeme testleri: init happy (mock) → token döner; init auth'suz → 401; init zaten-Premium → 409; callback SUCCESS → `/me` plan=`personal`, limit=100; callback idempotent (ikinci kez plan değişmez/çift `payments success` yok); callback `mock_fail_*` → plan free kalır. **Mevcut 45 test bozulmaz/zayıflamaz.** `python3 -m py_compile crew/tests/api_smoke.py` temiz. Ödeme testi izole kullanıcı kullanır ya da durumu geri alır (diğer testleri kirletmez).
8. Tüm smoke yeşil (≈ 51+/N).

**Doğrulama (iko + Claude — ajan değil)**
9. Claude klonda diff'i inceler → asıl repoya iko taşır → asıl repoda `pnpm install` + smoke yeşil + Chrome'dan `/upgrade` mock tık-akışı (init → callback → Premium banner) elle doğrulanır.
10. **Askıda blocker:** gerçek İyzico sandbox ödeme testi, iko sandbox merchant hesabı açıp gerçek key'leri `.dev.vars`'a koyup `IYZICO_MODE=sandbox` yapana kadar ertelendi → HANDOFF'a yazılır.

## 4. Kapsam dışı (Flash sınır)
- Kart saklama / recurring / otomatik yenileme (cron) / iptal-downgrade.
- İyzico async webhook bildirimi (yalnız senkron callback).
- Gerçek sandbox ağ doğrulaması (credential bekliyor).
- Fatura/makbuz, vergi, çoklu para birimi.

## 5. Riskler
- **Edge imza** (#1 risk): hex vs base64 karışırsa imza geçersiz → mock modda görünmez, sandbox'ta patlar. iko sandbox testinde gerçek imza ilk kez sınanır.
- **UI↔API kontrat kayması** (HANDOFF Böl.13): smoke görmez → #9 Chrome elle doğrulama şart.
- **Hono nested middleware**: init'e auth `payment.post('/checkout/init', authMiddleware, handler)` ile inline ver (admin.ts dersi).
- Mock mod prod'a sızmamalı: mod ayrımı tek dosyada, `.dev.vars` dışında default `sandbox`/`production`.

## Kaynaklar
- [İyzico HMACSHA256 Auth](https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth)
- [İyzico CF-Initialize](https://docs.iyzico.com/en/payment-methods/checkoutform/cf-implementation/cf-initialize)
