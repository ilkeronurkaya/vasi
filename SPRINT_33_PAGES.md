# SPRINT 33 — Eksik landing sayfaları (B16) + çerez bar dil fix (B15)

> Kaynak: BUGS B15, B16. iko kararı: landing footer'daki TÜM eksik linklere sayfa; hukuki olanlar gerçek route; şirket sayfaları Claude taslak/"yakında"; hepsi tek seferde.

## Yapılanlar
- **B15:** `CookieConsent` artık `useLang()` ile reaktif → dil değişince çerez bar'ı da çevriliyor (yerel ajan, mount-only useState kaldırıldı).
- **Paylaşılan bileşen:** `components/InfoPage.tsx` — `useLang` reaktif, AR RTL, `next/link` back. İçerik `lib/infoPages.ts`'ten gelir (6 dil). Claude yazdı (içerik = drift riski).
- **10 yeni route (edge, server component → InfoPage):**
  - Hukuki (gerçek metin taslağı, iko hukuk onayı bekler): `/gizlilik`, `/kosullar`, `/kvkk`
  - Ürün: `/ozellikler`, `/guvenlik`, `/yol-haritasi`
  - Şirket: `/hakkimizda`, `/iletisim` (taslak), `/blog`, `/kariyer` ("yakında")
- **Landing footer wiring (yerel ajan):** fp1→/ozellikler, fp2→/#pricing (mevcut bölüm), fp3→/guvenlik, fp4→/yol-haritasi; fc1→/hakkimizda, fc2→/blog, fc3→/kariyer, fc4→/iletisim; fl1→/gizlilik, fl2→/kosullar, fl3→/kvkk. (fl4 Çerezler = modal, dokunulmadı.)

## Doğrulama
vasi-web tsc 0 · lint 0 (mevcut admin uyarıları hariç; InfoPage back linki `<Link>`'e çevrildi) · smoke 61/61 (saf frontend). Tüm sayfalar 6 dil + AR RTL.

## Notlar / sonraki
- Hukuki metinler **taslak** — yayından önce iko hukuki gözden geçirmeli.
- About/İletişim içeriği makul taslak; Blog/Kariyer "yakında" — iko gerçek içerik verince güncellenecek.
- navbar-logo (`href="#"`) ve sosyal linkler (dış) kapsam dışı bırakıldı.
