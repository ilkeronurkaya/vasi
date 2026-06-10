
// Web Crypto API — global, import gerekmez
const encoder = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  return `pbkdf2:sha256:100000:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, hashFunction, iterationsStr, saltHex, hashHex] = storedHash.split(':');
  if (algorithm !== 'pbkdf2' || hashFunction !== 'sha256') throw new Error('Invalid hash format');
  const iterations = parseInt(iterationsStr, 10);
  const salt = Uint8Array.from((saltHex.match(/.{1,2}/g) ?? []).map((byte: string) => parseInt(byte, 16)));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const newHashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return newHashHex === hashHex;
}
