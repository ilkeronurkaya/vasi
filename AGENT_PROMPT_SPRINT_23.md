# OpenHands Ajan Promtu — Sprint 23 (Hızlı Kazanımlar)

> Bunu OpenHands'te YENİ bir konuşmaya yapıştır. Repo kökü `/workspace`. Model: yerel Qwen3.6-35B-A3B (LM Studio).

---

Sen bu sprint'te YALNIZCA kod ve test yazıyorsun. **Branch açma, commit, merge, push YAPMA.** Git'e hiç dokunma. Sadece çalışma ağacında (`/workspace`) dosyaları düzenle. Bitince bana (1) değiştirdiğin/eklediğin dosyaların listesini ve (2) `git status` çıktısını ver. İlk iş: `/workspace/AGENTS.md`'yi oku ve kurallarına uy (kod+test aynı değişiklikte; şema değişikliği = yeni migration; mevcut testleri SİLME/ZAYIFLATMA).

Bu sprint küçük, net 5 düzeltmedir. Her madde için SADECE belirtilen dosya ve satırlara dokun; başka bir şeyi refactor etme, davranış değiştirme.

## ⛔ ÇALIŞMA KURALLARI (İHLAL = BAŞARISIZ)

**1. Dosyaları KENDİN oku.** Düzenleyeceğin her dosyayı önce kendi araçlarınla `/workspace`'ten OKU. **Bana asla dosya içeriği / "context dump" yapıştırmamı isteme.** Dosyaya erişemiyorsan tam yolunu söyle ve dur — uydurma içerikle çalışma.

**2. Halüsinasyon YASAK.** Görmediğin bir dosya/satır/fonksiyon hakkında varsayımda bulunma. Bir testi/komutu KOŞMADIYSAN "koştum/geçti" DEME. "Çalışır / hazır / tamamlandı" diye yazmadan önce gerçekten yaptığından emin ol. Yanlış/uydurma rapor, hatalı koddan daha kötüdür.

**3. EMİN DEĞİLSEN YAPMA — BİZE GEL.** Bir maddenin nasıl yapılacağından, bir dosyanın içeriğinden, bir değişikliğin doğru olup olmadığından ya da promtun bir kısmından emin değilsen: **DUR, ne konuda kararsız olduğunu net yaz ve sor.** Tahminle ilerleme. Kararsızlıkları iko + Claude çözer — senin işin emin olduğun, tarif edilen değişiklikleri yapmak.

**4. Kapsam kilidi.** Sadece aşağıdaki 5 maddenin tarif ettiği dosya/satırlara dokun. Promtta olmayan hiçbir şeyi "iyileştirme/düzeltme" adına değiştirme. Beklenen çıktı: `migrations/0016_...` + 4 web dosyası, başka HİÇBİR dosya değişmemeli.

Emin olduğun maddeleri yap, emin olmadıklarını listele — yarısını yapıp sorman, hepsini tahminle yapmandan iyidir.

## M1 — Admin login düzeltmesi (migration)
Sorun: hiçbir migration `is_admin=1` atamıyor → `test@vasi.app` admin değil → admin login 403.
Yeni dosya **`migrations/0016_set_admin_flag.sql`** (KÖK `migrations/` dizini — `vasi-api/migrations/` DEĞİL):
```sql
-- Migration: 0016_set_admin_flag
-- Açıklama: test@vasi.app'i admin yap (is_admin migration'da set edilmiyordu — admin login 403)
UPDATE users SET is_admin = 1 WHERE email = 'test@vasi.app';
```
Başka migration ekleme/değiştirme yok. `crew/tests/api_smoke.py` içindeki elle `UPDATE users SET is_admin=1 ...` satırı (kurulum kısmı) artık migration sayesinde gereksiz; OLDUĞU GİBİ BIRAK (silme, smoke'u bozma).

## M2 — Sol-alttaki "N" dev göstergesini kaldır
**`vasi-web/next.config.ts`**: mevcut `nextConfig` nesnesine `devIndicators: false` ekle. Mevcut `rewrites()` fonksiyonunu OLDUĞU GİBİ KORU. Sonuç:
```ts
const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() { /* mevcut içerik aynen */ },
}
```

## M3 — Login/Kayıt CTA metinlerini bold yap
İki `<a>` linkinin inline stiline `fontWeight: 700` ekle (başka stil değişikliği yok):
- **`vasi-web/src/app/(auth)/login/page.tsx`** ~satır 142: `<a href="/register" style={{ fontSize: '13px', color: 'var(--copper)', textDecoration: 'none' }}>` → style'a `fontWeight: 700` ekle.
- **`vasi-web/src/app/(auth)/register/page.tsx`** ~satır 142: `<a href="/login" style={{ fontSize: '13px', color: 'var(--copper)', textDecoration: 'none' }}>` → style'a `fontWeight: 700` ekle.

## M4 — Mesaj sihirbazı son tuş "Gönder" → "Oluştur"
**`vasi-web/src/app/(dashboard)/messages/new/page.tsx`** — sadece şu üç metin (davranış/`handleSubmit` DEĞİŞMEZ):
- ~satır 9: `const STEPS = ['İçerik', 'Alıcılar', 'Zamanlama', 'Önizleme', 'Gönder'];` → son eleman `'Oluştur'`.
- ~satır 394: buton içeriği `Gönder ✓` → `Oluştur ✓`.
- ~satır 362: `Gönderiliyor...` → `Oluşturuluyor...`.
(Not: `:358` yorum satırı `{/* Adım 5: Gönder */}` ve diğer "Gönderildi"/"Gönderim tarihi" metinleri AYNEN KALIR — onlara dokunma.)

## M5 — Mesaj hakkı sayacını rakamla göster (5/100)
**`vasi-web/src/app/(dashboard)/layout.tsx`** ~satır 183-194, "Limit Progress Bar" bloğu. "Mesaj Hakkı" başlığının yanına sayısal `used/limit` ekle. Veri zaten var: `me?.usage.messages_used`, `me?.usage.messages_limit`.
Başlık `<div>`'ini başlık + sayı içerecek şekilde düzenle, ör:
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
  <span style={{ color: 'var(--mist)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    Mesaj Hakkı
  </span>
  <span style={{ color: 'var(--cream)', fontSize: '12px', fontWeight: 600 }}>
    {me?.usage.messages_used ?? 0}/{me?.usage.messages_limit ?? 0}
  </span>
</div>
```
Bar (`barContainerStyle` + `fillStyle(...)`) ve "%80 → Hakkın dolmak üzere" uyarısı OLDUĞU GİBİ KALIR.

## Kısıtlar
- Edge runtime (Cloudflare Workers): Node modülü ekleme. Bu sprintte zaten gerek yok.
- `'use client'` olan sayfalardan client kalıbını bozma.
- Mevcut testleri silme/zayıflatma. Yeni test gerekmiyor (M1 admin login zaten smoke'ta var); istersen smoke'u çalıştırmadan ELLE doğrula ama BOZMA.

## Bitirince ver
1. Değişen/eklenen dosya listesi (5 madde → beklenen: `migrations/0016_set_admin_flag.sql` + 4 web dosyası).
2. `git status` çıktısı.
3. Her madde için ne değiştirdiğinin 1 satırlık özeti.
Git komutu ÇALIŞTIRMA (status hariç). Branch/commit/push YOK.
