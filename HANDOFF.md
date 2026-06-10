# Vasi App BD — Oturum El Geçirme Notu
_Tarih: 2026-06-10 (güncellendi)_

> ⚠️ **DİKKAT:** Proje 2026-06-10'da iCloud'dan taşındı. Güncel konum: `~/Projects/vasi`
> iCloud'daki eski "Vasi App BD" klasörleri (Claude ve Claude 2 altında) kullanılmamalı.

---

## Projeye Genel Bakış

Vasi, insanların geleceğe mesaj bırakmasını sağlayan bir platform.
Monorepo yapısı: `vasi-web` (Next.js 15), `vasi-api` (Cloudflare Workers/Hono), `crew/` (smolagents AI geliştirme ekibi).

**Çalıştırma:**
```bash
cd crew
chainlit run manager.py
# → "sprint N" yaz
```

---

## Sprint Durumu

| Sprint | Kapsam | Durum |
|--------|--------|-------|
| 1 | Auth sistemi | ✅ |
| 2 | Mesaj CRUD + Alıcı | ✅ |
| 3 | Zamanlama + E-posta | ✅ |
| 4 | İyzico ödeme | ✅ |
| 5 | UX/UI — Auth & Dashboard | ✅ |
| 6 | UX/UI — Mesaj akışı | ✅ |
| 7 | UX/UI — Dashboard yenileme | ✅ |
| 8 | Gerçek veri (/me, recipient_count, mock temizliği) | ✅ (denetlendi, 3 hata düzeltildi) |
| 9 | Eksikler (plan limiti, /messages listesi, detay alıcıları) | 📝 Tanımlı — çalıştır + denetle |
| 10 | Apple tasarım dili (DESIGN.md v2, 5 restyle görevi) | 📝 Tanımlı — 9'dan sonra |

### Güncel durum (2026-06-10 öğleden sonra)
- Sprint 8 koştu; denetimde 3 hata bulundu ve düzeltildi: `/me` rotası index.ts'e kayıtsızdı, `layout.tsx`'ten `'use client'` silinmişti, dashboard `/me` yanıtını yanlış parse ediyordu (`ef8118f`).
- **Ders**: crew "build temiz" dese bile çıktı denetimi şart — tsc `'use client'` eksiğini ve mount edilmemiş rotayı yakalayamıyor. Adım limiti uyarısı (`ADIM LİMİTİ DOLDU`) log'da görünüyorsa o görevin dosyalarına mutlaka bak.
- **Git akışı**: crew sprint-N branch'i açar; sprint sonrası denetim → `git checkout main && git merge --ff-only sprint-N` → GitHub'a push (origin: `ilkeronurkaya/vasi`, private). Push yetkisi yoksa GitHub device flow ile al (kullanıcıya kod onaylatılır).
- **Bildirimler**: manager.py sprint bitince ntfy (`vasi-iko-7ca81627`) + iMessage atar; komutlar telefondan ntfy ile gelir (`vasi-iko-cmd-57f994b1`). Manager komutları: sprint N, durum, log, kontrol, migrate, dev, durdur, bildirim.

## Sıradaki İşler
1. `sprint 9` çalıştır → çıktı denetimi (API şema uyumu + 'use client' + rota kayıtları) → main'e merge + push
2. `sprint 10` çalıştır (Apple tasarım dili — referans: DESIGN.md "APPLE TASARIM DİLİ v2") → görsel denetim → merge + push
3. Tarayıcıda uçtan uca test: `dev` komutu → localhost:3000 → test@vasi.app / Test1234!
4. Sonrası: İyzico sandbox (ayrı sprint), Resend e-posta testi (API key gerek)

### Bekleyen Task'lar
- **Task #9**: crewai 1.x migration (düşük öncelik)
- Repo kökündeki yanlış yere yazılmış `src/app/(dashboard)/layout.tsx` kalıntısı temizlendi mi kontrol et

---

## Bilinen Teknik Sorunlar

### crew.py'de
1. **max_steps çok yüksek** — karmaşık görevlerde context overflow (1.2M token). Öneri: UX=20, diğer=30.
2. **Görev açıklamaları çok uzun** — kısalt, DESIGN.md'ye referans ver.
3. **tsc path quoting** — agent'ın doğrudan `bash()` ile tsc çağrıları bozulabilir.

### Ortam
- iCloud klasöründe sandbox'tan `.git` silme işlemleri "Operation not permitted" verebiliyor; `index.lock` oluşursa Mac terminalinden sil:
  `rm "$HOME/Library/Mobile Documents/com~apple~CloudDocs/Documents/Claude 2/Projects/Vasi App BD/.git/index.lock"`

---

## Önemli Dosya Yolları

```
Vasi App BD/
├── crew/
│   ├── crew.py          ← AI agent motoru (v2)
│   ├── manager.py       ← Chainlit UI
│   ├── sprint7.py       ← Sprint 7 görevleri
│   └── sprint.log       ← Çalışma logları
├── vasi-web/            ← Next.js 15 uygulaması
│   └── src/app/
│       ├── (dashboard)/
│       │   ├── layout.tsx        ← Sidebar ✅
│       │   ├── dashboard/page.tsx
│       │   └── messages/
│       │       ├── new/page.tsx  ← 5 adımlı wizard ✅
│       │       └── [id]/
│       └── (auth)/
├── vasi-api/            ← Cloudflare Workers API
├── DESIGN.md            ← Tasarım token referansı
├── Vasi_PRD_v2.md
└── Vasi_Technical_Architecture.md
```

---

## API Sözleşmesi (vasi-api, sık kullanılan)

- `POST /api/v1/messages` → `{ title, message_type, content_text }`
- `POST /api/v1/messages/:id/recipients` → `{ full_name, email }`
- `POST /api/v1/messages/:id/schedule` → `{ scheduled_at }` (ISO)
- Auth: `Authorization: Bearer <token>` — frontend'de `apiFetch` (`src/lib/api.ts`) kullan.

---

## Tasarım Sistemi Özeti

```
var(--obsidian)    #0C1525  sayfa arka planı
var(--midnight)    #162033  kart arka planı
var(--horizon)     #1F2D45  border, hover
var(--copper)      #D4763B  CTA, vurgu
var(--cream)       #EDE9E0  birincil metin
var(--mist)        #8B9BB4  ikincil metin
```

**YASAK**: `bg-Copper`, `text-Cream` gibi Tailwind custom class'lar.
**DOĞRU**: `style={{ color: 'var(--cream)' }}`

---

## Model Bilgisi

- **Güçlü**: `qwen2.5-coder:32b` (19 GB) — karmaşık görevler
- **Hızlı**: `qwen2.5-coder:7b` (4.7 GB) — basit fix'ler
- Ollama: `http://localhost:11434`
