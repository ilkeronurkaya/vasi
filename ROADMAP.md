# Vasi — Sprint Yol Haritası

> Yaşayan backlog. Elle test turlarından (eski `ikotest.md`) çıkan istekler buraya sprintlere bölünür.
> Buglar ayrı `BUGS.md`'de tutulur; her test sonrası triage edilip ilgili sprinte **adım** olarak eklenir.
> **İlke (proje kuralı):** stabil + en az maliyet → iç/ucuz işler önce, dış hesap + tekrarlayan maliyet gerektirenler (SMS, OAuth) sona.
> Akış: iko + Claude sprint'i tasarlar (kapsam + kabul kriteri) → ayrı `SPRINT_NN_*.md` + `AGENT_PROMPT_SPRINT_NN.md` çıkar → yerel ajan (Qwen3.6-35B-A3B) kod yazar → iko+Claude bağımsız doğrular → iko commit/push.

## Durum (2026-06-19)
- **S1–S28 + çerez onayı KAPALI ve main'de** (`41e3fef`). Smoke 58/58. Uygulayıcı: yerel Qwen3.6-35B-A3B (LM Studio + OpenHands), klonda; Claude şef (git+push+doğrulama).
- **S30 SMS-OTP (B6d mock)** `sprint-30-sms-otp` dalında push'lu, tsc 0 + smoke 58/58 → **iko merge onayı bekliyor.**
- **SIRADAKİ: S31 — bug-fix sprinti** (aşağıda). iko kararı: bir sonraki sprint yalnız bug düzeltme.

## Planlanan sprintler

### S24 — Hesap güvenliği & OTP  ·  ✅ KAPANDI (2026-06-14)
Kaynak: ikotest #3, #4. Admin login 2 adım (OTP) + settings profil/email/şifre OTP. Migration yok; mevcut `email_verifications` + Resend. Smoke 58/58. Branch `sprint-24-account-otp`. Review'da phone tsc bug'ı + 2 ortam sorunu (B3/B4) yakalandı.

### S25 — Çok dillilik (i18n) + ayrı admin hesabı  ·  ✅ KAPANDI (2026-06-15)
Kaynak: ikotest #5, #6 + S24 carryover. Tasarım: `SPRINT_25_I18N.md`.
- **Part A:** Login/kayıt + Dashboard (shell + ana sayfa) i18n (TR+EN, `lib/i18n.ts`, localStorage `'lang'`); settings'te OTP'siz dil seçici. Kapsam dışı: mesaj sihirbazı/upgrade/admin (sonraki i18n turu).
- **Part B:** Ayrı gerçek admin hesabı `ilkeronurkaya@gmail.com` (migration `0017`, şifre `Test1234!`) — Resend OTP'yi gerçekten yollar; `test@vasi.app` admin kalır (smoke).

