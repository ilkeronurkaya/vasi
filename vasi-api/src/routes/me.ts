
import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import { findById, findByEmail, updateProfile, updateEmail, updatePassword } from '../db/users.db'
import * as EmailVerificationsDB from '../db/email-verifications.db'
import { generateOTP, hashOTP } from '../lib/otp'
import { verifyPassword, hashPassword } from '../lib/password'
import { DeliveryService } from '../services/delivery.service'
import type { Env } from '../types'

const me = new Hono<{ Bindings: Env; Variables: { userId: string } }>()

me.use('*', authMiddleware)

me.get('/', async (c) => {
  const userId = c.get('userId')
  
  try {
    // Fetch user details
    const user = await findById(c.env, userId)
    if (!user) return c.json({ error: 'User not found' }, 404)
    
    // Fetch subscription plan type
    const planResult = await c.env.DB.prepare(`SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`).bind(userId).first()
    const planSlug = (planResult?.plan_type as string) ?? 'free'
    
    // Fetch plan details
    const plan = await c.env.DB.prepare(`SELECT * FROM plans WHERE slug = ?`).bind(planSlug).first()
    const messages_limit = (plan?.message_limit as number) ?? 10
    
    // Calculate messages used
    const messagesUsedResult = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM messages WHERE user_id = ? AND status != 'cancelled'`).bind(userId).first()
    const messages_used = (messagesUsedResult?.n as number) ?? 0
    
    // Return the response
    return c.json({
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, phone: user.phone },
      plan: planSlug,
      usage: { messages_used: messages_used, messages_limit: messages_limit }
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// ── Profile OTP: İstek (public) ──────────────────────────────────────────────
me.post('/profile/request-otp', async (c) => {
  const userId = c.get('userId')
  const user = await findById(c.env, userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const otp = generateOTP()
  const otpHash = await hashOTP(otp)
  await EmailVerificationsDB.create(c.env, userId, otpHash)

  try {
    await DeliveryService.sendOtpEmail(c.env, { name: (user.first_name as string) || '', email: user.email as string }, otp)
  } catch (error) {
    console.error('OTP e-postası gönderilemedi:', error)
  }
  console.log(`Profile OTP (${user.email}): ${otp}`)

  return c.json({ otpRequired: true }, 200)
})

// ── Profile: OTP ile güncelleme ──────────────────────────────────────────────
me.patch('/profile', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json() as Record<string, unknown>
  const { first_name, last_name, phone, email: newEmail, current_password, new_password, otp } = body

  // OTP doğrulama — zorunlu
  if (!otp || typeof otp !== 'string') {
    return c.json({ error: 'OTP zorunlu', code: 'VALIDATION_ERROR' }, 400)
  }

  const user = await findById(c.env, userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const verification = await EmailVerificationsDB.findActiveByUser(c.env, userId)
  if (!verification) {
    return c.json({ error: 'Geçersiz veya süresi dolmuş doğrulama kodu', code: 'INVALID_OTP' }, 401)
  }

  const otpHash = await hashOTP(otp)
  if (verification.code_hash !== otpHash) {
    return c.json({ error: 'Geçersiz doğrulama kodu', code: 'INVALID_OTP' }, 401)
  }

  // OTP kullanıldı işaretle
  await EmailVerificationsDB.markUsed(c.env, verification.id as string)

  // Profil alanları güncelle
  if (first_name !== undefined || last_name !== undefined || phone !== undefined) {
    await updateProfile(c.env, userId, {
      first_name: first_name as string | undefined,
      last_name: last_name as string | undefined,
      phone: phone as string | undefined,
    })
  }

  // E-posta değişikliği
  let emailVerificationRequired = false
  if (newEmail && typeof newEmail === 'string' && newEmail !== user.email) {
    const existing = await findByEmail(c.env, newEmail)
    if (existing) {
      return c.json({ error: 'E-posta zaten kayıtlı', code: 'EMAIL_TAKEN' }, 409)
    }
    await updateEmail(c.env, userId, newEmail)

    // Yeni e-postaya doğrulama OTP'si gönder
    const newOtp = generateOTP()
    const newOtpHash = await hashOTP(newOtp)
    await EmailVerificationsDB.create(c.env, userId, newOtpHash)
    try {
      await DeliveryService.sendOtpEmail(c.env, { name: (user.first_name as string) || '', email: newEmail }, newOtp)
    } catch (error) {
      console.error('Yeni e-posta OTP gönderilemedi:', error)
    }
    console.log(`Yeni e-posta OTP (${newEmail}): ${newOtp}`)
    emailVerificationRequired = true
  }

  // Şifre değişikliği
  if (new_password && typeof new_password === 'string') {
    if (!current_password || typeof current_password !== 'string') {
      return c.json({ error: 'Mevcut şifre zorunlu', code: 'VALIDATION_ERROR' }, 400)
    }
    const valid = await verifyPassword(current_password, user.password_hash as string)
    if (!valid) {
      return c.json({ error: 'Geçersiz mevcut şifre', code: 'INVALID_PASSWORD' }, 401)
    }
    if (new_password.length < 8) {
      return c.json({ error: 'Şifre en az 8 hane olmalı', code: 'VALIDATION_ERROR' }, 400)
    }
    const pwHash = await hashPassword(new_password)
    await updatePassword(c.env, userId, pwHash)
  }

  // Güncellenmiş kullanıcıyı döndür
  const updatedUser = await findById(c.env, userId)
  return c.json({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
    },
    emailVerificationRequired,
  }, 200)
})

export { me as meRoutes }
