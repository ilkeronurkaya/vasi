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
