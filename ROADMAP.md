# Vasi — Sprint Yol Haritası

> Yaşayan backlog. Elle test turlarından (eski `ikotest.md`) çıkan istekler buraya sprintlere bölünür.
> Buglar ayrı `BUGS.md`'de tutulur; her test sonrası triage edilip ilgili sprinte **adım** olarak eklenir.
> **İlke (proje kuralı):** stabil + en az maliyet → iç/ucuz işler önce, dış hesap + tekrarlayan maliyet gerektirenler (SMS, OAuth) sona.
> Akış: iko + Claude sprint'i tasarlar (kapsam + kabul kriteri) → ayrı `SPRINT_NN_*.md` + `AGENT_PROMPT_SPRINT_NN.md` çıkar → yerel ajan (Qwen3.6-35B-A3B) kod yazar → iko+Claude bağımsız doğrular → iko commit/push.

## Durum (2026-06-14)
- **S1–S22 KAPALI.** **S23** (hızlı kazanımlar) kod hazır — commit/push bekliyor.
- Uygulayıcı: **yerel Qwen3.6-35B-A3B** (LM Studio + OpenHands); S23 pilotu geçti. Kurulum: `LOCAL_AGENT_SETUP.md`.

## Planlanan sprintler

### S24 — Hesap güvenliği & OTP  ·  iç · ucuz · **SIRADAKİ**
Kaynak: ikotest #3, #4
- Admin girişine **email OTP** doğrulama (admin yalnız email + şifre + OTP; OAuth yok).
- Settings'te **profil bilgisi düzenleme**; her değişiklikte email OTP.
- Altyapı: mevcut `email_verifications` + Resend → yeni dış maliyet yok.
- Bağımlılık: S23 admin login fix (`0016`) shiplenmiş olmalı.

### S25 — Çok dillilik (i18n)  ·  iç · orta
Kaynak: ikotest #5, #6
- **Login ekranı + Dashboard** çok dilli (landing zaten TR/EN/FR/ES; aynı çeviri kalıbı yayılır).
- Login sonrası **settings'ten dil tercihi** seçme + kalıcı.
- Tasarım kararı (sprint tasarımında): dil tercihi nerede saklanacak — `users` tablosuna kolon (migration) mı, yoksa client-side mı.
- Not: #6, #5'in i18n altyapısına bağlı → aynı sprint.

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
