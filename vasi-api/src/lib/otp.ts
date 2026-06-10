
// lib/otp.ts

// 6 haneli OTP üretimi
export function generateOTP(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1000000).padStart(6, '0')
}

// Hash ile sakla — asla plain text
export async function hashOTP(otp: string): Promise<string> {
  const encoded = new TextEncoder().encode(otp)
  const hash = await crypto.subtle.digest('SHA-256', encoded)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}
