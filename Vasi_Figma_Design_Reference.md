# Vasi — Figma Design Reference
**Versiyon:** 1.0 · Mayıs 2026  
**Kapsam:** Web Desktop · Web Mobile · iOS · Android  
**Kaynak:** Vasi Brand Guideline v2.0

---

## İçindekiler
1. [Design Tokens — Renkler](#1-design-tokens--renkler)
2. [Design Tokens — Tipografi](#2-design-tokens--tipografi)
3. [Design Tokens — Spacing & Radius & Shadow](#3-design-tokens--spacing--radius--shadow)
4. [Grid & Layout — Platform Bazında](#4-grid--layout--platform-bazında)
5. [Logo Kullanımı](#5-logo-kullanımı)
6. [Component Specs](#6-component-specs)
7. [Ekran Listesi & Akış](#7-ekran-listesi--akış)
8. [Dark / Light Mod Kuralları](#8-dark--light-mod-kuralları)
9. [İkon & Görsel Rehberi](#9-i̇kon--görsel-rehberi)
10. [Figma Dosya Yapısı Önerisi](#10-figma-dosya-yapısı-önerisi)

---

## 1. Design Tokens — Renkler

Tüm renk isimleri Figma Variables / Styles olarak tanımlanmalıdır. Token adı `vasi/color/[grup]/[isim]` formatında kullanılır.

### 1.1 Primitive Colors (Base Palette)

| Token Adı | Hex | Kullanım |
|---|---|---|
| `color/base/obsidian` | `#0C1525` | Ana arka plan (Dark mod) |
| `color/base/midnight` | `#162033` | Yüzey / kart arka planı |
| `color/base/horizon` | `#1F2D45` | Sınır, divider, gölge |
| `color/base/copper` | `#D4763B` | Aksan, CTA, aktif durum |
| `color/base/copper-light` | `#E8956A` | Hover durumu için açık bakır |
| `color/base/copper-dark` | `#B55C22` | Pressed durumu için koyu bakır |
| `color/base/cream` | `#EDE9E0` | Birincil metin (koyu zemin) |
| `color/base/mist` | `#8B9BB4` | İkincil / yardımcı metin |
| `color/base/offwhite` | `#F5F3EE` | Ana arka plan (Light mod) |
| `color/base/lightbg` | `#F0EDE6` | Tablo / kart arka planı (Light) |
| `color/base/charcoal` | `#1A1A1A` | Birincil metin (Light mod) |
| `color/base/white` | `#FFFFFF` | Beyaz |
| `color/base/black` | `#000000` | Siyah |

### 1.2 Semantic Colors (Dark Mode — Varsayılan)

> Figma'da bu katman `color/semantic/dark/*` altında ayrıca tanımlanmalı.

| Token Adı | Değer | Açıklama |
|---|---|---|
| `color/bg/primary` | `#0C1525` | Sayfa arka planı |
| `color/bg/surface` | `#162033` | Kart, modal, bottom sheet |
| `color/bg/elevated` | `#1F2D45` | Dropdown, tooltip, float |
| `color/text/primary` | `#EDE9E0` | Ana metin |
| `color/text/secondary` | `#8B9BB4` | Yardımcı / açıklama metni |
| `color/text/disabled` | `#4A5568` | Pasif metin |
| `color/text/inverse` | `#0C1525` | Açık zemin üzeri metin |
| `color/border/default` | `#1F2D45` | Standart kenarlık |
| `color/border/subtle` | `#162033` | Hafif kenarlık |
| `color/border/accent` | `#D4763B` | Vurgulu kenarlık (focus, selected) |
| `color/accent/default` | `#D4763B` | CTA, aktif ikon, badge |
| `color/accent/hover` | `#E8956A` | Hover |
| `color/accent/pressed` | `#B55C22` | Pressed / active |
| `color/status/success` | `#2F9E44` | Başarı |
| `color/status/warning` | `#E67700` | Uyarı |
| `color/status/error` | `#C92A2A` | Hata |
| `color/status/info` | `#1971C2` | Bilgi |

### 1.3 Semantic Colors (Light Mode)

| Token Adı | Değer |
|---|---|
| `color/bg/primary` | `#F5F3EE` |
| `color/bg/surface` | `#FFFFFF` |
| `color/bg/elevated` | `#F0EDE6` |
| `color/text/primary` | `#1A1A1A` |
| `color/text/secondary` | `#5A6475` |
| `color/text/disabled` | `#9CA3AF` |
| `color/border/default` | `#D9D4CB` |
| `color/accent/default` | `#D4763B` *(aynı)* |

---

## 2. Design Tokens — Tipografi

**Ana Font:** Plus Jakarta Sans (Google Fonts)  
**Fallback:** `system-ui, -apple-system, sans-serif`

Figma'da **Text Styles** olarak aşağıdaki skalayı tanımla:

### 2.1 Type Scale

| Style Adı | Font | Weight | Size | Line Height | Letter Spacing | Kullanım |
|---|---|---|---|---|---|---|
| `display/xl` | Plus Jakarta Sans | 700 | 56px | 1.1 | –0.5px | Hero başlık |
| `display/lg` | Plus Jakarta Sans | 700 | 44px | 1.1 | –0.3px | Onboarding başlık |
| `heading/h1` | Plus Jakarta Sans | 700 | 36px | 1.2 | –0.2px | Sayfa başlığı |
| `heading/h2` | Plus Jakarta Sans | 700 | 28px | 1.25 | –0.1px | Bölüm başlığı |
| `heading/h3` | Plus Jakarta Sans | 600 | 22px | 1.3 | 0 | Kart başlığı |
| `heading/h4` | Plus Jakarta Sans | 600 | 18px | 1.35 | 0 | Sub-section |
| `body/lg` | Plus Jakarta Sans | 400 | 18px | 1.6 | 0 | Uzun okuma metni |
| `body/md` | Plus Jakarta Sans | 400 | 16px | 1.55 | 0 | Standart metin |
| `body/sm` | Plus Jakarta Sans | 400 | 14px | 1.5 | 0 | Yardımcı metin |
| `label/lg` | Plus Jakarta Sans | 600 | 16px | 1.2 | 0.1px | Buton etiketi |
| `label/md` | Plus Jakarta Sans | 600 | 14px | 1.2 | 0.1px | Küçük buton, tab |
| `label/sm` | Plus Jakarta Sans | 500 | 12px | 1.2 | 0.2px | Badge, chip |
| `caption/md` | Plus Jakarta Sans | 400 | 12px | 1.4 | 0 | Açıklama, timestamp |
| `caption/sm` | Plus Jakarta Sans | 400 | 10px | 1.4 | 0.1px | Micro metin |
| `mono/md` | JetBrains Mono | 400 | 14px | 1.5 | 0 | Kod, tarih inputları |

### 2.2 Platform Özel Notlar

**iOS:** SF Pro Display / SF Pro Text ile replace edilebilir (native hissiyat için opsiyonel).  
**Android:** Roboto fallback gerekebilir — Google Fonts üzerinde Plus Jakarta Sans erişilebilir.  
**Web:** `@import` veya `next/font` ile yüklenmeli.

---

## 3. Design Tokens — Spacing · Radius · Shadow

### 3.1 Spacing Scale

4px base grid. Tüm spacing değerleri 4'ün katıdır.

| Token | Değer | Kullanım |
|---|---|---|
| `space/1` | 4px | Micro gap (ikon–label arası) |
| `space/2` | 8px | Kompakt padding |
| `space/3` | 12px | İkon padding |
| `space/4` | 16px | Standart padding, mobil edge margin |
| `space/5` | 20px | Kart iç padding |
| `space/6` | 24px | Bölüm gap |
| `space/8` | 32px | Büyük section gap |
| `space/10` | 40px | Sayfa padding (desktop) |
| `space/12` | 48px | Hero padding |
| `space/16` | 64px | Section break |
| `space/20` | 80px | Major section |

### 3.2 Border Radius

| Token | Değer | Kullanım |
|---|---|---|
| `radius/xs` | 4px | Badge, tag, tooltip |
| `radius/sm` | 8px | Input, küçük kart |
| `radius/md` | 12px | Standart kart |
| `radius/lg` | 16px | Modal, bottom sheet |
| `radius/xl` | 24px | Hero kart, büyük modal |
| `radius/full` | 9999px | Pill buton, avatar, FAB |

### 3.3 Elevation / Shadow

| Token | CSS Shadow | Kullanım |
|---|---|---|
| `shadow/xs` | `0 1px 2px rgba(0,0,0,0.12)` | Hafif ayrım |
| `shadow/sm` | `0 2px 8px rgba(0,0,0,0.18)` | Kart, input focus |
| `shadow/md` | `0 4px 16px rgba(0,0,0,0.22)` | Dropdown, popover |
| `shadow/lg` | `0 8px 32px rgba(0,0,0,0.28)` | Modal, bottom sheet |
| `shadow/xl` | `0 16px 48px rgba(0,0,0,0.35)` | Full-screen overlay |
| `shadow/copper` | `0 4px 20px rgba(212,118,59,0.25)` | CTA buton hover gölgesi |

### 3.4 Stroke / Border Width

| Token | Değer |
|---|---|
| `border/thin` | 1px |
| `border/default` | 1.5px |
| `border/thick` | 2px |
| `border/focus` | 2px (copper rengiyle) |

---

## 4. Grid & Layout — Platform Bazında

### 4.1 Web — Desktop (1440px)

```
Toplam genişlik : 1440px
İçerik genişliği: 1200px (max-width)
Kenar boşluğu  : 120px (her iki yan)
Sütun sayısı   : 12
Gutter         : 24px
Column genişliği: ~76px
```

**Breakpoints:**
| İsim | Min Width | Kullanım |
|---|---|---|
| `xs` | 320px | Küçük telefon |
| `sm` | 375px | iPhone SE / standart mobil |
| `md` | 768px | Tablet |
| `lg` | 1024px | Küçük laptop |
| `xl` | 1280px | Standart desktop |
| `2xl` | 1440px | Referans desktop |
| `3xl` | 1920px | Geniş ekran |

**Layout Zones (Desktop):**
```
┌─────────────────────────────────────┐
│         Top Navigation (64px)       │
├──────────┬──────────────────────────┤
│ Sidebar  │   Main Content Area      │
│ (240px)  │   (kalan alan)           │
│ [opsiyonel]                         │
├──────────┴──────────────────────────┤
│              Footer                 │
└─────────────────────────────────────┘
```

### 4.2 Web — Mobile (375px)

```
Toplam genişlik : 375px
Kenar boşluğu  : 16px (her iki yan)
İçerik genişliği: 343px
Sütun sayısı   : 4
Gutter         : 16px
```

**Layout Zones (Mobile Web):**
```
┌──────────────────┐
│  Top Bar (56px)  │
├──────────────────┤
│                  │
│   Content Area   │
│                  │
├──────────────────┤
│ Bottom Nav (safe)|
└──────────────────┘
```

### 4.3 iOS (iPhone 14 Pro — 393×852pt)

```
Referans cihaz  : iPhone 14 Pro (393×852pt @3x)
Kenar boşluğu  : 16pt (standart) / 24pt (büyük içerik)
Safe Area üst  : Dynamic Island → 59pt
Safe Area alt  : 34pt (home indicator)
```

**iOS Layout Zones:**
```
┌────────────────────┐
│ Status Bar (59pt)  │  ← Dynamic Island
├────────────────────┤
│ Navigation Bar     │  ← 44pt (large: 96pt)
├────────────────────┤
│                    │
│   Content Area     │
│   (ScrollView)     │
│                    │
├────────────────────┤
│  Tab Bar (49pt)    │
├────────────────────┤
│  Safe Area (34pt)  │
└────────────────────┘
```

**iOS Bileşen Yükseklikleri:**
| Bileşen | Yükseklik |
|---|---|
| Navigation Bar | 44pt (compact) / 96pt (large title) |
| Tab Bar | 49pt |
| Bottom Sheet handle | 4pt yükseklik, 36pt genişlik |
| List Row (standart) | 44pt min |
| List Row (subtitle) | 56pt min |
| Button (büyük) | 50pt |
| Input Field | 44pt |

### 4.4 Android (360×800dp)

```
Referans cihaz  : Pixel 7 (360dp genişlik)
Kenar boşluğu  : 16dp
Status Bar      : 24dp
```

**Android Layout Zones:**
```
┌────────────────────┐
│  Status Bar (24dp) │
├────────────────────┤
│  App Bar (56dp)    │
├────────────────────┤
│                    │
│   Content Area     │
│                    │
├────────────────────┤
│  Bottom Nav (80dp) │
│  Nav Gesture (20dp)│
└────────────────────┘
```

**Android Bileşen Yükseklikleri (Material 3 uyumlu):**
| Bileşen | Yükseklik |
|---|---|
| Top App Bar | 64dp |
| Bottom Navigation | 80dp |
| FAB | 56dp |
| Button | 40dp |
| Input (OutlinedTextField) | 56dp |
| List Item (1-satır) | 56dp |
| List Item (2-satır) | 72dp |

---

## 5. Logo Kullanımı

### 5.1 Figma'da Logo Asset'leri

Üç SVG dosyası proje Assets paneline eklenecek:

| Dosya | Arka Plan | Kullanım Yeri |
|---|---|---|
| `vasi-symbol-dark.svg` | Obsidian `#0C1525` | Uygulama ikonu, splash screen, koyu header |
| `vasi-symbol-light.svg` | Off-White `#F5F3EE` | Web header (light mod), e-posta, baskı |
| `vasi-symbol-mono.svg` | Şeffaf | Tek renk baskı, onboarding watermark |

### 5.2 Platform Başına Logo Boyutu

| Platform | Bağlam | Boyut |
|---|---|---|
| Web Desktop | Header / Navbar | 32px yükseklik |
| Web Desktop | Footer | 24px yükseklik |
| Web Mobile | Top bar | 28px yükseklik |
| iOS | Navigation Bar logo | 28pt yükseklik |
| iOS | App Icon | 1024×1024pt (export) |
| iOS | Splash / Launch Screen | 120pt yükseklik |
| Android | App Bar | 28dp yükseklik |
| Android | Launcher Icon | 108×108dp (adaptive) |

### 5.3 Güvenli Alan (Clear Space)
Logonun her yönünde sembol yüksekliğinin **%50'si** kadar boş alan bırakılmalı.  
Minimum boyut: **32px / 32pt / 32dp** yükseklik.

---

## 6. Component Specs

### 6.1 Button

**Varyantlar:** `primary` · `secondary` · `ghost` · `destructive` · `text`  
**Boyutlar:** `sm` · `md` · `lg`

| Özellik | Small | Medium | Large |
|---|---|---|---|
| Height | 32px | 40px | 50px |
| Padding H | 12px | 16px | 24px |
| Font | `label/sm` | `label/md` | `label/lg` |
| Radius | `radius/full` | `radius/full` | `radius/full` |

**Renk Durumları (Primary):**
| Durum | Arka Plan | Metin |
|---|---|---|
| Default | `#D4763B` | `#FFFFFF` |
| Hover | `#E8956A` | `#FFFFFF` |
| Pressed | `#B55C22` | `#FFFFFF` |
| Disabled | `#1F2D45` | `#4A5568` |
| Loading | `#D4763B` + spinner | `#FFFFFF` |

**Secondary Button:**
| Durum | Arka Plan | Metin | Border |
|---|---|---|---|
| Default | `transparent` | `#D4763B` | `1.5px #D4763B` |
| Hover | `rgba(212,118,59,0.08)` | `#D4763B` | `1.5px #D4763B` |
| Pressed | `rgba(212,118,59,0.16)` | `#B55C22` | `1.5px #B55C22` |
| Disabled | `transparent` | `#4A5568` | `1.5px #1F2D45` |

**Ghost Button:** Arka plan ve border yok, sadece metin rengi `#EDE9E0`, hover'da `rgba(237,233,224,0.08)` bg.

### 6.2 Input Field

```
Height       : 48px (standart) / 56px (large)
Padding H    : 16px
Padding V    : 12px
Radius       : radius/sm (8px)
Border       : 1.5px solid color/border/default
Font         : body/md
Label font   : label/sm (üstte float veya üst sabit)
```

**Durum Renkleri:**
| Durum | Border | Arka Plan |
|---|---|---|
| Default | `#1F2D45` | `#162033` |
| Focus | `#D4763B` (2px) | `#162033` |
| Filled | `#1F2D45` | `#162033` |
| Error | `#C92A2A` | `rgba(201,42,42,0.06)` |
| Disabled | `#0F1A2E` | `#0C1525` |
| Success | `#2F9E44` | `rgba(47,158,68,0.06)` |

**Özel Input Tipleri:**
- **DatePicker:** `mono/md` font, takvim ikon sağda, `#D4763B`
- **Textarea:** min 96px yükseklik, resize: vertical
- **Password:** sağda göster/gizle ikon
- **Phone:** sol bayrak seçici, `+90` prefix

### 6.3 Card

**Varyantlar:** `default` · `elevated` · `outlined` · `interactive`

```
Default Card:
  Arka Plan   : #162033
  Padding     : 20px
  Radius      : radius/md (12px)
  Border      : 1px solid #1F2D45
  Shadow      : shadow/sm

Interactive Card (hover):
  Shadow      : shadow/md
  Border      : 1px solid #D4763B (copper)
  Transform   : translateY(-2px) — subtle lift
```

**Message Card (Vasi'ye özel):**
```
┌─────────────────────────────────┐
│ 🔒  [Mesaj Başlığı]       ►    │  ← başlık satırı
│     Alıcı: [İsim]               │
│     Gönderim: [Tarih/Tetikleyici]│
│─────────────────────────────────│
│  [Delivery Icon]  [Status Badge] │  ← alt bar
└─────────────────────────────────┘
Yükseklik: 88px (compact) / 112px (expanded)
```

### 6.4 Navigation

#### Web — Top Navigation Bar
```
Height      : 64px
Arka Plan   : #0C1525 (dark) / #F5F3EE (light)
Border alt  : 1px solid #1F2D45
Logo        : Sol, 32px yükseklik
Nav Links   : Orta/sağ, body/md, gap: 32px
CTA Buton   : Sağ köşe, primary/md
Mobilde     : Hamburger menü (24px ikon)
```

#### iOS — Tab Bar
```
Yükseklik   : 49pt + safe area
Tab sayısı  : 4–5 arası (önerilen: 4)
Aktif ikon  : #D4763B (copper)
Pasif ikon  : #8B9BB4 (mist)
Arka Plan   : #0C1525 (dark mod)
```

**Önerilen Tab Sırası:**
1. Ana Sayfa (house ikon)
2. Mesajlarım (message ikon)
3. Yeni Mesaj (+ FAB, ortada büyük)
4. Alıcılar (users ikon)
5. Profil (person ikon)

#### Android — Bottom Navigation
```
Yükseklik   : 80dp
Yapı        : Material 3 NavigationBar
Aktif        : Indicator pill + copper renk
Pasif        : Mist renk ikon
```

### 6.5 Status Badge / Chip

```
Height      : 20px (sm) / 24px (md)
Padding H   : 8px
Radius      : radius/full
Font        : label/sm
```

| Tip | Arka Plan | Metin Rengi |
|---|---|---|
| Draft / Taslak | `#1F2D45` | `#8B9BB4` |
| Scheduled / Zamanlandı | `rgba(212,118,59,0.15)` | `#D4763B` |
| Delivered / İletildi | `rgba(47,158,68,0.15)` | `#2F9E44` |
| Failed / Başarısız | `rgba(201,42,42,0.15)` | `#C92A2A` |
| Locked / Kilitli | `rgba(139,155,180,0.15)` | `#8B9BB4` |

### 6.6 Modal / Bottom Sheet

**Web Modal:**
```
Max Width   : 480px (sm) / 640px (md) / 800px (lg)
Padding     : 32px
Radius      : radius/xl (24px)
Overlay     : rgba(0,0,0,0.60) backdrop-blur: 4px
Shadow      : shadow/xl
```

**iOS Bottom Sheet:**
```
Radius üst  : 20pt
Handle      : 4×36pt, #1F2D45
Peek height : 40% ekran
Full height : 90% ekran (safe area hariç)
```

**Android Bottom Sheet:**
```
Material 3 ModalBottomSheet
Radius üst  : 28dp
```

### 6.7 Avatar

```
xs : 24px  — liste, yoğun görünüm
sm : 32px  — satır içi
md : 40px  — standart profil satırı
lg : 56px  — profil kartı
xl : 80px  — profil sayfası
2xl: 120px — profil başlık
```
Şekil: `radius/full` (daire)  
Placeholder arka plan: `#1F2D45`, baş harf `#8B9BB4`

### 6.8 Empty State

```
İkon        : 64px, mist rengi (#8B9BB4)
Başlık      : heading/h3, cream
Açıklama    : body/md, mist
CTA Buton   : primary/md (opsiyonel)
Dikey hizalama: merkez
```

### 6.9 Loading States

- **Skeleton:** `#162033` base, `#1F2D45` shimmer — border-radius bileşenin radius'u ile aynı
- **Spinner:** 24px, stroke `#D4763B`, 1.5px kalınlık
- **Progress Bar:** 4px yükseklik, `#D4763B` fill, `#1F2D45` track
- **Pulse:** opacity 0.4–1.0, 1.2s ease-in-out infinite

---

## 7. Ekran Listesi & Akış

### 7.1 Onboarding Akışı

```
Splash Screen
    ↓
Welcome / Hero  (3 slide carousel)
    ↓
Kayıt Ol / Giriş Seç
    ↓
E-posta & Şifre  ←→  Google / Apple SSO
    ↓
Telefon Doğrulama (OTP)
    ↓
Profil Kurulumu (İsim, Fotoğraf)
    ↓
Plan Seçimi (Free / Personal / Family / Legacy)
    ↓
Dashboard (Ana Ekran)
```

### 7.2 Ana Ekranlar (Her Platform)

| # | Ekran Adı | Açıklama |
|---|---|---|
| 01 | `splash` | Logo animasyonu, koyu zemin |
| 02 | `onboarding-1` | "Geleceğe mesaj bırak" hero |
| 03 | `onboarding-2` | Zaman kapsülü özelliği |
| 04 | `onboarding-3` | Miras mesajı özelliği |
| 05 | `auth/register` | Kayıt formu |
| 06 | `auth/login` | Giriş formu |
| 07 | `auth/otp` | Telefon doğrulama |
| 08 | `auth/forgot-password` | Şifre sıfırlama |
| 09 | `home/dashboard` | Mesaj özeti, hızlı eylemler |
| 10 | `messages/list` | Tüm mesajlar listesi (tabs: Taslak / Zamanlandı / İletildi) |
| 11 | `messages/compose` | Yeni mesaj oluştur (adım 1: içerik) |
| 12 | `messages/compose-recipients` | Alıcı ekle (adım 2) |
| 13 | `messages/compose-trigger` | Tetikleyici ayarla (adım 3: tarih veya ölüm) |
| 14 | `messages/compose-review` | Özet & gönder (adım 4) |
| 15 | `messages/detail` | Mesaj detayı / düzenle |
| 16 | `recipients/list` | Kayıtlı alıcılar |
| 17 | `recipients/add` | Yeni alıcı ekle |
| 18 | `trusted/list` | Güvenilir kişiler listesi |
| 19 | `trusted/add` | Güvenilir kişi ekle |
| 20 | `subscription/plans` | Plan karşılaştırma |
| 21 | `subscription/checkout` | Ödeme |
| 22 | `subscription/success` | Abonelik onayı |
| 23 | `profile/view` | Profil sayfası |
| 24 | `profile/edit` | Profil düzenleme |
| 25 | `settings/main` | Ayarlar ana menüsü |
| 26 | `settings/notifications` | Bildirim tercihleri |
| 27 | `settings/security` | Güvenlik & 2FA |
| 28 | `settings/privacy` | Gizlilik & KVKK |
| 29 | `settings/delete-account` | Hesap silme onayı |
| 30 | `error/404` | Sayfa bulunamadı |
| 31 | `error/offline` | Çevrimdışı durumu |

### 7.3 Web'e Özel Ek Ekranlar

| # | Ekran Adı | Açıklama |
|---|---|---|
| W01 | `landing/home` | Pazarlama ana sayfası |
| W02 | `landing/features` | Özellikler sayfası |
| W03 | `landing/pricing` | Fiyatlandırma sayfası |
| W04 | `landing/about` | Hakkımızda |
| W05 | `landing/blog` | Blog listesi |
| W06 | `legal/privacy` | Gizlilik politikası |
| W07 | `legal/terms` | Kullanım şartları |
| W08 | `legal/kvkk` | KVKK aydınlatma metni |

---

## 8. Dark / Light Mod Kuralları

### 8.1 Mod Stratejisi

- **Varsayılan:** Dark Mode (Vasi'nin birincil görünümü)
- **Light Mode:** Web ve sistem tercihi takip edebilir; uygulama içi manuel switch
- Figma'da her frame için 2 varyant: `/dark` ve `/light`

### 8.2 Geçiş Kuralları

| Element | Dark | Light |
|---|---|---|
| Page BG | `#0C1525` | `#F5F3EE` |
| Surface / Card | `#162033` | `#FFFFFF` |
| Elevated | `#1F2D45` | `#F0EDE6` |
| Primary Text | `#EDE9E0` | `#1A1A1A` |
| Secondary Text | `#8B9BB4` | `#5A6475` |
| Border | `#1F2D45` | `#D9D4CB` |
| Accent (Copper) | `#D4763B` | `#D4763B` *(değişmez)* |
| Logo Versiyonu | Dark SVG | Light SVG |

### 8.3 Figma Auto Layout & Variants

- Her component'in `mode=dark` ve `mode=light` property'si olmalı
- Figma Variables kullanarak Color Mode geçişi tek tıkla değiştirilebilmeli
- Frame düzeyinde `Fill: color/bg/primary` token ile bağla

---

## 9. İkon & Görsel Rehberi

### 9.1 İkon Seti

**Öncelikli:** [Phosphor Icons](https://phosphoricons.com) — Regular weight  
**Alternatif:** [Tabler Icons](https://tabler-icons.io) — 1.5px stroke

```
Boyutlar    : 16px · 20px · 24px · 32px
Stroke      : 1.5px (default), 2px (vurgulu)
Renk (pasif): #8B9BB4 (mist)
Renk (aktif): #D4763B (copper)
Renk (metin): #EDE9E0 (cream)
```

### 9.2 Figma'ya İkon Aktarımı

1. Phosphor Icons Figma plugin'i yükle
2. Tüm ikonları `Assets / Icons` sayfasına çek
3. Her ikon için 3 renk varyantı: `default` · `active` · `disabled`
4. 24px grid üzerine oturt, 2px padding ile

### 9.3 Fotoğraf Kuralları (Figma için)

Placeholder fotoğraf kullanırken:
- [Unsplash](https://unsplash.com) — `warm`, `portrait`, `hands`, `letters` anahtar kelimeleri
- Renk tonu: sıcak, amber, düşük doygunluk
- Üzerine `rgba(12,21,37,0.30)` overlay ekle (dark mod için)
- Figma Unsplash plugin ile direkt yerleştirilebilir

---

## 10. Figma Dosya Yapısı Önerisi

```
📁 Vasi — Design System
├── 📄 00_Cover
├── 📄 01_Tokens
│   ├── Colors (Variables)
│   ├── Typography (Text Styles)
│   ├── Spacing & Grid
│   └── Shadow & Radius
├── 📄 02_Components
│   ├── Buttons
│   ├── Inputs
│   ├── Cards
│   ├── Navigation
│   ├── Modals
│   ├── Badges & Chips
│   ├── Avatars
│   └── Empty States
└── 📄 03_Assets
    ├── Logo (Dark / Light / Mono)
    └── Icons

📁 Vasi — Web
├── 📄 00_Landing Pages
├── 📄 01_Auth
├── 📄 02_Dashboard
├── 📄 03_Messages
├── 📄 04_Profile & Settings
└── 📄 05_Subscription

📁 Vasi — Mobile (iOS & Android)
├── 📄 00_Onboarding
├── 📄 01_Auth
├── 📄 02_Home
├── 📄 03_Messages
├── 📄 04_Compose (Wizard)
├── 📄 05_Recipients
├── 📄 06_Profile & Settings
└── 📄 07_Subscription
```

### 10.1 Figma Variables Kurulumu (Öneri)

```
Collections:
├── 🎨 Colors
│   ├── Mode: Dark (default)
│   └── Mode: Light
├── 📐 Spacing
│   └── (tek mod — değişmez)
├── 🔠 Typography
│   └── (tek mod — değişmez)
└── 🔄 Radius
    └── (tek mod — değişmez)
```

### 10.2 Naming Convention

| Element | Format | Örnek |
|---|---|---|
| Frame (ekran) | `[platform]/[section]/[screen-name]` | `ios/messages/list` |
| Component | `[ComponentName]/[variant]/[state]` | `Button/Primary/Hover` |
| Layer | `[role]-[description]` | `bg-surface`, `text-heading` |
| Color Style | `[mode]/[category]/[name]` | `dark/text/primary` |

---

*Vasi Design Reference v1.0 · Brand Guideline v2.0 kaynaklı · Mayıs 2026*  
*Bu doküman Brand Guideline ile birlikte okunmalıdır.*
