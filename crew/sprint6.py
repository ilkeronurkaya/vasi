"""
Sprint 6 — Mesaj Akışı UX/UI (UX/UI Ajani)
============================================
Görev: Yeni mesaj formu, mesaj detay sayfası ve zamanlama
sayfasını design system'e uygun şekilde tasarla.
"""

tasks = [
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Mesaj Akışı Sayfalarını Tasarla

Bu sprint'te mesaj oluşturma, görüntüleme ve zamanlama sayfaları tasarlanacak.

---

### ADIM 1 — ÖNCE OKU (zorunlu)

Yazmaya başlamadan önce şu dosyaları oku:

```python
read_file("vasi-web/src/app/globals.css")
read_file("vasi-web/src/app/(dashboard)/layout.tsx")       # referans: sidebar stili
read_file("vasi-web/src/app/(auth)/login/page.tsx")        # referans: form stili
read_file("vasi-web/src/app/(dashboard)/dashboard/page.tsx")
read_file("vasi-web/src/app/(dashboard)/messages/new/page.tsx")
read_file("vasi-web/src/app/(dashboard)/messages/[id]/page.tsx")
read_file("vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx")
```

**Bunları özellikle not al:**
- login/page.tsx'teki `inputStyle` ve `labelStyle` pattern'i → aynısını kullan
- dashboard/page.tsx'teki kart stili → mesaj listesinde aynısı
- globals.css'deki `.btn`, `.btn-primary`, `.btn-lg` class'ları

---

### KESİN KURALLAR

1. `bg-Copper`, `text-Cream`, `bg-Midnight`, `border-Horizon` gibi Tailwind custom class'ları ÇALIŞMIYOR, kullanma.
2. Renkleri SADECE `style={{color: 'var(--copper)'}}` formatında ver.
3. `className` ile sadece globals.css'de tanımlı class'ları kullan: `btn`, `btn-primary`, `btn-lg`, `btn-ghost` vb.
4. `export const runtime = 'edge'` her dosyada ZORUNLU.
5. API çağrıları, state yönetimi, routing mantığını BOZMA — sadece görsel güncelle.
6. Her dosyayı yazmadan ÖNCE `read_file` ile oku.

---

### Ortak stil sabitleri (her sayfada kullan)

```typescript
const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: '8px',
    color: 'var(--cream)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginTop: '6px',
    boxSizing: 'border-box' as const,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
};
```

Focus state: `onFocus`/`onBlur` ile `borderColor: 'var(--copper)'` yap.

---

### ADIM 2 — YENİ MESAJ FORMU (`messages/new/page.tsx`)

**Sayfa yapısı:**
- Sol üstte geri butonu (← simgesi) + sayfa başlığı "Yeni Mesaj"
- Form bir kart içinde: `background: var(--midnight)`, `border: 1px solid var(--horizon)`, `border-radius: 12px`, `padding: 28px`
- `max-width: 640px`

**Form alanları:**
- Başlık: text input, placeholder: "Mesajınıza bir başlık verin"
- İçerik: textarea, rows=6, `resize: vertical`, placeholder: "Sevdiklerinize bırakmak istediğiniz mesajı yazın..."
- Mesaj Türü: select — Metin / Fotoğraf / Ses / Karışık

**Kaydet butonu:**
- `className="btn btn-primary btn-lg"` full-width
- Loading: `disabled` + "Kaydediliyor..."
- Hata: kırmızı (#EF4444) metin

**Route fix:** Kayıt sonrası `router.push(`/messages/${response.id}`)` (dashboard/ prefix'i YOK)

---

### ADIM 3 — MESAJ DETAY (`messages/[id]/page.tsx`)

**Sayfa yapısı:** `max-width: 680px`

**Header bölümü:**
- Geri butonu (← simgesi, `/dashboard`'a döner)
- Mesaj başlığı + durum badge'i
- Sağda aksiyon butonları: "Zamanla" (sadece draft iken, `.btn .btn-primary`) + "Sil" (kırmızı outline)

**İçerik kartı:**
- `background: var(--midnight)`, border, radius 12px
- "MESAJ İÇERİĞİ" üst etiketi: `var(--mist)`, uppercase, küçük font
- İçerik metni: `var(--cream)`, `line-height: 1.7`, `white-space: pre-wrap`

**Alıcılar kartı:**
- Ayrı bir kart (aynı midnight/border stili)
- "ALICILAR (N)" başlığı
- Her alıcı: obsidian bg satır, isim + email, sağda "Kaldır" butonu (kırmızı)
- Alıcı ekleme formu: ad + email yan yana, "+ Alıcı Ekle" butonu

**Route fix:**
- Zamanlama: `router.push(`/messages/${params.id}/schedule`)` (dashboard/ YOK)
- Düzenleme: `router.push(`/messages/${params.id}/edit`)` (dashboard/ YOK)
- Silme sonrası: `router.push('/dashboard')` (bu doğru, kalsın)

**Loading state:** Mesaj yüklenmeden önce merkezi "Yükleniyor..." metni.

---

### ADIM 4 — ZAMANLAMA (`messages/[id]/schedule/page.tsx`)

**Sayfa yapısı:** `max-width: 480px`

**Header:** Geri butonu + "Mesajı Zamanla" başlığı

**Kart içeriği:**
- Mesaj başlığı özeti: obsidian bg küçük bilgi kutusu
- `datetime-local` input — `min` özelliği: şu anki zaman (`new Date().toISOString().slice(0, 16)`)
- "Zamanla" butonu `.btn .btn-primary .btn-lg` full-width

**Route fix:** Başarı sonrası `router.push(`/messages/${params.id}`)` (dashboard/ YOK)

---

### ADIM 5 — BUILD & COMMIT

Her dosyadan sonra TypeScript kontrolü:
```python
bash(f"cd {ROOT}/vasi-web && ./node_modules/.bin/tsc --noEmit 2>&1")
```

Temizse commit:
```python
git_commit("feat(sprint-6): UX/UI - mesaj akisi tasarimi")
```
""",
    ),
]
