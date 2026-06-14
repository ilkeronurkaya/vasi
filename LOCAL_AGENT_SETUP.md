# Yerel Ajan Kurulumu + İşletim Promtu (LM Studio + OpenHands)

> Amaç: uygulayıcıyı (kod yazan ajan) **yerel modele** taşımak — API maliyeti sıfır, veri yerelde.
> Önkoşul: iş akışı zaten git'i ajandan çıkardı (ajan SADECE kod yazar). Yerel modelin tek işi: küçük, net diff'ler üretmek. Doğrulamayı her zaman iko+Claude yapar.
> Donanım: Mac, 48GB+ birleşik bellek (model tamamı GPU'ya açık).

## 1. Model seçimi (48GB+ için)

| Rol | Model | LM Studio ID | Boyut (4-bit) | Neden |
|-----|-------|--------------|---------------|-------|
| **Birincil** | Qwen3.6-35B-A3B | `qwen/qwen3.6-35b-a3b` (LM Studio kataloğundan doğrula) | ~20-22GB | OpenHands'in resmî #1 yerel önerisi (May 2026). MoE → 3B aktif, hızlı. |
| **Yedek** | Devstral Small 2 | `mistralai/devstral-small-2-2512` | ~14-15GB | OpenHands-native (SWE-bench scaffold ile eğitildi). 256k context — büyük-bağlam işlerinde. %68 SWE-bench. |

İkisi de Apache-2.0 / açık. 48GB'de her ikisi de bol context payıyla rahat çalışır. **Önce Qwen3.6-35B-A3B ile başla;** araç-çağırma/format takibinde sorun çıkarsa Devstral'a düş.

## 2. LM Studio kurulumu
1. LM Studio'da modeli indir (yukarıdaki ID).
2. **Context length**: en az 32k seç (OpenHands çok token yer; 48GB elveriyor). Devstral'da 256k'ya kadar açılabilir ama 32-64k pratikte yeterli.
3. **Tool/function calling AÇIK** olmalı (OpenHands buna dayanır). Model yükleme ekranında "tool use" destekli template seçili olsun. Context Length ≥ 22000 (tercihen 32768) + Flash Attention açık.
4. **"Serve on Local Network"i AÇ** (server ayarları) — ZORUNLU. Varsayılan bind `127.0.0.1`; bu açık değilse LM Studio sadece loopback'te dinler ve OpenHands'in Docker container'ı ERİŞEMEZ. Açınca `0.0.0.0`'a bağlanır.
5. Server'ı başlat → `http://127.0.0.1:1234` (host tarafı). Host'tan doğrula: `curl http://127.0.0.1:1234/v1/models`.

## 3. OpenHands bağlama (KRİTİK tuzaklar)
> **EN SIK HATA:** OpenHands Docker'da çalışır → container içinden `127.0.0.1` = container'ın kendisi, Mac DEĞİL. Base URL'de ASLA `127.0.0.1`/`localhost` kullanma; **`host.docker.internal`** kullan. (Mac'te Docker Desktop bunu otomatik sağlar; `openhands serve` yeterli.)

Settings > LLM > "see advanced settings" > Advanced:
- **Custom Model:** `openai/qwen/qwen3.6-35b-a3b` (LM Studio'daki Model API Identifier'ın başına `openai/` ekle — LiteLLM'in OpenAI-uyumlu yola gitmesi için ŞART).
- **Base URL:** `http://host.docker.internal:1234/v1` — ZORUNLU (`/v1` dahil, `host.docker.internal` ile).
- **API Key:** `local-llm` (placeholder — LM Studio auth istemiyor ama alan boş kalmasın).

**Container'dan bağlantı testi (Mac terminali):** `docker exec -it openhands-app curl -s http://host.docker.internal:1234/v1/models` → model listesi dönmeli. Takılırsa LM Studio hâlâ localhost-only → "Serve on Local Network"ü aç.

**Tool kullanmıyorsa (chatbot gibi davranıyorsa):** sorun model olabilir. Topluluk-onaylı yedekler: `qwen2.5-coder-14b-instruct` veya `qwopus3.5-27b-v3 Q8_0`. Bizim Devstral yedeği de dener.
- **Condenser AÇIK** (Settings) — uzun bağlamı sıkıştırır, yerel modelde token tasarrufu.
- Ayar değişikliği konuşma AÇILIŞINDA sabitlenir → ayardan sonra HEP yeni konuşma.
- Ajanı **`~/Projects/vasi-agent`'ten** başlat: `cd ~/Projects/vasi-agent && openhands serve --mount-cwd`. (S23'te yanlışlıkla asıl repodan başlatıldı — bir daha olmasın; ajan asıl repoya dokunmamalı.)

