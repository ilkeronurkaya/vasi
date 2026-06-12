# Vasi App BD — Oturum El Geçirme Notu
_Tarih: 2026-06-11 gece (güncellendi)_

> Proje: `~/Projects/vasi` · GitHub: `git@github.com:ilkeronurkaya/vasi.git` (private, push kullanıcı terminalinden)
> Ürün durumu: **UÇTAN UCA ÇALIŞIYOR** — kayıt → mesaj → zamanlama → tasarımlı e-posta → /m/[token] görüntüleme.
> İlk gerçek e-posta 2026-06-11'de teslim edildi (Resend).

---

## Mimari Özet

Monorepo: `vasi-web` (Next.js 15, edge, koyu Apple-dili tasarım), `vasi-api` (CF Workers/Hono, D1),
`crew/` (yerel LLM ajan altyapısı — **fiilen emekli**, aşağıya bak), `migrations/` (13 dosya),
`DESIGN.md` (tasarım anayasası: APPLE TASARIM DİLİ v2 + Buton Sistemi v2).

## Sprint Durumu — 18/18 KAPALI

1-7 temel, 8 gerçek veri, 9 eksikler, 10-11 Apple tasarım, 12 e-posta bug+upgrade,
13 admin backend, 14 admin UI, 15 buton v2+fiyat senkronu (hibrit), 16 e-posta uçtan uca (Claude),
17 teslimat deneyimi: tasarımlı e-posta şablonu + alıcı erişim token'ı + `/m/[token]` sayfası (Claude),
19 alıcı OTP doğrulaması: /m/[token] içerik artık e-posta koduyla açılıyor (Claude, `1527a7b`).
Tüm sprint dosyaları `CLOSED = True` ile kilitli — manager koşturmayı reddeder.
NOT: İyzico sandbox sprint 20'ye kaydı (19 numarasını OTP aldı).

## TestBulgulari_1 — 7/7 DÜZELTİLDİ (2026-06-12, branch test-bulgulari-1)

Kullanıcının ilk elle test turu (`TestBulgulari_1.txt`) 7 bulgu çıkardı; hepsi kapatıldı:
1. **Landing hydration hatası** — dil tespiti useState initializer'dan useEffect'e taşındı (SSR hep TR üretir).
2. **Auth → ana sayfa linki yok** — (auth)/layout.tsx kart altına "← Ana sayfaya dön" eklendi.
3. **Kayıt 500** — İKİ kök neden: (a) D1 `phone=undefined` bind hatası → `?? null`; (b) `email_verifications` şema uyumsuzluğu: kod `token_hash` yazıyordu, sütun `code_hash` + `expires_at` NOT NULL set edilmiyordu. Kayıt hiç çalışmamıştı. Ek: doğrulama OTP'si artık gerçekten e-postalanıyor (başarısızsa kayıt yine geçer, kod dev-api.log'da).
4. **Dashboard rakamları yanlış** — silinen (cancelled) mesajlar listeden filtrelendi (findAllByUser); GÖNDERİLDİ artık sent+delivered sayıyor.
5. **Zamanlanmış e-posta gitmedi** — lokal'de cron çalışmaz; admin genel bakışa "Teslimatları Şimdi Çalıştır" (run-due) butonu eklendi.
6. **OTP akışı anlaşılmadı** — kök neden #5 (e-posta hiç gitmedi); akış aşağıda "Canlı Test Akışı"nda dokümante edildi.
7. **Mesaj silme "çalışmıyor"** — API aslında 200 dönüyordu; soft-delete edilen mesaj listede kalıp Taslak görünüyordu → #4 filtresi çözdü.
BONUS: `lib/adminFetch.ts` bozuk kopyaydı (token göndermiyordu) — silindi, admin genel bakış `@/lib/api`'ye bağlandı.

## Canlı Test Akışı (uçtan uca)

