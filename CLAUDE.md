# CLAUDE.md — Vasi şef operatör kılavuzu (terminal Claude)

> Bu repo'da terminal Claude **ŞEF**tir: tüm terminal komutlarını, git'i ve yerel-LLM uygulayıcıyı (OpenHands+Qwen) SEN yönetirsin. **iko stratejiyi belirler ve onaylar; uygulamayı/komutları/doğrulamayı sen yaparsın.**
> İlk açılışta: bu dosyayı + `HANDOFF.md`'yi oku, durumu `git log --oneline -8 --all` ile çapraz doğrula (dosyalar bayat olabilir).

## Proje
Geleceğe mesaj bırakma uygulaması. Monorepo: `vasi-web` (Next.js 15, edge, koyu Apple-dili — `DESIGN.md`), `vasi-api` (Cloudflare Workers + Hono + D1), `migrations/` (D1 şema, KÖK dizin), `crew/tests/api_smoke.py` (deterministik smoke). Uçtan uca çalışıyor; ilk gerçek e-posta 2026-06-11 (Resend). GitHub: `git@github.com:ilkeronurkaya/vasi.git` (private).

## Roller
- **iko** — strateji, ürün kararları, sprint kapsamı onayı, elle test/kapanış ritüeli. Para/dış hesap gerektiren kararlar (SMS, OAuth, ödeme) iko'da.
- **Claude (sen, şef, terminalde tam yetki)** — sprint tasarımı, ajan promtu yazımı, **yerel LLM'i sürme**, **git (branch/commit/push)**, **doğrulama** (tsc + lint + smoke), doküman bakımı. Tüm terminal komutlarını sen koşarsın.
- **Uygulayıcı** — yerel **Qwen3.6-35B-A3B** (LM Studio) + **OpenHands** (Docker, headless). SADECE kod yazar, KLONDA (`~/Projects/vasi-agent`). Git yapmaz, `task_tracker` kullanmaz, asıl repoya dokunmaz. Kurulum: `LOCAL_AGENT_SETUP.md`.

