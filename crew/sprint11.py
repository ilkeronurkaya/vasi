"""
Sprint 11 — Eksik Restyle + Fonksiyonel Düzeltmeler
=====================================================
Task 1: messages/[id]/page.tsx — API şema hatası + v2 restyle
Task 2: messages/[id]/schedule/page.tsx — v2 restyle
Task 3: Sidebar NAV yeniden düzenleme

Kural: Görevler kısa — tasarım detayı DESIGN.md "APPLE TASARIM DİLİ v2" bölümünde.
Sprint 10'da yapılan değişiklikler baz alınır: globals.css'te v2 tokenler mevcut.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: messages/[id] — API hatası + restyle
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: messages/[id]/page.tsx — API şema düzelt + Apple v2 restyle

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA.
Veri mantığını (useEffect, addRecipient, deleteRecipient, deleteMessage) AYNEN koru.

### A) API şema hatası (fonksiyonel — önce düzelt)
API `POST /recipients` endpoint'i `full_name` bekler, `name` değil.
Şu 3 noktayı düzelt:

1. Tip tanımı: `type Recipient = { id: string; name: string; email: string }`
   → `type Recipient = { id: string; full_name: string; email: string }`

2. `handleAddRecipient` içindeki body:
   `body: JSON.stringify({ name: newName, email: newEmail })`
   → `body: JSON.stringify({ full_name: newName, email: newEmail })`
   Ve optimistik güncelleme:
   `{ id: created.id ?? '', name: newName, email: newEmail }`
   → `{ id: created.id ?? '', full_name: newName, email: newEmail }`

3. Alıcı listesi görünümü:
   `{r.name}` → `{r.full_name}`

### B) Apple v2 restyle
Tüm tasarım detayı DESIGN.md "APPLE TASARIM DİLİ v2" bölümünde.

**inputStyle** sabitini şununla değiştir:
```ts
const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: '44px', padding: '10px 14px',
    background: 'var(--obsidian)', border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
};
```

**labelStyle** sabitini şununla değiştir:
```ts
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: 'var(--mist)', marginBottom: '6px',
};
```

**Focus stilleri**: dosyada `borderColor: focusField === 'name' ? ...` ve
`borderColor: focusField === 'email' ? ...` satırlarını bulup
`border + boxShadow` pattern'ına geçir:
`...(focusField === 'name' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {})`
`...(focusField === 'email' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {})`

**İki büyük kart** (İçerik ve Alıcılar):
`border: '1px solid var(--horizon)', borderRadius: '12px'`
→ `border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)'`

**Başlık** `h1`: `fontSize: '20px'` → `fontSize: '22px'`, `letterSpacing: '-0.01em'` ekle.

**Section label'lar** (MESAJ İÇERİĞİ, ALICILAR):
`fontSize: '12px', letterSpacing: '0.05em'`
→ `fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em'`

**Sil butonu** köşesi: `borderRadius: '8px'` → `borderRadius: 'var(--radius-input)'`

**Alıcı satırı** köşesi: `borderRadius: '8px'` → `borderRadius: 'var(--radius-input)'`

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: messages/[id]/schedule restyle
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: messages/[id]/schedule/page.tsx — Apple v2 restyle

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA.
Veri mantığını (useEffect, handleSchedule) AYNEN koru.

### Değişiklikler

**inputStyle** sabitini şununla değiştir:
```ts
const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: '44px', padding: '10px 14px',
    background: 'var(--obsidian)', border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
};
```

**labelStyle** ekle (dosyada yok, ekle):
```ts
const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: 'var(--mist)', marginBottom: '6px',
};
```
Sonra `label` elementindeki inline stili `style={labelStyle}` ile değiştir.

**Focus stili** (scheduled input):
`borderColor: focused ? 'var(--copper)' : 'var(--horizon)'`
→ `...(focused ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {})`

**Ana kart** (`background: 'var(--midnight)', border: '1px solid var(--horizon)', borderRadius: '12px'`):
→ `background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)'`

**İç özet kutu** (`borderRadius: '8px'`):
→ `borderRadius: 'var(--radius-input)'`

**Başlık** `h1`: `letterSpacing: '-0.01em'` ekle.

### Doğrulama
run_tsc() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Sidebar NAV
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Sidebar NAV'ını yeniden düzenle

### Dosya: `vasi-web/src/app/(dashboard)/layout.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA. Veri mantığına DOKUNMA.

### Değişiklik: NAV sabitini güncelle

Mevcut:
```ts
const NAV = [
    { href: '/dashboard', label: 'Mesajlarım' },
    { href: '/messages/new', label: 'Yeni Mesaj' },
];
```

Yeni (3 madde):
```ts
const NAV = [
    { href: '/dashboard', label: 'Ana Sayfa' },
    { href: '/messages', label: 'Mesajlarım' },
    { href: '/messages/new', label: 'Yeni Mesaj' },
];
```

Açıklama: `/messages` liste sayfası sprint 9'da eklendi ama sidebar'a girmedi.
`/dashboard` artık özet/istatistik sayfası; `/messages` tam liste sayfası.

Aktif rota eşleştirmesi: mevcut `pathname === item.href` mantığını koru —
`/messages/new` ve `/messages/:id` gibi alt rotalar için `/messages` aktif
görünmesi GEREKMEZ (kesin eşleşme yeterli, değiştirme).

### Doğrulama
run_tsc() temizse commit at.
""",
    ),
]
