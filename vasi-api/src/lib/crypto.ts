
// lib/crypto.ts
export async function encrypt(text: string, keyHex: string): Promise<string> {
  const key = await importKey(keyHex)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(text)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array([...iv, ...new Uint8Array(cipher)])
  return btoa(String.fromCharCode(...combined))
}

export async function decrypt(cipherB64: string, keyHex: string): Promise<string> {
  const key = await importKey(keyHex)
  const combined = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0))
  const iv = combined.slice(0, 12)
  const data = combined.slice(12)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return new TextDecoder().decode(plain)
}

async function importKey(keyHex: string): Promise<CryptoKey> {
  const keyBytes = hexToBytes(keyHex)
  return crypto.subtle.importKey('raw', keyBytes.buffer as ArrayBuffer, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}
