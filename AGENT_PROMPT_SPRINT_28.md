# OpenHands Ajan Promtu — Sprint 28 (Stabilite: B4 smoke + B1 premium seed)

> Her promtu AYRI/YENİ OpenHands konuşmasına yapıştır. Repo `/workspace` altında. iko: tur öncesi `rm -f ~/Projects/vasi-agent/.git/index.lock`.
> NOT: B4 + B1 + B11 küçük; istersen iko+Claude doğrudan da yapabilir. B10 hacimli → ajan veya iko+Claude, diff dikkatli incelenir.
> SIRA: PROMT 1 (B4) → PROMT 2 (B1) → PROMT 3 (B11) → PROMT 4 (B10, en son/en hacimli).

---

## === PROMT 1 — B4 smoke :3000 JSON toleransı ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push YOK). task_tracker KULLANMA. SADECE TEK dosyaya dokun. Dosyayı önce KENDİN oku. Küçük, hedefli `str_replace`. Bitince diff + `git status`.

Dosya: `/workspace/crew/tests/api_smoke.py`

Amaç: `req()` fonksiyonu payment callback 302 ile `:3000`'e yönlenip HTML dönerse `json.loads` ile çöküyor. JSON olmayan yanıtı tolere et.

`req()` içindeki şu satırı:
```
        with urllib.request.urlopen(r, timeout=20) as resp:
            return resp.status, json.loads(resp.read() or b"{}")
```
ŞUNUNLA değiştir:
```
        with urllib.request.urlopen(r, timeout=20) as resp:
            raw = resp.read() or b"{}"
            try:
                return resp.status, json.loads(raw)
            except (json.JSONDecodeError, ValueError):
                return resp.status, {}
```

DOKUNMA: `except urllib.error.HTTPError` ve `except urllib.error.URLError` blokları, başka fonksiyonlar, statik kontroller. Smoke'u SEN koşma (iko koşar).

---

## === PROMT 2 — B1 premium seed hash düzeltmesi ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE listelenen 2 dosyaya dokun. Şema değişikliği = KÖK `/workspace/migrations/`'a yeni dosya. Dosyaları önce KENDİN oku. Bitince diff + `git status`.

Amaç: `premium.test@vasi.app` seed'inin parola hash'i sahte format (`$` ayraçlı) → giriş 401. `test@vasi.app`'in gerçek hash'iyle (parola `Test1234!`) değiştir.

1. **Yeni migration** `/workspace/migrations/0019_fix_premium_seed_hash.sql` oluştur. `/workspace/migrations/0016_set_admin_flag.sql` başlık/`migrate:up` biçimini örnek al. İçerik (migrate:up altında):
```
UPDATE users SET password_hash = 'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33'
WHERE email = 'premium.test@vasi.app';
```

2. `/workspace/migrations/0010_seed_dev.sql`: premium seed bloğundaki
```
  'pbkdf2:sha256:260000$dev_salt_premium$hashedpassword_premium_user_dev_only',
```
satırını şununla değiştir:
```
  'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33',
```

DOKUNMA: diğer seed kullanıcıları, subscriptions blokları, başka migration'lar. Migration'ı SEN uygulama (iko `wrangler d1 migrations apply` koşar).

---

## === PROMT 3 — B11 /public/pricing cache kısalt ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE TEK dosyaya dokun. Dosyayı önce KENDİN oku. Tek satır `str_replace`. Bitince diff + `git status`.

Dosya: `/workspace/vasi-api/src/routes/public.ts`

`/pricing` handler'ındaki
```
  c.header('Cache-Control', 'public, max-age=300')
```
satırını şununla değiştir:
```
  c.header('Cache-Control', 'public, max-age=30')
```

DOKUNMA: SQL sorgusu, dönen `{plans}` şekli, diğer handler'lar.

---

## === PROMT 4 — B10 landing fiyatı DB'den dinamik (EN HACİMLİ) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. SADECE TEK dosyaya dokun: `/workspace/vasi-web/src/app/page.tsx`. Dosyayı BAŞTAN SONA KENDİN oku (660+ satır, 7 dilli `LANGS` objesi + fiyat `section id="pricing"`). Davranışı yalnız fiyat bölümünde değiştir. Yeni `any` veya `useEffect` içi senkron `setState` EKLEME. Bitince diff + `git status` + `pnpm exec tsc --noEmit` çıktısı.