1. Kayıt: /register → doğrulama kodu e-postana gelir (Resend test modu: YALNIZCA ilkeronurkaya@gmail.com'a gönderir; başka adresle test ediyorsan kod `crew/dev-api.log`'da `E-posta doğrulama OTP'si` satırında)
2. /verify-email → kodu gir → login
3. Mesaj oluştur → alıcı ekle (alıcı e-postası = kendi adresin, Resend test modu) → zamanla (yakın bir tarih)
4. Admin (/admin/login, test@vasi.app / Test1234!) → Genel Bakış → **"Teslimatları Şimdi Çalıştır"** → "X teslim edildi" görmeli
5. E-postadaki "Mesajını Görüntüle" → /m/[token] önizleme → "Mesajı Aç" → OTP e-postası gelir → 6 haneli kodu gir → içerik açılır
   (OTP kodu da test modunda yalnızca kendi adresine gider; gerekirse dev-api.log'a düşmez — alıcı adresi kendi adresin olmalı)

## CREW KARARI — KAPANDI (2026-06-12): CREW EMEKLİ

Devstral + ToolCallingAgent pilotu (sprint 18, login validasyonu) 4/4 kriterde kaldı:
api_smoke.py girintisiz satırla bozuldu (paket çöktü), erken-return mantık hatası
kalan tüm testleri atlatacaktı; Tester 2 denemede düzeltemedi. Detay: `crew/sprint18.py`
SONUÇ bölümü + `crew/logs/sprint18-task1-ana.log`. (TS tarafı temizdi ama yetmedi.)

**Yeni iş akışı (kesin):** kullanıcı yönetir (sprint tanımı + kabul + push) →
Claude uygular (kod + test AYNI commit'te) → Tester doğrular (manager `test`).
Manager/Tester/bildirim altyapısı kalıyor; crew kod yazımı kapalı.
manager.py temizliği yapıldı (2026-06-12): `sprint N` iki kanalda da kapalı,
`test` artık salt rapor (LLM düzelttirme yok), panel "Süreç Paneli" oldu.

## Çalışan Süreç Altyapısı

- **Manager / Süreç Paneli** (chainlit run manager.py): test · durum · log · kontrol · migrate · dev · durdur · bildirim. (`sprint N` kapalı — crew emekli.)
- **Tester**: `crew/tests/api_smoke.py` — 33 deterministik test (izole DB :8788). Statik: 'use client', rota mount, CSS sözdizimi. Komut: `test`. (Elle: `crew/.venv/bin/python3 crew/tests/api_smoke.py` — sistem python3 3.9, `str | None` çöker.)
- **Bildirim**: ntfy `vasi-iko-7ca81627` (çıktı) / `vasi-iko-cmd-57f994b1` (telefondan komut) + iMessage ("Patron ... Bilgine.").
- **Ajan adım logları**: `crew/logs/` (denetim için; sohbete log yapıştırmak yerine buradan okunur).
- **Kurallar**: test, özellikle AYNI commit'te eklenir (önce eklenirse Tester onu bug sanır — yaşandı). Şema değişikliği = yeni migration, elle DB ALTER yasak. Her commit öncesi `git branch --show-current` (branch kayması 2 kez yaşandı).

## Ortam / Sırlar

`vasi-api/.dev.vars` (gitignore'lu): JWT_SECRET, RESEND_API_KEY (gerçek, test modu — yalnızca
hesap sahibinin adresine gönderir), EMAIL_FROM=`Vasi <onboarding@resend.dev>` (domain doğrulanana
dek zorunlu), APP_URL=http://localhost:3000. Lokal admin: test@vasi.app / Test1234! (is_admin=1).
Not: Resend key sohbete yapıştırıldı — canlıya çıkmadan rotate edilecek.

## SÜREÇ DEĞİŞİKLİĞİ (2026-06-12): UYGULAYICI ARAYIŞI

Token maliyeti nedeniyle uygulayıcı rolü ajan çatısına taşınıyor; iko+Claude beyin takımı
(strateji/roadmap/kontrol) olarak kalıyor. Ajan kuralları: `AGENTS.md` (OpenHands kökten yükler).

- **Pilot 1 (Qwen3.6-35B yerel, LM Studio): KALDI** — api_smoke.py bozuldu + rapor uydurma
  (devstral kalıbı). Döküm: `PILOT_OPENHANDS.md` SONUÇ. `pilot-openhands-1` silindi.
- **Pilot 2 (Gemini 3 Flash API): tanımlı, başlatılacak** — aynı görev (failed-deliveries retry),
  branch `pilot-openhands-2`. Yeni kurallar: ajan REPO KLONUNDA çalışır (`~/Projects/vasi-agent`),
  raporuna güvenilmez (her tur Tester doğrular), klona sahte `.dev.vars`.

## Sıradaki İşler

1. Canlı testi tekrarla — yukarıdaki "Canlı Test Akışı"nı izle (TestBulgulari_1 düzeltmeleri sonrası; API restart gerekli)
2. Sprint 20 adayı: **İyzico sandbox** (kullanıcının merchant hesabı açması gerek) — /upgrade CTA'sı "Yakında" bekliyor
3. Diğer adaylar: Resend domain doğrulama (test modu kısıtını kaldırır), canlıya çıkış (wrangler deploy + Pages)

## API Sözleşmesi (sık kullanılan)

- Auth: `POST /api/v1/auth/login` → `{accessToken, refreshToken}`; Bearer ile `apiFetch`/`adminFetch` (src/lib/api.ts)
- Mesaj: `POST /messages` `{title, message_type, content_text}` → satır (id'li); 403 LIMIT_REACHED; `POST /:id/recipients` `{full_name, email}`; `POST /:id/schedule` `{scheduled_at}` (ISO, gelecek zorunlu)
- `GET /me` → `{user, plan, usage}`
- Admin `/api/v1/admin/*`: login → `{accessToken}`; users (+status/plan PATCH); stats/overview·messages·plans; reports/users·revenue·failed-deliveries; settings GET/PUT; **delivery/run-due** → `{delivered, failed}`
- Public: `GET /api/v1/public/pricing` (admin↔landing fiyat senkronu); `GET /api/v1/public/view/:token` → önizleme (içerik YOK, `otp_required`); `POST /view/:token/otp` → kod e-postala (`email_masked`); `POST /view/:token/verify` `{otp}` → içerik (5 deneme, 10 dk, tek kullanımlık, accessed_at damgalar)
- Teslimat: cron 08:00 UTC + run-due; e-posta şablonu `delivery.service.ts:buildDeliveryEmail` (açık tema, tablo tabanlı, içerik gömülmez — link taşır)

## Komutlar

```bash
pnpm dev:api / dev:web          # :8787 / :3000
pnpm db:migrate:local           # D1 şema
python3 crew/tests/api_smoke.py # testler (veya manager'da `test`)
git push origin main            # push HER ZAMAN kullanıcıdan
```
