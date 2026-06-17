# Sprint 27 — Güvenlik + OTP & UX düzeltmeleri + lint temizliği

> Kaynak: `BUGS.md` B5 (P0), B6 (a–c), B7, B8, B9, B2, B3 — 06-15 elle test turu.
> İlke (proje kuralı): **stabil + en az maliyet**. Tümü iç iş; dış hesap/maliyet yok.
> Uygulayıcı: yerel Qwen3.6-35B-A3B (LM Studio + OpenHands), klonda, SADECE kod. Git/branch/push iko'da.
> **Context taşması dersi (S26):** bu sprint hacimli → ajan promtu **bug-bug / dosya-dosya** bölündü (`AGENT_PROMPT_SPRINT_27.md`). Her mini-promt AYRI/YENİ OpenHands konuşmasına yapıştırılır. B3 (lint) kod tabanı geneli → **kendi turlarına** ayrıldı, en sona.
> Doğrulama HER ZAMAN iko+Claude: tsc + smoke (`:3000` kapalı) + admin/settings akışları Chrome'dan elle.

---

## Kapsam ve sıra

Önce güvenlik (B5 P0 → B6), sonra UX (B7, B8, B9, B2), en son lint (B3). Sıra önemli: B5 OTP şemasını değiştirir, B6 aynı dosyaya (`me.ts`) dokunur — B5'ten sonra gelmeli.

| # | Bug | Şiddet | Dosya(lar) | Tür |
|---|-----|--------|-----------|-----|
| 1 | **B5** cross-context OTP açığı | **P0** | yeni migration `0018` + `email-verifications.db.ts` + 3 rota (auth.service, admin, me) | backend mantık + migration |
| 2 | **B6 a–c** şifre politikası + OTP'den önce doğrulama | P1 | `me.ts` (server) + `settings/page.tsx` (client) | backend + frontend |
| 3 | **B7** OTP alanı maskeleme | P2 | 4 input (admin/login, verify-email, settings, m/[token]) | frontend |
| 4 | **B8** "Teslimatları Şimdi Çalıştır" UI redesign | P2 | `admin/page.tsx` | frontend (stil) |
| 5 | **B9 + B2** plan formu label + 0-default | P2 | `admin/settings/page.tsx` | frontend |
| 6 | **B3** kod tabanı geneli lint temizliği | P1 | proje geneli | ayrı turlar |

---

## B5 (P0) — Cross-context OTP auth açığı

**Kök neden:** `email_verifications` tablosunda OTP'nin **amacı** yok. `findActiveByUser(userId)` amaç gözetmeden kullanıcının aktif OTP'sini döndürüyor → profil/şifre akışında üretilen OTP **admin girişinde** kabul ediliyor. Ayrıca birden çok aktif kayıt varsa `.first()` rastgele tek satır çekiyor → admin'in kendi OTP'si reddedilebiliyor.

**Çözüm (iki parça):**

1. **Şema:** yeni migration `migrations/0018_email_verifications_purpose.sql` → `purpose` kolonu ekle (`TEXT NOT NULL DEFAULT 'email_verify'`). Değerler: `email_verify` (kayıt + e-posta değişimi), `admin_login`, `profile` (profil/şifre değişimi).
2. **Kod:** `create`/`findActiveByUser` imzalarına `purpose` ekle; `findActive` sorgusunu `purpose = ?` ile kapsamla **ve** `ORDER BY created_at DESC, rowid DESC LIMIT 1` ile en yeni aktif kaydı seç. 8 çağrı yerini doğru amaçla güncelle (detay: agent promtu).

**Kabul kriterleri:**
- Profil/şifre akışında üretilen OTP **admin girişinde REDDEDİLİR** (ve tersi).
- Aynı kullanıcının birden çok aktif OTP'si varken doğru amacın **en yeni** kodu kabul edilir.
- Kayıt→verify-email, admin login OTP, profil OTP akışları **çalışmaya devam eder** (smoke 58/58).
- `purpose` DEFAULT'u sayesinde eski satırlar geçerli kalır; migration kök `migrations/`'a yazılır.

---

## B6 a–c — Şifre değişimi: politika + OTP'den ÖNCE doğrulama

**Kök neden:** `me.ts` şifre kontrolü (uzunluk) OTP **tüketildikten sonra**; settings "Kaydet" şifreyi doğrulamadan `request-otp` çağırıyor → 6 hane girilip OTP alınıyor, sonra "8 hane" hatası, OTP boşa.

**Çözüm:**
- **(a) Politika:** ≥8 karakter + ≥1 küçük + ≥1 büyük + ≥1 rakam, **özel karakter YOK** (yalnız alfanümerik `[A-Za-z0-9]`). Hem client hem server uygular. Tek kaynak: paylaşılan regex/kural.
- **(b) Canlı kutu:** settings şifre alanı yanında kuralları **canlı** göster (her kural ✓/✗); kural seti sağlanana dek "Kaydet/OTP iste" pasif.
- **(c) OTP'den ÖNCE doğrulama:** Client `request-otp` çağırmadan önce yeni şifre kuralını + mevcut şifre alanının doluluğunu kontrol eder. Server `PATCH /profile`'da yeni şifre politikası + mevcut şifre doğrulaması **`markUsed`'tan ÖNCE** yapılır; başarısızsa OTP tüketilmez (400/401 döner, OTP aktif kalır).

