"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.register = register;
exports.login = login;
exports.verifyEmail = verifyEmail;
exports.logout = logout;
exports.refresh = refresh;
const jwt_1 = require("../lib/jwt");
const otp_1 = require("../lib/otp");
const password_1 = require("../lib/password");
const UsersDB = __importStar(require("../db/users.db"));
const RefreshTokensDB = __importStar(require("../db/refresh-tokens.db"));
const EmailVerificationsDB = __importStar(require("../db/email-verifications.db"));
async function register(env, userData) {
    const { email, password, first_name, last_name, phone } = userData;
    const existingUser = await UsersDB.findByEmail(env, email);
    if (existingUser)
        return { error: 'E-posta zaten kayıtlı', code: 'EMAIL_ALREADY_REGISTERED', status: 409 };
    const password_hash = await (0, password_1.hashPassword)(password);
    const userId = await UsersDB.create(env, { email, password_hash, first_name, last_name, phone, status: 'active' });
    const otp = (0, otp_1.generateOTP)();
    const otpHash = await (0, otp_1.hashOTP)(otp);
    await EmailVerificationsDB.create(env, userId, otpHash);
    console.log(`E-posta doğrulama OTP'si: ${otp}`); // TODO: Resend ile gerçek e-posta gönderimi
    return { message: 'Kayıt başarılı. Lütfen e-postanızı kontrol edin ve doğrulayın.' };
}
async function login(env, email, password) {
    const user = await UsersDB.findByEmail(env, email);
    const valid = user ? await (0, password_1.verifyPassword)(password, user.password_hash) : false;
    if (!user || !valid)
        return { error: 'Geçersiz e-posta veya şifre', code: 'INVALID_CREDENTIALS', status: 401 };
    if (user.email_verified === 0)
        return { error: 'E-postanız doğrulanmamış', code: 'EMAIL_NOT_VERIFIED', status: 403 };
    const accessToken = await (0, jwt_1.generateAccessToken)({ userId: user.id, role: 'user' }, env.JWT_SECRET);
    const refreshToken = await (0, jwt_1.generateRefreshToken)({ userId: user.id, role: 'user' }, env.JWT_SECRET);
    await RefreshTokensDB.create(env, user.id, refreshToken);
    return { accessToken, refreshToken };
}
async function verifyEmail(env, email, otp) {
    const user = await UsersDB.findByEmail(env, email);
    if (!user)
        return { error: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND', status: 404 };
    const verification = await EmailVerificationsDB.findActiveByUser(env, user.id);
    if (!verification)
        return { error: 'Geçersiz veya kullanılmış doğrulama kodu', code: 'INVALID_OTP', status: 401 };
    const otpHash = await (0, otp_1.hashOTP)(otp);
    if (verification.token_hash !== otpHash)
        return { error: 'Geçersiz doğrulama kodu', code: 'INVALID_OTP', status: 401 };
    await UsersDB.updateEmailVerified(env, user.id);
    await EmailVerificationsDB.markUsed(env, verification.id);
    return { message: 'E-posta başarıyla doğrulandı.' };
}
async function logout(env, refreshToken) {
    const token = await RefreshTokensDB.findByHash(env, refreshToken);
    if (!token)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    await RefreshTokensDB.revoke(env, token.id);
    return { message: 'Çıkış başarılı.' };
}
async function refresh(env, refreshToken) {
    const token = await RefreshTokensDB.findByHash(env, refreshToken);
    if (!token)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    const payload = await (0, jwt_1.verifyToken)(refreshToken, env.JWT_SECRET);
    if (!payload)
        return { error: 'Geçersiz refresh token', code: 'INVALID_REFRESH_TOKEN', status: 401 };
    const accessToken = await (0, jwt_1.generateAccessToken)({ userId: payload.userId, role: payload.role }, env.JWT_SECRET);
    return { accessToken };
}
exports.AuthService = { register, login, verifyEmail, logout, refresh };