Amaç: landing fiyat kartlarını `/api/v1/public/pricing`'ten (`{plans:[...]}`) DİNAMİK üret; şu an sabit 2 kart + yanlış alan (`d.pricing`) okuyor.

1. **Tip + state:** dosyada `const [pricing, setPricing] = useState<Record<string, string>>({})` satırını şununla değiştir:
```
  const [plans, setPlans] = useState<{ slug: string; name: string; price_monthly: number; message_limit: number; recipient_limit: number; is_active: boolean }[]>([])
```
   ve `fetch('/api/v1/public/pricing').then(r => r.json()).then(d => setPricing(d.pricing ?? {})).catch(() => {})` bloğunda `setPricing(d.pricing ?? {})` → `setPlans(d.plans ?? [])` yap.

2. **`withLimit` yardımcısını** (`const withLimit = (text, limit?) => ...`) SİL (artık kullanılmayacak).

3. **Fiyat bölümü** (`<div className="pricing-grid pricing-grid--two">` ile başlayan iki sabit `plan-card` bloğu): tümünü ŞU dinamik blokla değiştir:
```
          <div className="pricing-grid pricing-grid--two">
            {plans.map((p) => (
              <div key={p.slug} className={`plan-card${p.slug === 'personal' ? ' featured' : ''}`}>
                {p.slug === 'personal' && <div className="plan-popular">{t.plan_popular}</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  <span className="plan-amount">₺{p.price_monthly}</span>
                  <span className="plan-per">{t.plan_per}</span>
                </div>
                <div className="plan-line" />
                <div className="plan-feats">
                  <div className="plan-feat"><span className="plan-check">✓</span><span>{p.message_limit} {t.plan_msgs}</span></div>
                  <div className="plan-feat"><span className="plan-check">✓</span><span>{p.recipient_limit} {t.plan_recips}</span></div>
                </div>
                <a href="/register" className="btn btn-primary btn-md plan-btn">{t.plan_cta}</a>
              </div>
            ))}
          </div>
```

4. **i18n:** 7 dil bloğunun HER BİRİNE 3 yeni anahtar ekle (mevcut `plan_per` satırının yanına uygun dilde):
   - TR: `plan_msgs: 'mesaj', plan_recips: 'alıcı', plan_cta: 'Başla',`
   - EN: `plan_msgs: 'messages', plan_recips: 'recipients', plan_cta: 'Get Started',`
   - DE: `plan_msgs: 'Nachrichten', plan_recips: 'Empfänger', plan_cta: 'Loslegen',`
   - FR: `plan_msgs: 'messages', plan_recips: 'destinataires', plan_cta: 'Commencer',`
   - ES: `plan_msgs: 'mensajes', plan_recips: 'destinatarios', plan_cta: 'Comenzar',`
   - AR: `plan_msgs: 'رسائل', plan_recips: 'مستلمون', plan_cta: 'ابدأ',`
   (LANGS objesinde kaç dil varsa hepsine; eksik dil varsa EN değerini koy.)

5. Artık kullanılmayan `plan_free_*` / `plan_personal_*` / `plan_free_f*` / `plan_personal_f*` anahtarlarını SİLME zorunlu değil ama `withLimit` ve `pricing.*` referansları KALMAMALI (tsc/lint temiz). Kullanılmayan anahtar bırakırsan lint uyarısı vermez (obje alanı).

DOKUNMA: fiyat bölümü dışındaki section'lar (hero, features, how, cta, footer), nav, dil seçici, `useLang`/`setLang` mantığı. `pnpm exec tsc --noEmit` koş; çıktıyı rapora ekle.

---

## Her tur sonrası (Claude doğrular)
Claude diff'i doğrular (kapsam sızıntısı yok, yeni `any` yok, davranış yalnız hedefte). iko: B4 sonrası `:3000` açık+kapalı smoke; B1 sonrası migration apply + premium giriş; B11 sonrası plan ekle→upgrade'de görünür; B10 sonrası landing 7 dil + admin listesiyle birebir + tsc/lint 0. Tümü bitince kapanış ritüeli + commit + push.
