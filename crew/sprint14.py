"""
Sprint 14 — Admin Panel UI (6 UX/UI Task)
==========================================
Sprint 13'ün admin API'sinin üstüne arayüz. Tasarım referansı:
DESIGN.md "APPLE TASARIM DİLİ v2" — her görevde oku.

Genel kurallar (her görev için):
- Her sayfanın İLK SATIRI 'use client'; olacak — SİLME, yoksa EKLE.
- export const runtime = 'edge' zorunlu.
- Admin sayfaları kullanıcı sayfalarından bağımsız: /admin/* altında yaşar.
- Admin istekleri adminFetch ile yapılır (Task 1'de tanımlanır), apiFetch ile DEĞİL.
"""

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: adminFetch + login sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: adminFetch yardımcısı + /admin/login sayfası

### A) `vasi-web/src/lib/api.ts` (önce oku!)
Mevcut apiFetch'e DOKUNMA. Altına aynı kalıpla `adminFetch` ekle —
tek fark: token'ı `localStorage.getItem('adminToken')`'dan okur.

### B) Yeni dosya: `vasi-web/src/app/admin/login/page.tsx`
DESIGN.md "Form Kuralları" + "Tipografi" ile, ortalanmış tek kart:
- Başlık: "Yönetici Girişi" (22px/700/-0.01em), üstünde VasiLogo (height 36).
- E-posta + şifre inputları (44px, radius-input, focus ring), "Giriş Yap" btn btn-primary.
- Submit: `fetch('/api/v1/admin/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password}) })`
  Yanıt şeması: `{ accessToken: string, role: 'admin' }` — DİKKAT: alan adı `accessToken`.
  Başarıda: `localStorage.setItem('adminToken', data.accessToken)` → `router.push('/admin')`.
  Hata yanıtı: `{ error: string }` → kırmızı (#EF4444) 13px metin.
- Loading durumunda buton "Giriş yapılıyor...".

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): adminFetch + login sayfası`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 2: Admin layout (guard + sidebar)
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: Admin layout — token guard + buzlu cam sidebar

### Yeni dosya: `vasi-web/src/app/admin/layout.tsx`
Önce `vasi-web/src/app/(dashboard)/layout.tsx`'i OKU — sidebar iskeletini
ve DESIGN.md "Sidebar Kuralları"nı (glass-bg, pill aktif item) aynen uygula.

### Davranış
```ts
const pathname = usePathname()
const isLogin = pathname === '/admin/login'
useEffect(() => {
  if (!isLogin && !localStorage.getItem('adminToken')) router.push('/admin/login')
}, [pathname])
if (isLogin) return <>{children}</>
```

### Sidebar içeriği
- Üstte VasiLogo + "Vasi Admin" yazısı (cream, 15px/600) + copper "ADMIN" mini rozeti
  (11px, uppercase, copper bg %12, copper metin, radius 6, padding 2px 8px).
- Nav: Genel Bakış → /admin, Kullanıcılar → /admin/users,
  Raporlar → /admin/reports, Ayarlar → /admin/settings.
- Altta "Çıkış Yap": `localStorage.removeItem('adminToken')` → `/admin/login`.
- Ana içerik: `<main style={{ flex: 1, padding: '32px' }}>{children}</main>`.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): layout — guard + sidebar`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 3: Genel bakış sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: /admin genel bakış — istatistik kartları

### Yeni dosya: `vasi-web/src/app/admin/page.tsx`
Kart stili için `vasi-web/src/app/(dashboard)/dashboard/page.tsx`'teki
istatistik kartlarını ve DESIGN.md "Kart Kuralları"nı referans al.

### Veri
- `adminFetch('/api/v1/admin/stats/overview')` →
  `{ total_users, active_users, paid_subs, total_delivered, total_failed, messages_today, delivery_rate_pct }`
- `adminFetch('/api/v1/admin/stats/plans')` → `{ plans: [{ plan_type, user_count }] }`

### Görünüm
1. Başlık: "Genel Bakış" (22px/700/-0.01em).
2. 6 istatistik kartı (grid, minmax 200px): Toplam Kullanıcı, Aktif Kullanıcı,
   Ücretli Abone, Teslim Edilen, Başarısız, Bugünkü Mesaj.
   Sayı 32px/700 cream; etiket caption stili. total_failed > 0 ise sayı #EF4444.
3. "Teslimat Oranı" kartı: `delivery_rate_pct ?? 0`% — copper, 32px/700.
4. "Plan Dağılımı" bölümü (17px/600 başlık): her plan bir satır —
   plan adı + kullanıcı sayısı + toplam içindeki yüzdeyi gösteren copper progress bar.
