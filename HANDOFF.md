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

## Sprint Durumu — 17/17 KAPALI

1-7 temel, 8 gerçek veri, 9 eksikler, 10-11 Apple tasarım, 12 e-posta bug+upgrade,
13 admin backend, 14 admin UI, 15 buton v2+fiyat senkronu (hibrit), 16 e-posta uçtan uca (Claude),
17 teslimat deneyimi: tasarımlı e-posta şablonu + alıcı erişim token'ı + `/m/[token]` sayfası (Claude).
Tüm sprint dosyaları `CLOSED = True` ile kilitli — manager koşturmayı reddeder.

## ⚠️ CREW KARARI (2026-06-12: yeni modelle pilot)

Karar: crew'a **devstral + ToolCallingAgent** ile bir şans daha (kullanıcı seçimi).
Eski hataların kökü iki katmandı: zayıf model (qwen2.5-coder) + CodeAgent paradigması
(her adım Python bloğu → TSX'i Python'a sarma, find()==-1 dosya bozma).
`crew-devstral` branch'inde ikisi de değişti: CodeAgent→ToolCallingAgent (4 ajan),
yeni `replace_in_file` aracı (eşleşme 0 veya >1 ise dosyaya dokunmaz), KOD BLOĞU
kuralları → ARAÇ KURALLARI, model `ollama_chat/devstral` (yoksa qwen 32b'ye düşer).

**Pilot protokolü:** küçük, düşük riskli tek iş + baştan yazılı kriterler:
dosya bozma 0 · ≤2 iterasyon · 23 smoke yeşil · Tester onayı.
Geçerse hibrit (basit işler crew'da), geçmezse emeklilik kesin. Donanım: M5 Pro 48GB.
Gerekenler: kullanıcı Mac'te `ollama pull devstral`; pilot manager'dan koşulur.
Manager/Tester/bildirim altyapısı her durumda kalıyor (değerli ve deterministik).

## Çalışan Süreç Altyapısı

- **Manager** (chainlit run manager.py): sprint N · test · durum · log · kontrol · migrate · dev · durdur · bildirim. Canlı log akışı var.
- **Tester**: `crew/tests/api_smoke.py` — 23 deterministik test (izole DB :8788). Statik: 'use client', rota mount, CSS sözdizimi. Komut: `test`.
- **Bildirim**: ntfy `vasi-iko-7ca81627` (çıktı) / `vasi-iko-cmd-57f994b1` (telefondan komut) + iMessage ("Patron ... Bilgine.").
- **Ajan adım logları**: `crew/logs/` (denetim için; sohbete log yapıştırmak yerine buradan okunur).
- **Kurallar**: test, özellikle AYNI commit'te eklenir (önce eklenirse Tester onu bug sanır — yaşandı). Şema değişikliği = yeni migration, elle DB ALTER yasak. Her commit öncesi `git branch --show-current` (branch kayması 2 kez yaşandı).

## Ortam / Sırlar

`vasi-api/.dev.vars` (gitignore'lu): JWT_SECRET, RESEND_API_KEY (gerçek, test modu — yalnızca
hesap sahibinin adresine gönderir), EMAIL_FROM=`Vasi <onboarding@resend.dev>` (domain doğrulanana
dek zorunlu), APP_URL=http://localhost:3000. Lokal admin: test@vasi.app / Test1234! (is_admin=1).
Not: Resend key sohbete yapıştırıldı — canlıya çıkmadan rotate edilecek.

## Sıradaki İşler

1. Sprint 17 canlı testi: API restart → kendine mesaj zamanla → `run-due` → yeni tasarım e-posta → butondan `/m/[token]` aç
2. **Crew pilotu**: `ollama pull devstral` (kullanıcı) → `crew-devstral` branch'inde pilot iş seç → kriterlere göre değerlendir (üstteki bölüm)
3. Sprint 18 adayı: **İyzico sandbox** (kullanıcının merchant hesabı açması gerek) — /upgrade CTA'sı "Yakında" bekliyor
4. Diğer adaylar: Resend domain doğrulama, alıcı OTP doğrulaması (recipients.otp_* alanları hazır), canlıya çıkış (wrangler deploy + Pages)

## API Sözleşmesi (sık kullanılan)

- Auth: `POST /api/v1/auth/login` → `{accessToken, refreshToken}`; Bearer ile `apiFetch`/`adminFetch` (src/lib/api.ts)
- Mesaj: `POST /messages` `{title, message_type, content_text}` → satır (id'li); 403 LIMIT_REACHED; `POST /:id/recipients` `{full_name, email}`; `POST /:id/schedule` `{scheduled_at}` (ISO, gelecek zorunlu)
- `GET /me` → `{user, plan, usage}`
- Admin `/api/v1/admin/*`: login → `{accessToken}`; users (+status/plan PATCH); stats/overview·messages·plans; reports/users·revenue·failed-deliveries; settings GET/PUT; **delivery/run-due** → `{delivered, failed}`
- Public: `GET /api/v1/public/pricing` (admin↔landing fiyat senkronu); `GET /api/v1/public/view/:token` → mesaj içeriği (accessed_at damgalar)
- Teslimat: cron 08:00 UTC + run-due; e-posta şablonu `delivery.service.ts:buildDeliveryEmail` (açık tema, tablo tabanlı, içerik gömülmez — link taşır)

## Komutlar

```bash
pnpm dev:api / dev:web          # :8787 / :3000
pnpm db:migrate:local           # D1 şema
python3 crew/tests/api_smoke.py # testler (veya manager'da `test`)
git push origin main            # push HER ZAMAN kullanıcıdan
```
