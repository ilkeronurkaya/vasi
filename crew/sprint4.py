"""
Sprint 4 — Auth Akışı + Navigasyon Düzeltmeleri
=================================================
Kapsam:
  - Backend: Şifre doğrulama düzeltmesi (PBKDF2), seed güncelleme
  - Web: Token kaydetme/gönderme, route düzeltmeleri, navigasyon

Bağımlılık sırası: Backend → Web
"""

# ── Backend Görevi ────────────────────────────────────────────────────────────

task_backend_auth_fix = TaskSpec(
    role="Backend Ajani",
    description="""
vasi-api'daki auth servisini düzelt — şu an login çalışmıyor.

Önce mevcut durumu anla:
  read_file("vasi-api/CLAUDE.md")
  read_file("vasi-api/src/services/auth.service.ts")
  read_file("vasi-api/src/lib/otp.ts")
  read_file("migrations/0010_seed_dev.sql")

SORUN:
  auth.service.ts'te login şöyle:
    if (!user || user.password_hash !== password_hash) return error
  Web'den gelen şifre (örn: "test123") hash'lenmemiş plain text.
  D1'deki password_hash ise sahte bir string.
  Karşılaştırma her zaman başarısız → login çalışmıyor.

ÇÖZÜM — 3 dosya değişecek:

1. vasi-api/src/lib/password.ts — YENİ DOSYA — Web Crypto API ile PBKDF2:
   ```
   // Şifre hash'leme (kayıt sırasında)
   export async function hashPassword(password: string): Promise<string>
     → PBKDF2 ile hash, "pbkdf2:sha256:<iterations>:<saltHex>:<hashHex>" formatında döner

   // Şifre doğrulama (login sırasında)
   export async function verifyPassword(password: string, storedHash: string): Promise<boolean>
     → storedHash'i parse et, aynı salt ile hash'le, karşılaştır
   ```
   Web Crypto API kullan (node:crypto değil!):
   ```
   const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
   const derivedBits = await crypto.subtle.deriveBits(
     {{ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }},
     keyMaterial, 256
   )
   ```

2. vasi-api/src/services/auth.service.ts — GÜNCELLE:
   - register: password'ü artık hashPassword() ile hash'le, password_hash olarak kaydet
     (body'den artık password gelecek, password_hash değil)
   - login: verifyPassword(password, user.password_hash as string) ile doğrula
     (body'den artık password gelecek, password_hash değil)
   - Fonksiyon imzaları güncelle: userData'da password alanı, password_hash değil

3. migrations/0010_seed_dev.sql — GÜNCELLE:
   - Test şifresi "Test1234!" için gerçek PBKDF2 hash hesapla:
     Node.js ile: crypto.pbkdf2Sync("Test1234!", Buffer.from("devsalt01", "hex"), 100000, 32, "sha256")
   - Ya da seed'deki password_hash'i sabit bir test değeriyle güncelle
   - UYARI: Sadece -- migrate:up bölümünü yaz, migrate:down ekleme

   DAHA KOLAY ÇÖZÜM: Seed'i değiştirmek yerine seed'e yeni INSERT ekle:
   ```sql
   INSERT OR REPLACE INTO users (id, email, password_hash, ...)
   VALUES ('...', 'test@vasi.app', '<gerçek_hash>', ...)
   ```
   "Test1234!" şifresi için hash'i bash ile hesapla:
   bash("node -e \\"const c=require('crypto'); const s=Buffer.from('aabbccdd','hex'); const h=c.pbkdf2Sync('Test1234!',s,100000,32,'sha256'); console.log('pbkdf2:sha256:100000:aabbccdd:'+h.toString('hex'))\\"")

KURALLAR (CLAUDE.md'den):
- Env tipi: import type {{ Env }} from '../types'
- Service'te hata dönüşü: return {{ error: '...', status: 404 }} (virgül operatörü KULLANMA)
- any kullanma

Root dizin: {ROOT}
""",
)

# ── Web Görevi ────────────────────────────────────────────────────────────────

task_web_navigation_fix = TaskSpec(
    role="Web Ajani",
    description="""
vasi-web'deki navigasyon ve auth akışı sorunlarını düzelt.

Önce mevcut durumu anla:
  read_file("vasi-web/CLAUDE.md")
  read_file("vasi-web/src/lib/api.ts")
  read_file("vasi-web/src/app/(auth)/login/page.tsx")
  read_file("vasi-web/src/app/(dashboard)/layout.tsx")
  read_file("vasi-web/src/app/(dashboard)/page.tsx")

SORUNLAR VE ÇÖZÜMLER:

1. vasi-web/src/lib/api.ts — GÜNCELLE:
   - apiFetch localStorage'dan token okusun ve Authorization header'ı eklesin:
   ```
   export const apiFetch = async (url: string, options: RequestInit = {{}}) => {{
     const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
     const headers: HeadersInit = {{
       'Content-Type': 'application/json',
       ...(token ? {{ Authorization: `Bearer ${{token}}` }} : {{}}),
       ...(options.headers ?? {{}}),
     }}
     const response = await fetch(url, {{ ...options, headers }})
     if (!response.ok) {{
       const data = await response.json().catch(() => ({{}}))
       throw Object.assign(new Error(`API ${{response.status}}`), {{ status: response.status, data }})
     }}
     return response.json()
   }}
   ```

2. vasi-web/src/app/(auth)/login/page.tsx — GÜNCELLE:
   - Form body'sinde "password_hash" değil "password" gönder (backend artık password bekliyor)
   - Login başarılı olunca accessToken'ı localStorage'a kaydet:
     localStorage.setItem('authToken', data.accessToken)
   - Başarıda router.push('/') değil router.push('/dashboard') yap
     NOT: (dashboard) route group'u. Dashboard anasayfa /dashboard değil / olabilir.
     list_dir("vasi-web/src/app/(dashboard)") ile kontrol et, doğru URL'yi kullan.

3. vasi-web/src/app/(dashboard)/layout.tsx — GÜNCELLE:
   - Redirect'i "/auth/login" yerine "/login" yap (route group (auth) URL'ye eklenmez)
   - Sidebar linklerini düzelt:
     * Mesajlarım → href="/messages" DEĞİL, dashboard anasayfası — list_dir ile kontrol et
     * Yeni Mesaj → href="/messages/new"
     * Çıkış: href kullanma; onClick ile localStorage.removeItem('authToken') + router.push('/login')
   - <a href="..."> yerine next/link'ten <Link href="..."> kullan (tam sayfa yenileme olmaz)

4. vasi-web/src/app/(auth)/register/page.tsx — KONTROL ET:
   - Varsa aynı login düzeltmelerini uygula (password_hash → password, token kaydetme)

ZORUNLU KURALLAR (CLAUDE.md 4b-2):
- useState([]) KULLANMA — her zaman useState<Type[]>([])
- useState(null) KULLANMA — her zaman useState<Type | null>(null)
- Callback parametrelerine tip ver
- 'use client' her sayfada
- next/navigation kullan, next/router KULLANMA
- Dinamik route: useParams() hook ile

Root dizin: {ROOT}
""",
)

# ── Görev Listesi ─────────────────────────────────────────────────────────────
tasks = [task_backend_auth_fix, task_web_navigation_fix]


CLOSED = True  # sprint kapandı — tekrar koşturulamaz
