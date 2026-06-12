# Vasi App BD — Oturum El Geçirme Notu (DETAYLI)
_Tarih: 2026-06-12 gece · Bu dosya her oturum başında okunur; durumu git ile çapraz doğrula: `git log --oneline -5 --all`_

> Proje: `~/Projects/vasi` · Ajan klonu: `~/Projects/vasi-agent` · GitHub: `git@github.com:ilkeronurkaya/vasi.git` (private)
> Ürün durumu: **UÇTAN UCA ÇALIŞIYOR** — kayıt → e-posta doğrulama → mesaj → zamanlama → tasarımlı e-posta → /m/[token] → alıcı OTP → içerik.
> İlk gerçek e-posta 2026-06-11'de teslim edildi (Resend). Smoke: **38/38 yeşil.**

---

## 1. ROLLER VE İŞ AKIŞI (2026-06-12'de kesinleşti)

**Beyin takımı = iko + Claude.** Strateji, roadmap, sprint tasarımı, kabul kriterleri, diff incelemesi, mimari kararlar.
**Uygulayıcı = OpenHands + Gemini 3.5 Flash** (API). Kod + test yazımı, klonda çalışır.
**Tüm işlemler iko'nun Mac'inde yapılır; Claude sandbox'tan commit ATMAZ** (bayat .git lock bırakıyor — yaşandı).

Sprint döngüsü, adım adım:
1. iko + Claude sprint'i tanımlar → görev dosyası/prompt hazırlanır (kabul kriterli).
2. iko klonu tazeler: `cd ~/Projects/vasi-agent && git checkout main && git pull origin main`
3. OpenHands'te YENİ konuşma → prompt yapıştırılır. Prompt şablonu (uyarlayarak):
   - Repo kökü /workspace; önce /workspace/AGENTS.md oku
   - Branch adı (main'den), kod + testler AYNI commit'te
   - Commit'ten önce smoke koştur; çıktının SON 10 satırını AYNEN göster
   - git push YAPMA
4. Ajan bitirince: **raporuna güvenilmez** — iko host'ta bağımsız doğrular:
   `cd ~/Projects/vasi-agent && rm -rf node_modules */node_modules && pnpm install && uv run --python 3.12 python crew/tests/api_smoke.py`
   (node_modules tazeleme şart: ajan Linux'ta kurduysa workerd binary'si Mac'te çalışmaz.)
5. Claude diff'i inceler: `git diff main..<branch>` (klonda) — assertion'lar gerçek mi, mevcut testler korunmuş mu, spec'e uygun mu.
6. Yeşil + incelemeden geçtiyse iko merge + push:
   `cd ~/Projects/vasi && git fetch ../vasi-agent <branch>:<branch> && git checkout main && git merge <branch> && git push origin main`
7. Düzeltme gerekirse ajana TEK tur verilir, satır seviyesinde tarifle; 2. turda hâlâ kırmızıysa sprint Claude'a döner.

## 2. UYGULAYICI TARİHÇESİ VE MALİYET

- **Crew/devstral (sprint 18): KALDI** — api_smoke.py bozuldu, rapor güvenilmez. `crew/` emekli; manager/Tester/bildirim kalıyor.
- **Pilot 1, Qwen3.6-35B yerel (LM Studio): KALDI** — aynı kalıp (testler bozuldu + "3/4 geçti" uydurması). Yerel LLM bir daha DENENMEZ.
- **Pilot 2, Gemini 3.5 Flash: GEÇTİ** — failed-deliveries retry, 38/38, sıfır düzeltme turu (`aa6af45`). Döküm: `PILOT_OPENHANDS.md`.
- **Maliyet:** Pilot 2 ≈ $1.5 (kurulum debelenmesi dahil). iko için hâlâ yüksek. **Sıradaki hamle: bir sonraki sprint'i
  Gemini 3.1 Flash-Lite ile dene** (Custom Model `gemini/gemini-3.1-flash-lite`, aynı Base URL) — Google'ın en ucuz modeli;
  geçerse ~10x ucuzlar. Alternatif: DeepSeek (`deepseek/deepseek-chat`, görev başına ~$0.03). Kalite düşerse 3.5 Flash'a dön.
  Ek tasarruf: OpenHands Settings > Condenser'ı aç (bağlam sıkıştırma); kullanılmayan skill'leri kapat (50 skill yükleniyor).

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

## 5. SPRINT GEÇMİŞİ — 19/19 + 1 KAPALI

1-7 temel · 8 gerçek veri · 9 eksikler · 10-11 Apple tasarım · 12 e-posta bug+upgrade · 13 admin backend · 14 admin UI ·
15 buton v2+fiyat senkronu · 16 e-posta uçtan uca · 17 teslimat deneyimi (şablon + erişim token'ı + /m/[token]) ·
18 devstral pilotu (KALDI) · 19 alıcı OTP (`1527a7b`) · +failed-deliveries retry (`aa6af45`, pilot 2 ürünü).
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
- Admin `/api/v1/admin/*`: login; users (+status/plan PATCH); stats/overview·messages·plans; reports/users·revenue·failed-deliveries;
  settings GET/PUT; `POST delivery/run-due` → `{delivered, failed}`; `POST delivery/retry/:messageId` → 200/404/409 (error→scheduled, failed_reason=NULL)
- Public: `GET /public/pricing`; `GET /public/view/:token` → önizleme (`otp_required`, içerik YOK); `POST /view/:token/otp` → kod e-postala;
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

## 13. SIRADAKİ İŞLER (öncelik sırasıyla)

1. **Canlı testi tekrarla** (Bölüm 7) — TestBulgulari düzeltmeleri + OTP + retry sonrası tam tur (API restart gerekli).
2. **Maliyet pilotu**: bir sonraki sprint'i Gemini 3.1 Flash-Lite ile koş (Bölüm 2) — kabul kriterleri aynı.
3. **Sprint 20: İyzico sandbox** — iko'nun merchant hesabı gerek; /upgrade CTA "Yakında" bekliyor.
4. Resend domain doğrulama (test modu kısıtını kaldırır) → sonra key rotate.
5. Canlıya çıkış: wrangler deploy + Pages.

## 14. KOMUT ÖZETİ

```bash
pnpm dev:api / dev:web                                   # :8787 / :3000
pnpm db:migrate:local                                    # D1 şema
uv run --python 3.12 python crew/tests/api_smoke.py      # testler (veya manager `test`)
cd ~/Projects/vasi-agent && git pull origin main          # sprint öncesi klonu tazele... (önce asıl repodan push)
openhands serve --mount-cwd                              # ajan (klon dizininden!)
git push origin main                                     # push HER ZAMAN iko'dan
```
