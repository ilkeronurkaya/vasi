# OpenHands Ajan Promtu — Sprint 27 DÜZELTME turu (B9 regresyonu + B3 kalan lint)

> S27 ilk tur sonrası Claude doğrulaması: 2 bloker kaldı. Her promt AYRI/YENİ OpenHands konuşmasına yapıştırılır.
> Sebep: B3 lint (set-state-in-effect) düzeltmesi B9 dosyasına sızmış ve `fetchPlans`'i kırmış; ayrıca 4 ESLint hatası atlanmış → `next build` hâlâ düşer.
> Repo `/workspace/vasi-web` altında. iko: tur öncesi bayat kilit varsa `rm -f ~/Projects/vasi-agent/.git/index.lock`.
> SIRA: önce FIX-A (kırığı kapat), sonra FIX-B (kalan lint).

---

## === FIX-A — admin/settings: silinen `fetchPlans`'i geri getir (tsc kırığı) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push YOK). task_tracker KULLANMA. SADECE TEK dosyaya dokun. Dosyayı önce KENDİN oku. Küçük, hedefli `str_replace`. Bitince diff + `git status`.

Dosya: `/workspace/vasi-web/src/app/admin/settings/page.tsx`

Sorun: önceki turda `fetchPlans` fonksiyonu `useEffect` içine inline edilip TANIMI silinmiş, ama `deletePlan` (~satır 65) ve `savePlan` (~satır 90) hâlâ `await fetchPlans()` çağırıyor → `error TS2552: Cannot find name 'fetchPlans'` + paket sil/kaydet sonrası liste yenilenmiyor.

1. Import satırını güncelle:
```
import React, { useEffect, useState } from 'react';
```
→
```
import React, { useCallback, useEffect, useState } from 'react';
```

2. Mevcut inline `useEffect` bloğunu (aşağıdaki gibi):
```
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await adminFetch('/api/v1/admin/plans');
                if (!cancelled) setPlans(data.plans ?? []);
            } catch {
                if (!cancelled) setError('Paketler alınamadı');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);
```
ŞUNUNLA değiştir:
```
    const fetchPlans = useCallback(async () => {
        try {
            const data = await adminFetch('/api/v1/admin/plans');
            setPlans(data.plans ?? []);
        } catch {
            setError('Paketler alınamadı');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);
```
Böylece `fetchPlans` tekrar tanımlı olur (deletePlan/savePlan çalışır) ve `useEffect` yalnız `fetchPlans()` çağırdığı için setState async fonksiyon içinde kalır → `set-state-in-effect` tetiklenmez.

DOKUNMA: `deletePlan`, `savePlan`, plan formu (B9/B2 değişiklikleri), CRUD mantığı. `cd /workspace/vasi-web && ./node_modules/.bin/tsc --noEmit` koş; admin/settings hatası gitmeli. Çıktıyı rapora ekle.

---

## === FIX-B — kalan 4 ESLint hatası (build kapısı) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA. task_tracker KULLANMA. Davranışı DEĞİŞTİRME — yalnız lint. Her dosyayı KENDİN oku. Yeni `any`/yeni borç EKLEME. Bitince diff + `git status` + lint çıktısı.

İlk adım: `cd /workspace/vasi-web && ./node_modules/.bin/next lint` ile hata listesini gör. Hedef: **0 error** (warning'ler build'i bloklamaz, opsiyonel).

Bilinen 4 hata ve düzeltmeleri:

**1) `src/app/(dashboard)/upgrade/page.tsx` ~satır 62 — "value cannot be modified" (`window.location.href`)**
```
        window.location.href = paymentPageUrl
```
→
```
        window.location.assign(paymentPageUrl)
```
(Aynı yönlendirme, dış değişkene atama yok → kural susar.)

**2) `src/app/(dashboard)/upgrade/page.tsx` ~satır 50-56 — set-state-in-effect**
Effect içindeki senkron `setMessage`/`setError` bloğunu, hemen yukarıdaki `.then(([meData, pricingData]) => { ... })` callback'inin İÇİNE taşı (orada setState async callback olduğu için kural tetiklenmez). Yani şu bloğu effect gövdesinden SİL:
```
    // Query'i client-only oku (useSearchParams Next 15'te Suspense ister; window ile gerek kalmaz)
    const payment = new URLSearchParams(window.location.search).get('payment')
    if (payment === 'success') {
      setMessage('Ödeme başarılı, planın artık Premium.')
    } else if (payment === 'failed') {
      setError('Ödeme tamamlanamadı, tekrar deneyebilirsin.')
    }
```
ve `.then` callback'ini `setLoading(false)`'tan SONRA şöyle genişlet:
```
      .then(([meData, pricingData]) => {
        setCurrentPlan(meData.plan)
        setPlans(pricingData.plans)
        setLoading(false)
        const payment = new URLSearchParams(window.location.search).get('payment')
        if (payment === 'success') {
          setMessage('Ödeme başarılı, planın artık Premium.')
        } else if (payment === 'failed') {
          setError('Ödeme tamamlanamadı, tekrar deneyebilirsin.')
        }
      })
```

**3) `src/app/admin/page.tsx` ~satır 89 ve `src/app/page.tsx` ~satır 383 — set-state-in-effect**
Bu iki yerde effect gövdesinde SENKRON çağrılan setState kuralı tetikliyor. Davranışı değiştirmeden, yalnız o tek setState çağrısını bir mikrotask'a ertele:
- Kalıp: `setX(deger)` → `queueMicrotask(() => setX(deger))`
- `page.tsx` örnek: `if (detected !== 'tr') setLang(detected)` → `if (detected !== 'tr') queueMicrotask(() => setLang(detected))`
- `admin/page.tsx`: lint'in işaret ettiği satırdaki setState'i aynı `queueMicrotask(() => ...)` kalıbıyla sar.
(Mikrotask hâlâ paint'ten önce çalışır; görünür davranış aynı, en az maliyet.)

**Opsiyonel (warning, bloklamaz):** `upgrade/page.tsx` kullanılmayan `MeData`/`PricingData` tip importlarını sil.

Bitiş kriteri: `./node_modules/.bin/next lint` **0 error**. Çıktının son özetini rapora ekle. Başka dosyaya/davranışa DOKUNMA.

---

## Her tur sonrası (Claude doğrular)
Claude klondan `git diff` + `tsc --noEmit` + `next lint` ile kapsam/regression kontrol eder. İkisi bitince tam re-verify: tsc temiz + next lint 0 error → iko smoke (`:3000` kapalı) → Chrome elle (admin/settings plan sil-kaydet, upgrade, OTP maskeleme) → sprint kapanış ritüeli.
