"""
Sprint 3 — Zamanlama + E-posta Teslimatı
=========================================
Kapsam:
  - Backend: Mesaj zamanlaması (trigger CRUD), Cloudflare Cron işleyicisi,
             Resend ile e-posta gönderimi
  - Web: Zamanlama ayarları sayfası (mesaja tarih/koşul bağlama)

Bağımlılık sırası: Backend → Web
Not: messages, recipients tabloları mevcut (Sprint 2)
"""

# ── Backend Görevi ────────────────────────────────────────────────────────────

task_backend_scheduling = TaskSpec(
    role="Backend Ajani",
    description="""
vasi-api/src/ klasöründe zamanlama ve e-posta teslimat sistemini yaz.
Önce mevcut durumu anla:
  list_dir("vasi-api/src")
  read_file("vasi-api/CLAUDE.md")
  read_file("vasi-api/src/types.ts")
  read_file("vasi-api/src/index.ts")
  read_file("vasi-api/src/db/messages.db.ts")

ÖNEMLI KURAL — Env tipi:
  import type {{ Env }} from '../types'   ← DOĞRU
  import type {{ Env }} from '../index'   ← YANLIŞ, index.ts Env export etmez

ÖNEMLI KURAL — Hono route generic:
  const routes = new Hono<{{ Bindings: Env; Variables: {{ userId: string }} }}>()
  ← Bindings generic OLMADAN c.env tipi 'unknown' olur, build patlar

ÖNEMLI KURAL — Service hata dönüşü:
  return {{ error: 'mesaj', code: 'KOD', status: 404 }}   ← DOĞRU
  return {{ error: 'mesaj' }}, 404                         ← YANLIŞ (virgül operatörü)

ÖNEMLI KURAL — Route'larda dinamik HTTP status:
  import type {{ ContentfulStatusCode }} from 'hono/utils/http-status'
  c.json(result, (result.status as number) as ContentfulStatusCode)

ÖNEMLI KURAL — Env secret adı:
  env.JWT_SECRET   ← DOĞRU
  env.SECRET_KEY   ← YANLIŞ

Yazılacak dosyalar:

1. vasi-api/src/db/triggers.db.ts — D1 sorguları:
   - findDueMessages(env: Env): mesajları döner (status='scheduled', scheduled_at <= now())
   - setTrigger(env: Env, messageId: string, scheduledAt: string): messages tablosunda
     scheduled_at ve status='scheduled' günceller
   - markDelivered(env: Env, messageId: string): status='delivered', delivered_at=now()
   - markFailed(env: Env, messageId: string, reason: string): status='failed'

2. vasi-api/src/services/delivery.service.ts — İş mantığı:
   - scheduleMessage(env: Env, messageId: string, userId: string, scheduledAt: string)
     → mesajın sahibini kontrol et, trigger kaydet, status='scheduled' yap
   - deliverDueMessages(env: Env)
     → findDueMessages → her mesaj için alıcıları çek → sendEmail → markDelivered/Failed
   - sendEmail(env: Env, to: {{name: string, email: string}}, subject: string, html: string)
     → Resend API: POST https://api.resend.com/emails
     → Header: Authorization: Bearer {{env.RESEND_API_KEY}}
     → from: "Vasi <noreply@vasi.app>"

3. vasi-api/src/routes/delivery.ts — Korumalı route'lar:
   POST /api/v1/messages/:id/schedule
     Body: {{ scheduled_at: "2030-01-01T08:00:00Z" }}
     → scheduleMessage çağır
     → 200: {{ message: 'Mesaj zamanlandı' }}

4. vasi-api/src/index.ts güncelle:
   - Cron handler ekle (scheduled event):
     export default {{
       fetch: app.fetch,
       scheduled: async (event, env, ctx) => {{
         ctx.waitUntil(DeliveryService.deliverDueMessages(env))
       }}
     }}
   - deliveryRoutes ekle: app.route('/api/v1/messages', deliveryRoutes)
     (mesaj ID'ye bağlı olduğu için /api/v1/messages prefix'i doğru)

KURALLAR:
- Resend API'ye istek atarken fetch() kullan (Node.js 'nodemailer' değil)
- E-posta şablonu Türkçe + İngilizce HTML (subject'te kullanıcı adı olsun)
- Tüm hata durumları loglanmalı (console.error)
- TypeScript strict — any kullanma

Root dizin: {ROOT}
""",
)

# ── Web Görevi ────────────────────────────────────────────────────────────────

task_web_scheduling = TaskSpec(
    role="Web Ajani",
    description="""
vasi-web/src/app/(dashboard)/messages/[id]/ altına zamanlama sayfası ekle.
Önce mevcut durumu anla:
  list_dir("vasi-web/src/app/(dashboard)/messages")
  read_file("vasi-web/CLAUDE.md")
  read_file("vasi-web/src/app/(dashboard)/messages/[id]/page.tsx")

ZORUNLU KURALLAR (CLAUDE.md bölüm 4b-2):
- useState([]) YASAK — her zaman açık tip:
    const [x, setX] = useState<Type[]>([])
    const [x, setX] = useState<Type | null>(null)
- Callback parametrelerine tip ver: async (id: string) => {{ ... }}

DİĞER ZORUNLU KURALLAR:
- 'use client' (useState/useEffect kullananlar)
- export const runtime = 'edge'
- next/navigation kullan, next/router KULLANMA
- Dinamik route: useParams() hook ile, props olarak değil
- Tüm metinler LANGS objesinde (TR/EN/DE/FR/ES/AR)

Yazılacak dosya:

vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx
  - Mesaj detaylarını çek (GET /api/v1/messages/:id)
  - Tarih/saat input'u (type="datetime-local")
  - "Zamanla" butonu → POST /api/v1/messages/:id/schedule
  - Başarıda mesaj detay sayfasına yönlendir
  - Mesaj zaten zamanlanmışsa mevcut tarihi göster
  - Tüm metinler LANGS'de (TR/EN/DE/FR/ES/AR dahil)
  - AR için RTL desteği

Ayrıca [id]/page.tsx'i güncelle:
  - "Zamanla" butonu ekle (status === 'draft' olan mesajlar için)
  - Butona tıklandığında /dashboard/messages/[id]/schedule sayfasına git

Root dizin: {ROOT}
""",
)

# ── Görev Listesi ─────────────────────────────────────────────────────────────
tasks = [task_backend_scheduling, task_web_scheduling]
