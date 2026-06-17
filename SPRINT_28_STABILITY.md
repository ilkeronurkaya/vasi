# Sprint 28 — Stabilite & temizlik (B4 smoke + B1 seed + B10/B11 fiyat)

> Kaynak: `BUGS.md` B4 (P1), B1 (P2), B10 (P1), B11 (P2). İlke: **stabil + en az maliyet** — hepsi iç iş, dış hesap/maliyet YOK.
> S28 dışı (ertelendi): B6d (OTP SMS = NetGSM, mesaj başına maliyet), İyzico gerçek sandbox testi (merchant hesabı). Bunlar hesap/kredi hazır olunca açılır.
> Uygulayıcı: B4 test harness'ı (Python, `crew/` — iko+Claude bölgesi) + B1 migration küçük; B10 landing yeniden yazımı en HACİMLİ ve riskli (660 satır + 7 dilli i18n) → dosya-dosya/ayrı tur. Git/push iko'da.

---

## Kapsam ve sıra

| # | Bug | Şiddet | Dosya(lar) | Tür |
|---|-----|--------|-----------|-----|
| 1 | **B4** smoke `:3000` JSON çökmesi | P1 | `crew/tests/api_smoke.py` | test harness |
| 2 | **B1** premium seed giriş yapılamıyor | P2 | yeni migration `0019` + `migrations/0010_seed_dev.sql` | migration/seed |
| 3 | **B11** `/public/pricing` cache → yeni plan gecikir | P2 | `vasi-api/src/routes/public.ts` | backend (1 satır) |
| 4 | **B10** landing fiyat sabit/DB'den gelmiyor | P1 | `vasi-web/src/app/page.tsx` | frontend (hacimli) |

