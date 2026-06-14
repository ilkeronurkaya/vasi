# Vasi App BD — Oturum El Geçirme Notu (DETAYLI)
_Tarih: 2026-06-14 · Bu dosya her oturum başında okunur; durumu git ile çapraz doğrula: `git log --oneline -5 --all`_

> Proje: `~/Projects/vasi` · Ajan klonu: `~/Projects/vasi-agent` · GitHub: `git@github.com:ilkeronurkaya/vasi.git` (private)
> Ürün durumu: **UÇTAN UCA ÇALIŞIYOR** — kayıt → e-posta doğrulama → mesaj → zamanlama → tasarımlı e-posta → /m/[token] → alıcı OTP → içerik.
> İlk gerçek e-posta 2026-06-11'de teslim edildi (Resend). Smoke: **52/52 yeşil** (S22 sonrası). Sprint 20+21+22 KAPANDI (admin/plan düzeltmeleri + paket CRUD + İyzico ödeme mock).
>
> **2026-06-14 Sprint 22 — İyzico Checkout Form ödeme (mock mod, commit `7b24ff3`, branch `sprint-22`):** /upgrade'de "Premium'a Yükselt" → `POST /payment/checkout/init` → İyzico Checkout Form → `callback` token ile retrieve → başarılıysa subscription 30 gün `personal`'a yükselir. `payments` tablosu (migration 0015) audit+idempotency. İyzico imzası (IYZWSv2 HMAC-SHA256 hex) Web Crypto ile edge-uyumlu; `iyzico.ts`. **Credential YOK → `IYZICO_MODE=mock` ile tüm akış offline/deterministik; smoke böyle geçiyor.**
> **Ders (ajan = OpenHands+Flash, "sadece kod" iş akışı):** Flash kodu mantıken doğruydu ama smoke'u HİÇ koşamadı ("miniflare" dedi) → 6 gerçek bug Claude'un bağımsız doğrulamasında yakalandı: (1) migration yanlış dizinde (`vasi-api/migrations/` — doğrusu kök `migrations/`, `wrangler.toml migrations_dir=../migrations`); (2) callback upsert `ON CONFLICT(user_id)` kullanmış ama `subscriptions.user_id`'de UNIQUE yok + INSERT'te `id` PK eksik → runtime 500; admin.ts SELECT→UPDATE/INSERT kalıbına çevrildi; (3) `await response.json()` `unknown` → tsc patlıyor → `as any`; (4) `useSearchParams` Suspense'siz → Next15 build riski → `window.location.search` useEffect'te; (5) mock callback GET 404 → callback GET+POST ortak handler; (6) smoke sıralama (callback'ten önce 409) + test@vasi.app'i premium bırakıp limit testini kırıyordu → reset eklendi + smoke callback'i `?token=` query'sine çevrildi (JSON body handler'a ulaşmıyordu). **Bağımsız doğrulama olmasa hepsi kaçardı.**
> **Askıdaki blocker:** Gerçek İyzico sandbox ödeme testi — merchant hesabı açılıp gerçek key'ler `.dev.vars`'a konup `IYZICO_MODE=sandbox` yapılana dek YALNIZ mock doğrulandı. Tasarım+kabul kriterleri: `SPRINT_22_IYZICO.md`. Ajan promtu: `AGENT_PROMPT_SPRINT_22.md`.
>
> **2026-06-13 canlı test turu (Chrome + Gmail + yerel D1):** Tüm akış gerçek tarayıcıdan baştan sona doğrulandı. İKİ P0 bug bulundu+düzeltildi (commit `e2eae52`, push edildi):
> 1. UI kayıt kırıktı — `register/page.tsx` camelCase (`firstName`) gönderiyordu, API snake_case (`first_name`) bekliyor → her zaman 400.
> 2. UI e-posta doğrulama kırıktı — `verify-email/page.tsx` body'de email göndermiyordu; register email'i taşımıyordu. Düzeltme: email `localStorage('verifyEmail')` ile taşınıyor.
> **Ders:** API-only smoke (38 test) frontend↔API kontrat kaymasını GÖREMEZ. Canlıya çıkmadan ince bir e2e/UI testi şart.
> Repo temizliği yapıldı: nested `vasi/` kopyası, `conversations/`, junk, eski v1 dokümanlar silindi; `dist/` + npm lock + `.chainlit` git'ten çıkarıldı (`.gitignore` güncellendi).
> Canlı testte OTP'ler yerel D1'den çözülebiliyor: `email_verifications.code_hash` ve `recipients.otp_code` = saltsız `base64(SHA-256(otp))` → 6 hane brute-force. Resend test modu yalnız `ilkeronurkaya@gmail.com`'a gerçekten gönderir (Gmail'den okunur).

---

## 1. ROLLER VE İŞ AKIŞI (2026-06-12'de kesinleşti)

**Beyin takımı = iko + Claude.** Strateji, roadmap, sprint tasarımı, kabul kriterleri, diff incelemesi, mimari kararlar.
**Uygulayıcı = OpenHands + Gemini Flash** (API). **YALNIZCA kod + test yazar.** Klonda çalışır.
**Tüm işlemler iko'nun Mac'inde yapılır; Claude sandbox'tan commit ATMAZ** (bayat .git lock bırakıyor — yaşandı).

> **YENİ İŞ AKIŞI (2026-06-13'te kesinleşti):** Ajan **branch/commit/push YAPMAZ** — sadece çalışma ağacında kod+test yazar.
> Branch açma, commit, merge, push HEPSİ iko'da. Sebep: Flash-Lite iki turda da git'i batırdı (yanlış branch, eksik/derlenmeyen redo,
> "tamamlandı" uydurması — bkz. Bölüm 2). Bu değişiklikle git riski tamamen ortadan kalkar; ajanın sadece kod kalitesi değerlendirilir.

Sprint döngüsü, adım adım:
1. iko + Claude sprint'i tanımlar → prompt hazırlanır (kabul kriterli). Promtta: **"branch/commit/push YAPMA; sadece çalışma ağacında kod+test yaz; bitince değişen dosyaların listesini + `git status` çıktısını ver."**
2. iko klonu tazeler: `cd ~/Projects/vasi-agent && git checkout main && git pull origin main` (klon main asıl repo main ile aynı olmalı).
3. OpenHands'te YENİ konuşma → prompt yapıştırılır. (Repo kökü /workspace; önce /workspace/AGENTS.md oku.)
4. Ajan bitince **raporuna güvenilmez.** iko klonda `git status` ile gerçek değişen dosyaları görür; Claude diff'i klondaki çalışma ağacından inceler (`cd ~/Projects/vasi-agent && git --no-pager diff`).
5. İnceleme OK ise işi asıl repoya iko taşır: en temizi klondaki değişiklikleri asıl repoda elle uygulamak (küçükse) ya da `git -C ~/Projects/vasi-agent diff > /tmp/s.patch && git -C ~/Projects/vasi apply /tmp/s.patch`. Sonra asıl repoda: `git checkout -b sprint-NN ... && git add -A && git commit && smoke && git push`.
6. Bağımsız doğrulama ŞART: asıl repoda `rm -rf node_modules */node_modules && pnpm install && uv run --python 3.12 python crew/tests/api_smoke.py` + UI işleri Chrome'dan elle (smoke UI'yi görmez).
7. Düzeltme gerekirse ajana TEK tur (satır seviyesinde tarifle); 2. turda hâlâ kırmızıysa düzeltme Claude'a döner (S20'de yaşandı — Claude asıl repoda 2 satırlık fix'i kendi uyguladı).

## 2. UYGULAYICI TARİHÇESİ VE MALİYET

- **Crew/devstral (sprint 18): KALDI** — api_smoke.py bozuldu, rapor güvenilmez. `crew/` emekli; manager/Tester/bildirim kalıyor.
- **Pilot 1, Qwen3.6-35B yerel (LM Studio): KALDI** — aynı kalıp (testler bozuldu + "3/4 geçti" uydurması). Yerel LLM bir daha DENENMEZ.
- **Pilot 2, Gemini 3.5 Flash: GEÇTİ** — failed-deliveries retry, 38/38, sıfır düzeltme turu (`aa6af45`). Döküm: `PILOT_OPENHANDS.md`.
- **Pilot 3, Gemini 3.1 Flash-Lite (Sprint 20): KISMİ.** Kod mantığı çoğunlukla doğruydu (admin/plan UI, 6 maddenin 5'i ilk turda kabul edilebilir),
  AMA git akışını İKİ turda da batırdı: işi feature branch yerine klon main'ine commit'ledi; düzeltme turunda orijinal işi içermeyen
  eksik/**derlenmeyen** bir redo yaptı (plans.ts/recharts unutuldu); her seferinde "tamamlandı, branch açıldı" diye uydurdu.
  #4 pie chart görünmüyordu, #7 audit attribution NULL'dı — ikisini de Claude asıl repoda elle düzeltti. **Sonuç: model ucuz ve kod üretebiliyor,
  ama git/iş-akışı güvenilmez → kalıcı çözüm: ajan artık SADECE kod yazar, git iko'da (Bölüm 1 yeni iş akışı).** Kalite hâlâ 3.5 Flash'ın altında;
  riskli/büyük sprintlerde 3.5 Flash tercih et, ufak/net işlerde Flash-Lite dene.
- **Maliyet:** Pilot 2 ≈ $1.5. Flash-Lite belirgin ucuz. Ek tasarruf: OpenHands Settings > Condenser'ı aç; kullanılmayan skill'leri kapat.

## 3. OPENHANDS ÇALIŞTIRMA REHBERİ (sıfırdan)

1. Docker Desktop açık olsun. Eski container temizliği: `docker rm -f openhands-app; docker ps -aq --filter "name=oh-agent-server" | xargs docker rm -f`
2. `cd ~/Projects/vasi-agent && openhands serve --mount-cwd` → http://localhost:3000 (port 3000 doluysa vasi-web'i kapat: `lsof -i :3000` → kill)
3. Settings > LLM > "see advanced settings" > Advanced:
   - Custom Model: `gemini/gemini-3.5-flash` (veya denenen ucuz model)
   - **Base URL: `https://generativelanguage.googleapis.com/v1beta`** — ZORUNLU; boş bırakılırsa LiteLLM çift-URL 404 hatası verir (bilinen bug)
   - API Key: Google AI Studio (`AIza...`; doğrulama: curl ile generateContent — PILOT_OPENHANDS.md)
4. Ayar değişikliği konuşma AÇILIŞINDA sabitlenir → ayardan sonra hep YENİ konuşma.
5. Klondaki `vasi-api/.dev.vars` SAHTE değerlerle durur (JWT_SECRET=pilot-test-secret, APP_URL=http://localhost:3000) — gerçek sır ajana verilmez.

## 4. MİMARİ

Monorepo (pnpm): `vasi-web` (Next.js 15, edge runtime, koyu Apple-dili tasarım — `DESIGN.md` anayasa: APPLE TASARIM DİLİ v2 + Buton Sistemi v2),
`vasi-api` (Cloudflare Workers + Hono + D1; rotalar `src/routes/`, servisler `src/services/`, DB erişimi `src/db/`, yardımcılar `src/lib/`),
`migrations/` (13 dosya, D1), `crew/` (emekli ajan altyapısı; canlı kalanlar: `crew/tests/api_smoke.py` + manager + loglar), `AGENTS.md` (ajan kuralları).

## 5. SPRINT GEÇMİŞİ — 21 KAPALI

1-7 temel · 8 gerçek veri · 9 eksikler · 10-11 Apple tasarım · 12 e-posta bug+upgrade · 13 admin backend · 14 admin UI ·
15 buton v2+fiyat senkronu · 16 e-posta uçtan uca · 17 teslimat deneyimi (şablon + erişim token'ı + /m/[token]) ·
18 devstral pilotu (KALDI) · 19 alıcı OTP (`1527a7b`) · +failed-deliveries retry (`aa6af45`, pilot 2 ürünü) ·
**20 admin & plan düzeltmeleri + UI** (ikotest 7 bulgu; auth kontrat fix'leri `e2eae52`, pie/audit fix `2454f1f`) ·
**21 paket (plan) CRUD** (plans tablosu + admin yönetimi; Flash-Lite pilot 3, "ajan sadece kod" iş akışı burada doğdu) ·
**22 İyzico Checkout Form ödeme** (mock mod, `7b24ff3`; `payments` tablosu 0015, `iyzico.ts` edge-uyumlu IYZWSv2, /upgrade yükseltme; Flash pilot — 6 bug bağımsız doğrulamada düzeltildi; gerçek sandbox testi askıda).
Eski sprint dosyaları `CLOSED = True` ile kilitli.

## 6. TESTBULGULARI_1 — 7/7 DÜZELTİLDİ (2026-06-12, main'de)

1. Landing hydration — dil tespiti useEffect'e taşındı (SSR hep TR). 2. Auth sayfalarına "← Ana sayfaya dön".
3. Kayıt 500 — D1 undefined bind (`?? null`) + email_verifications şema uyumu (code_hash, expires_at); doğrulama kodu artık e-postalanıyor; ek: süresi geçmiş kod reddi (`2fc0adc`).
4. Dashboard rakamları — cancelled filtrelendi, GÖNDERİLDİ=sent+delivered. 5. Admin'e "Teslimatları Şimdi Çalıştır" (lokal'de cron yok).
6. OTP akışı dokümante edildi (aşağıda). 7. Mesaj silme — soft-delete listede kalıyordu, #4 çözdü. BONUS: bozuk adminFetch.ts silindi.

## 7. CANLI TEST AKIŞI (uçtan uca elle test)

1. /register → doğrulama kodu e-postana (Resend test modu: YALNIZCA ilkeronurkaya@gmail.com'a gönderir; başka adres → kod `crew/dev-api.log`'da)
2. /verify-email → kod → login
3. Mesaj oluştur → alıcı ekle (alıcı = kendi adresin) → yakın tarihe zamanla
4. Admin (/admin/login, test@vasi.app / Test1234!) → Genel Bakış → "Teslimatları Şimdi Çalıştır" → "X teslim edildi"
5. E-postadaki buton → /m/[token] önizleme → "Mesajı Aç" → OTP e-postası → 6 haneli kod → içerik açılır
6. Başarısız teslimat varsa: Admin > Raporlar > başarısız satırda "Yeniden Dene" → tekrar kuyruğa girer (yeni özellik)

## 8. SÜREÇ ALTYAPISI

- **Manager / Süreç Paneli** (`chainlit run manager.py`): test · durum · log · kontrol · migrate · dev · durdur · bildirim. `sprint N` kapalı.
- **Tester**: `crew/tests/api_smoke.py` — 38 deterministik test (izole DB :8788) + statik kontroller ('use client', rota mount, CSS).
  Host'ta elle: `uv run --python 3.12 python crew/tests/api_smoke.py` (sistem python3=3.9, `str | None` çöker).
- **Bildirim**: ntfy `vasi-iko-7ca81627` (çıktı) / `vasi-iko-cmd-57f994b1` (komut) + iMessage.
- **Loglar**: `crew/logs/` + `crew/dev-api.log` — sohbete log yapıştırma, buradan oku.

## 9. KURALLAR (değişmez)

1. Kod + test AYNI commit'te (test önce giderse Tester bug sanır — yaşandı).
2. Şema değişikliği = yeni migration; elle ALTER yasak.
3. Her commit öncesi `git branch --show-current` (branch kayması 2 kez yaşandı).
4. Push HER ZAMAN iko'dan. Claude sandbox'tan commit atmaz. Ajan asıl repoya DOKUNMAZ (sadece klon).
5. Ajan raporuna güvenilmez — bağımsız doğrulama şart.

## 10. ORTAM / SIRLAR

`vasi-api/.dev.vars` (gitignore'lu, ASIL repoda gerçek): JWT_SECRET, RESEND_API_KEY (test modu — yalnızca hesap sahibine gönderir),
EMAIL_FROM=`Vasi <onboarding@resend.dev>` (domain doğrulanana dek), APP_URL=http://localhost:3000.
Lokal admin: test@vasi.app / Test1234! (is_admin=1). NOT: Resend key sohbete yapıştırılmıştı — canlıya çıkmadan ROTATE edilecek.

## 11. API SÖZLEŞMESİ (sık kullanılan)

- Auth: `POST /api/v1/auth/login` → `{accessToken, refreshToken}`; `POST /auth/register` (400 eksik alan, 409 kayıtlı e-posta); `POST /auth/verify-email` `{email, otp}`
- Mesaj: `POST /messages` `{title, message_type, content_text}` (403 LIMIT_REACHED); `POST /:id/recipients` `{full_name, email}`; `POST /:id/schedule` `{scheduled_at}` (ISO, gelecek); `DELETE /:id` (soft, status=cancelled)
- `GET /me` → `{user, plan, usage}`
- Admin `/api/v1/admin/*` (rotalara INLINE adminMiddleware — `admin.use('/x*')` iç içe PATCH'i yakalamıyor): login; users (+status/plan PATCH); stats/overview·messages·plans; reports/users·revenue·failed-deliveries;
  settings GET/PUT; `POST delivery/run-due` → `{delivered, failed}`; `POST delivery/retry/:messageId` → 200/404/409 (error→scheduled, failed_reason=NULL)
- **Plan CRUD (S21)** `/api/v1/admin/plans`: `GET` → `{plans:[...]}`; `POST` `{slug,name,price_monthly,message_limit,recipient_limit,is_active?}` (201, 409 SLUG_EXISTS); `PUT /:id` (200/404); `DELETE /:id` → 409 PLAN_IN_USE (aktif abone varsa), yoksa 200. Plan = `plans` tablosu (slug,name,price_monthly,message_limit,recipient_limit,is_active,sort_order). `subscriptions.plan_type` = plan slug (CHECK YOK).
- Public: **`GET /public/pricing` → `{plans:[aktif: {slug,name,price_monthly,message_limit,recipient_limit}]}`** (S21'de `{pricing:{key:value}}`'dan değişti); `GET /public/view/:token` → önizleme (`otp_required`, içerik YOK); `POST /view/:token/otp` → kod e-postala;
  `POST /view/:token/verify` `{otp}` → içerik (5 deneme, 10 dk, tek kullanımlık, accessed_at damgalar)
- Teslimat: cron 08:00 UTC + run-due; şablon `delivery.service.ts:buildDeliveryEmail` (açık tema, tablo; içerik gömülmez, link taşır)
- Statü sözlüğü: messages.status ∈ draft/scheduled/sent/delivered/error/cancelled — CHECK kısıtı `'failed'` KABUL ETMEZ.

## 12. BİLİNEN TUZAKLAR

- D1 `undefined` bind = D1_TYPE_ERROR → `?? null`.
- Tarih karşılaştırması SQL'de `datetime(...)` ile normalize edilir.
- `navigator`/`localStorage` useState initializer'da OKUNMAZ (hydration) — useEffect.
- Hook kullanan sayfada `'use client'` zorunlu (statik kontrol var).
- adminFetch `@/lib/api`'den (Bearer ekler).
- Klonda ajan pnpm install yaptıysa workerd Linux'a döner → host'ta yeniden kur.
- Tarayıcı çeviri eklentisi hydration uyarısı üretebilir — uygulama hatası değil.
- **Migration'lar KÖK `migrations/`'a yazılır** (`wrangler.toml migrations_dir = ../migrations`). `vasi-api/migrations/` atıl/yanlış — oraya yazılan migration uygulanmaz (S22'de ajan buraya koydu).
- **`subscriptions.user_id`'de UNIQUE YOK** → `ON CONFLICT(user_id)` PATLAR. Upsert için SELECT (status='active') → UPDATE ya da açık `crypto.randomUUID()` id ile INSERT (admin.ts kalıbı).
- Workers'da `await response.json()` tipi `unknown` (tsc strict) → `const data: any = ...` ile bağla.
- Client sayfada `useSearchParams` Next15'te `<Suspense>` ister yoksa build kırılır → query'i `useEffect` içinde `window.location.search`'ten oku.
- İyzico callback'i gerçekte form-POST, mock'ta `?token=` query gelir — handler ikisini de okur, JSON body OKUMAZ. Smoke callback'i query ile çağırmalı (JSON body handler'a ulaşmaz). Başarı callback'i 302 ile `APP_URL`'e döner; smoke'ta web kapalı → `req()` `URLError`'ı yutar.

## 13. SIRADAKİ İŞLER (öncelik sırasıyla)

> Canlı test (06-13) + ikinci tur elle test (`ikotest.md`, 7 bulgu) sonrası öncelikler güncellendi. İyzico ileri kaydı; önce admin/plan deneyimi düzeltilecek.

~~1. Sprint 20 — Admin & Paket düzeltmeleri + UI~~ **KAPANDI (06-13).** `ikotest.md` #1,#2,#3,#4,#5,#7 tamam; canlı doğrulandı.
   - #7 askıya alma 500: kök neden `admin.use('/users*')` Hono'da iç içe PATCH rotasını yakalamıyordu → patch rotalarına **inline** `adminMiddleware` eklendi; audit artık admin id kaydediyor (NULL değil).
   - #1 /upgrade `GET /public/pricing`'ten okuyor (₺49/100 mesaj) · #2 her yerde **"Premium"** (`lib/plans.ts` planLabel) · #3 buton `btn btn-primary` · #4 pie chart sabit 320×240 + `isAnimationActive=false` (ResponsiveContainer 1702px yanlış ölçüyordu) · #5 `premium.test@vasi.app` seed.
   - **Kalan ufak iş:** premium seed kullanıcının şifre hash'i sahte → onunla giriş yapılamaz (sadece görünür). Giriş gerekirse `test@vasi.app`'inki gibi gerçek hash koy.
~~Sprint 21 — Paket (plan) CRUD~~ **KAPANDI (06-13).** `plans` tablosu (migration 0014) + admin Ayarlar'da CRUD; `subscriptions.plan_type` CHECK'i kaldırıldı (tablo yeniden oluşturuldu); fiyat/limit artık `plans`'tan (public/pricing → `{plans:[...]}`, mesaj limiti `messages.ts`'te plans.message_limit). Canlı doğrulandı: yaratma 201, kullanılmayan silme 200, kullanımdaki silme 409 (masaüstü alert ile uyarı). Smoke 45/45. **Backlog (ufak UX):** "Yeni Paket" sayısal alanları `0` default'unu temizlemiyor (`099` görünür, kayıt doğru).
~~1. İyzico sandbox~~ **KAPANDI (06-14, mock mod).** `7b24ff3` / branch `sprint-22`. /upgrade'de "Premium'a Yükselt" çalışıyor (mock). Gerçek sandbox ödeme testi askıda (merchant hesabı + gerçek key + `IYZICO_MODE=sandbox`). Kart saklama/recurring/webhook kapsam dışıydı.
1. **ikotest.md 2. tur (9 bulgu, 06-14)** ← SIRADAKİ ürün backlog'u: (1) login/kayıt "hesap aç" metinleri bold; (2) Google + Apple login (admin yalnız email+şifre); (3) SMS gönderme (NetGSM kolonları/Env hazır); (4) mesaj sihirbazında son tuş "Gönder" yerine "Oluştur"; (5) admin'e giriş yapılamıyor — incele; (6) sol-altta "N" butonu (Next dev göstergesi) kaldır; (7) admin girişine e-posta OTP; (8) settings'te profil düzenleme + her değişiklikte OTP; (9) mesaj hakkı sayacı "5/100" rakamla. **Önce iko ile önceliklendir + sprintlere böl.**
2. Resend domain doğrulama (test modu kısıtını kaldırır) → sonra key rotate.
3. Gerçek İyzico sandbox testi — merchant hesabı açılınca (Böl. üstteki blocker).
4. Canlıya çıkış: wrangler deploy + Pages.

> **Açık process boşluğu:** frontend↔API kontrat kayması smoke'ta görünmüyor (06-13'te 2 P0 böyle kaçmıştı). Sprint kabul kriterlerine UI akış kontrolü ekle veya web↔api paylaşılan tip/şema kullan.

## 14. KOMUT ÖZETİ

```bash
pnpm dev:api / dev:web                                   # :8787 / :3000
pnpm db:migrate:local                                    # D1 şema
uv run --python 3.12 python crew/tests/api_smoke.py      # testler (veya manager `test`)
cd ~/Projects/vasi-agent && git pull origin main          # sprint öncesi klonu tazele... (önce asıl repodan push)
openhands serve --mount-cwd                              # ajan (klon dizininden!)
git push origin main                                     # push HER ZAMAN iko'dan
```
