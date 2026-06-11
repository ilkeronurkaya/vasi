"""
Sprint 12 — E-posta Teslimi + Eksik Sayfa/Akışlar
===================================================
Task 1: deliverDueMessages — e-posta gönderimi (BACKEND kritik bug fix)
Task 2: /upgrade sayfası — plan karşılaştırma tablosu
Task 3: Zamanlanmış mesaj iptal/yeniden zamanlama
Task 4: messages/[id] — scheduled_at göster
Task 5: Dashboard delivered/failed statüs etiketleri

Çalışma kuralları:
- Her görev öncesi ilgili dosyayı OKU, sonra yaz.
- 'use client' direktifine DOKUNMA (mevcutsa).
- Veri mantığını (useEffect, handler'lar, servis katmanı) AYNEN koru; yalnızca görevde belirtilen yerleri değiştir.
- Her görev sonunda run_tsc() çalıştır; hata varsa düzelt, sonra commit at.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: deliverDueMessages — e-posta gönderimi (kritik backend bug)
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: DeliveryService.deliverDueMessages — alıcılara e-posta gönder

### Sorun
`vasi-api/src/services/delivery.service.ts` dosyasındaki `deliverDueMessages` metodu
mesajları `delivered` olarak işaretliyor ama `sendEmail` metodunu HİÇ çağırmıyor.
Cron (her gün 08:00 UTC) çalışıyor, DB güncelleniyor, alıcılara e-posta gitmiyor.

### Dosyalar (önce oku!)
1. `vasi-api/src/services/delivery.service.ts` — değiştirilecek dosya
2. `vasi-api/src/db/recipients.db.ts` — `findByMessage(env, messageId, userId)` fonksiyonu
3. `vasi-api/src/db/triggers.db.ts` — `findDueMessages` çıktısının yapısını anla
4. `vasi-api/src/types.ts` — Env tipi (RESEND_API_KEY, ENCRYPTION_KEY mevcut)

### Değişiklik: `deliverDueMessages` metodunu yeniden yaz

Mevcut:
```ts
static async deliverDueMessages(env: Env) {
  const dueMessages = await findDueMessages(env);
  for (const message of dueMessages.results) {
    const messageId = message.id as string;
    try {
      await markDelivered(env, messageId);
    } catch (error) {
      console.error('deliverDueMessages hata:', error);
      await markFailed(env, messageId, String(error));
    }
  }
}
```

Yeni (adım adım):
1. `findDueMessages` sonucundan her mesaj için:
   - `message.user_id` ile `findByMessage(env, messageId, userId)` çağır
   - Bu `recipients.db.ts` importunu ekle: `import { findByMessage } from '../db/recipients.db'`
   - Alıcı yoksa mesajı yine de `delivered` olarak işaretle (boş mesaj durumu)
2. Her alıcı için `sendEmail` çağır:
   - `to: { name: alici.full_name, email: alici.email }`
   - `subject: message.title as string`
   - `html`: aşağıdaki şablonu kullan (tek satır string olarak yaz):
     ```html
     <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
       <h2 style="color:#D4763B">Geleceğinizden bir mesaj</h2>
       <p style="font-size:16px;line-height:1.6;color:#333">${message.content_text ?? ''}</p>
       <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
       <p style="font-size:12px;color:#999">Bu mesaj Vasi aracılığıyla gönderilmiştir.</p>
     </div>
     ```
3. Tüm alıcılara gönderim tamamlandıktan sonra `markDelivered` çağır.
4. Herhangi bir hata olursa `markFailed` çağır ve hatayı logla.

### RESEND_API_KEY kontrolü
`sendEmail` metodunun başına ekle:
```ts
if (!env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY tanımlı değil');
}
```

### Import ekleme
Dosyanın üstüne şunu ekle:
```ts
import { findByMessage } from '../db/recipients.db';
```

### Doğrulama
`vasi-api` dizininde `npx tsc --noEmit` çalıştır, hata yoksa commit at.

Commit mesajı: `fix(delivery): deliverDueMessages artık alıcılara e-posta gönderiyor`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: /upgrade sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: /upgrade sayfası oluştur

### Oluşturulacak dosya
`vasi-web/src/app/(dashboard)/upgrade/page.tsx` (yeni dosya — yoksa oluştur)

### Gereksinimler
- `'use client'` direktifi en üstte ZORUNLU (useRouter kullanılacak)
- `export const runtime = 'edge'` ZORUNLU (ikinci satır)
- Mevcut planı `/api/v1/me`'den çek (`apiFetch` ile — `import { apiFetch } from '@/lib/api'`)
- Plan karşılaştırma tablosu: Free / Personal / Family (3 sütun)
- Mevcut plan sütununu `var(--copper)` border + "Mevcut Plan" badge'i ile vurgula
- CTA butonları: "Yükselt" (şimdilik disabled, `onClick` boş — İyzico sonraki sprintte)
- Geri butonu: `router.back()`

### Plan verileri (hardcode)
```ts
const PLANS = [
  {
    key: 'free',
    name: 'Ücretsiz',
    price: '₺0',
    period: '/ay',
    features: ['10 mesaj', 'E-posta teslimi', '—', '—'],
  },
  {
    key: 'personal',
    name: 'Kişisel',
    price: '₺49',
    period: '/ay',
    features: ['100 mesaj', 'E-posta teslimi', 'Öncelikli destek', '—'],
  },
  {
    key: 'family',
    name: 'Aile',
    price: '₺99',
    period: '/ay',
    features: ['Sınırsız mesaj', 'E-posta teslimi', 'Öncelikli destek', '5 kullanıcı'],
  },
];
```

### Tasarım (Apple v2 token'ları kullan)
- Sayfa maxWidth: 640px
- Başlık h1: fontSize 22px, fontWeight 700, letterSpacing '-0.01em', color var(--cream)
- Plan kartları: `background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '24px'`
- Mevcut plan kartı extra border: `border: '2px solid var(--copper)'`
- "Mevcut Plan" badge: `background: 'var(--copper)', color: 'var(--obsidian)', fontSize: '11px', fontWeight: 700, borderRadius: '6px', padding: '2px 8px'`
- Fiyat: fontSize 28px, fontWeight 700, color var(--cream)
- Özellik listesi: fontSize 14px, color var(--mist), lineHeight 2
- CTA buton: `className="btn btn-primary"` style `width: '100%', marginTop: '16px', opacity: currentPlan === plan.key ? 0.5 : 1`
- disabled: `currentPlan === plan.key`
- Yükleniyor durumu: mevcut diğer sayfalarla aynı pattern (`color: var(--mist), fontSize: 14px`)

### Doğrulama
`vasi-web` dizininde `npx tsc --noEmit` çalıştır, hata yoksa commit at.

Commit mesajı: `feat(upgrade): plan karşılaştırma sayfası eklendi`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Zamanlanmış mesaj iptal / yeniden zamanlama
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: messages/[id] — zamanlanmış mesaj iptal ve yeniden zamanlama

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx` (önce oku!)
`'use client'` direktifine DOKUNMA. Mevcut tüm handler'lara (addRecipient, deleteRecipient, deleteMessage) DOKUNMA.

### API bilgisi
- Mesaj güncelleme: `PUT /api/v1/messages/:id`
- Body: `{ status: 'draft' }` — mesajı iptal etmek için (scheduled → draft geri alır)
- Mevcut `apiFetch` ile çağrılır.

### A) Tip ve state eklemeleri
`Message` tipine `scheduled_at?: string` ekle:
```ts
type Message = { id: string; title: string; content_text?: string; content?: string; status: string; scheduled_at?: string };
```

### B) `handleCancelSchedule` handler'ı ekle
```ts
const handleCancelSchedule = async () => {
    if (!confirm('Zamanlamayı iptal etmek istediğinize emin misiniz?')) return;
    try {
        await apiFetch(`/api/v1/messages/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'draft' }),
        });
        setMessage(prev => prev ? { ...prev, status: 'draft', scheduled_at: undefined } : null);
    } catch (err) {
        console.error(err);
    }
};
```

### C) Butonları güncelle
Mevcut header butonlarını bul (Zamanla + Sil). `draft` durumu için zaten "Zamanla" butonu var.
`scheduled` durumu için "İptal Et" ve "Yeniden Zamanla" butonları ekle:

```tsx
{message.status === 'scheduled' && (
    <>
        <button
            onClick={handleCancelSchedule}
            style={{
                background: 'none',
                border: '1px solid var(--mist)',
                color: 'var(--mist)',
                borderRadius: 'var(--radius-input)',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
            }}
        >
            İptal Et
        </button>
        <button
            onClick={() => router.push(`/messages/${params.id}/schedule`)}
            className="btn btn-primary"
        >
            Yeniden Zamanla
        </button>
    </>
)}
```

Bu blok, mevcut `{message.status === 'draft' && (...)}` bloğundan SONRA yer almalı, Sil butonundan ÖNCE.

### Doğrulama
`vasi-web` dizininde `npx tsc --noEmit` çalıştır, hata yoksa commit at.

Commit mesajı: `feat(messages): zamanlanmış mesaj iptal ve yeniden zamanlama eklendi`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: messages/[id] — scheduled_at göster
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: messages/[id] — "Gönderilecek: [tarih]" bilgisini göster

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx` (önce oku!)
Task 3 bu dosyayı zaten değiştirdi — güncel halini oku.

### Değişiklik: İçerik kartına scheduled_at satırı ekle
Mevcut "İçerik" kartında (`MESAJ İÇERİĞİ` section label'ının bulunduğu div) content_text'in altına:

```tsx
{message.status === 'scheduled' && message.scheduled_at && (
    <p style={{
        marginTop: '12px',
        fontSize: '13px',
        color: 'var(--copper)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    }}>
        <span>⏰</span>
        <span>
            Gönderilecek:{' '}
            {new Date(message.scheduled_at).toLocaleString('tr-TR', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })}
        </span>
    </p>
)}
```

### Doğrulama
`vasi-web` dizininde `npx tsc --noEmit` çalıştır, hata yoksa commit at.

Commit mesajı: `feat(messages): zamanlanma tarihi detay sayfasında gösteriliyor`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 5: Dashboard delivered/failed statüs etiketleri
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Dashboard ve messages listesinde delivered/failed statüs etiketleri

### Dosyalar (her ikisini de önce oku!)
1. `vasi-web/src/app/(dashboard)/dashboard/page.tsx`
2. `vasi-web/src/app/(dashboard)/messages/page.tsx`

### A) dashboard/page.tsx

Bu dosyada `STATUS_LABELS` objesi veya statüs renk mantığı ara.
`STATUS_LABELS`'a `delivered` ve `failed` ekle:

Mevcut pattern'i bul (draft/scheduled/sent gibi) ve genişlet:
```ts
const STATUS_LABELS: Record<string, string> = {
    draft: 'Taslak',
    scheduled: 'Zamanlandı',
    sent: 'Gönderildi',
    delivered: 'Teslim Edildi',
    failed: 'Başarısız',
};
```

Renk mantığında da `delivered` ve `failed` ekle (mevcut `statusColor` veya benzeri değişkeni bul):
- `delivered`: `'#4ade80'` (yeşil — sent ile aynı)
- `failed`: `'#ef4444'` (kırmızı)

### B) messages/page.tsx

Aynı değişiklikleri bu dosyada da uygula:
- `STATUS_LABELS`'a `delivered` ve `failed` ekle
- Renk mantığında aynı renkler: delivered → `'#4ade80'`, failed → `'#ef4444'`

### Doğrulama
`vasi-web` dizininde `npx tsc --noEmit` çalıştır, hata yoksa commit at.

Commit mesajı: `feat(dashboard): delivered/failed statüs etiketleri eklendi`
""",
    ),
]


CLOSED = True  # sprint kapandı — tekrar koşturulamaz
