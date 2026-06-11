"""
Sprint 16 — E-posta Teslimatı Uçtan Uca (Resend)
=================================================
Tamamı Backend Ajani — Sprint 15 dersi: tam dosya yazan UX görevleri crew'a verilmez.
Ön koşul (kullanıcı): Resend hesabı + API key → vasi-api/.dev.vars içine:
  RESEND_API_KEY=re_xxx
  EMAIL_FROM=onboarding@resend.dev   (domain doğrulanana kadar bu adres zorunlu)

Task 1: EMAIL_FROM env değişkeni
Task 2: Geçmiş tarihe zamanlama engeli (400)
Task 3: Admin manuel teslimat tetikleyici + sonuç sayaçları
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: EMAIL_FROM
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Gönderen adresini env'den al (EMAIL_FROM)

### A) `vasi-api/src/types.ts` (önce oku!)
Env interface'ine ekle: `EMAIL_FROM?: string`

### B) `vasi-api/src/services/delivery.service.ts` (önce oku!)
`sendEmail` içindeki sabit `from: 'Vasi <noreply@vasi.app>'` satırını şununla değiştir:
```ts
from: env.EMAIL_FROM ?? 'Vasi <onboarding@resend.dev>',
```
(Resend, domain doğrulanana kadar yalnızca onboarding@resend.dev'den gönderime izin verir.)

Başka hiçbir şeye DOKUNMA.

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-16): EMAIL_FROM env değişkeni`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Geçmiş tarih engeli
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Geçmiş tarihe zamanlamayı engelle

### Dosya: `vasi-api/src/services/delivery.service.ts` (önce oku!)
`scheduleMessage` fonksiyonunda, mesaj bulunduktan SONRA, setTrigger'dan ÖNCE ekle:
```ts
if (new Date(scheduledAt).getTime() <= Date.now()) {
  return { error: 'Gönderim tarihi gelecekte olmalı', code: 'VALIDATION_ERROR', status: 400 };
}
```
Geçersiz tarih (NaN) de bu kontrole takılır (NaN <= Date.now() false döner —
o yüzden önce NaN kontrolü ekle):
```ts
const ts = new Date(scheduledAt).getTime();
if (Number.isNaN(ts) || ts <= Date.now()) { ...aynı hata... }
```

Başka hiçbir fonksiyona DOKUNMA.

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-16): geçmiş tarihe zamanlama engeli`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Manuel teslimat tetikleyici
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Admin manuel teslimat tetikleyici + sonuç sayaçları

### A) `vasi-api/src/services/delivery.service.ts` (önce oku!)
`deliverDueMessages` fonksiyonunu sayaç döndürecek şekilde güncelle —
imza: `static async deliverDueMessages(env: Env): Promise<{ delivered: number; failed: number }>`
- Döngünün başında `let delivered = 0, failed = 0`
- markDelivered çağrılan yerlerde `delivered++`, markFailed'da `failed++`
- Sonda `return { delivered, failed }`
Mevcut mantığı DEĞİŞTİRME, sadece sayaç ekle.

### B) `vasi-api/src/routes/admin.ts` (önce oku — dosya uzun, sadece sonuna ekleme yap!)
Dosyanın SONUNA ekle:
```ts
// ── Teslimat ──────────────────────────────────────────────────────────────────
admin.use('/delivery*', adminMiddleware)

// POST /admin/delivery/run-due — vadesi gelen mesajları hemen teslim et (test/manuel)
admin.post('/delivery/run-due', async (c) => {
  const result = await DeliveryService.deliverDueMessages(c.env)
  return c.json({ success: true, ...result })
})
```
Import ekle (dosyanın başındaki import bloğuna):
```ts
import { DeliveryService } from '../services/delivery.service'
```

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-16): admin manuel teslimat tetikleyici`
""",
    ),
]
