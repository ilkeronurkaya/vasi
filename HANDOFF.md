# Vasi App BD — Oturum El Geçirme Notu
_Tarih: 2026-06-11 öğleden sonra (güncellendi)_

> Proje konumu: `~/Projects/vasi` (2026-06-10'da iCloud'dan taşındı).
> GitHub: `git@github.com:ilkeronurkaya/vasi.git` (private) — push kullanıcı terminalinden SSH ile.

---

## Projeye Genel Bakış

Vasi, insanların geleceğe mesaj bırakmasını sağlayan bir platform.
Monorepo: `vasi-web` (Next.js 15), `vasi-api` (Cloudflare Workers/Hono), `crew/` (smolagents AI geliştirme ekibi).

**Çalıştırma:**
```bash
cd crew && chainlit run manager.py
```

**Manager komutları** (Chainlit'te veya telefondan ntfy ile):
`sprint N` · `test` · `durum` · `log` · `kontrol` · `migrate` · `dev` · `durdur` · `bildirim` · `sprintler`

---

## Sprint Durumu

| Sprint | Kapsam | Durum |
|--------|--------|-------|
| 1-7 | Auth, CRUD, zamanlama, UX temelleri | ✅ |
| 8 | Gerçek veri (/me, recipient_count) | ✅ denetlendi |
| 9 | Plan limiti, /messages listesi, detay alıcıları | ✅ denetlendi |
| 10 | Apple tasarım dili (DESIGN.md v2) | ✅ denetlendi |
| 11 | Sprint 10 kaçakları + NAV düzeni | ✅ denetlendi |
| 12 | E-posta teslim bug'ı + /upgrade + iptal/yeniden zamanlama | ✅ denetlendi |
| 13 | Admin backend (login, users, stats, reports, settings) | ✅ denetlendi — migration'lar + 6 endpoint Claude tamamladı |
| 14 | Admin Panel UI | ✅ denetlendi — users/settings sayfaları + guard fix Claude tamamladı |
| — | Tester Ajani + smoke testler + canlı log | ✅ kuruldu (sprint dışı) |
| — | Tasarım rafinesi (ui-ux-pro-max skill ile) | ✅ landing + tutarlılık + a11y |
| 15 | Buton v2 + UI cilası + admin↔landing fiyat senkronu | ✅ hibrit (crew 2 görev + Claude 5 görev) |
| 16 | E-posta teslimatı (EMAIL_FROM, tarih engeli, manuel tetikleyici) | ✅ Claude uyguladı — testler 19/19 |

### Güncel durum (2026-06-11 öğleden sonra)
- **Tester Ajani devrede**: `crew/tests/api_smoke.py` deterministik smoke paketi (izole DB, port 8788, ~16 test). Her sprint sonunda otomatik koşar; hata bulursa sahibine (Backend/UX ajanı) düzelttirir (2 deneme), olmazsa log'a "manuel kontrol" düşer. Bağımsız: `test` komutu.
- **Tester'ın ilk avı**: alıcı ekleme + zamanlama akışı Sprint 2-3'ten beri şema uyumsuzluğuyla bozukmuş — düzeltildi (recipients user_id kaldırıldı, migration 0013 teslimat kolonları, markFailed→'error').
- **Canlı log**: `sprint N` ve `test` çalışırken Chainlit mesajında sprint.log son satırları 3 sn'de bir akar.
- **Mesaj oluşturma bug'ı düzeltildi**: POST /messages artık id'li satır döndürüyor (wizard "Message not found" hatasıydı).
- Admin: `test@vasi.app` is_admin=1 (lokal). Admin giriş PBKDF2 düzeltmesiyle çalışıyor.

## Sıradaki İşler
1. `git push origin main` (yerelde commit'li, push bekliyor olabilir — `git status` bak)
2. `pnpm db:migrate:local` (0013 uygulanmamışsa)
3. **Sprint 15'i çalıştır** → Claude denetimi (özellikle Task 2 inline buton temizliği, Task 5 mobil sidebar, Task 7 landing fiyat senkronu) → main'e ff-merge → push
4. Tarayıcı testi: localhost:3000 (test@vasi.app / Test1234!) + /admin
5. Sonrası: Resend e-posta gerçek test (`wrangler secret put RESEND_API_KEY` veya .dev.vars), İyzico sandbox (ayrı sprint — /upgrade CTA "Yakında")

### Bekleyen
- crewai 1.x migration (düşük öncelik)
- check_css'e "inline buton stili" kuralı eklenebilir (DESIGN.md Buton v2 kuralını otomatik denetler)

---

## Süreç Kuralları (önemli — denenmiş dersler)

1. **Sprint sonrası denetim ZORUNLU**: tsc temiz olsa bile bak: `'use client'` ilk satır mı, rotalar index.ts'e mount edilmiş mi, API yanıt şeması frontend beklentisiyle uyuşuyor mu, tsconfig'lere dokunulmuş mu, kök dizine stray `src/` yazılmış mı. (Hepsi yaşandı.)
2. **ADIM LİMİTİ DOLDU** uyarısı = o görevin dosyaları büyük ihtimalle eksik/yarım.
3. **Crew'a şema değişikliği yaptırma kuralı** fix prompt'ta: .wrangler DB'lerine elle ALTER yasak; değişiklik = yeni migration. (Yerel model dev DB'yi elle değiştirip kilitlenmişti.)
4. **Görev yazımı**: ≤4000 karakter, kod örneği gömülü, "önce şu dosyayı oku" + "şuna DOKUNMA" sınırları açık. Sprint başına ideal görev sayısı ≤5 (15'te 7 var — denetimde dikkat).
5. **Git akışı**: crew sprint-N branch açar → denetim → `git checkout main && git merge --ff-only sprint-N` → kullanıcı push eder.
6. Commit kimliği sandbox'tan: `git -c user.name="İlker Onur Kaya" -c user.email="ilkeronurkaya@gmail.com" commit ...`

---

## API Sözleşmesi (sık kullanılan)

- `POST /api/v1/messages` → `{ title, message_type, content_text }` → mesaj satırı (id dahil); limit dolunca 403 `LIMIT_REACHED`
- `POST /api/v1/messages/:id/recipients` → `{ full_name, email }`
- `POST /api/v1/messages/:id/schedule` → `{ scheduled_at }` (ISO)
- `GET /api/v1/me` → `{ user, plan, usage: { messages_used, messages_limit } }`
- `GET /api/v1/messages` → liste (recipient_count dahil); `GET /:id` → detay (recipients dahil)
- Admin (`/api/v1/admin/*`, Bearer admin token): `auth/login` → `{ accessToken }`, `users`, `users/:id/status|plan`, `stats/overview|messages|plans`, `reports/users|revenue|failed-deliveries`, `settings` GET/PUT
- `GET /api/v1/public/pricing` → auth'suz, admin_settings fiyat/limitleri (Sprint 15 Task 6)
- Frontend: kullanıcı istekleri `apiFetch` (authToken), admin istekleri `adminFetch` (adminToken) — `src/lib/api.ts`

---

## Tasarım Sistemi

Kaynak: `DESIGN.md` — renk tokenleri + **"APPLE TASARIM DİLİ v2"** (tipografi, boşluk, kart/form/sidebar kuralları, hareket) + **"Buton Sistemi v2"** (yumuşak dikdörtgen, 3 seviye; inline buton stili yasak).
Kısa yasaklar: Tailwind custom renk class'ı yok (`bg-Copper` ❌), `transition: all` yok, 2px focus border yerine focus-ring token.

---

## Test Altyapısı

- `crew/tests/api_smoke.py` — deterministik; izole wrangler dev (:8788, geçici DB, migrations baştan). Statik kontroller ('use client', rota mount) + API akışları (auth→mesaj→alıcı→zamanlama→me→admin→limit→public pricing).
- Çıktı: `RESULTS_JSON:` satırı; Tester Ajani bunu parse edip hataları owner'a göre dağıtır.
- Test dosyası ajanlara karşı korumalı: "test doğru, kod hatalı" + DB ALTER yasağı prompt'ta.

---

## Bildirim / Uzaktan Kumanda

- Sprint/test bitince: ntfy push (`vasi-iko-7ca81627`) + iMessage ("Patron Sprint X tamamlandı. Bilgine.")
- Telefondan komut: ntfy `vasi-iko-cmd-57f994b1` konusuna yaz (`sprint 15`, `test`, `durum`...). Yer imi linkleri: `https://ntfy.sh/vasi-iko-cmd-57f994b1/publish?message=durum`

---

## Model Bilgisi

- **Güçlü**: `qwen2.5-coder:32b` — karmaşık görevler. **Hızlı**: `qwen2.5-coder:7b` — basit fix'ler. Ollama: `localhost:11434`
- Bilinen zaaf: uzun düzeltme oturumlarında context şişince kilitlenme (`###</code>` döngüsü) — adım limitleri bunun sigortası.
