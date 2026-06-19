# SPRINT 31 — Çerez politikası popup'a (B13)

> Kaynak: 06-19 elle test, BUGS **B13**. iko kararı: sıradaki sprint yalnız bug. Uygulayıcı: yerel Qwen (OpenHands), klonda. Promt: `AGENT_PROMPT_SPRINT_31.md`. Doğrulama: Claude (tsc + lint; saf frontend → smoke etkilenmez).

## Sorun
Çerez politikası ayrı route (`/cerez-politikasi`). Girişten sonra açılıp "Ana sayfaya dön" linkine basınca landing'e gidiyor → kullanıcı uygulamadan çıkıyor. iko: **ayrı sayfa olmasın, popup/modal olsun.**

## Çözüm (global event mimarisi — page.tsx'i en az dokunmak için)
- **YENİ** `CookiePolicyModal` bileşeni: kendi içinde 6 dilli içerik + `open` state; `window` üzerinde `vasi-open-cookie-policy` event'ini dinler, gelince açılır. Overlay + kapat butonu + backdrop tıkla-kapat. RTL + tasarım token'ları.
- Modal **layout.tsx'te bir kez** mount edilir (CookieConsent'in yanında).
- İki giriş noktası modalı event ile açar:
  1. `CookieConsent` banner'ındaki "Çerez Politikası" linki → `<button>` (event dispatch). `Link` importu kaldırılır.
  2. Landing footer'daki link (`page.tsx` ~satır 693) → `<a onClick>` (event dispatch). page.tsx'e yeni import/state EKLENMEZ (sadece tek satır swap; `Link` importu page.tsx'te başka yerlerde kullanıldığı için KALIR).
- **`vasi-web/src/app/cerez-politikasi/page.tsx` SİLİNİR** (route kalkar). Silme işini Claude transfer sırasında yapar.

İçerik kaynağı: silinen sayfanın `CONTENT` objesi (6 dil) modale taşınır; `back` ("ana sayfaya dön") yerine `close` ("Kapat") eklenir.

## Dokunulan dosyalar
1. `vasi-web/src/components/CookiePolicyModal.tsx` — **YENİ** (event-driven modal, 6 dil).
2. `vasi-web/src/app/layout.tsx` — import + `<CookiePolicyModal />` mount.
3. `vasi-web/src/components/CookieConsent.tsx` — link→button (event), `Link` importu kaldır.
4. `vasi-web/src/app/page.tsx` — footer link→`<a onClick>` (event). Tek satır.
5. `vasi-web/src/app/cerez-politikasi/page.tsx` — **SİL** (Claude, transfer sırasında).

**Yeni paket YOK. Migration YOK. Backend YOK → smoke etkilenmez.** Edge: bileşen, route değil → `export const runtime` gerekmez.

## Kabul kriterleri
- [ ] `vasi-web` `tsc --noEmit` 0 hata; `next lint` 0 error (mevcut admin uyarıları hariç).
- [ ] Çerez banner'ındaki link tıklanınca modal açılır (sayfa değişmez); kapat çalışır.
- [ ] Landing footer "Çerezler" linki modalı açar (landing'de kalır).
- [ ] `/cerez-politikasi` route'u artık yok (404) — kaynak silindi; ona referans kalmadı.
- [ ] 6 dil + AR RTL modalde düzgün; tasarım token'ları (hardcode renk yok, `var(--...)`).
- [ ] `git diff` kapsam temiz: yalnız yukarıdaki dosyalar; yeni `any` yok.
