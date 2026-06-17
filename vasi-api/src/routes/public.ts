
import { Hono } from 'hono'
import type { Env } from '../types'
import { generateOTP, hashOTP } from '../lib/otp'
import { DeliveryService } from '../services/delivery.service'

// Herkese açık endpoint'ler — auth YOK (landing page + alıcı görüntüleme kullanır)
const pub = new Hono<{ Bindings: Env }>()

pub.get('/pricing', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT slug, name, price_monthly, message_limit, recipient_limit FROM plans WHERE is_active = 1 ORDER BY sort_order ASC`
  ).all()
  
  c.header('Cache-Control', 'public, max-age=30')
  return c.json({ plans: result.results })
})

// Token ile alıcı + mesaj kaydını getirir. otp_valid süre kontrolü SQL'de yapılır —
// SQLite datetime('now') çıktısını JS'te parse etmek timezone hatasına açık (run-due'da yaşandı).
async function findRecipientByToken(env: Env, token: string) {
  return await env.DB.prepare(`
    SELECT r.id AS recipient_id, r.full_name AS recipient_name, r.email AS recipient_email,
           r.otp_code, r.otp_attempts,
           CASE WHEN r.otp_expires_at IS NOT NULL AND r.otp_expires_at > datetime('now')
                THEN 1 ELSE 0 END AS otp_valid,
           m.title, m.content_text, m.delivered_at,
           u.first_name AS sender_name
    FROM recipients r
    JOIN messages m ON m.id = r.message_id
    JOIN users u ON u.id = m.user_id
    WHERE r.access_token = ?
  `).bind(token).first()
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return '***'
  return `${local.slice(0, 1)}***@${domain}`
}

const MAX_OTP_ATTEMPTS = 5

// Alıcı mesaj önizleme — e-postadaki linkin hedefi. İçerik DÖNMEZ; OTP doğrulaması gerekir.
pub.get('/view/:token', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Geçersiz bağlantı', code: 'NOT_FOUND' }, 404)
  }
  const row = await findRecipientByToken(c.env, token)
  if (!row) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }
  return c.json({
    title: row.title,
    sender_name: row.sender_name,
    recipient_name: row.recipient_name,
    delivered_at: row.delivered_at,
    otp_required: true,
  })
})

// Doğrulama kodu üret ve alıcının e-postasına gönder
pub.post('/view/:token/otp', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Geçersiz bağlantı', code: 'NOT_FOUND' }, 404)
  }
  const row = await findRecipientByToken(c.env, token)
  if (!row) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }

  const otp = generateOTP()
  const otpHash = await hashOTP(otp)
  // Yeni kod eski denemeleri geçersiz kılar — sayaç sıfırlanır
  await c.env.DB.prepare(
    "UPDATE recipients SET otp_code = ?, otp_expires_at = datetime('now', '+10 minutes'), otp_attempts = 0 WHERE id = ?"
  ).bind(otpHash, row.recipient_id).run()

  try {
    await DeliveryService.sendOtpEmail(
      c.env,
      { name: row.recipient_name as string, email: row.recipient_email as string },
      otp
    )
  } catch (error) {
    console.error('OTP e-postası gönderilemedi:', error)
    return c.json({ error: 'Doğrulama kodu e-postası gönderilemedi', code: 'EMAIL_SEND_FAILED' }, 502)
  }

  return c.json({
    message: 'Doğrulama kodu gönderildi',
    email_masked: maskEmail(row.recipient_email as string),
  })
})

// Kodu doğrula → mesaj içeriğini dön (tek kullanımlık; accessed_at damgalanır)
pub.post('/view/:token/verify', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Geçersiz bağlantı', code: 'NOT_FOUND' }, 404)
  }
  const row = await findRecipientByToken(c.env, token)
  if (!row) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }

  const body = await c.req.json().catch(() => ({}))
  const otp = String(body.otp ?? '')
  if (!/^\d{6}$/.test(otp)) {
    return c.json({ error: '6 haneli doğrulama kodu gerekli', code: 'VALIDATION_ERROR' }, 400)
  }
  if (!row.otp_code) {
    return c.json({ error: 'Önce doğrulama kodu isteyin', code: 'OTP_NOT_REQUESTED' }, 400)
  }
  const attempts = (row.otp_attempts as number) ?? 0
  if (attempts >= MAX_OTP_ATTEMPTS) {
    return c.json({ error: 'Çok fazla yanlış deneme. Yeni kod isteyin.', code: 'TOO_MANY_ATTEMPTS' }, 429)
  }
  if (!row.otp_valid) {
    return c.json({ error: 'Kodun süresi doldu. Yeni kod isteyin.', code: 'OTP_EXPIRED' }, 401)
  }

  const otpHash = await hashOTP(otp)
  if (otpHash !== row.otp_code) {
    await c.env.DB.prepare(
      'UPDATE recipients SET otp_attempts = otp_attempts + 1 WHERE id = ?'
    ).bind(row.recipient_id).run()
    const remaining = MAX_OTP_ATTEMPTS - attempts - 1
    return c.json({ error: 'Doğrulama kodu hatalı', code: 'INVALID_OTP', remaining_attempts: remaining }, 401)
  }

  // Başarılı: kod tek kullanımlık — temizle, erişimi damgala
  await c.env.DB.prepare(
    "UPDATE recipients SET otp_code = NULL, otp_expires_at = NULL, otp_attempts = 0, accessed_at = datetime('now') WHERE id = ?"
  ).bind(row.recipient_id).run()

  return c.json({
    title: row.title,
    content_text: row.content_text,
    sender_name: row.sender_name,
    recipient_name: row.recipient_name,
    delivered_at: row.delivered_at,
  })
})

export { pub as publicRoutes }
