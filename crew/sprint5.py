"""
Sprint 5 — Auth & Dashboard Tasarımı (UX/UI Ajani)
====================================================
Görev: Auth ve dashboard sayfalarını landing page ile aynı
tasarım diline ve komponentlerine kavuştur.
"""

tasks = [
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Auth & Dashboard Sayfalarını Tasarla

### ADIM 1 — ÖNCE OKU, SONRA YAZ (zorunlu)

Yazmaya başlamadan önce şu dosyaları oku ve içselleştir:

```python
read_file("vasi-web/src/app/page.tsx")          # referans tasarım
read_file("vasi-web/src/app/globals.css")        # tüm CSS class'ları ve değişkenler
read_file("vasi-web/src/app/(auth)/layout.tsx")  # mevcut auth layout
read_file("vasi-web/src/app/(auth)/login/page.tsx")
read_file("vasi-web/src/app/(auth)/register/page.tsx")
read_file("vasi-web/src/app/(auth)/verify-email/page.tsx")
read_file("vasi-web/src/app/(dashboard)/layout.tsx")
read_file("vasi-web/src/app/(dashboard)/dashboard/page.tsx")
```

**page.tsx'ten çıkarman gereken pattern'ler:**
- VasiLogo SVG komponenti (viewBox, path'ler, renkler)
- Navbar'daki `.btn .btn-ghost .btn-md` ve `.btn .btn-primary .btn-md` kullanımı
- Input'larda kullanılan inline style pattern'i
- Renk değişkenlerinin nasıl kullanıldığı (var(--copper) vb.)
- globals.css'deki `.btn`, `.btn-primary`, `.btn-lg` class tanımları

---

### ADIM 2 — SHARED COMPONENT

`vasi-web/src/components/VasiLogo.tsx` oluştur.
- page.tsx'teki VasiLogo SVG'sini buraya taşı (path'leri birebir kopyala)
- Props: `interface VasiLogoProps {{ height?: number }}` (default: 40)
- Named export: `export const VasiLogo`

---

### ADIM 3 — AUTH LAYOUT (`(auth)/layout.tsx`)

Mevcut dosyayı tamamen yeniden yaz:
- Tam ekran, dikey ortalanmış (`min-height: 100vh`, flexbox center)
- Arka plan: `var(--obsidian)`
- Kart: `var(--midnight)` bg, `1px solid var(--horizon)` border, `border-radius: 16px`, `padding: 40px`
- Kart max-width: 440px, width: 100%
- Üstte logo bölümü: VasiLogo + "Vasi" wordmark, merkez hizalı, `/` linkine sarılı
- Logonun altında hafif separator (margin)
- `export const runtime = 'edge'` zorunlu

---

### ADIM 4 — LOGIN SAYFASI (`(auth)/login/page.tsx`)

Mevcut mantığı (apiFetch, router.push, localStorage) koru, sadece görsel güncelle:

**Form inputları için style:**
```
background: var(--midnight)
border: 1px solid var(--horizon)
color: var(--cream)
border-radius: 8px
padding: 10px 14px
width: 100%
font-size: 14px
outline: none
transition: border-color 0.2s
```
Focus state için `onFocus`/`onBlur` ile border'ı `var(--copper)` yap.

**Buton:** `className="btn btn-primary btn-lg"` + `style={{width:'100%'}}`

**Error state:** `const [error, setError] = useState('')`
- try/catch'te `setError(...)` ile mesajı kaydet
- Form altında kırmızı (#EF4444) küçük metin olarak göster

**Label'lar:** `var(--mist)` renk, `font-size: 13px`, `font-weight: 500`

**Alt linkler:**
- "Şifremi unuttum" → `var(--mist)` renk
- "Hesabınız yok mu? Kayıt ol" → `var(--copper)` renk, `href="/register"`

---

### ADIM 5 — REGISTER SAYFASI (`(auth)/register/page.tsx`)

Mevcut dosyayı oku. Alanlar: ad, soyad, e-posta, şifre.
Login ile birebir aynı form stil'i uygula.
- Error state ekle
- Loading state: submit sırasında buton disabled + "Kaydediliyor..."
- Alt link: "Zaten hesabınız var mı? Giriş yapın" → `/login`, `var(--copper)`

---

### ADIM 6 — VERIFY EMAIL SAYFASI (`(auth)/verify-email/page.tsx`)

Mevcut dosyayı oku. Aynı form stili.
- Açıklama metni: "E-postanıza gönderilen kodu girin"
- Tek OTP input veya 6 ayrı input (hangisi mevcutsa koru)
- Başarı durumunda: yeşil mesaj + /login yönlendirmesi

---

### ADIM 7 — DASHBOARD LAYOUT (`(dashboard)/layout.tsx`)

Mevcut mantığı (auth check, router.push('/login'), localStorage) koru:

**Sidebar (sol):**
- `width: 240px`, `min-height: 100vh`
- `background: var(--midnight)`, `border-right: 1px solid var(--horizon)`
- `padding: 24px 16px`
- Üstte: VasiLogo (height=32) + "Vasi" wordmark — `/dashboard` linkine sarılı
- Logo altında `margin-bottom: 32px`

**Nav linkleri:**
```
display: block
padding: 10px 12px
border-radius: 8px
color: var(--mist)
text-decoration: none
font-size: 14px
font-weight: 500
transition: all 0.2s
```
Hover: `background: var(--horizon)`, `color: var(--cream)`
Aktif link (usePathname ile kontrol): `color: var(--copper)`, `border-left: 3px solid var(--copper)`, `padding-left: 9px`

**Çıkış butonu:** Sidebar en altında, `var(--mist)` renk

**Main içerik:**
- `flex: 1`, `background: var(--obsidian)`, `padding: 32px`, `min-height: 100vh`

**usePathname import:** `import {{ usePathname }} from 'next/navigation'`

---

### ADIM 8 — DASHBOARD SAYFA (`(dashboard)/dashboard/page.tsx`)

**Sayfa başlığı:**
- `font-size: 24px`, `font-weight: 700`, `color: var(--cream)`, `margin-bottom: 24px`

**"Yeni Mesaj Yaz" butonu:**
- `className="btn btn-primary btn-md"` — full-width değil, sağa hizalı veya başlıkla yan yana

**Mesaj kartları:**
- `background: var(--midnight)`, `border: 1px solid var(--horizon)`
- `border-radius: 12px`, `padding: 20px`, `margin-bottom: 12px`
- Başlık: `var(--cream)`, Status badge: duruma göre renk
  - draft → `var(--mist)`
  - scheduled → `var(--copper)`
  - delivered → `#22C55E`

**Boş state (mesaj yokken):**
```tsx
<div style={{textAlign:'center', padding:'64px 0'}}>
  <div style={{fontSize:'48px', marginBottom:'16px'}}>✉️</div>
  <p style={{color:'var(--mist)', marginBottom:'24px'}}>Henüz hiç mesajın yok</p>
  <button onClick={() => router.push('/messages/new')} className="btn btn-primary btn-md">
    İlk Mesajını Yaz
  </button>
</div>
```

**Skeleton loading (messages yüklenirken):**
`const [loading, setLoading] = useState(true)` — fetch başlamadan önce true, bitince false.
Loading=true iken 3 adet gri animasyonlu skeleton kart göster.

---

### ADIM 9 — BUILD & COMMIT

Her dosyayı yazdıktan sonra:
```python
bash(f"cd {ROOT}/vasi-web && ./node_modules/.bin/tsc --noEmit 2>&1")
```

Tüm dosyalar temiz olunca:
```python
git_commit("feat(sprint-5): UX/UI ajani - auth ve dashboard tasarimi")
```

---

### KESİN KURALLAR (ihlal etme)
1. `export const runtime = 'edge'` — her .tsx dosyasında ZORUNLU
2. `bg-Copper`, `text-Cream`, `bg-Obsidian` gibi Tailwind renk class'ları ÇALIŞMIYOR — kullanma
3. Renkleri sadece `style={{color: 'var(--cream)'}}` veya globals.css class'larıyla ver
4. `.btn .btn-primary .btn-lg` gibi class'lar globals.css'de tanımlı — `className` ile kullan
5. Mevcut iş mantığını (API çağrıları, state, routing) bozmadan sadece görsel güncelle
6. Her dosyayı yazmadan önce `read_file` ile mevcut halini oku
""",
    ),
]
