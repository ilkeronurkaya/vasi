# Vasi Tasarım Sistemi — DESIGN.md

> Bu dosya her UX/UI görevinde agent tarafından okunur.
> Tasarım kararlarında bu dosyayı referans al. Değişiklik yapma.

---

## Renk Tokenleri (CSS değişkenleri — globals.css'de tanımlı)

| Token | Hex | Kullanım |
|-------|-----|----------|
| `var(--obsidian)` | `#0C1525` | Sayfa arka planı |
| `var(--midnight)` | `#162033` | Kart / panel arka planı |
| `var(--horizon)` | `#1F2D45` | Border, hover arka planı |
| `var(--copper)` | `#D4763B` | Birincil aksiyon (CTA, link, vurgu) |
| `var(--copper-light)` | `#E8956A` | Hover durumu |
| `var(--copper-dark)` | `#B55C22` | Active / pressed durumu |
| `var(--cream)` | `#EDE9E0` | Birincil metin |
| `var(--mist)` | `#8B9BB4` | İkincil metin, placeholder |
| `var(--offwhite)` | `#F5F3EE` | Açık yüzey |

---

## DOĞRU KULLANIM — Inline style ile CSS değişkeni

```tsx
// ✅ Doğru
<div style={{ background: 'var(--midnight)', color: 'var(--cream)' }}>
<button style={{ background: 'var(--copper)', color: 'var(--obsidian)' }}>
<input style={{ border: '1px solid var(--horizon)' }}>
<span style={{ color: 'var(--mist)' }}>
```

## YASAK — Tailwind custom renk class'ları (tailwind.config.ts'de TANIMLI DEĞİL)

```tsx
// ❌ Bunlar çalışmaz — KULLANMA:
className="bg-Copper"       // → style={{ background: 'var(--copper)' }}
className="text-Cream"      // → style={{ color: 'var(--cream)' }}
className="bg-Obsidian"     // → style={{ background: 'var(--obsidian)' }}
className="bg-Midnight"     // → style={{ background: 'var(--midnight)' }}
className="border-Horizon"  // → style={{ border: '1px solid var(--horizon)' }}
className="text-Mist"       // → style={{ color: 'var(--mist)' }}
className="bg-D46B30"       // → style={{ background: 'var(--copper)' }}
className="bg-B55C22"       // → style={{ background: 'var(--copper-dark)' }}
```

---

## Hazır CSS Class'ları (globals.css)

```tsx
// Butonlar
<button className="btn btn-primary">   // copper arka plan
<button className="btn btn-secondary"> // horizon border, şeffaf arka plan
<button className="btn btn-ghost">     // sadece metin, hover'da hafif bg
<button className="btn btn-sm">        // küçük
<button className="btn btn-md">        // orta (default)
<button className="btn btn-lg">        // büyük
```

---

## Kart / Panel Stili

```tsx
const cardStyle = {
  background: 'var(--midnight)',
  border: '1px solid var(--horizon)',
  borderRadius: '12px',
  padding: '24px',
};
```

## Input Stili

```tsx
const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--horizon)',
  border: '1px solid var(--horizon)',
  borderRadius: '8px',
  color: 'var(--cream)',
  fontSize: '14px',
  outline: 'none',
};
// Focus: border: '2px solid var(--copper)'
// Hata: border: '1px solid #EF4444'
```

---

## Route Yapısı

```
/messages/           → mesaj listesi
/messages/new        → yeni mesaj oluştur
/messages/[id]       → mesaj detayı
/messages/[id]/edit  → mesaj düzenle
/messages/[id]/schedule → zamanlama
/dashboard           → ana dashboard (alias)
```

> ⚠️ `/dashboard/messages/` route prefix'i YANLIŞ. Her zaman `/messages/` kullan.

---

## UX Standartları

### Form'lar
- Input focus: `border: '2px solid var(--copper)'` (onFocus/onBlur ile)
- Loading state: buton disabled + spinner veya "..."
- Hata: `color: '#EF4444'` satır içi mesaj
- Başarı: `color: '#22C55E'` satır içi mesaj
- Client-side validasyon submit öncesi zorunlu

### Navigasyon
- Aktif link: `color: 'var(--copper)'` + `borderLeft: '3px solid var(--copper)'`
- Hover: `background: 'var(--horizon)'`

### Boş State
- Ikon (emoji veya SVG) + açıklama metni + CTA butonu
- Örnek: `💌 Henüz mesaj yok` + `"İlk mesajını oluştur"` butonu

### Responsive
- Mobile-first, sidebar 768px altında gizlenir
- Geçişler: `transition: 'all 0.2s ease'`

---

## VasiLogo Komponenti

```tsx
import { VasiLogo } from '@/components/VasiLogo';
<VasiLogo height={40} />
```

Dosya: `vasi-web/src/components/VasiLogo.tsx`
ViewBox: `125 315 240 230`
Renkler: `#EDE9E0` (cream) + `#BF7A57` (copper)
