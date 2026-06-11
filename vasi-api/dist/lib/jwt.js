"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyToken = verifyToken;
// lib/jwt.ts
const encoder = new TextEncoder();
async function importHmacKey(secretHex) {
    const bytes = new Uint8Array(secretHex.length / 2);
    for (let i = 0; i < secretHex.length; i += 2)
        bytes[i / 2] = parseInt(secretHex.substr(i, 2), 16);
    return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function generateAccessToken(payload, secretHex) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))));
    const encodedPayload = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(payload))));
    const signature = await sign(`${encodedHeader}.${encodedPayload}`, secretHex);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}
async function generateRefreshToken(payload, secretHex) {
    payload.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
    return await generateAccessToken(payload, secretHex);
}
async function verifyToken(token, secretHex) {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = await sign(`${encodedHeader}.${encodedPayload}`, secretHex);
    if (signature !== expectedSignature)
        return null;
    const payload = JSON.parse(atob(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp)
        return null;
    return payload;
}
async function sign(data, secretHex) {
    const key = await importHmacKey(secretHex);
    const encodedData = encoder.encode(data);
    const hashBuffer = await crypto.subtle.sign('HMAC', key, encodedData);
    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}