### S26 — i18n turu 2 (kalan kullanıcı sayfaları)  ·  ✅ KAPANDI (2026-06-16, `124587d`)
Kaynak: 06-15 elle test (#1–#4). S25 altyapısı (`lib/i18n.ts` + `t()`) üzerine; admin paneli HARİÇ (sonraya).
- **#1:** dashboard `STATUS_LABELS` (draft/scheduled/sent/delivered/failed) + "X alıcı · tarih" satırı.
- **#2:** `/messages` (mesaj listesi) tam.
- **#3:** `/messages/new` (sihirbaz) + `/messages/[id]` + `/messages/[id]/schedule`.
- **#4:** `settings` tam (profil/email/şifre başlık-açıklama-label-buton-loading; dil seçici S25'te çevrildi).
- Ekstra: `/upgrade`, `/verify-email`. Yeni anahtarlar `DICT`'e eklenir; saf frontend → smoke etkilenmez.

### S27 — Güvenlik + OTP & UX düzeltmeleri + lint temizliği  ·  iç · orta-büyük · **SIRADAKİ**
Kaynak: BUGS.md B5 (P0), B6 (a–c), B7, B8, B9, B2, B3 — 06-15 elle test turu. Tasarım: `SPRINT_27_SECURITY.md`; promt: `AGENT_PROMPT_SPRINT_27.md`. Hacimli → bug-bug/dosya-dosya, B3 ayrı turlar (context taşması dersi).
- **B5 (P0):** OTP kapsam açığı — `email_verifications`'a `purpose` kolonu (yeni migration) + `create`/`findActive` çağrılarını amaca göre kapsamla (admin_login / profile / email_verify). Cross-context OTP kabulünü kapat.
- **B6 a–c:** Şifre politikası — ≥8 + küçük/büyük/rakam, özel karakter YOK; kuralları şifre alanı yanında canlı kutuda göster + uygula; doğrulama OTP'den ÖNCE (client+server). **B6d (SMS OTP) → S28.**
- **B7/B8/B9 (+B2):** OTP alanı maskeleme (`*****`), "Teslimatları Şimdi Çalıştır" UI redesign, plan düzenleme alan label'ları, "Yeni Paket" 0-default temizliği.
- **B3:** kod tabanı geneli lint temizliği — `any`→tip, `<a>`→`<Link>`, `set-state-in-effect`→`useSyncExternalStore`/event kalıbı. Prod deploy'u (`next build`) açar. Kapsam net → yerel modele uygun ama hacimli; gerekirse ayrı tur.

### S28 — SMS (NetGSM) + şifre SMS-OTP + cookie onayı  ·  dış · orta
Kaynak: ikotest #2, B6d, ikotest #7 (cookie S27'den kaydı).
- NetGSM ile SMS (kolonlar/env hazır). **Mock-mod** ile yaz; gerçek gönderim NetGSM hesabı + kredi gerektirir (İyzico gibi gerçek test askıya alınabilir).
- **B6d:** şifre değişimi OTP'sini SMS kanalına taşı (kurallar sağlanınca SMS gönder).
- **Cookie onayı (KVKK/GDPR):** ana sayfada onay banner'ı (kabul/ret/ayarla, kategoriler), Vasi tasarım diline uygun. Araştırma adımı: güncel KVKK/GDPR cookie onay gereksinimleri.

### S29 — Google + Apple ile giriş (OAuth)  ·  dış · büyük · pahalı
Kaynak: ikotest #1
- Login + kayıta **Google + Apple**. Admin hariç (admin email+şifre+OTP, S24).
- Gerektirir: Google Cloud + Apple Developer hesabı, redirect URI, edge-uyumlu OAuth. En riskli/pahalı → **en sona**. Önce Google, sonra Apple (gerekirse iki sprite böl).

### S31 — Bug-fix sprinti  ·  **SIRADAKİ**  ·  iko kararı: sadece bug
Kaynak: 06-19 elle test. Tasarım+promt çıkacak (`SPRINT_31_*.md` + `AGENT_PROMPT_SPRINT_31.md`).
- **B13 (P1, kod):** çerez politikasını ayrı `/cerez-politikasi` route'tan **popup/modal**'a çevir; route'u kaldır. Saf frontend, yerel ajana uygun.
- **B12 (P0, çoğu dış):** e-posta yalnız hesap sahibine gidiyor — Resend TEST modu (`onboarding@resend.dev` + doğrulanmış domain yok). **iko:** Resend'de domain doğrula (DNS) → kod tarafı `EMAIL_FROM` env güncellemesi → key rotate. Kod kısmı küçük; asıl iş iko'nun DNS aksiyonu.
- (B6d gerçek SMS hâlâ NetGSM hesabı bekliyor — bu sprint değil.)

## Zamanlanmamış backlog
- Resend domain doğrulama → test modu kısıtını kaldırır → ardından API key rotate.
- Gerçek İyzico sandbox ödeme testi (merchant hesabı + gerçek key + `IYZICO_MODE=sandbox`).
- Canlıya çıkış: wrangler deploy + Cloudflare Pages.

## Sprint sırası özeti
S24 (OTP) → S25 (i18n) → S26 (i18n turu 2) → S27 (güvenlik+OTP+UX+lint) → S28 (SMS+SMS-OTP+cookie) → S29 (OAuth). İç/ucuz önce, dış/pahalı sona.
