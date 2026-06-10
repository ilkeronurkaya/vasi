# Vasi — CrewAI Agent Kurulumu

## Gereksinimler

- Python 3.11+
- Ollama çalışıyor olmalı: `ollama run qwen2.5-coder:32b`
- Git repository başlatılmış olmalı: `git init` (zaten varsa gerek yok)

## Kurulum

```bash
cd crew/
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Çalıştırma — Manager Arayüzü (Önerilen)

Agent Manager, sprint'leri başlatmanızı, durumu takip etmenizi ve log görmenizi sağlayan bir chat arayüzüdür.

```bash
chainlit run manager.py
```

Tarayıcıda `http://localhost:8000` açılır. Chat penceresinden komut gönderin:

| Komut | Açıklama |
|-------|----------|
| `sprint 1` | Sprint 1'i başlat |
| `durum` | Mevcut sprint durumu |
| `sprintler` | Tüm sprint listesi |
| `log` | Son log kayıtları |
| `yardım` | Komut listesi |

## Çalıştırma — CLI (Alternatif)

```bash
python crew.py --sprint 1
```

## Git Entegrasyonu

Her sprint başladığında otomatik olarak `sprint-{n}` branch'i oluşturulur:

```bash
git branch     # sprint-1, sprint-2, ... listesi
git log --oneline sprint-1   # Sprint 1 commit'leri
```

Her ajan görevini tamamladıktan sonra:
1. Build kontrol eder (`pnpm build`)
2. Build başarılıysa commit atar
3. Build hatalıysa TypeScript hatalarını düzeltir, tekrar dener

## Sprint Dosyaları

| Dosya | Kapsam | Durum |
|-------|--------|-------|
| `sprint1.py` | Auth (register, login, verify-email) | ✅ Hazır |
| `sprint2.py` | Mesaj CRUD + Alıcı yönetimi | 🔜 Yazılacak |
| `sprint3.py` | Zamanlama + E-posta iletimi | 🔜 Yazılacak |
| `sprint4.py` | İyzico ödeme entegrasyonu | 🔜 Yazılacak |

## Ajan Rolleri

| Ajan | Klasör | Sorumlu |
|------|--------|---------|
| Orkestratör | — | Sprint planı, delegasyon |
| DB Ajanı | `migrations/` | SQL migration, seed data, SQL doğrulama |
| Backend Ajanı | `vasi-api/` | Hono API, servisler, TypeScript build |
| Web Ajanı | `vasi-web/` | Next.js sayfaları, i18n, Next.js build |

## Dosya Yapısı

```
crew/
├── manager.py        # Chainlit chat arayüzü — kullanıcı buradan konuşur
├── crew.py           # Ajan ve crew tanımları
├── tools.py          # BashTool, GitTool ve yardımcı fonksiyonlar
├── sprint1.py        # Sprint 1 görev tanımları
├── sprint.log        # Sprint çıktı logu (otomatik oluşur)
└── requirements.txt
```

## Sorun Giderme

**Ollama bağlantı hatası:**
```bash
curl http://localhost:11434/api/tags
```

**Model değiştirme (daha hızlı):**
`crew.py` içinde `MODEL` değişkenini değiştir:
```python
MODEL = "qwen2.5-coder:14b"
```

**Git hatası — user.email/name eksik:**
```bash
git config user.email "you@example.com"
git config user.name "Your Name"
```

**Build hataları — pnpm bulunamıyor:**
```bash
npm install -g pnpm
```