## Read-first dosyalar
`HANDOFF.md` (oturum el-geçirme, en güncel durum) · `BUGS.md` (yaşayan bug listesi, Açık/Kapalı) · `ROADMAP.md` (sprint planı) · `LOCAL_AGENT_SETUP.md` (yerel LLM) · `AGENTS.md` (mutlak kurallar) · **`DESIGN.md` = Vasi Tasarım Sistemi (UX/UI'ın TEK kaynağı)**.

## Tasarım Sistemi (UX/UI)
`DESIGN.md` Vasi Tasarım Sistemi'dir. **Her UX/UI içeren işte zorunlu:** renk/tipografi/boşluk/buton (Buton Sistemi v2)/bileşen kararlarını buradan al. Bir sprint UI dokunuyorsa: (1) `AGENT_PROMPT_SPRINT_NN.md`'ye ilgili `DESIGN.md` kurallarını AÇIKÇA kopyala (yerel model dar — "DESIGN.md'ye bak" yetmez, kuralı satır satır ver) ve "önce `DESIGN.md`'yi oku" de; (2) doğrulamada çıktının tasarım sistemine uyduğunu (gelişigüzel inline stil yerine tema sınıfları/değişkenleri) kontrol et. `Vasi_Figma_Design_Reference.md` daha geniş marka/Figma referansı.

## Sprint iş akışı (şef sürümü)
1. **Tasarla** — iko ile kapsamı netleştir; `SPRINT_NN_*.md` (tasarım+kabul) + `AGENT_PROMPT_SPRINT_NN.md` (bug-bug/dosya-dosya, **mekanik str_replace**'lerle; yerel model dar) yaz. Hacimli/riskli işi yerele VERME — küçük, satır-seviyesi tarifli işler ver.
2. **Klonu senkronla** — `cd ~/Projects/vasi-agent && git fetch origin && git checkout main && git reset --hard origin/main`. (S27 dersi: klon main'in gerisinde kalırsa working tree karışır.)
3. **Yerel LLM'i sür** — LM Studio'da Qwen yüklü + "Serve on Local Network" AÇIK + context 65536 + Condenser AÇIK. OpenHands'i KLONDAN başlat: `cd ~/Projects/vasi-agent && openhands serve --mount-cwd`. Base URL `http://host.docker.internal:1234/v1` (ASLA 127.0.0.1), Custom Model `openai/qwen/qwen3.6-35b-a3b`. **Her mini-promt için YENİ konuşma** (context taşması). Headless de koşulabilir.
4. **DOĞRULA (rapora ASLA güvenme)** — her tur sonrası klonda: `git -C ~/Projects/vasi-agent diff` (kapsam sızıntısı / yeni `any` / silinen çalışan kod) + `vasi-api` & `vasi-web` `./node_modules/.bin/tsc --noEmit` + `vasi-web` `./node_modules/.bin/next lint` (**0 error** hedef) + backend değişiminde smoke. **Tekrarlayan ders: zayıf model lint refactor'unda kapsamı aşıp çalışan fonksiyon silebiliyor (S27'de `fetchPlans`) → diff+tsc+lint+smoke ZORUNLU.**
5. **Aktar** — yalnız o sprintin DOKUNDUĞU dosyaları klon→main kopyala (S27 dersi: dizin-kopya/`git apply` başka sprintin işini bozabilir). Doğrula.
6. **Commit + push** — asıl repoda sprint dalı: `git checkout -b sprint-NN`, `git add -A`, anlamlı commit (kod+test aynı commit'te — `AGENTS.md`), `git push -u origin sprint-NN`. **Guardrail: main'e ASLA force-push; her iş sprint dalında.**
7. **Kapanış ritüeli (ZORUNLU)** — her düzeltilen bug'ı iko elle doğrular; sen `BUGS.md`'de Kapalı'ya taşırsın. Hepsi doğrulanmadan sprint kapanmaz.

## Smoke / migration / dev komutları
```
lsof -ti :3000 | xargs kill -9 2>/dev/null; true
cd ~/Projects/vasi && uv run --python 3.12 python crew/tests/api_smoke.py
cd ~/Projects/vasi/vasi-api && npx wrangler d1 migrations apply vasi-db --local
cd ~/Projects/vasi/vasi-api && npm run dev
cd ~/Projects/vasi/vasi-web && npm run dev
```
Smoke izole DB :8788 + migration'ları otomatik uygular; `:3000` AÇIKSA payment callback'i eskiden çökertiyordu — B4'te tolere edildi.

## Mutlak kurallar (AGENTS.md özeti)
- Kod + test AYNI commit'te. Şema değişikliği = yeni `migrations/00XX_*.sql` (KÖK `migrations/`; `wrangler.toml migrations_dir=../migrations`). Elle ALTER YASAK.
- Edge runtime: Node `crypto/http/https`/`iyzipay` KULLANMA — yalnız `fetch` + Web Crypto.
- **Terminal komut örneklerine yorum (`#`) KOYMA** (iko/sen kopyalayıp koşuyor).
- Migration'lar KÖK `migrations/`'a (S22'de ajan `vasi-api/migrations/`'a koydu — uygulanmaz).

## Güncel durum (git ile doğrula)
S1–S28 KAPALI. **Sprint numaralandırmada kayma var** (commit `sprint-29`=çerez onayı; ROADMAP S29=OAuth — iko kararı, `git log` esas). **Bekleyen:** çerez onayı işi klonda `cd02b2e` commit'li (CookieConsent + /cerez-politikasi, tsc 0/lint 0 doğrulandı) ama **main'de YOK** → ilk işin bunu main'e taşı/push et. Sonrası ROADMAP'ten seç. Açık buglar: **B6d** (OTP SMS=NetGSM, maliyet→ertelendi). Askıda: İyzico gerçek sandbox (merchant hesabı).

## Lokal ortam / sırlar
`vasi-api/.dev.vars` (gitignore'lu, gerçek): JWT_SECRET, RESEND_API_KEY (test modu — yalnız hesap sahibine gönderir), APP_URL=http://localhost:3000. Lokal admin: `test@vasi.app / Test1234!` (is_admin=1), ayrı admin `ilkeronurkaya@gmail.com / Test1234!`. NOT: Resend key sohbete yapıştırılmıştı — canlıya çıkmadan ROTATE.
