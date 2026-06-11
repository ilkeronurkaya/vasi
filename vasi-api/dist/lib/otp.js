"use strict";
// lib/otp.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.hashOTP = hashOTP;
// 6 haneli OTP üretimi
function generateOTP() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0] % 1000000).padStart(6, '0');
}
// Hash ile sakla — asla plain text
async function hashOTP(otp) {
    const encoded = new TextEncoder().encode(otp);
    const hash = await crypto.subtle.digest('SHA-256', encoded);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
}
