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
- **Tester**: `crew/tests/api_smoke.py` — 30 deterministik test (izole DB :8788). Statik: 'use client', rota mount, CSS sözdizimi. Komut: `test`. (Elle: `crew/.venv/bin/python3 crew/tests/api_smoke.py` — sistem python3 3.9, `str | None` çöker.)
- **Bildirim**: ntfy `vasi-iko-7ca81627` (çıktı) / `vasi-iko-cmd-57f994b1` (telefondan komut) + iMessage ("Patron ... Bilgine.").
- **Ajan adım logları**: `crew/logs/` (denetim için; sohbete log yapıştırmak yerine buradan okunur).
- **Kurallar**: test, özellikle AYNI commit'te eklenir (önce eklenirse Tester onu bug sanır — yaşandı). Şema değişikliği = yeni migration, elle DB ALTER yasak. Her commit öncesi `git branch --show-current` (branch kayması 2 kez yaşandı).

## Ortam / Sırlar

`vasi-api/.dev.vars` (gitignore'lu): JWT_SECRET, RESEND_API_KEY (gerçek, test modu — yalnızca
hesap sahibinin adresine gönderir), EMAIL_FROM=`Vasi <onboarding@resend.dev>` (domain doğrulanana
dek zorunlu), APP_URL=http://localhost:3000. Lokal admin: test@vasi.app / Test1234! (is_admin=1).
Not: Resend key sohbete yapıştırıldı — canlıya çıkmadan rotate edilecek.

## Sıradaki İşler

1. Canlı test (17+19 birlikte): API restart → kendine mesaj zamanla → `run-due` → tasarımlı e-posta → `/m/[token]` → OTP e-postası → kodla aç
2. Sprint 20 adayı: **İyzico sandbox** (kullanıcının merchant hesabı açması gerek) — /upgrade CTA'sı "Yakında" bekliyor
3. Diğer adaylar: Resend domain doğrulama, canlıya çıkış (wrangler deploy + Pages)

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
