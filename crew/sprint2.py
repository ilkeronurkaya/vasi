"""
Sprint 2 — Mesaj CRUD + Alıcı Yönetimi
========================================
Kapsam:
  - Backend: Mesaj oluşturma/listeleme/güncelleme/silme + alıcı ekleme/silme
  - Web: Dashboard, mesaj yazma sayfası, alıcı yönetimi

Bagimlilik sirasi: Backend → Web
Not: DB tabloları zaten mevcut (0003, 0004, 0005 migration'ları)
"""

# ── Backend Görevi ───────────────────────────────────────────────────────────

task_backend_messages = TaskSpec(
    role="Backend Ajani",
    description="""
vasi-api/src/ klasöründe mesaj ve alıcı yönetimi API'sini yaz.
Oncelikle mevcut durumu anla:
  list_dir("vasi-api/src")
  read_file("vasi-api/CLAUDE.md")
  read_file("vasi-api/src/index.ts")
  read_file("vasi-api/src/middleware/auth.ts")

Yazilacak dosyalar:

1. vasi-api/src/db/messages.db.ts — D1 sorguları:
   - findById(env, id, userId)          — sahiplik kontrolü dahil
   - findAllByUser(env, userId)         — kullanıcının tüm mesajları
   - create(env, userId, data)
   - update(env, id, userId, data)      — sadece draft/unlocked mesajlar
   - remove(env, id, userId)            — soft delete: status='cancelled'

2. vasi-api/src/db/recipients.db.ts — D1 sorguları:
   - findByMessage(env, messageId, userId)
   - create(env, messageId, data)
   - remove(env, id, messageId, userId)

3. vasi-api/src/services/message.service.ts — İş mantığı:
   - listMessages(env, userId)
   - getMessage(env, id, userId)
   - createMessage(env, userId, { title, message_type, content_text })
   - updateMessage(env, id, userId, data)
   - deleteMessage(env, id, userId)
   - addRecipient(env, messageId, userId, { full_name, email, phone? })
   - removeRecipient(env, recipientId, messageId, userId)

4. vasi-api/src/routes/messages.ts — Korumalı Hono route'ları:
   GET    /api/v1/messages              — kullanıcının mesaj listesi
   POST   /api/v1/messages              — yeni mesaj oluştur
   GET    /api/v1/messages/:id          — tek mesaj getir
   PUT    /api/v1/messages/:id          — mesaj güncelle
   DELETE /api/v1/messages/:id          — mesaj sil
   POST   /api/v1/messages/:id/recipients     — alıcı ekle
   DELETE /api/v1/messages/:id/recipients/:rid — alıcı sil

5. vasi-api/src/index.ts güncelle:
   - authMiddleware ekle (tüm /api/v1/ rotaları korumalı, /auth hariç)
   - messageRoutes ekle: app.route('/api/v1/messages', messageRoutes)

KURALLAR:
- userId her zaman JWT'den alınır, body'den değil (güvenlik)
- Şifreli alanlar (email, phone) env.ENCRYPTION_KEY ile encrypt/decrypt edilir
  vasi-api/src/lib/crypto.ts dosyasındaki encrypt/decrypt fonksiyonlarını kullan
- TypeScript strict — any kullanma

Root dizin: {ROOT}
""",
)

# ── Web Görevi ───────────────────────────────────────────────────────────────

task_web_dashboard = TaskSpec(
    role="Web Ajani",
    description="""
vasi-web/src/app/ klasöründe dashboard ve mesaj sayfalarını yaz.
Oncelikle mevcut durumu anla:
  list_dir("vasi-web/src")
  read_file("vasi-web/CLAUDE.md")
  read_file("vasi-web/src/lib/api.ts")
  read_file("vasi-web/src/app/(auth)/login/page.tsx")

ZORUNLU KURALLAR (CLAUDE.md'den):
- Her sayfada: 'use client' (useState kullananlar) + export const runtime = 'edge'
- Router için next/navigation kullan, next/router KULLANMA
- Hicbir metin hardcode yazilmaz; tüm metinler LANGS objesinde (TR/EN/DE/FR/ES/AR)
- AR icin RTL destegi
- Marka renkleri: Obsidian #0C1525, Copper #D4763B, Cream #EDE9E0

Yazilacak dosyalar:

1. vasi-web/src/app/(dashboard)/layout.tsx
   - Korumalı layout: token yoksa /login'e yönlendir
   - Sidebar: "Mesajlarım", "Yeni Mesaj", "Çıkış"
   - Edge runtime

2. vasi-web/src/app/(dashboard)/page.tsx — Dashboard ana sayfa
   - Mesaj listesi (GET /api/v1/messages)
   - Her mesaj için: başlık, durum badge'i (taslak/zamanlanmış/teslim edildi), alıcı sayısı
   - "Yeni Mesaj Yaz" butonu
   - Tüm metinler LANGS'de (6 dil)

3. vasi-web/src/app/(dashboard)/messages/new/page.tsx — Yeni mesaj
   - Başlık, metin alanı, mesaj türü seçimi (text/photo/audio/mixed)
   - "Kaydet (Taslak)" butonu → POST /api/v1/messages
   - Başarıda /dashboard/(mesaj detay) yönlendir
   - Tüm metinler LANGS'de (6 dil)

4. vasi-web/src/app/(dashboard)/messages/[id]/page.tsx — Mesaj detay
   - Mesaj içeriği göster
   - Alıcı listesi + "Alıcı Ekle" formu (ad, e-posta)
   - "Alıcı Sil" butonu
   - Mesaj durumu taslaksa "Düzenle" ve "Sil" butonları
   - Tüm metinler LANGS'de (6 dil)

Root dizin: {ROOT}
""",
)

# ── Görev Listesi ─────────────────────────────────────────────────────────────
tasks = [task_backend_messages, task_web_dashboard]
