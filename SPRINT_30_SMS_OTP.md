# SPRINT 30 — SMS OTP kanalı (B6d), mock-öncelikli

> Kaynak: ROADMAP S28 SMS parçası + BUGS **B6d**. iko kapsam onayı: "tüm OTP akışları SMS" → kavramsal düzeltmeyle netleştirildi (aşağıda).
> Uygulayıcı: yerel Qwen (OpenHands), KLONDA. Promt: `AGENT_PROMPT_SPRINT_30.md`. Doğrulama: Claude (tsc+lint+smoke).
> Numara notu: commit `sprint-29`=çerez onayıydı; bu sprint SMS-OTP → `sprint-30-sms-otp`. ROADMAP S29=OAuth ayrı kalır.

## Amaç
Şifre/profil değişimi ve admin girişi OTP'sini **e-posta yerine SMS** ile gönder. **Mock-öncelikli**: NetGSM hesabı/kredisi GEREKMEZ — dev/smoke'ta kod yalnız log'a yazılır, gerçek gönderim `SMS_MODE=live` ile açılır. Maliyet yok.

## Kanal kuralı (kavramsal tutarlılık)
iko "tüm OTP akışları SMS" dedi; ama **SMS bir e-posta adresinin sahipliğini kanıtlayamaz**. Bu yüzden OTP'ler *amacına* göre yönlendirilir:

| OTP amacı (`purpose`) | Nerede | Yeni kanal | Gerekçe |
|---|---|---|---|
| `admin_login` | admin girişi 2. adım | **SMS** (telefon yoksa e-posta) | kişiyi doğrular |
| `profile` | `/me/profile` OTP'si (şifre değişimi + profil düzenleme kapısı) | **SMS** (telefon yoksa e-posta) | kişiyi/işlemi yetkilendirir |
| `email_verify` (kayıt) | `/auth/verify-email` | **e-posta (değişmez)** | e-posta adresi sahipliğini kanıtlar |
| `email_verify` (e-posta değişimi onayı) | `/me/profile` içinde YENİ adrese gönderilen 2. OTP | **e-posta (değişmez)** | yeni e-posta sahipliğini kanıtlar |

**Sonuç:** "şifre değişimi + admin login + e-posta DEĞİŞİKLİĞİNİ yetkilendiren OTP" → SMS. E-posta *adresi doğrulama* OTP'leri (kayıt + yeni adres onayı) → e-postada kalır. Bu, iko'nun niyetini (kimlik/işlem OTP'leri SMS) karşılar, e-posta doğrulamasını kırmaz.

## Fallback
Kullanıcının telefonu **yoksa** (`users.phone` boş/null) OTP **e-posta ile** gider. Kimse kilitlenmez; mevcut e-posta yolu korunur.

## Mock / live anahtarı
- Yeni env: **`SMS_MODE`** (`'live'` | diğer/boş). Tanımsız/`'live'` değilse → **MOCK**.
- MOCK: `console.log("[SMS MOCK] <telefon>: <mesaj>")` — gerçek gönderim yok.
- LIVE: NetGSM HTTP API'sine `fetch` (edge-uyumlu). **Bu yol NetGSM hesabı gelince doğrulanacak — şimdilik test edilmedi.**
- `NETGSM_USER`/`NETGSM_PASS` zaten `types.ts`'te + `.dev.vars`'ta (placeholder). Mock, creds'e GÜVENMEZ — yalnız `SMS_MODE`'a bakar (güvenli).

## Dokunulan dosyalar (yalnız bunlar)
1. `vasi-api/src/types.ts` — `Env`'e `SMS_MODE?: string` ekle; `NETGSM_USER/PASS`'i opsiyonel yap.
2. `vasi-api/src/services/sms.service.ts` — **YENİ** `SmsService.sendOtp(env, phone, otp)` (mock+live).
3. `vasi-api/src/services/delivery.service.ts` — **YENİ** `DeliveryService.sendAuthOtp(env, user, otp)` (telefon→SMS, yoksa e-posta). `SmsService` import.
4. `vasi-api/src/routes/admin.ts` — admin login: `sendOtpEmail` → `sendAuthOtp`.
5. `vasi-api/src/routes/me.ts` — `/profile/request-otp`: `sendOtpEmail` → `sendAuthOtp`. (E-posta değişimi `email_verify` send'i **DEĞİŞMEZ**.)

**Migration YOK** (`purpose` + `phone` kolonları mevcut). **Frontend bu sprintte yok** (kanal sunucu tarafı; kullanıcı kopyası ayrı küçük adımda ele alınır — gerekirse).

## Kabul kriterleri
- [ ] `vasi-api` `tsc --noEmit` → 0 hata.
- [ ] `vasi-web` etkilenmez; `next lint` → 0 error (mevcut uyarılar hariç).
- [ ] Smoke → mevcut sayı korunur (admin login + profil OTP testleri yeşil; smoke OTP hash'i DB'ye yazdığı için kanaldan bağımsız).
- [ ] Telefonlu kullanıcı: admin login / profil OTP isteğinde log'da `[SMS MOCK] <telefon>: ...` görünür; e-posta gitmez.
- [ ] Telefonsuz kullanıcı: aynı isteklerde e-posta yolu (fallback) çalışır.
- [ ] Kayıt `/auth/verify-email` ve e-posta değişimi onayı hâlâ **e-posta** ile.
- [ ] `git diff` kapsam temiz: yalnız 5 dosya; yeni `any` yok; silinen çalışan kod yok.

## Backlog notu (bu sprint DIŞI)
- `users.phone` şu an **düz metin** kaydediliyor (vasi-api/CLAUDE.md "şifreli" diyor ama write'ta encrypt yok). Güvenlik açığı; ayrı sprintte ele al (migration + mevcut veri dönüşümü gerektirir).
- B6d gerçek SMS: NetGSM hesabı + kredi → `SMS_MODE=live` + canlı doğrulama.