5. Yüklenirken "Yükleniyor..." (mist); adminFetch hata verirse "Veriler alınamadı" (kırmızı).

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): genel bakış sayfası`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 4: Kullanıcılar sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: /admin/users — kullanıcı tablosu + aksiyonlar

### Yeni dosya: `vasi-web/src/app/admin/users/page.tsx`

### Veri
`adminFetch('/api/v1/admin/users?page=1&limit=20&q=...')` →
`{ users: [{ id, email, first_name, last_name, status, email_verified, is_admin,
   created_at, plan_type, message_count }], total, page, limit }`

### Görünüm
1. Başlık "Kullanıcılar" + sağda arama inputu (yazdıkça 400ms debounce ile q paramı).
2. Tablo (midnight kart içinde, DESIGN.md kart stili):
   Sütunlar: Ad Soyad, E-posta, Plan, Durum, Mesaj, Kayıt Tarihi, İşlem.
   - Durum badge'i: active → yeşil (#22C55E %15 bg), suspended → kırmızı (#EF4444 %15 bg).
   - Plan: free → mist, diğer → copper.
3. İşlem sütunu:
   - "Askıya Al" / "Aktifleştir" butonu (btn btn-secondary btn-sm):
     `adminFetch('/api/v1/admin/users/' + id + '/status', { method:'PATCH', body: JSON.stringify({ status: yeniDurum }) })`
     (yeniDurum: 'suspended' veya 'active') → başarıda listedeki satırı güncelle.
   - Plan <select> (free/personal): değişince
     `adminFetch('/api/v1/admin/users/' + id + '/plan', { method:'PATCH', body: JSON.stringify({ plan_type: secilen }) })`
4. Altta "Önceki / Sonraki" sayfalama (total/limit'e göre, pasifken opacity .5).

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): kullanıcı tablosu`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 5: Raporlar sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: /admin/reports — gelir + başarısız teslimatlar

### Yeni dosya: `vasi-web/src/app/admin/reports/page.tsx`

### Veri
- `adminFetch('/api/v1/admin/reports/revenue')` →
  `{ breakdown: [{ plan_type, subscriber_count, unit_price, monthly_revenue }], total_monthly_revenue }`
- `adminFetch('/api/v1/admin/reports/failed-deliveries?page=1&limit=30')` →
  `{ data: [{ message_id, title, status, updated_at, user_email, first_name, last_name, recipient_count }], total, page, limit }`

### Görünüm
1. Başlık "Raporlar".
2. "Aylık Gelir (Tahmini)" kartı: büyük rakam `total_monthly_revenue ₺` (32px/700 copper);
   altında plan bazlı satırlar: plan + abone sayısı + birim fiyat + aylık tutar.
3. "Başarısız Teslimatlar" bölümü: tablo — Mesaj Başlığı, Kullanıcı (ad + e-posta),
   Alıcı Sayısı, Tarih. `total` 0 ise yeşil "✓ Başarısız teslimat yok" boş durumu.
4. Yüklenme/hata durumları Task 3'teki kalıpla.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): raporlar sayfası`
""",
    ),

    # ─────────────────────────────────────────────────────────────────────────
    # Task 6: Ayarlar sayfası
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="UX/UI Ajani",
        description="""
## Görev: /admin/settings — ayar formu

### Yeni dosya: `vasi-web/src/app/admin/settings/page.tsx`

### Veri
- `adminFetch('/api/v1/admin/settings')` → `{ settings: { [key]: value } }`
  Beklenen anahtarlar: plan_limit_free, plan_limit_personal, plan_limit_unlimited,
  recipient_limit_free, recipient_limit_personal, price_personal_monthly, price_family_monthly.
- Kaydet (anahtar başına): `adminFetch('/api/v1/admin/settings', { method:'PUT', body: JSON.stringify({ key, value }) })`

### Görünüm
1. Başlık "Ayarlar".
2. İki bölüm kartı (17px/600 bölüm başlıkları): "Plan Limitleri" (limit anahtarları)
   ve "Fiyatlandırma (₺/ay)" (price anahtarları).
3. Her ayar bir satır: sol tarafta Türkçe etiket (örn. plan_limit_free → "Ücretsiz Plan
   Mesaj Limiti"), sağda number input (DESIGN.md input stili, width 120px) + "Kaydet"
   butonu (btn btn-secondary btn-sm) — sadece değer değiştiyse aktif.
4. Kaydet başarılı: satır yanında 2 sn yeşil "✓ Kaydedildi"; hata: kırmızı mesaj.

### Doğrulama
run_tsc() + check_css() temizse commit at.
Commit: `feat(admin-ui): ayarlar sayfası`
""",
    ),
]


CLOSED = True  # sprint kapandı — tekrar koşturulamaz
