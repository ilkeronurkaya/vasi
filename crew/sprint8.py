"""
Sprint 8 — Gerçek Veri Entegrasyonu
====================================
Task 1: GET /api/v1/me endpoint'i (kullanıcı + plan + kullanım)
Task 2: Mesaj listesine recipient_count ekle
Task 3: Sidebar (layout.tsx) mock'larını /me'ye bağla
Task 4: Dashboard mock'larını gerçek veriye bağla

Kural: Görevler kısa tutuldu — detay için dosya referansları verildi.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: GET /api/v1/me
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: GET /api/v1/me endpoint'i

### Yeni dosya: `vasi-api/src/routes/me.ts`
Hono router. Önce `vasi-api/src/routes/messages.ts`'i oku, aynı kalıbı kullan.
`userId` auth middleware'den gelir: `c.get('userId')`.

Dönen JSON (tam bu şema):
```json
{
  "user": { "id": "...", "email": "...", "first_name": "...", "last_name": "..." },
  "plan": "free",
  "usage": { "messages_used": 3, "messages_limit": 10 }
}
```

### Kurallar
- user: `db/users.db.ts` içindeki `findById` ile çek. password_hash'i ASLA döndürme.
- plan: `subscriptions` tablosundan `SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'` — kayıt yoksa 'free'.
- messages_used: `SELECT COUNT(*) FROM messages WHERE user_id = ? AND status != 'cancelled'`
- messages_limit: plan 'free' → 10, 'personal' → 100, diğer → 1000.

### Kayıt: `vasi-api/src/index.ts`
```ts
app.use('/api/v1/me', authMiddleware)
app.route('/api/v1/me', meRoutes)
```

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Mesaj listesine recipient_count
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Mesaj listesi yanıtına recipient_count ekle

### Dosya: `vasi-api/src/db/messages.db.ts`
Sadece `findAllByUser` fonksiyonunu güncelle:
```sql
SELECT m.*, COUNT(r.id) AS recipient_count
FROM messages m
LEFT JOIN recipients r ON r.message_id = m.id
WHERE m.user_id = ?
GROUP BY m.id
ORDER BY m.created_at DESC
```
Başka hiçbir fonksiyona dokunma. Kolon adlarını doğrulamak için
`migrations/0005_create_recipients.sql` dosyasını oku.

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Sidebar gerçek veri
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Sidebar mock'larını /me endpoint'ine bağla

### Dosya: `vasi-web/src/app/(dashboard)/layout.tsx` (önce oku!)
Mevcut görünümü ve stilleri AYNEN koru. Sadece veri kaynağını değiştir:

1. Modül seviyesindeki mock'ları sil: `usedMessages`, `maxMessages`, `plan` sabitleri
   ve profildeki hardcode "İlker" / "ilker@vasi.app".
2. Component içinde state ekle:
```ts
const [me, setMe] = useState<Me | null>(null)
useEffect(() => { apiFetch('/api/v1/me').then(setMe).catch(() => {}) }, [])
```
   `apiFetch` import'u: `import { apiFetch } from '@/lib/api'`
3. /me yanıt şeması:
```json
{ "user": {"first_name": "...", "last_name": "...", "email": "..."},
  "plan": "free",
  "usage": {"messages_used": 3, "messages_limit": 10} }
```
4. Bağla: limit bar → usage, plan badge → plan, profil → first_name + email,
   avatar harfi → first_name[0]. `me` null iken bölümleri boş/sade göster, çökme.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Dashboard gerçek veri
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Dashboard'daki kalan mock'ları düzelt

### Dosya: `vasi-web/src/app/(dashboard)/dashboard/page.tsx` (önce oku!)
Görünümü ve stilleri AYNEN koru. Üç küçük değişiklik:

1. Başlıktaki hardcode "İlker" yerine /me'den first_name:
   `apiFetch('/api/v1/me')` → `t.page_title` içine ad ekle (LANGS yapısını boz ma,
   `page_title` fonksiyona çevrilebilir ya da template kullan).
2. Mesaj kartındaki `msg.recipient` alanı API'de YOK — kaldır. Yerine:
   `{msg.recipient_count ?? 0} alıcı · {new Date(msg.created_at).toLocaleDateString('tr-TR')}`
   MessageSummary tipini API gerçeğine göre güncelle:
   `{ id, title, status, created_at, recipient_count }`.
3. Tarih alanı `msg.date` kullanılıyorsa onu da `created_at`'e çevir.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),
]
