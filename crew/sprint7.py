"""
Sprint 7 — Dashboard UX Yenileme
=================================
3 görev, sıralı çalışır.

Task 1: Sidebar — kullanıcı profili, limit progress bar, abonelik badge
Task 2: Dashboard ana sayfa — istatistik kartları, mesaj listesi yenileme
Task 3: Wizard flow — /messages/new → 5 adımlı mesaj oluşturma sihirbazı
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Sidebar geliştirme
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Sidebar — Limit Göstergesi + Abonelik Durumu

### Dosya
`vasi-web/src/app/(dashboard)/layout.tsx` — mevcut sidebar layout'unu güncelle.
Yoksa oluştur.

### Mevcut Sidebar Yapısı
Sidebar genellikle şunları içerir: logo, navigasyon linkleri.
Eklenecekler: kullanıcı profili bölümü (alt kısım), limit progress bar, abonelik badge.

### Eklenecek 1: Limit Göstergesi (Progress Bar)
Sidebar'ın alt bölümüne ekle. Tasarım:
```
Mesaj Hakkı
[██████░░░░] 6 / 10
```
- Şu anlık mock data kullan: `const usedMessages = 6; const maxMessages = 10;`
- Progress bar: copper renk, horizon arka plan
- "Hakkın dolmak üzere" uyarısı: %80+ dolunca copper renkte göster
- Style:
  - Container: padding 16px, border-top: 1px solid var(--horizon)
  - Label: var(--mist), 12px
  - Bar: height 6px, borderRadius 3px, background var(--horizon)
  - Fill: background var(--copper), transition width 0.3s ease

### Eklenecek 2: Abonelik Badge
Progress bar'ın altına ekle:
- **Free plan**: gri badge (`background: var(--horizon), color: var(--mist)`)
  + "Pro'ya Geç" butonu (btn btn-primary btn-sm, tam genişlik)
- **Pro plan**: copper badge + "Pro ✓"
- Şu anlık mock: `const plan = 'free';`
- "Pro'ya Geç" butonu onClick: `router.push('/upgrade')` (sayfayı şimdilik oluşturma)

### Eklenecek 3: Kullanıcı Profili (Sidebar alt kısım, en alta)
- Avatar daire: kullanıcı adının baş harfi, copper arka plan, obsidian metin
- Kullanıcı adı (mock: "İlker") + e-posta (mock: "ilker@vasi.app")
- Çıkış yap butonu: sağda, `→` ikonu veya "Çıkış" metni
- onClick çıkış: localStorage.removeItem('authToken') + router.push('/login')

### Teknik
- 'use client' direktifi
- useRouter import
- export const runtime = 'edge'
- Tüm renkler CSS değişkeni ile (var(--copper), var(--midnight) vb.)
- Tailwind custom renk class'ı KULLANMA (bg-Copper vb. çalışmıyor)

### Doğrulama
Bitince check_css() ile ihlal kontrolü yap. Temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Dashboard ana sayfa yenileme
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Dashboard Ana Sayfa — İstatistik + Mesaj Listesi

### Dosya
`vasi-web/src/app/(dashboard)/dashboard/page.tsx` — tamamen yeniden yaz.

### Sayfa Yapısı (yukarıdan aşağı)

#### 1. Sayfa Başlığı
```
Merhaba, İlker 👋          [+ Yeni Mesaj]
Bugün ne bırakmak istiyorsun?
```
- Başlık: var(--cream), 24px, font-weight 600
- Alt metin: var(--mist), 14px
- "Yeni Mesaj" butonu: btn btn-primary, sağ tarafa yaslanmış, router.push('/messages/new')

#### 2. İstatistik Kartları (3 kart, yan yana)
```
[📝 Toplam]    [📅 Zamanlanmış]    [✅ Gönderildi]
    8               3                   5
```
- Her kart: midnight bg, horizon border, borderRadius 12px, padding 20px
- Sayı: var(--cream), 32px, font-weight 700
- Label: var(--mist), 12px, uppercase, letter-spacing 0.05em
- Mock data: `const stats = { total: 8, scheduled: 3, sent: 5 }`
- Responsive: 3 sütun masaüstü, 1 sütun mobile (CSS grid)

#### 3. Mesaj Listesi Başlığı
```
Son Mesajlar                          [Tümünü Gör →]
```
- "Tümünü Gör" linki: var(--copper), router.push('/messages')

#### 4. Mesaj Kartları (mock list, 3 item)
Mock data:
```ts
const mockMessages = [
  { id: '1', title: 'Anneme mektup', status: 'scheduled', date: '2035-06-15', recipient: 'anne@gmail.com' },
  { id: '2', title: 'Oğluma tavsiyeler', status: 'draft', date: null, recipient: 'ogul@gmail.com' },
  { id: '3', title: 'Eşime sürpriz', status: 'sent', date: '2030-01-01', recipient: 'esim@gmail.com' },
];
```

Her kart:
- midnight bg, horizon border, 12px radius, 16px padding
- hover: borderColor var(--copper), transition 0.2s
- Sol taraf: başlık (cream, 15px, 500) + alıcı (mist, 13px)
- Sağ taraf: durum badge + tarih
- Durum badge renkleri:
  - draft: `background: var(--horizon), color: var(--mist)` — "Taslak"
  - scheduled: `background: rgba(212,118,59,0.15), color: var(--copper)` — "Zamanlanmış"
  - sent: `background: rgba(34,197,94,0.15), color: #22C55E` — "Gönderildi"
- Karta tıklama: router.push(`/messages/${msg.id}`)

#### 5. Boş State (mesaj yoksa)
```
        💌
  Henüz mesaj yok
  Sevdiklerine geleceğe mesaj bırak
  [İlk Mesajını Oluştur]
```
- Ortalanmış, padding 48px
- Buton: btn btn-primary

### Teknik
- 'use client', useRouter, useState
- export const runtime = 'edge'
- Tüm renkler CSS değişkeni ile
- Tailwind custom renk class'ı KULLANMA

### Doğrulama
check_css() çalıştır. Temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Wizard Flow — 5 adımlı mesaj oluşturma
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Wizard Flow — 5 Adımlı Mesaj Oluşturma Sihirbazı

### Dosya
`vasi-web/src/app/(dashboard)/messages/new/page.tsx` — tamamen yeniden yaz.

### Wizard Yapısı
5 adım, tek sayfada state ile yönetilen:

```
[1. İçerik] → [2. Alıcılar] → [3. Zamanlama] → [4. Önizleme] → [5. Gönder]
```

### Progress Bar (en üstte)
```
●━━━━○━━━━○━━━━○━━━━○
1    2    3    4    5
```
- Aktif adım: copper daire + copper metin
- Tamamlanan adım: copper doldurulmuş + check ikonu
- Gelecek adım: horizon daire + mist metin
- Aralarındaki çizgi: tamamlanmış kısım copper, bekleyen kısım horizon

### State Yapısı
```ts
const [step, setStep] = useState(1)
const [form, setForm] = useState({
  title: '',
  body: '',
  recipients: [] as string[],
  scheduledAt: '',
})
```

### Adım 1: İçerik
- Başlık input: "Mesajına bir başlık ver" (placeholder: "Anneme mektup")
- Body textarea: "Mesajını yaz" (placeholder: "Sevgili...", 8 satır yükseklik)
- Karakter sayacı textarea sağ altında: `{body.length} / 5000`
- Validasyon: title en az 3 karakter, body en az 10 karakter
- "İleri →" butonu: btn btn-primary, sağa yaslanmış

### Adım 2: Alıcılar
- E-posta input + "Ekle" butonu yan yana
- Eklenen alıcılar chip/tag olarak listelenir:
  `[ali@gmail.com ×]` — copper border, copper renk, × kaldırır
- Min 1 alıcı zorunlu
- "← Geri" + "İleri →" butonları

### Adım 3: Zamanlama
- datetime-local input
- min: bugünden itibaren en az 1 gün sonra
- Önerilen tarihler (hızlı seç butonu):
  - "1 Yıl Sonra", "5 Yıl Sonra", "10 Yıl Sonra"
  - Tıklanınca datetime-local inputu o tarihe ayarlar
- "← Geri" + "İleri →" butonları

### Adım 4: Önizleme
Düzenlenemez, sadece gösterim:
- midnight kart içinde:
  - Başlık: cream, 20px
  - Mesaj body: mist, 14px, max 200 karakter + "..." (tam hali)
  - Alıcılar: chip listesi
  - Gönderim tarihi: copper renk, takvim ikonu
- "← Geri" + "Gönder ✓" butonları

### Adım 5: Gönder (Submit)
API çağrısı yap:
```ts
const res = await fetch('/api/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ title: form.title, body: form.body })
})
const data = await res.json()
// Alıcıları ekle
for (const email of form.recipients) {
  await fetch(`/api/messages/${data.id}/recipients`, {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({ email, name: email.split('@')[0] })
  })
}
// Zamanla
if (form.scheduledAt) {
  await fetch(`/api/messages/${data.id}/schedule`, {
    method: 'POST',
    headers: { ... },
    body: JSON.stringify({ scheduled_at: form.scheduledAt })
  })
}
router.push(`/messages/${data.id}`)
```
- Loading state: "Gönderiliyor..." + spinner
- Hata: kırmızı (#EF4444) mesaj
- Token: `localStorage.getItem('authToken')`

### Teknik
- 'use client', useRouter, useState
- export const runtime = 'edge'
- Tüm renkler CSS değişkeni ile — Tailwind custom class KULLANMA
- inputStyle sabiti: { width:'100%', padding:'10px 14px', background:'var(--horizon)',
    border:'1px solid var(--horizon)', borderRadius:'8px', color:'var(--cream)',
    fontSize:'14px', outline:'none' }
- Focus: onFocus → border: '2px solid var(--copper)', onBlur → geri al

### Sayfa Genel Stili
- Sayfa başlığı: "Yeni Mesaj" + "5 adımda mesajını oluştur"
- Ortalanmış container: maxWidth 640px, margin auto, padding 32px 16px
- Her adım içeriği: midnight kart, 24px padding

### Doğrulama
check_css() + run_tsc() çalıştır. Temizse commit at.
""",
    ),
]


CLOSED = True  # sprint kapandı — tekrar koşturulamaz
