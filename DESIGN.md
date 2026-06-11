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

---

# APPLE TASARIM DİLİ v2 (Sprint 10+)

> Bu bölüm yukarıdaki "Input Stili" ve "Navigasyon" kurallarının YERİNE GEÇER.
> Renk tokenleri AYNEN korunur. İlke: sadelik, cömert boşluk, derinlik.

## Yeni CSS Tokenleri (globals.css'de tanımlı)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `var(--radius-card)` | `16px` | Kart, panel |
| `var(--radius-input)` | `12px` | Input, select, textarea |
| `var(--border-subtle)` | `1px solid rgba(237,233,224,0.08)` | Kart/panel kenarı |
| `var(--shadow-card)` | `0 1px 2px rgba(0,0,0,.2), 0 8px 24px rgba(0,0,0,.25)` | Kart gölgesi |
| `var(--glass-bg)` | `rgba(22,32,51,0.72)` | Buzlu cam yüzey |
| `var(--focus-ring)` | `0 0 0 3px rgba(212,118,59,0.25)` | Input focus halkası |
| `var(--dur)` | `200ms` | Standart animasyon süresi |
| `var(--ease)` | `cubic-bezier(0.25,0.1,0.25,1)` | Standart easing |

## Tipografi (sistem fontu — SF Pro/system-ui, ek yükleme YOK)

| Rol | Boyut/Ağırlık | Ek |
|-----|---------------|-----|
| Büyük başlık | 28px / 700 | `letterSpacing: '-0.02em'` |
| Sayfa başlığı | 22px / 700 | `letterSpacing: '-0.01em'` |
| Bölüm başlığı | 17px / 600 | — |
| Gövde | 15px / 400 | `lineHeight: 1.5` |
| İkincil | 13px / 400 | mist renk |
| Etiket/caption | 11px / 500 | uppercase, `letterSpacing: '0.06em'` |

## Boşluk Skalası (4px taban)
`4, 8, 12, 16, 24, 32, 48, 64` — ara değer KULLANMA. Bölümler arası min 32px.

## Form Kuralları (Apple stili)

```tsx
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500,
  color: 'var(--mist)', marginBottom: '6px' };
const inputStyle = { width: '100%', minHeight: '44px', padding: '10px 14px',
  background: 'var(--obsidian)', border: '1px solid var(--horizon)',
  borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px',
  outline: 'none', transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
  boxSizing: 'border-box' };
// Focus:  border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)'  (2px border DEĞİL — zıplama yapar)
// Hata:   border: '1px solid #EF4444' + altta 13px kırmızı metin
```
- Label HER ZAMAN input üstünde — placeholder asla tek etiket olamaz.
- Doğru input type'ları: email, tel, datetime-local. Touch hedefi min 44px.
- Validasyon blur'da başlar, submit'te tamamlanır.

## Sidebar Kuralları (buzlu cam)

```tsx
const sidebarStyle = { background: 'var(--glass-bg)',
  backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  borderRight: 'var(--border-subtle)' };
// Aktif nav item: yumuşak pill — background: 'rgba(212,118,59,0.12)', color: 'var(--copper)', borderRadius: '10px'
// (Eski borderLeft çizgisi KALDIRILDI)
// Pasif item: color: 'var(--mist)'; hover: background: 'rgba(237,233,224,0.04)', color: 'var(--cream)'
// Item yüksekliği 36px, metin 13px/500, ikon-metin arası 10px
```

## Kart Kuralları

```tsx
const cardStyle = { background: 'var(--midnight)', border: 'var(--border-subtle)',
  borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '24px',
  transition: 'transform var(--dur) var(--ease), border-color var(--dur) var(--ease)' };
// Tıklanabilir kart hover: transform: 'scale(1.02)', borderColor: 'rgba(212,118,59,0.3)'
// Dashboard istatistikleri: bento hissi — kartlar arası gap 16px, sayı 32px/700, etiket caption stili
```

## Hareket Kuralları
- Sadece `transform`, `opacity`, `border-color`, `box-shadow` anime edilir (layout zıplatma YASAK).
- Süre 200ms, ease standart token. Pressed durumu: `scale(0.98)`.
- `transition: 'all ...'` KULLANMA — özellik adlarını yaz.

## Buton Sistemi v2 (Sprint 15+) — hap formu KALDIRILDI

Apple yumuşak dikdörtgen. globals.css'teki .btn sınıfları şöyledir:

| Class | Görünüm | Kullanım |
|-------|---------|----------|
| `btn-primary` | Dolu bakır zemin, obsidian metin | Sayfada EN FAZLA 1 ana aksiyon |
| `btn-secondary` | Bakır tonlu saydam zemin (rgba(212,118,59,.12)), bakır metin, border YOK | İkincil aksiyonlar |
| `btn-ghost` | Düz metin (mist), hover'da hafif zemin | Üçüncül/iptal |
| `btn-sm` | 32px yükseklik, 13px metin, radius 10px | Tablo içi, satır aksiyonları |
| `btn-md` | 40px yükseklik, 14px metin, radius 12px | Varsayılan |
| `btn-lg` | 48px yükseklik, 16px metin, radius 12px | Hero/form ana CTA |

**KURAL:** Uygulama içinde (login sonrası tüm sayfalar + admin) her tıklanabilir
aksiyon `.btn .btn-{seviye} .btn-{boyut}` üçlüsünü kullanır. Inline buton stili
(style ile padding/background/borderRadius verilmiş <button>) YASAKTIR —
istisna: ikon butonlar (geri oku, × kaldır) btn-ghost veya sade kalabilir.