## 4. Yerel-model işletim promtu (her sprint başına başa ekle)
Yerel model bulut modelinden daha "dar" — talimat ne kadar mekanik ve satır-seviyesinde olursa o kadar iyi. Her sprint promtunun başına şunu koy:

```
Sen YALNIZCA kod+test yazan bir uygulayıcısın. Kurallar (İHLAL = BAŞARISIZ):
1. Git'e HİÇ dokunma — branch/commit/push/checkout YOK. Sadece /workspace içindeki dosyaları düzenle.
2. SADECE sana madde madde verilen dosya ve satırlara dokun. Başka dosyayı açma, refactor etme, "iyileştirme" yapma. İstenmeyen yerde tek karakter bile değiştirme.
3. Dosyaları KENDİN oku. Düzenleyeceğin her dosyayı önce kendi araçlarınla /workspace'ten OKU. Bana asla dosya içeriği / "context dump" yapıştırmamı isteme. Erişemiyorsan tam yolunu söyle ve dur.
4. HALÜSİNASYON YASAK. Görmediğin dosya/satır/fonksiyon hakkında varsayım yapma. Test/komut KOŞMADIYSAN "koştum/geçti" DEME. "Çalışır/hazır/tamamlandı" yazmadan önce gerçekten yaptığından emin ol. Yanlış rapor, hatalı koddan kötüdür.
5. EMİN DEĞİLSEN YAPMA — SOR. Bir maddenin nasıl yapılacağından, bir dosyanın içeriğinden ya da bir değişikliğin doğruluğundan emin değilsen: DUR, neyden emin olmadığını net yaz, sor. Tahminle ilerleme. Kararsızlıkları iko+Claude çözer. Emin olduklarını yap, emin olmadıklarını listele.
6. Şema değişikliği = KÖK `migrations/`'a yeni dosya (vasi-api/migrations/ DEĞİL). Elle ALTER yok.
7. Bitince ver: (a) değişen/eklenen dosya listesi, (b) `git status` çıktısı, (c) her madde için ne yaptığının 1 satır özeti, (d) her değiştirdiğin dosyanın diff'i.
8. OpenHands `task_tracker`/planlama aracını KULLANMA — yerel model yanlış şema değerleriyle (ör. status='pending') çağırıp crash ettiriyor. Plan yapma, doğrudan dosyaları düzenle.
Edge runtime (Cloudflare Workers): Node `crypto/http/https`/`iyzipay` KULLANMA — sadece `fetch` + Web Crypto.
Görevler aşağıda, madde madde. Her maddeyi tam tarif edildiği gibi uygula.
```

## 5. Doğrulama / pilot planı (yerel modeli güvenmeden önce TEST ET)
Yeni uygulayıcıyı canlı sprintte denemeden önce **kontrollü eval**: bilinen-doğru çıktısı olan bir işi tekrar koştur, karşılaştır.

**En iyi pilot = Sprint 23** — çünkü doğru diff'i zaten elimizde var (Claude inceledi, 5/5 temiz).
1. Klonu temizle + S23 ÖNCESİ tabana al: `cd ~/Projects/vasi-agent && git reset --hard && git clean -fd && git fetch origin && git checkout sprint-22` (S23'ün başladığı taban). iko önce sprint-22'yi origin'e push'lamalı ki klon çekebilsin.
2. OpenHands'te yerel model + `AGENT_PROMPT_SPRINT_23.md` → koştur.
3. Çıktı diff'ini bilinen-doğru S23 diff'iyle karşılaştır (`git -C ~/Projects/vasi-agent diff`).
4. **Geçme kriteri:** 6 dosyanın (5 web + `migrations/0016`) hepsi doğru; fazladan dosya/değişiklik yok; davranış bozulmamış; uydurma rapor yok. (Eski yerel modeller burada testleri bozup "geçti" diyerek kalmıştı.)
5. Geçerse → S24'ü yerel modelle koş. Kalırsa → Devstral'a düş, tekrar pilot. İki model de kalırsa yerel fikri yine rafa, OpenHands+Flash'a dön.

## 6. Maliyet / not
Yerel = sıfır API maliyeti, sınırsız tur. Tek "maliyet" elektrik + zaman (yerel inference bulut Flash'tan yavaş olabilir ama bizim diff'ler küçük). Kalite hâlâ Claude/3.5 Flash altında olabilir → **riskli/büyük sprintleri yerel modele verme;** yerel = küçük, net, satır-seviyesi tarifli işler. Doğrulama HER ZAMAN iko+Claude'da.
