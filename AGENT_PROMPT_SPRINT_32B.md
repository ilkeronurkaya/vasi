# AGENT PROMPT — SPRINT 32 Faz 2 (6 dil i18n altyapısı)

> Yerel Qwen yazdı (MT1 i18n.ts, MT2 layout+settings). Mekanik str_replace. Doğrulama: Claude (tsc+lint).

## MT1 — vasi-web/src/lib/i18n.ts
- `Lang` → `'tr'|'en'|'de'|'fr'|'es'|'ar'`; `SUPPORTED_LANGS` + `RTL_LANGS` export.
- `DICT` tipi → `Partial<Record<Lang, ...>>` (de/fr/es/ar Faz 3'te dolacak).
- `settings_lang_de/fr/es/ar` anahtarları (tr + en DICT, dil adları).
- `getLang` → `SUPPORTED_LANGS.includes(saved)` ile 6 dile clamp.
- `t` → `DICT[lang]?.[key] ?? DICT.tr?.[key] ?? key` (çevrilmeyen dil TR'ye düşer — Faz 3'e kadar).

## MT2 — web
- `(dashboard)/layout.tsx`: `RTL_LANGS`+`Lang` import; `setStoredLang(... as Lang)`; yeni effect `document.documentElement.dir = RTL_LANGS.has(lang) ? 'rtl':'ltr'` (`[lang]`).
- `(dashboard)/settings/page.tsx`: `Lang` import; onChange cast `as Lang`; seçiciye de/fr/es/ar option'ları.

## Not
Faz 2 = altyapı. DE/FR/ES/AR seçilince metin şimdilik TR (graceful fallback); **Faz 3** tam DICT çevirisini ekleyince diller gerçekten dolacak. AR seçilince layout RTL olur.

## Doğrulama (Claude)
vasi-web tsc 0 · lint 0 · smoke 61/61 (web-only, backend etkilenmez).
