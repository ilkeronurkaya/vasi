# Vasi — Sprint Yol Haritası

> Yaşayan backlog. Elle test turlarından (eski `ikotest.md`) çıkan istekler buraya sprintlere bölünür.
> Buglar ayrı `BUGS.md`'de tutulur; her test sonrası triage edilip ilgili sprinte **adım** olarak eklenir.
> **İlke (proje kuralı):** stabil + en az maliyet → iç/ucuz işler önce, dış hesap + tekrarlayan maliyet gerektirenler (SMS, OAuth) sona.
> Akış: iko + Claude sprint'i tasarlar (kapsam + kabul kriteri) → ayrı `SPRINT_NN_*.md` + `AGENT_PROMPT_SPRINT_NN.md` çıkar → yerel ajan (Qwen3.6-35B-A3B) kod yazar → iko+Claude bağımsız doğrular → iko commit/push.

## Durum (2026-06-14)
- **S1–S24 KAPALI.** S23 (hızlı kazanımlar) + S24 (hesap güvenliği & email OTP) push edildi (`sprint-23`, `sprint-24-account-otp`). Smoke 58/58.
- Uygulayıcı: **yerel Qwen3.6-35B-A3B** (LM Studio + OpenHands); S23 + S24 başarıyla koşuldu. Kurulum: `LOCAL_AGENT_SETUP.md`.
- **SIRADAKİ: S25** (i18n + ayrı admin hesabı). Tasarım: `SPRINT_25_I18N.md`.

## Planlanan sprintler

### S24 — Hesap güvenliği & OTP  ·  ✅ KAPANDI (2026-06-14)
Kaynak: ikotest #3, #4. Admin login 2 adım (OTP) + settings profil/email/şifre OTP. Migration yok; mevcut `email_verifications` + Resend. Smoke 58/58. Branch `sprint-24-account-otp`. Review'da phone tsc bug'ı + 2 ortam sorunu (B3/B4) yakalandı.

### S25 — Çok dillilik (i18n) + ayrı admin hesabı  ·  iç · orta · **SIRADAKİ**
Kaynak: ikotest #5, #6 + S24 carryover. Tasarım: `SPRINT_25_I18N.md`.
- **Part A:** Login/kayıt + Dashboard (shell + ana sayfa) i18n (TR+EN, `lib/i18n.ts`, localStorage `'lang'`); settings'te OTP'siz dil seçici. Kapsam dışı: mesaj sihirbazı/upgrade/admin (sonraki i18n turu).
- **Part B:** Ayrı gerçek admin hesabı `ilkeronurkaya@gmail.com` (migration `0017`, şifre `Test1234!`) — Resend OTP'yi gerçekten yollar; `test@vasi.app` admin kalır (smoke).

### S26 — Cookie onayı (KVKK/GDPR)  ·  iç · küçük
Kaynak: ikotest #7
- Ana sayfada cookie onay banner'ı; en iyi-pratik "maksimum" onay (kabul/ret/ayarla, kategoriler), Vasi tasarım diline uygun.
- Araştırma adımı: güncel KVKK/GDPR cookie onay gereksinimleri.
- Bağımsız, dış maliyet yok. (Küçükse S25 ile birleştirilebilir.)

### S27 — SMS gönderme  ·  dış · orta · *gerçek test askıda olabilir*
Kaynak: ikotest #2
- NetGSM ile SMS (kolonlar/env hazır). **Mock-mod** ile yaz; gerçek gönderim NetGSM hesabı + kredi gerektirir (İyzico gibi gerçek test askıya alınabilir).

### S28 — Google + Apple ile giriş (OAuth)  ·  dış · büyük · pahalı
Kaynak: ikotest #1
- Login + kayıta **Google + Apple**. Admin hariç (admin email+şifre+OTP, S24).
- Gerektirir: Google Cloud + Apple Developer hesabı, redirect URI, edge-uyumlu OAuth. En riskli/pahalı → **en sona**. Önce Google, sonra Apple (gerekirse iki sprite böl).

## Zamanlanmamış backlog
- Resend domain doğrulama → test modu kısıtını kaldırır → ardından API key rotate.
- Gerçek İyzico sandbox ödeme testi (merchant hesabı + gerçek key + `IYZICO_MODE=sandbox`).
- Canlıya çıkış: wrangler deploy + Cloudflare Pages.

## Sprint sırası özeti
S24 (OTP) → S25 (i18n) → S26 (cookie) → S27 (SMS) → S28 (OAuth). İç/ucuz önce, dış/pahalı sona.
