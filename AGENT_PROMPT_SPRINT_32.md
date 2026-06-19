# AGENT PROMPT — SPRINT 32 Faz 1 (Dil tercihi kalıcılığı, B14)

> Yerel Qwen TS kodunu yazdı (MT1 backend, MT2 web). Migration (`0020`) + smoke testleri Claude yazdı (placement/test footgun). Her MT ayrı konuşma; mekanik str_replace.

## MT1 — Backend (vasi-api)
**`src/db/users.db.ts`** — `updateEmailVerified`'in altına:
```ts
export async function updateLanguage(env: Env, userId: string, language: string): Promise<void> {
  await env.DB.prepare('UPDATE users SET language = ? WHERE id = ?')
    .bind(language, userId)
    .run()
}
```
**`src/routes/me.ts`** — (a) import'a `updateLanguage` ekle; (b) GET `/me` user objesine `language: (user.language as string) ?? 'tr'`; (c) GET'ten sonra yeni route:
```ts
// ── Dil tercihi: kaydet (OTP YOK) ───────────────────────────────────────────
const SUPPORTED_LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar']

me.patch('/language', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => ({})) as Record<string, unknown>
  const language = body.language
  if (typeof language !== 'string' || !SUPPORTED_LANGS.includes(language)) {
    return c.json({ error: 'Geçersiz dil', code: 'VALIDATION_ERROR' }, 400)
  }
  await updateLanguage(c.env, userId, language)
  return c.json({ language }, 200)
})
```

## MT2 — Web (vasi-web)
**`src/app/(dashboard)/layout.tsx`** — `setStoredLang` import; `Me.user`'a `language: string`; `/me` yüklenince `setStoredLang(data.user.language as 'tr' | 'en')`.
**`src/app/(dashboard)/settings/page.tsx`** — dil seçici `onChange`: `setLang(next)` + `apiFetch('/api/v1/me/language', { method: 'PATCH', body: JSON.stringify({ language: next }) })`.

## Doğrulama (Claude)
vasi-api tsc 0 · vasi-web tsc 0 · lint 0 · smoke **61/61** (3 yeni dil testi). Migration kökte `0020_add_user_language.sql`.
