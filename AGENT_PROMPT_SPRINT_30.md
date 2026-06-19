# AGENT PROMPT — SPRINT 30 (SMS OTP, mock-öncelikli)

> Uygulayıcı: yerel Qwen (OpenHands), KLONDA (`~/Projects/vasi-agent`). SADECE kod yaz. Git YOK, asıl repoya dokunma.
> **Her mini-task (MT) için YENİ konuşma aç** (context taşması). Sırayla: MT1 → MT2 → MT3.
> Önce `vasi-api/CLAUDE.md`'yi oku. Edge runtime: **yalnız `fetch` + Web Crypto** — `node:crypto`/`fs`/`http` YASAK. `any` kullanma. Sadece tarif edilen dosyalara dokun.

---

## MT1 — Env tipi + yeni SMS servisi

### 1a) `vasi-api/src/types.ts`
Şu bloğu BUL:
```ts
  RESEND_API_KEY: string
  EMAIL_FROM?: string
  APP_URL?: string
  NETGSM_USER: string
  NETGSM_PASS: string
```
ŞUNUNLA DEĞİŞTİR:
```ts
  RESEND_API_KEY: string
  EMAIL_FROM?: string
  APP_URL?: string
  NETGSM_USER?: string
  NETGSM_PASS?: string
  SMS_MODE?: string
```

### 1b) `vasi-api/src/services/sms.service.ts` (YENİ DOSYA)
Tam içerik:
```ts
// services/sms.service.ts
import type { Env } from '../types'

/**
 * SMS OTP gönderimi — MOCK-öncelikli.
 * SMS_MODE !== 'live' ise (varsayılan) gerçek gönderim YAPILMAZ; kod yalnız log'a yazılır (maliyet yok).
 * SMS_MODE === 'live' ise NetGSM HTTP API'sine fetch ile gider (edge-uyumlu).
 * NOT: live yolu NetGSM hesabı gelince doğrulanacak — şimdilik test edilmedi.
 */
export class SmsService {
  static async sendOtp(env: Env, phone: string, otp: string): Promise<void> {
    const message = `Vasi dogrulama kodun: ${otp} (10 dk gecerli)`

    if (env.SMS_MODE !== 'live') {
      console.log(`[SMS MOCK] ${phone}: ${message}`)
      return
    }

    if (!env.NETGSM_USER || !env.NETGSM_PASS) {
      throw new Error('SMS live modda NETGSM_USER/NETGSM_PASS zorunlu')
    }

    const params = new URLSearchParams({
      usercode: env.NETGSM_USER,
      password: env.NETGSM_PASS,
      gsmno: phone,
      message,
      msgheader: env.NETGSM_USER,
    })
    const response = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`)
    if (!response.ok) {
      const text = await response.text()
      console.error('SmsService.sendOtp hata:', text)
      throw new Error(`SMS gönderme başarısız: ${text}`)
    }
  }
}
```

**MT1 sonu.** (tsc bu noktada `sendAuthOtp` eksikliği nedeniyle hata vermez — sms.service henüz hiçbir yerden çağrılmıyor.)

---

## MT2 — DeliveryService.sendAuthOtp (kanal seçimi)

`vasi-api/src/services/delivery.service.ts`

### 2a) Import ekle
Şu satırı BUL (dosyanın en başı):
```ts
import type { Env } from '../types';
```
ŞUNUNLA DEĞİŞTİR:
```ts
import type { Env } from '../types';
import { SmsService } from './sms.service';
```

### 2b) Yeni metot ekle
Şu metodu BUL (olduğu gibi):
```ts
  static async sendOtpEmail(env: Env, to: { name: string; email: string }, otp: string) {
    return await this.sendEmail(
      env,
      to,
      'Vasi doğrulama kodun',
      buildOtpEmail({ recipientName: to.name, otp })
    );
  }
```
HEMEN ALTINA (aynı sınıf içinde) ŞUNU EKLE:
```ts

  /**
   * Kimlik/işlem OTP'si — telefon varsa SMS (mock-öncelikli), yoksa e-postaya düş.
   */
  static async sendAuthOtp(env: Env, user: { first_name?: string; email: string; phone?: string | null }, otp: string) {
    if (user.phone) {
      await SmsService.sendOtp(env, user.phone, otp)
      return
    }
    await this.sendOtpEmail(env, { name: user.first_name ?? '', email: user.email }, otp)
  }
```

**MT2 sonu.** `cd ~/Projects/vasi-agent/vasi-api && ./node_modules/.bin/tsc --noEmit` → 0 hata olmalı.

---

## MT3 — Route bağlama (admin login + profil OTP isteği)

### 3a) `vasi-api/src/routes/admin.ts` — admin login OTP gönderimi
Şu bloğu BUL:
```ts
  try {
    await DeliveryService.sendOtpEmail(c.env, { name: user.first_name as string, email: user.email }, otp)
  } catch (error) {
    console.error('OTP e-postası gönderilemedi:', error)
  }
  console.log(`Admin OTP (${user.email}): ${otp}`)
```
ŞUNUNLA DEĞİŞTİR:
```ts
  try {
    await DeliveryService.sendAuthOtp(c.env, { first_name: user.first_name as string, email: user.email as string, phone: (user.phone as string | null) ?? null }, otp)
  } catch (error) {
    console.error('OTP gönderilemedi:', error)
  }
  console.log(`Admin OTP (${user.email}): ${otp}`)
```

### 3b) `vasi-api/src/routes/me.ts` — profil OTP isteği
Şu bloğu BUL:
```ts
  try {
    await DeliveryService.sendOtpEmail(c.env, { name: (user.first_name as string) || '', email: user.email as string }, otp)
  } catch (error) {
    console.error('OTP e-postası gönderilemedi:', error)
  }
  console.log(`Profile OTP (${user.email}): ${otp}`)
```
ŞUNUNLA DEĞİŞTİR:
```ts
  try {
    await DeliveryService.sendAuthOtp(c.env, { first_name: (user.first_name as string) || '', email: user.email as string, phone: (user.phone as string | null) ?? null }, otp)
  } catch (error) {
    console.error('OTP gönderilemedi:', error)
  }
  console.log(`Profile OTP (${user.email}): ${otp}`)
```

> **DİKKAT:** `me.ts` içindeki E-POSTA DEĞİŞİKLİĞİ bloğundaki `sendOtpEmail` çağrısına (yeni e-postaya `email_verify` OTP'si) **DOKUNMA** — o e-postada kalmalı. Yalnız yukarıdaki `/profile/request-otp` bloğunu değiştir.

**MT3 sonu.** `cd ~/Projects/vasi-agent/vasi-api && ./node_modules/.bin/tsc --noEmit` → 0 hata.

---

## Bitiş kontrolü (ajan kendi yapar, Claude tekrar doğrular)
- `tsc --noEmit` (vasi-api) → 0 hata.
- Dokunulan dosyalar yalnız: `types.ts`, `sms.service.ts` (yeni), `delivery.service.ts`, `admin.ts`, `me.ts`.
- Yeni `any` yok; başka dosya değişmedi; `me.ts` e-posta değişimi bloğu olduğu gibi.
