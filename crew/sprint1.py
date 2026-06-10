"""
Sprint 1 — Auth Sistemi
========================
Kapsam:
  - DB: Seed data + test verisi
  - Backend: Auth route'ları (register, login, verify-email, logout, refresh)
  - Web: Auth sayfaları (login, register, verify-email)

Bagimlilik sirasi: DB → Backend → Web
"""

# ── DB Görevi ────────────────────────────────────────────────────────────────

task_db_seed = TaskSpec(
    role="DB Ajani",
    description="""
Asagidaki islemleri yap:

1. migrations/ klasöründeki tüm SQL dosyalarini oku ve semayı anla.
   Bunun icin: list_dir("migrations") ve read_file("migrations/<dosya>") kullan.

2. migrations/0010_seed_dev.sql dosyasi olustur. Icerigi:
   - 2 test kullanicisi (biri ücretsiz, biri kisisel planli)
   - Her kullanici icin abonelik kaydi
   - 1 taslak mesaj (ücretsiz kullaniciya ait)
   - Tüm ID'ler UUID formatinda (örn: '550e8400-e29b-41d4-a716-446655440000')
   - Dosyanin basina -- Yalnizca local dev icin. Production'a uygulanmaz. notu ekle.

3. migrations/README.md dosyasini yeni migration'i (0010) icerecek sekilde güncelle.

Root dizin: {ROOT}
""",
)

# ── Backend Görevi ───────────────────────────────────────────────────────────

task_backend_auth = TaskSpec(
    role="Backend Ajani",
    description="""
vasi-api/src/ klasöründe auth sistemini yaz. CLAUDE.md kurallarına harfiyen uy.
Oncelikle: list_dir("vasi-api/src") ve read_file("vasi-api/CLAUDE.md") ile mevcut durumu anla.

Yazilacak dosyalar:

1. vasi-api/src/lib/crypto.ts — AES-256-GCM sifreleme/cözme (Web Crypto API)
2. vasi-api/src/lib/jwt.ts    — Access token (1 saat) ve refresh token (7 gün) (Web Crypto API, HMAC-SHA256)
3. vasi-api/src/lib/otp.ts    — 6 haneli OTP üretimi + SHA-256 hash
4. vasi-api/src/lib/uuid.ts   — crypto.randomUUID() wrapper

5. vasi-api/src/db/users.db.ts — D1 sorgulari:
   findByEmail, findById, create, updateEmailVerified

6. vasi-api/src/db/refresh-tokens.db.ts — D1 sorgulari:
   create, findByHash, revoke, revokeAllForUser

7. vasi-api/src/db/email-verifications.db.ts — D1 sorgulari:
   create, findActiveByUser, markUsed

8. vasi-api/src/services/auth.service.ts — Is mantigi:
   register, login, verifyEmail, logout, refresh

9. vasi-api/src/routes/auth.ts — Hono route'lari:
   POST /api/v1/auth/register
   POST /api/v1/auth/login
   POST /api/v1/auth/verify-email
   POST /api/v1/auth/logout
   POST /api/v1/auth/refresh

10. vasi-api/src/middleware/auth.ts — JWT dogrulama middleware'i

11. vasi-api/src/index.ts güncelle — auth route'unu ekle

E-posta gönderimleri icin su an console.log kullan.

Root dizin: {ROOT}
""",
)

# ── Web Görevi ───────────────────────────────────────────────────────────────

task_web_auth = TaskSpec(
    role="Web Ajani",
    description="""
vasi-web/src/app/ klasöründe auth sayfalarini yaz. CLAUDE.md kurallarına harfiyen uy.
Oncelikle: list_dir("vasi-web/src") ve read_file("vasi-web/CLAUDE.md") ile mevcut durumu anla.

ZORUNLU KURALLAR:
- Her sayfada: export const runtime = 'edge'
- Hicbir metin hardcode yazilmaz; tüm metinler LANGS objesinde (TR/EN/DE/FR/ES/AR)
- AR icin RTL destegi
- Marka renkleri: Obsidian #0C1525, Copper #D4763B, Cream #EDE9E0

Yazilacak dosyalar:

1. vasi-web/src/lib/api.ts — apiFetch fonksiyonu

2. vasi-web/src/app/(auth)/layout.tsx
   - Ortada logo, altinda form karti
   - Edge runtime

3. vasi-web/src/app/(auth)/login/page.tsx
   - E-posta + sifre formu
   - "Sifremi unuttum" linki
   - "Hesabin yok mu? Kayit ol" linki
   - POST /api/v1/auth/login cagrisi

4. vasi-web/src/app/(auth)/register/page.tsx
   - Ad, soyad, e-posta, sifre formu
   - Plan secimi (Ucretsiz / Kisisel 490TL/yil)
   - POST /api/v1/auth/register cagrisi

5. vasi-web/src/app/(auth)/verify-email/page.tsx
   - 6 haneli OTP giris ekrani
   - "Kodu tekrar gönder" butonu
   - POST /api/v1/auth/verify-email cagrisi

Root dizin: {ROOT}
""",
)

# ── Görev Listesi (sıra önemli) ──────────────────────────────────────────────
tasks = [task_db_seed, task_backend_auth, task_web_auth]
