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
| 7 | UX/UI — Dashboard yenileme | ✅ (commit `c18a7c69`) |

### Sprint 7 kapanışı (2026-06-10)
- `layout.tsx` — backtick fix + 8 tip hatası düzeltildi
- `messages/new/page.tsx` — 5 adımlı wizard'a dönüştürüldü (İçerik → Alıcılar → Zamanlama → Önizleme → Gönder). Gerçek API alanları kullanıldı: `message_type`, `content_text`, `full_name`, `scheduled_at`
- `tsc --noEmit` temiz

---

## Sıradaki İşler

### Sprint 8 Önerileri
- Backend: Gerçek API entegrasyonu (layout.tsx'teki mock limit/plan/kullanıcı verilerini kaldır)
- Abonelik: İyzico entegrasyonu tamamlama
- E-posta: Gerçek gönderim testi

### Bekleyen Task'lar
- **Task #9**: crewai 1.x migration (düşük öncelik)
- **crew.py**: max_steps'i görev tipine göre ayarla (UX=20, diğer=30)
- Repo kökündeki yanlış yere yazılmış `src/app/(dashboard)/layout.tsx` kalıntısını temizle (commit 16fe7c4e ile gelmiş)

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
