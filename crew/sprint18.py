"""
Sprint 18 — PİLOT: Login Input Validasyonu (devstral + ToolCallingAgent)
=========================================================================
Bu sprint crew'un yeni kurulumunun (devstral modeli + ToolCallingAgent) pilot testi.
Amaç hem küçük bir gerçek bug'ı kapatmak hem de crew'un geleceğine veriyle karar vermek.

Bug: POST /api/v1/auth/login boş/eksik gövdeyle çağrılınca email undefined olarak
D1'e bağlanıyor → "Type 'undefined' not supported" → 500. Olması gereken: 400.
(wrangler.log 2026-06-12 — test paketinin hazırlık yoklaması bu yüzden 500 görüyor.)

⚠️ KOŞMADAN ÖNCE: branch `crew-devstral` olmalı (git branch --show-current).

## Pilot Başarı Kriterleri (değerlendirme için — 2026-06-12'de kararlaştırıldı)
1. Dosya bozma: 0 (build kırılması, sözdizimi felci, alakasız satır silme yok)
2. İterasyon: görev ≤2 denemede biter (build-fix döngüsü dahil)
3. Smoke testler: tamamı yeşil (yeni test dahil → 26)
4. Tester onayı: run_test_cycle temiz döner
Geçerse: hibrit model (basit işler crew'da). Geçmezse: crew emekli, tartışmasız.
"""

CLOSED = False

tasks = [

    # ─────────────────────────────────────────────────────────────────────────
    # Task 1: Login input validasyonu + smoke test (AYNI commit'te)
    # ─────────────────────────────────────────────────────────────────────────
    TaskSpec(
        role="Backend Ajani",
        description="""
## Görev: POST /auth/login eksik girdi ile 500 yerine 400 dönsün

### Bug
`vasi-api/src/routes/auth.ts` içindeki `/login` handler'ı `email` ve `password`
alanlarını kontrol etmeden `AuthService.login`'e geçiriyor. Alanlar eksikse
`undefined` değeri D1 sorgusuna bağlanıyor ve istek 500 ile patlıyor.

### A) `vasi-api/src/routes/auth.ts` (önce read_file ile oku!)
`/login` handler'ında `AuthService.login` çağrısından ÖNCE kontrol ekle:
- `email` veya `password` yoksa ya da string değilse, 400 dön.
- Yanıt gövdesi dosyadaki mevcut hata deseniyle aynı biçimde olsun:
  `{ error: 'E-posta ve şifre zorunlu', code: 'VALIDATION_ERROR' }`
- Diğer handler'lara ve fonksiyonlara DOKUNMA.
- Küçük bir ekleme bu — replace_in_file ile yap, dosyayı baştan YAZMA.

### B) `crew/tests/api_smoke.py` (önce read_file ile oku!)
Mevcut login testinin hemen ALTINA yeni bir smoke test ekle:
- `req("POST", "/api/v1/auth/login", {})` çağır.
- Beklenti: status == 400 (500 veya 200 DEĞİL).
- Sonucu dosyadaki diğer testlerle aynı desende kaydet:
  `record("Login eksik girdi 400 dönüyor", "auth", "Backend Ajani", ok, detail)`
- Başka hiçbir teste DOKUNMA.

### Doğrulama ve commit
1. Her iki dosyayı read_file ile tekrar oku, değişikliklerin uygulandığını doğrula.
2. run_tsc() çalıştır — temiz olmalı.
3. Temizse TEK commit at:
   git_commit("fix(sprint-18): login input validasyonu (400) + smoke test")
""",
    ),
]
