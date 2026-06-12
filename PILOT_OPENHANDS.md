# OpenHands Pilot Sprint — Failed-Deliveries Retry

_Tanım: 2026-06-12 · Karar: token maliyeti nedeniyle uygulayıcı rolü OpenHands'e taşınıyor. Bu pilot, devstral pilotunun (crew/sprint18.py) kaldığı kriterlerle kıyaslanabilir._

## Görev

Admin, başarısız (status=`'error'`) teslimatları yeniden kuyruğa alabilmeli.

**API:** `POST /api/v1/admin/delivery/retry/:messageId` (admin auth zorunlu)
- Mesaj yoksa → 404 `NOT_FOUND`
- `status != 'error'` → 409 `INVALID_STATUS`
- Başarıda: `status='scheduled'`, `scheduled_at=` şimdi (UTC ISO), `failed_reason=NULL` → 200. Sonraki `run-due` mesajı işler.

**Web:** `vasi-web/src/app/admin/reports/page.tsx` — başarısız teslimatlar tablosuna "Yeniden Dene" butonu (`adminFetch`); başarıda liste yenilenir.

**Testler (aynı commit, `crew/tests/api_smoke.py`):** error→retry→200+scheduled · non-error→409 · olmayan id→404

## Kabul Kriterleri (devstral pilotuyla aynı çıta)

| # | Kriter |
|---|--------|
| 1 | `python3 crew/tests/api_smoke.py` tümü yeşil |
| 2 | Mevcut testler bozulmadı, silinmedi, zayıflatılmadı |
| 3 | Kod + test AYNI commit'te; branch görev tanımındaki branch |
| 4 | En fazla 1 düzeltme turu (2. turda hâlâ kırmızıysa pilot KALDI) |

## SONUÇ — KALDI (2026-06-12)

Model: Qwen3.6-35B-A3B (LM Studio). Branch: `pilot-openhands-1` (merge EDİLMEYECEK, silinebilir).

| # | Kriter | Sonuç |
|---|--------|-------|
| 1 | Testler yeşil | KALDI — fix commit `d4577f6`: `uuid4` import edilmeden kullanıldı → NameError, suite o satırda çöküyor; SQL string'inin içine Python kodu gömülü; `messages`'ta olmayan `recipient_id` kolonuna INSERT |
| 2 | Mevcut testler korunur | KALDI — çökme noktasından sonraki testler hiç koşamıyor |
| 3 | Kod+test aynı commit | GEÇTİ — ilk commit (`2259e67`) düzgündü; endpoint + admin UI spec'e büyük ölçüde uygun |
| 4 | Max 1 düzeltme turu | KALDI — 2. tur hâlâ kırmızı + rapor uydurma ("3/4 geçti": suite'te 34 test var; gerçekte koşturulsa NameError) |

Devstral pilotuyla aynı kalıp: api_smoke.py bozuldu + yanlış raporlama. Yerel LLM uygulayıcılığı ikinci kez kaldı.

Ek ders: OpenHands `--mount-cwd` ile GERÇEK çalışma kopyasında koştu — branch değiştirdi, commit'lenmemiş dosyaları kaybettirdi, köke çöp bıraktı (`bash_events/`, `conversations/`, `project/`). Bir daha denenirse repo'nun KLONUNDA çalıştırılmalı, asıl kopyada değil.

Sonraki adım adayı: OpenHands çatısı sorunsuz; arkasına ucuz API modeli (DeepSeek vb.) bağlanarak yeni pilot yapılabilir.


## PİLOT 2 — Gemini Flash (2026-06-12, tanım)

Model: Gemini 3 Flash (API). Aynı görev, aynı kabul kriterleri. Branch: `pilot-openhands-2`.
Değişen kurallar: (a) ajan repo KLONUNDA çalışır (`~/Projects/vasi-agent`), asıl kopyaya dokunmaz;
(b) ajan raporuna güvenilmez — her tur Tester (manager `test`) ile doğrulanır;
(c) klondaki `.dev.vars` SAHTE değerlerle oluşturulur, gerçek sır ajana verilmez.

### OpenHands'e Yapıştırılacak Prompt (Pilot 2)

```
Repo kökü /workspace dizinidir. Önce /workspace/AGENTS.md ve
/workspace/PILOT_OPENHANDS.md oku, kurallara uy. Görev: PILOT_OPENHANDS.md
"Görev" bölümündeki Failed-Deliveries Retry. Branch: pilot-openhands-2
(main'den aç). Kod + 3 smoke testi AYNI commit'te. Commit'ten önce
cd /workspace && python3 crew/tests/api_smoke.py koştur; çıktının SON 10
satırını bana aynen göster. git push YAPMA.
```

### SONUÇ (Pilot 2)

_(bittiğinde doldurulacak)_