Sıra: B4 (smoke kapısı) → B1 → B11 (küçük, B10'dan önce) → B10 (en son, en hacimli). B11 önce gelmeli ki B10 doğrulanırken yeni plan anında görünsün.

---

## B4 (P1) — smoke `:3000` açıkken JSONDecodeError ile çöküyor

**Kök neden:** `req()` (`api_smoke.py`) `urllib.request.urlopen` ile çağrı yapıyor; payment callback **302** ile `APP_URL` (`:3000`)'e yönleniyor. `:3000` KAPALIYKEN `URLError` yutuluyor (`return 0, {}`). Ama `:3000` AÇIKSA urllib redirect'i izleyip **HTML** çekiyor → `json.loads(html)` → `JSONDecodeError` (except blokları yakalamıyor) → TÜM smoke çöküyor. Şu anki workaround: smoke öncesi `:3000`'i elle kapat.

**Çözüm:** başarı yolundaki `json.loads`'u JSON-olmayan yanıta toleranslı yap. `req()` içindeki
```
with urllib.request.urlopen(r, timeout=20) as resp:
    return resp.status, json.loads(resp.read() or b"{}")
```
bloğunu şununla değiştir:
```
with urllib.request.urlopen(r, timeout=20) as resp:
    raw = resp.read() or b"{}"
    try:
        return resp.status, json.loads(raw)
    except (json.JSONDecodeError, ValueError):
        return resp.status, {}
```
(`URLError`/`HTTPError` blokları AYNEN kalır.) Böylece `:3000` ister açık ister kapalı olsun smoke çökmez; non-JSON yanıt `(status, {})` döner.

**Kabul kriterleri:**
- `:3000` AÇIKKEN `uv run --python 3.12 python crew/tests/api_smoke.py` çökmeden tamamlanır (önceki JSONDecodeError yok).
- `:3000` KAPALIYKEN smoke yine **58/58** (regresyon yok).
- Payment callback testi anlamını korur (302 sonrası non-JSON → boş gövde, ilgili assertion bozulmaz).

---

## B1 (P2) — premium.test@vasi.app ile giriş yapılamıyor

**Kök neden:** `migrations/0010_seed_dev.sql` premium seed'inin `password_hash`'i sahte/yanlış formatta: `pbkdf2:sha256:260000$dev_salt_premium$hashedpassword_premium_user_dev_only` (`$` ayraçlı, 260000 iterasyon). Gerçek format `:` ayraçlı, 100000 iterasyon (`verifyPassword` `algorithm:hashFunction:iterations:saltHex:hashHex` bekler). → premium kullanıcı panelde görünür ama **giriş 401**.

**Çözüm:** `test@vasi.app`'in gerçek hash'ini (parola `Test1234!`) premium seed'e de ver, ki aynı parolayla giriş yapılabilsin.
1. **Yeni migration** `migrations/0019_fix_premium_seed_hash.sql` (kök `migrations/`, `0016`/`0017` biçimini örnek al): mevcut DB'ler için
   ```
   UPDATE users SET password_hash = 'pbkdf2:sha256:100000:aabbccddeeff0011aabbccddeeff0011:1520fe7f853df2783cb6efd66c356ea3e714071bb2e0b0a5805e011103b0fa33'
   WHERE email = 'premium.test@vasi.app';
   ```
2. `migrations/0010_seed_dev.sql`'de premium seed'in sahte hash satırını aynı gerçek hash ile değiştir (taze DB'ler için tutarlılık).

**Kabul kriterleri:**
- `premium.test@vasi.app` / `Test1234!` ile giriş **200** (token döner).
- `0019` mevcut DB'de hash'i düzeltir; `0010` taze DB'de doğru kurar.
- Smoke 58/58 etkilenmez.

---

## B11 (P2) — `/public/pricing` cache'i yeni planı geciktiriyor

**Kök neden:** `public.ts` `/pricing` yanıtında `c.header('Cache-Control', 'public, max-age=300')` → admin yeni plan eklediğinde landing/upgrade 5 dk'ya kadar eski listeyi gösterir.

**Çözüm:** cache'i kısalt. `'public, max-age=300'` → `'public, max-age=30'` (veya anlık istenirse `'no-store'`). Düşük trafik + nadir plan değişimi → `max-age=30` denge.

**Kabul:** admin'de plan ekle/düzenle → en geç ~30 sn içinde (veya hard refresh ile anında) `/upgrade` ve landing'de görünür; smoke etkilenmez.

---

## B10 (P1) — Landing fiyat bölümünü DB'den dinamik yap (EN HACİMLİ)

**Kök neden:** `page.tsx` (~satır 389–660):
- `const [pricing, setPricing] = useState<Record<string,string>>({})` + `fetch('/api/v1/public/pricing').then(d => setPricing(d.pricing ?? {}))` → **yanlış alan** (`d.pricing` yok; API `{plans:[...]}` döndürür) → her zaman `{}`.
- Fiyat kartları **sabit kodlu**: `pricing-grid--two`, Free (₺0) + Personal (`₺{pricing.price_personal_monthly ?? '49'}`), küratör maddeler `plan_free_f1..3` / `plan_personal_f1..5`.
- `next.config` `/api/v1/:path*` rewrite VAR → fetch API'ye ulaşıyor; sorun alan adı + statik kartlar.

**Çözüm (karar: TAM DİNAMİK, /upgrade gibi):**
1. State'i değiştir: `const [plans, setPlans] = useState<Plan[]>([])`; fetch `.then(d => setPlans(d.plans ?? []))`. `Plan` arabirimi: `{slug, name, price_monthly, message_limit, recipient_limit, is_active}` (upgrade'deki ile aynı).
2. `pricing-grid--two` bloğunu `plans.map(p => <kart>)` ile dinamik yap; her kart: `p.name`, `₺{p.price_monthly}{t.plan_per}`, iki limit satırı (`{p.message_limit} {t.plan_msgs}`, `{p.recipient_limit} {t.plan_recips}`), CTA `t.plan_cta` (→ `/register`). Mevcut `.plan-card` / `.featured` / `.plan-*` CSS sınıfları korunur; `featured` rozetini `p.slug === 'personal'` için göster (opsiyonel).
3. **i18n:** 7 dil bloğuna (TR/EN/DE/FR/ES/AR) generic anahtar ekle: `plan_msgs` (mesaj/messages/Nachrichten/messages/mensajes/رسائل), `plan_recips` (alıcı/recipients/Empfänger/destinataires/destinatarios/مستلمون), `plan_cta` (Başla/Get Started/Loslegen/Commencer/Comenzar/ابدأ). `plan_per` zaten var. Eski `plan_free_*`/`plan_personal_*`/`withLimit` artık kullanılmıyorsa kaldır (lint temiz kalsın).
4. `withLimit` yardımcısı ve `pricing.*` referansları temizlenir.

**Kapsam dışı:** plan açıklaması/özellik maddeleri DB'de yok → küratör pazarlama metni düşer (karar gereği). İstenirse sonra hibrit.

**Kabul kriterleri:**
- Landing fiyat kartları `/public/pricing`'ten gelir; admin'deki aktif planlarla **birebir aynı** (sayı, isim, fiyat, limit).
- Admin'de yeni plan ekle → (B11 ile) landing'de görünür.
- 7 dilde fiyat bölümü kırılmadan render olur; `tsc` temiz, `next lint` 0 error (yeni `any`/`<a>`-to-page yok), smoke 58/58.

> NOT (Claude): B10 660 satırlık pazarlama sayfası + 7 i18n bloğu → yerel model için en riskli iş. Diff'i çok dikkatli incele; model zorlanırsa iko+Claude doğrudan yazar.

---

## Doğrulama planı (iko + Claude)
1. B4 sonrası: `:3000` AÇIK ve KAPALI iki senaryoda smoke koş → çökmeden 58/58.
2. B1 sonrası: `wrangler d1 migrations apply vasi-db --local` → Chrome'dan premium.test@vasi.app / Test1234! giriş.
3. B11 sonrası: admin'de plan ekle → `/upgrade`'de ~30 sn/hard refresh ile görünür.
4. B10 sonrası: landing 7 dilde kontrol; admin plan listesi ile landing kartları birebir; yeni plan landing'de görünür. `tsc` + `next lint` 0 error.
5. Claude her tur sonrası diff'i klondan/main'den doğrular (kapsam sızıntısı yok).
6. **Sprint kapanış ritüeli:** B4 + B1 + B11 + B10'u iko elle doğrular → `BUGS.md`'de Kapandı'ya taşınır → commit + push.
