"""
Sprint 10 — Apple Tasarım Dili
===============================
DESIGN.md'deki "APPLE TASARIM DİLİ v2" bölümü bu sprintin tek referansıdır.
Task 1: globals.css yeni tokenler
Task 2: Sidebar — buzlu cam restyle
Task 3: Wizard formu — Apple form kuralları
Task 4: Auth formları (login + register)
Task 5: Dashboard + /messages kartları

Kural: Görevler kısa — tüm tasarım detayı DESIGN.md v2 bölümünde.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Tokenler
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: globals.css'e Apple v2 tokenlerini ekle

### Dosya: `vasi-web/src/app/globals.css` (önce oku!)
Mevcut hiçbir kuralı SİLME. `:root` bloğuna DESIGN.md "Yeni CSS Tokenleri"
tablosundaki 8 tokeni ekle: --radius-card, --radius-input, --border-subtle,
--shadow-card, --glass-bg, --focus-ring, --dur, --ease. Değerleri tablodan al.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Sidebar
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Sidebar'ı buzlu cam stile geçir

### Dosya: `vasi-web/src/app/(dashboard)/layout.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA. Veri mantığını (apiFetch /me,
state) AYNEN koru. Sadece görsel stilleri DESIGN.md "Sidebar Kuralları" ve
"Kart Kuralları" bölümlerine göre güncelle:

1. <aside> stilini sidebarStyle örneğindeki gibi yap (glass-bg + backdropFilter + border-subtle).
2. Aktif nav item: borderLeft çizgisini KALDIR, yumuşak pill stiline geçir
   (DESIGN.md'deki aktif/pasif/hover değerleri birebir).
3. Limit bar ve abonelik badge köşelerini --radius-input ile yumuşat.
4. Tüm geçişlerde --dur ve --ease tokenlerini kullan; `transition: 'all ...'` yazma.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Wizard formu
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Wizard formunu Apple form kurallarına geçir

### Dosya: `vasi-web/src/app/(dashboard)/messages/new/page.tsx` (önce oku!)
İlk satırdaki `'use client';` direktifine DOKUNMA. Wizard akışını, state'i ve
API çağrılarını AYNEN koru. Sadece stilleri DESIGN.md "Form Kuralları",
"Kart Kuralları" ve "Tipografi" bölümlerine göre güncelle:

1. inputStyle/labelStyle sabitlerini DESIGN.md'deki örneklerle değiştir.
2. Focus: 2px border yerine 1px copper border + boxShadow var(--focus-ring).
3. Adım kartını cardStyle örneğine geçir (radius-card, border-subtle, shadow-card).
4. Başlıklara tipografi tablosundaki boyut/ağırlık/letterSpacing değerlerini uygula.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Auth formları
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Login ve Register formlarını Apple form kurallarına geçir

### Dosyalar (ikisini de önce oku!)
- `vasi-web/src/app/(auth)/login/page.tsx`
- `vasi-web/src/app/(auth)/register/page.tsx`

Her dosyada `'use client';` ilk satırsa DOKUNMA, yoksa EKLE.
Form mantığını (state, submit, hata) AYNEN koru. Sadece stiller:

1. Input/label'ları DESIGN.md "Form Kuralları" örneklerine geçir
   (44px min yükseklik, radius-input, focus ring, label üstte).
2. Form kartını "Kart Kuralları" stiline geçir.
3. Başlık tipografisi: sayfa başlığı 22px/700/-0.01em.
4. Geçişlerde --dur/--ease; `transition: 'all'` yazma.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 5: Kartlar (dashboard + messages)
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Dashboard ve mesaj listesi kartlarını Apple kart stiline geçir

### Dosyalar (ikisini de önce oku!)
- `vasi-web/src/app/(dashboard)/dashboard/page.tsx`
- `vasi-web/src/app/(dashboard)/messages/page.tsx` (varsa; yoksa atla)

`'use client';` direktiflerine ve veri mantığına DOKUNMA. Sadece stiller,
DESIGN.md "Kart Kuralları" + "Tipografi" bölümlerine göre:

1. İstatistik kartları: radius-card, border-subtle, shadow-card; sayı 32px/700,
   etiket caption stili (11px/500/uppercase/0.06em).
2. Mesaj kartları: tıklanabilir kart hover'ı (scale 1.02 + copper border) —
   onMouseEnter/Leave ile transform; transition'da özellik adlarını yaz.
3. Sayfa başlıkları: 22px/700/-0.01em; bölüm başlıkları 17px/600.

### Doğrulama
run_tsc() + check_css() temizse commit at.
""",
    ),
]