**Kapsam dışı:** B6d (OTP'yi SMS kanalına taşıma) → **S28** (NetGSM).

**Kabul kriterleri:**
- Zayıf şifre (kural ihlali) ile OTP **istenemez** (client) ve `PATCH /profile` **OTP tüketmeden** 400 döner (server).
- Özel karakterli şifre reddedilir; alfanümerik + büyük/küçük/rakam kabul.
- Doğru akışta şifre değişir, smoke etkilenmez.

---

## B7 — OTP/doğrulama kodu alanı maskeleme

`type="text"` → `type="password"` (sayısal klavye için `inputMode="numeric"` korunur). 4 alan:
- `app/admin/login/page.tsx` (admin OTP, ~satır 98)
- `app/(auth)/verify-email/page.tsx` (kayıt doğrulama OTP)
- `app/(dashboard)/settings/page.tsx` (profil/email/şifre OTP, ~satır 210)
- `app/m/[token]/page.tsx` (alıcı OTP)

**Kabul:** kodlar girilirken maskeli görünür; yapıştırma + maxLength + sadece-rakam mantığı bozulmaz.

---

## B8 — "Teslimatları Şimdi Çalıştır" UI redesign

`app/admin/page.tsx` içindeki run-due butonu Vasi tasarım diline uydurulur (Buton Sistemi v2: `btn btn-primary`/uygun varyant, `DESIGN.md`). Sonuç/hata mesajı yerleşimi düzgün. Davranış (run-due çağrısı + sonuç) **değişmez**.

---

## B9 + B2 — Plan formu: label + 0-default

`app/admin/settings/page.tsx` plan düzenleme/ekleme formu (~satır 127–129):
- **B9:** her sayısal input'a görünür **label** ekle (Fiyat (₺) / Mesaj Limiti / Alıcı Limiti) — placeholder yetersiz.
- **B2:** `value={...price_monthly}` vb. `0` iken boş göster (`value === 0 ? '' : value`) ve `onChange`'de `parseInt(e.target.value) || 0` ile `099` sorununu kapat. Kayıt değeri doğru kalır.

**Kabul:** alanların ne olduğu net; boş alana yazınca başında `0` kalmaz; kayıt 201/200 doğru.

---

## B3 — Kod tabanı geneli lint temizliği (AYRI turlar, en son)

`next build` tsc'yi geçiyor ama ESLint'te kırılıyor → **prod deploy bloke**. Hatalar: `@typescript-eslint/no-explicit-any`, `react-hooks/set-state-in-effect`, `@next/next/no-html-link-for-pages`, `react/no-unescaped-entities`.

**Yaklaşım:** hacimli + bağlam yutar → **kural-kural, küçük dosya gruplarıyla** ayrı OpenHands turları. Sıra: (1) `no-html-link-for-pages` (`<a href="/...">` → `<Link>`), (2) `no-unescaped-entities` (kaçış), (3) `no-explicit-any` (gerçek tipler; mümkünse `unknown` + daraltma), (4) `set-state-in-effect` (S25'teki `useSyncExternalStore`/event kalıbına çevir — yeni borç ekleme). Davranış değişmez.

**Geçici alternatif (acil deploy gerekirse):** `next.config` `eslint.ignoreDuringBuilds=true` — borç kapanmaz, sadece kapıyı açar. Tercih: gerçek temizlik.

**Kabul:** `pnpm --filter vasi-web build` ESLint'siz geçer (veya hedef kural grubu temiz); tsc temiz; smoke 58/58; davranış aynı.

---

## Doğrulama planı (iko + Claude)

1. Her mini-tur sonrası Claude klondan diff inceler (kapsam sızıntısı / yeni `any` / tarih bozulması yok).
2. B5/B6 sonrası **iko smoke koşar** (`:3000` kapalı). Smoke cross-context OTP'ye dayanıyorsa harness gözden geçirilir (artık dayanmamalı).
3. Admin/settings akışları (plan formu, run-due, OTP maskeleme) Chrome'dan elle.
4. B3 sonrası `pnpm --filter vasi-web build` (ESLint kapısı).
5. **Sprint kapanış ritüeli:** B5–B9 + B2 + B3'ün her biri için iko elle test + işaretleme → doğrulanan `BUGS.md`'de **Kapandı**'ya taşınır.

## iko hazırlık komutları

```
cd ~/Projects/vasi
git checkout main && git pull origin main
cd ~/Projects/vasi-agent && git checkout main && git pull origin main
rm -f ~/Projects/vasi-agent/.git/index.lock
```
LM Studio: Context Length 65536 (reload), "Serve on Local Network" AÇIK, Condenser AÇIK. Her mini-promt için YENİ konuşma.
