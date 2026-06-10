import { generateAccessToken, generateRefreshToken, verifyToken } from '../lib/jwt';
import { generateOTP, hashOTP } from '../lib/otp';
import * as UsersDB from '../db/users.db';
import * as RefreshTokensDB from '../db/refresh-tokens.db';
import * as EmailVerificationsDB from '../db/email-verifications.db';
export async function register(env, userData) {
    const { email, password_hash, first_name, last_name, phone } = userData;
    const existingUser = await UsersDB.findByEmail(env, email);
    if (existingUser)
        return { error: 'E-posta zaten kayıtlı', code: 'EMAIL_ALREADY_REGISTERED', status: 409 };
    const userId = await UsersDB.create(env, { email, password_hash, first_name, last_name, phone, status: 'active' });
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    await EmailVerificationsDB.create(env, userId, otpHash);
    console.log(`E-posta doğrulama OTP'si: ${otp}`); // TODO: Resend ile gerçek e-posta gönderimi
    return { message: 'Kayıt başarılı. Lütfen e-postanızı kontrol edin ve doğrulayın.' };
}
export async function login(env, email, password_hash) {
    const user = await UsersDB.findByEmail(env, email);
    if (!user || user.password_hash !== password_hash)
        return { error: 'Geçersiz e-posta veya şifre', code: 'INVALID_CREDENTIALS', status: 401 };
    if (user.email_verified === 0)
        return { error: 'E-postanız doğrulanmamış', code: 'EMAIL_NOT_VERIFIED', status: 403 };
    const accessToken = await generateAccessToken({ userId: user.id, role: 'user' }, env.JWT_SECRET);
    const refreshToken = await generateRefreshToken({ userId: user.id, role: 'user' }, env.JWT_SECRET);
    await RefreshTokensDB.create(env, user.id, refreshToken);
    return { accessToken, refreshToken };
}
export async function verifyEmail(env, email, otp) {
    const user = await UsersDB.findByEmail(env, email);
    if (!user)
        return { error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND', status: 404 };
    const verification = await EmailVerificationsDB.findActiveByUser(env, user.id);
    if (!verification)
        return { error: 'Geçersiz veya kullanılmış doğrulama kodu', code: 'INVALID_OTP', status: 401 };
    const otpHash = await hashOTP(otp);
    if (verification.token_hash !== otpHash)
        return { error: 'Geçersiz doğrulama kodu', code: 'INVALID_OTP', status: 401 };
    await UsersDB.updateEmailVerified(env, user.id);
    await EmailVerificationsDB.markUsed(env, verification.id);
    return { message: 'E-posta başarıyla doğrulandı.' };
}
export async function logout(env, refreshToken) {
    const token = await RefreshTokensDB.findByHash(env, refreshToken);
    if (!token)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    await RefreshTokensDB.revoke(env, token.id);
    return { message: 'Çıkış başarılı.' };
}
export async function refresh(env, refreshToken) {
    const token = await RefreshTokensDB.findByHash(env, refreshToken);
    if (!token)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    const payload = await verifyToken(refreshToken, env.JWT_SECRET);
    if (!payload)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    const accessToken = await generateAccessToken({ userId: payload.userId, role: payload.role }, env.JWT_SECRET);
    return { accessToken };
}
export const AuthService = { register, login, verifyEmail, logout, refresh };
