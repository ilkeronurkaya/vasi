import type { Env } from '../types'
import { generateAccessToken, generateRefreshToken, verifyToken } from '../lib/jwt'
import { generateOTP, hashOTP } from '../lib/otp'
import { hashPassword, verifyPassword } from '../lib/password'
import * as UsersDB from '../db/users.db'
import * as RefreshTokensDB from '../db/refresh-tokens.db'
import * as EmailVerificationsDB from '../db/email-verifications.db'

type ServiceResult = Record<string, unknown>

export async function register(env: Env, userData: Record<string, string>): Promise<ServiceResult> {
  const { email, password, first_name, last_name, phone } = userData
  const existingUser = await UsersDB.findByEmail(env, email)
  if (existingUser) return { error: 'E-posta zaten kayıtlı', code: 'EMAIL_ALREADY_REGISTERED', status: 409 }

  const password_hash = await hashPassword(password)
  const userId = await UsersDB.create(env, { email, password_hash, first_name, last_name, phone, status: 'active' })
  const otp = generateOTP()
  const otpHash = await hashOTP(otp)
  await EmailVerificationsDB.create(env, userId as string, otpHash)

  console.log(`E-posta doğrulama OTP'si: ${otp}`) // TODO: Resend ile gerçek e-posta gönderimi

  return { message: 'Kayıt başarılı. Lütfen e-postanızı kontrol edin ve doğrulayın.' }
}

export async function login(env: Env, email: string, password: string): Promise<ServiceResult> {
  const user = await UsersDB.findByEmail(env, email) as Record<string, unknown> | null
  const valid = user ? await verifyPassword(password, user.password_hash as string) : false
  if (!user || !valid) return { error: 'Geçersiz e-posta veya şifre', code: 'INVALID_CREDENTIALS', status: 401 }
  if (user.email_verified === 0) return { error: 'E-postanız doğrulanmamış', code: 'EMAIL_NOT_VERIFIED', status: 403 }

  const accessToken = await generateAccessToken({ userId: user.id as string, role: 'user' }, env.JWT_SECRET)
  const refreshToken = await generateRefreshToken({ userId: user.id as string, role: 'user' }, env.JWT_SECRET)

  await RefreshTokensDB.create(env, user.id as string, refreshToken)

  return { accessToken, refreshToken }
}

export async function verifyEmail(env: Env, email: string, otp: string): Promise<ServiceResult> {
  const user = await UsersDB.findByEmail(env, email) as Record<string, unknown> | null
  if (!user) return { error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND', status: 404 }

  const verification = await EmailVerificationsDB.findActiveByUser(env, user.id as string) as Record<string, unknown> | null
  if (!verification) return { error: 'Geçersiz veya kullanılmış doğrulama kodu', code: 'INVALID_OTP', status: 401 }

  const otpHash = await hashOTP(otp)
  if (verification.token_hash !== otpHash) return { error: 'Geçersiz doğrulama kodu', code: 'INVALID_OTP', status: 401 }

  await UsersDB.updateEmailVerified(env, user.id as string)
  await EmailVerificationsDB.markUsed(env, verification.id as string)

  return { message: 'E-posta başarıyla doğrulandı.' }
}

export async function logout(env: Env, refreshToken: string): Promise<ServiceResult> {
  const token = await RefreshTokensDB.findByHash(env, refreshToken) as Record<string, unknown> | null
  if (!token) return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 }

  await RefreshTokensDB.revoke(env, token.id as string)
  return { message: 'Çıkış başarılı.' }
}

export async function refresh(env: Env, refreshToken: string): Promise<ServiceResult> {
  const token = await RefreshTokensDB.findByHash(env, refreshToken) as Record<string, unknown> | null
  if (!token) return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 }

  const payload = await verifyToken(refreshToken, env.JWT_SECRET) as Record<string, string> | null
  if (!payload) return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 }

  const accessToken = await generateAccessToken({ userId: payload.userId, role: payload.role }, env.JWT_SECRET)
  return { accessToken }
}

export const AuthService = { register, login, verifyEmail, logout, refresh }
