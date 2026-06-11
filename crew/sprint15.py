"""
Sprint 15 — Buton Sistemi v2 + UI Cilası
=========================================
Referans: DESIGN.md "Buton Sistemi v2" ve "APPLE TASARIM DİLİ v2" bölümleri.
Task 1: globals.css buton sınıfları (hap → yumuşak dikdörtgen)
Task 2: Uygulama içi butonları .btn ailesine geçir
Task 3: Upgrade sayfası — gerçek plan vurgusu + v2 kartlar
Task 4: Boş durum / yükleme kalıbı tutarlılığı
Task 5: Mobil sidebar davranışı
Task 6: Public fiyat endpoint'i (admin ayarları → herkese açık)
Task 7: Landing fiyat kartlarını endpoint'e bağla (admin değişince landing değişir)

Her görevde: 'use client' direktiflerine DOKUNMA, veri mantığını KORU.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Buton CSS'i
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: globals.css buton sınıflarını v2'ye geçir

### Dosya: `vasi-web/src/app/globals.css` (önce oku!)
SADECE .btn-sm, .btn-md, .btn-lg, .btn-secondary tanımlarını aşağıdakiyle değiştir.
.btn taban sınıfına, .btn-primary'ye ve .btn-ghost'a DOKUNMA.

```css
.btn-sm  { height: 32px; padding: 0 12px; font-size: 13px; border-radius: 10px; }
.btn-md  { height: 40px; padding: 0 18px; font-size: 14px; border-radius: 12px; }
.btn-lg  { height: 48px; padding: 0 28px; font-size: 16px; border-radius: 12px; }

.btn-secondary {
  background: rgba(212,118,59,.12); color: var(--copper);
  border: none;
}
.btn-secondary:hover { background: rgba(212,118,59,.2); }
```

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `style(sprint-15): buton sistemi v2 — yumuşak dikdörtgen`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Inline buton temizliği
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Uygulama içi butonları .btn ailesine geçir

DESIGN.md "Buton Sistemi v2" bölümünü oku — kural: inline buton stili YASAK
(ikon butonlar hariç: geri oku, × kaldır, hamburger).

### Dosyalar (her birini önce oku, sonra düzelt)
1. `vasi-web/src/app/(dashboard)/messages/new/page.tsx`:
   ghostBtnStyle sabitini SİL; "← Geri" ve "Hızlı seç" yıl butonları
   `className="btn btn-ghost btn-md"` olsun. "İleri →" / "Gönder ✓" zaten btn-primary — boyutu btn-md yap.
2. `vasi-web/src/app/(dashboard)/dashboard/page.tsx`:
   "Tümünü Gör" butonundaki `style={{ padding: '6px 12px' }}`'i kaldır,
   `className="btn btn-ghost btn-sm"` yap.
3. `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx` ve
   `vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx`:
   style ile boyut/zemin verilmiş tüm <button>'ları uygun .btn üçlüsüne geçir
   (ana aksiyon btn-primary btn-md, ikincil btn-secondary btn-sm, iptal btn-ghost).
4. Admin sayfalarına DOKUNMA (zaten .btn kullanıyor).

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `style(sprint-15): inline buton stilleri .btn ailesine geçirildi`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Upgrade sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Upgrade sayfasını v2 kartlara geçir + gerçek plan vurgusu

### Dosya: `vasi-web/src/app/(dashboard)/upgrade/page.tsx` (önce oku!)
DESIGN.md "Kart Kuralları" + "Buton Sistemi v2" referans.

1. Sayfa başlığı: "Planını Yükselt" (22px/700/-0.01em) + alt metin (mist 15px).
2. `apiFetch('/api/v1/me')` → `data.plan` ile kullanıcının MEVCUT planını bul.
3. 2 plan kartı (Free: 10 mesaj, e-posta teslimat / Personal 49₺/ay: 100 mesaj,
   medya ekleri, SMS+e-posta): mevcut plan kartında "Mevcut Planın" rozeti
   (copper tonlu, radius 6) ve buton disabled "Kullanımda"; diğer kartta
   btn-primary btn-md "Yakında" (İyzico gelene dek disabled + altında
   mist 12px "Ödeme entegrasyonu yakında").
4. Kartlar: radius-card, border-subtle, shadow-card; önerilen kartta copper border.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(sprint-15): upgrade sayfası v2`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Boş durum / yükleme tutarlılığı
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Boş durum ve yükleme kalıplarını tek tipe geçir

### Standart kalıp (DESIGN.md "Boş State" + tipografi)
- Yükleme: `<p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>`
- Boş durum: ortalanmış blok — 40px emoji, 17px/600 cream başlık,
  14px mist alt metin, btn-primary btn-md CTA.

### Dosyalar (önce oku; kalıba uymayanı düzelt, uyanı OLDUĞU GİBİ BIRAK)
1. `vasi-web/src/app/(dashboard)/messages/page.tsx`
2. `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx` (yükleme + "bulunamadı" durumu)
3. `vasi-web/src/app/admin/users/page.tsx` ("Kullanıcı bulunamadı" boş durumu)
4. `vasi-web/src/app/admin/reports/page.tsx`

Veri mantığına ve state'lere DOKUNMA — sadece görsel kalıp.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `style(sprint-15): boş durum ve yükleme kalıbı birleştirildi`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 5: Mobil sidebar
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Mobilde sidebar davranışı — 768px altı

### Dosya: `vasi-web/src/app/(dashboard)/layout.tsx` (önce oku!)
'use client' ve /me veri mantığına DOKUNMA. Adımlar:

1. State ekle: `const [menuOpen, setMenuOpen] = useState(false)`
2. <aside>'a className="app-sidebar" ekle; menuOpen true iken ek olarak "open".
3. Sidebar'ın HEMEN ÖNÜNE mobil üst bar ekle:
```tsx
<header className="mobile-topbar">
  <button onClick={() => setMenuOpen(v => !v)} aria-label="Menü"
    style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '22px', cursor: 'pointer' }}>☰</button>
  <VasiLogo height={26} />
</header>
```
4. Nav linklerine tıklanınca `setMenuOpen(false)`.
5. `vasi-web/src/app/globals.css` SONUNA ekle:
```css
.mobile-topbar { display: none; }
@media (max-width: 768px) {
  .mobile-topbar {
    display: flex; align-items: center; gap: 14px;
    position: fixed; top: 0; left: 0; right: 0; height: 56px;
    padding: 0 16px; z-index: 90;
    background: var(--glass-bg);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: var(--border-subtle);
  }
  .app-sidebar {
    position: fixed; top: 56px; left: 0; bottom: 0; z-index: 80;
    transform: translateX(-100%);
    transition: transform var(--dur) var(--ease);
  }
  .app-sidebar.open { transform: translateX(0); }
  .app-main { padding-top: 72px !important; }
}
```
6. <main>'e className="app-main" ekle.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(sprint-15): mobil sidebar — üst bar + açılır menü`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 6: Public fiyat endpoint'i
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: Herkese açık fiyat endpoint'i — GET /api/v1/public/pricing

### Yeni dosya: `vasi-api/src/routes/public.ts`
Önce `vasi-api/src/routes/me.ts`'i oku, aynı kalıbı kullan ama
authMiddleware KULLANMA — bu endpoint herkese açık (landing page çağıracak).

```ts
import { Hono } from 'hono'
import type { Env } from '../types'

const pub = new Hono<{ Bindings: Env }>()

pub.get('/pricing', async (c) => {
  const result = await c.env.DB.prepare(
    `SELECT key, value FROM admin_settings WHERE key IN
     ('plan_limit_free','plan_limit_personal','recipient_limit_free',
      'recipient_limit_personal','price_personal_monthly','price_family_monthly')`
  ).all()
  const pricing: Record<string, string> = {}
  for (const row of (result.results ?? []) as Array<{ key: string; value: string }>) {
    pricing[row.key] = row.value
  }
  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ pricing })
})

export { pub as publicRoutes }
```

### Kayıt: `vasi-api/src/index.ts` (önce oku!)
Import ekle ve auth OLMADAN mount et:
```ts
app.route('/api/v1/public', publicRoutes)
```

### Doğrulama
run_tsc() temizse commit at.
Commit: `feat(sprint-15): public pricing endpoint`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 7: Landing ↔ admin fiyat senkronu
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Landing fiyat kartlarını /api/v1/public/pricing'e bağla

### Dosya: `vasi-web/src/app/page.tsx` (önce SADECE fiyatlandırma bölümünü ve
LANGS'taki plan_* anahtarlarını oku — dosya büyük, tamamını okumaya çalışma!)

1. Component'e state + fetch ekle:
```ts
const [pricing, setPricing] = useState<Record<string, string>>({})
useEffect(() => {
  fetch('/api/v1/public/pricing')
    .then(r => r.json())
    .then(d => setPricing(d.pricing ?? {}))
    .catch(() => {})
}, [])
```
2. Plan kartlarındaki RAKAMLARI pricing'den göster (yoksa mevcut sabit değer fallback):
   - Personal kart fiyatı: `pricing.price_personal_monthly ?? '49'`
   - Family kart fiyatı: `pricing.price_family_monthly ?? '99'`
   - Free/Premium fiyatları sabit kalır.
3. Mesaj limiti metinleri: plan_free_f1 ve plan_personal_f1 string'lerinin
   BAŞINDAKİ sayıyı dinamik değiştir:
```ts
const withLimit = (text: string, limit?: string) =>
  limit ? text.replace(/^[\\d.,]+/, limit) : text
// kullanım: withLimit(t.plan_free_f1, pricing.plan_limit_free)
```
4. plan_per değerini TÜM dillerde aylığa çevir (admin fiyatları aylık):
   tr '/ay', en '/mo', de '/Monat', fr '/mois', ar '/شهريًا'.
5. Başka HİÇBİR metni/bölümü değiştirme.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(sprint-15): landing fiyatları admin ayarlarıyla senkron`
""",
    ),
]
