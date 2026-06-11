"""
Sprint 17 — Teslimat Deneyimi
==============================
E-posta artık mesajın tamamını gömmek yerine güvenli görüntüleme linki taşır.

Crew görevleri (Backend Ajani):
  Task 1: Teslimatta alıcı başına access_token üret + e-postaya link
  Task 2: Public görüntüleme endpoint'i — GET /api/v1/public/view/:token

Claude görevleri (denetimde — crew'a verilmez):
  - E-posta HTML şablonu tasarımı (marka diline uygun)
  - /m/[token] public görüntüleme sayfası (vasi-web)
  - Smoke testler (özellikle birlikte eklenir)

⚠️ BU SPRINT KAPANDI — crew koşusu corruption'la sonuçlandı (find()==-1 bug'ı),
tüm görevler 2026-06-11 akşamı Claude tarafından uygulandı.
"""

CLOSED = True  # manager bu sprint'i koşturmayı reddeder

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Teslimatta access_token + linkli e-posta
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Teslimatta alıcı başına erişim token'ı üret

### A) `vasi-api/src/types.ts` (önce oku!)
Env interface'ine ekle: `APP_URL?: string`

### B) `vasi-api/src/services/delivery.service.ts` (önce oku!)
`deliverDueMessages` içindeki alıcı döngüsünü güncelle. Alıcı tipine `id` ekle:
```ts
const recipients = recipientsResult.results as Array<{ id: string; full_name: string; email: string }>;
```
Döngüde, sendEmail'den ÖNCE token üret ve kaydet:
```ts
const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
await env.DB.prepare(
  "UPDATE recipients SET access_token = ?, delivered_at = datetime('now') WHERE id = ?"
).bind(token, recipient.id).run();
const viewUrl = `${env.APP_URL ?? 'http://localhost:3000'}/m/${token}`;
```
sendEmail'e geçilen HTML'de mesaj içeriği paragrafının ALTINA buton ekle:
```ts
<a href="${viewUrl}" style="display:inline-block;background:#D4763B;color:#ffffff;
  padding:12px 28px;border-radius:12px;text-decoration:none;font-weight:600;
  margin-top:16px">Mesajını Görüntüle</a>
```
deliverDueMessages'ın sayaç mantığına ve diğer fonksiyonlara DOKUNMA.

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-17): teslimatta erişim token'ı + e-postada görüntüleme linki`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Public görüntüleme endpoint'i
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: GET /api/v1/public/view/:token — alıcı mesaj görüntüleme

### Dosya: `vasi-api/src/routes/public.ts` (önce oku!)
Mevcut /pricing endpoint'ine DOKUNMA. Altına ekle:

```ts
pub.get('/view/:token', async (c) => {
  const token = c.req.param('token')
  if (!token || token.length < 32) {
    return c.json({ error: 'Geçersiz bağlantı', code: 'NOT_FOUND' }, 404)
  }
  const row = await c.env.DB.prepare(`
    SELECT r.id AS recipient_id, r.full_name AS recipient_name,
           m.title, m.content_text, m.delivered_at,
           u.first_name AS sender_name
    FROM recipients r
    JOIN messages m ON m.id = r.message_id
    JOIN users u ON u.id = m.user_id
    WHERE r.access_token = ?
  `).bind(token).first()
  if (!row) {
    return c.json({ error: 'Mesaj bulunamadı', code: 'NOT_FOUND' }, 404)
  }
  await c.env.DB.prepare(
    "UPDATE recipients SET accessed_at = datetime('now') WHERE id = ?"
  ).bind(row.recipient_id).run()
  return c.json({
    title: row.title,
    content_text: row.content_text,
    sender_name: row.sender_name,
    recipient_name: row.recipient_name,
    delivered_at: row.delivered_at,
  })
})
```

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-17): public mesaj görüntüleme endpoint'i`
""",
    ),
]
