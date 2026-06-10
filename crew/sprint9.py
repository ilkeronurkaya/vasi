"""
Sprint 9 — Eksikleri Kapatma
=============================
Task 1: Plan limiti uygulaması (POST /messages → 403 LIMIT_REACHED)
Task 2: GET /messages/:id yanıtına alıcı listesi
Task 3: /messages liste sayfası (dashboard'daki kırık link)
Task 4: Wizard'da limit hatasını kullanıcı dostu göster

Kural: Görevler kısa — detay için dosya referansları.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Plan limiti
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Mesaj oluşturmada plan limitini uygula

### Dosya: `vasi-api/src/routes/messages.ts` (önce oku!)
Sadece `messages.post('/')` handler'ını güncelle. Validation'dan SONRA,
`MessageService.createMessage`'dan ÖNCE şu kontrolü ekle:

```ts
const planRow = await c.env.DB.prepare(
  `SELECT plan_type FROM subscriptions WHERE user_id = ? AND status = 'active'`
).bind(userId).first()
const plan = (planRow?.plan_type as string) ?? 'free'
const limit = plan === 'free' ? 10 : plan === 'personal' ? 100 : 1000
const countRow = await c.env.DB.prepare(
  `SELECT COUNT(*) AS n FROM messages WHERE user_id = ? AND status != 'cancelled'`
).bind(userId).first()
if (((countRow?.n as number) ?? 0) >= limit) {
  return c.json({ error: 'Mesaj limitine ulaştın', code: 'LIMIT_REACHED', limit }, 403)
}
```

Başka hiçbir handler'a dokunma.

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Detay yanıtına alıcılar
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: GET /messages/:id yanıtına alıcı listesini ekle

### Dosya: `vasi-api/src/services/message.service.ts` (önce oku!)
Sadece `getMessage` fonksiyonunu güncelle — mesajı bulduktan sonra:

```ts
const recipients = await env.DB.prepare(
  `SELECT id, full_name, email FROM recipients WHERE message_id = ?`
).bind(id).all()
return { ...message, recipients: recipients.results ?? [] }
```

Kolon adlarını doğrulamak için `migrations/0005_create_recipients.sql` oku.
Frontend zaten `data.recipients` bekliyor (`messages/[id]/page.tsx`) — şema buna uymalı.

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: /messages liste sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Mesaj listesi sayfası — /messages

### Yeni dosya: `vasi-web/src/app/(dashboard)/messages/page.tsx`
Dashboard'daki "Tümünü Gör" bu sayfaya gidiyor ama sayfa yok (404).

ÖNCE `vasi-web/src/app/(dashboard)/dashboard/page.tsx` dosyasını oku —
oradaki mesaj kartı stilini, STATUS_LABELS objesini ve apiFetch kalıbını AYNEN kullan.

### İçerik
1. İlk satır: `'use client';` — SİLME. Sonra importlar, sonra `export const runtime = 'edge'`.
2. Başlık: "Mesajlarım" + sağda "+ Yeni Mesaj" butonu (router.push('/messages/new')).
3. `apiFetch('/api/v1/messages')` → TÜM mesajları kart listesi olarak göster
   (dashboard'dakiyle aynı kart: başlık, `{recipient_count} alıcı · tarih`, status badge).
4. Kart tıklanınca `/messages/${id}`.
5. Boş durum: "Henüz mesaj yok" + "İlk Mesajını Oluştur" butonu.
6. Yüklenirken: "Yükleniyor..." (mist renk).

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Wizard'da limit hatası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Wizard'da LIMIT_REACHED hatasını kullanıcı dostu göster

### Dosya: `vasi-web/src/app/(dashboard)/messages/new/page.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA. Görünümü koru.
Sadece `handleSubmit` içindeki catch bloğunu güncelle:

```ts
catch (err: unknown) {
    const e = err as { data?: { error?: string; code?: string } };
    if (e?.data?.code === 'LIMIT_REACHED') {
        setSubmitError('Mesaj hakkın doldu. Daha fazla mesaj için Pro plana geçebilirsin.');
    } else {
        setSubmitError(e?.data?.error ?? 'Mesaj gönderilemedi. Tekrar deneyin.');
    }
    setLoading(false);
}
```

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),
]
