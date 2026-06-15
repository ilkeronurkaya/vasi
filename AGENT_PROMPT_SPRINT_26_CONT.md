# OpenHands Ajan Promtu — Sprint 26 DEVAM (i18n turu 2, kalan dosyalar)

> Önceki koşu yarıda kesildi. `lib/i18n.ts`, `dashboard/page.tsx`, `messages/page.tsx` ZATEN TAM. `messages/new/page.tsx` YARIM kaldı; 5 sayfa hiç başlanmadı.
> Yerel Qwen3.6-35B-A3B, klonda. **Bu bloğu OLDUĞU GİBİ yapıştır.** (iko: ajanı klondan başlat, `task_tracker` kapalı, raporuna güvenme.)

---

Sen sadece KOD yazıyorsun. Branch/commit/push/git YOK. `task_tracker` kullanma. Bitince değişen dosya listesi + `git status` ver.

## Bağlam

`vasi-web/src/lib/i18n.ts` içindeki `DICT` ZATEN tüm gerekli anahtarları içeriyor (TR + EN). **`lib/i18n.ts`'e DOKUNMA, yeni anahtar EKLEME.** Sadece aşağıdaki 6 sayfada hardcoded TR string'leri mevcut anahtarlarla `t()`'ye bağla.

Kullanım kalıbı (referans: `vasi-web/src/app/(dashboard)/dashboard/page.tsx` zaten böyle çevrildi):

```
import { useLang, t } from '@/lib/i18n';
const [lang] = useLang();
<h1>{t('new_title', lang)}</h1>
```

## DOKUNMA (TR bırak, değiştirme)

- Hata/doğrulama mesajları (`setStepError`, `setError`, `setSubmitError`, `setSectionMessages` text, `catch` metinleri).
- Toast/durum mesajları (başarı + hata; ödeme başarılı/başarısız metinleri).
- `placeholder="..."`, `aria-label="..."`, `confirm('...')` metinleri.
- `toLocaleDateString` / `toLocaleString` çağrıları — tarih biçimi `'tr-TR'` AYNEN.
- Stil/CSS/layout. Yeni `any` veya `useEffect` içi `setState` EKLEME.

## Dosya 1: `vasi-web/src/app/(dashboard)/messages/new/page.tsx` (YARIM — tamamla)
Import + `const [lang] = useLang()` + başlık/altbaşlık + adım çubuğu ZATEN yapıldı. Kalan değişiklikler:
- `<label htmlFor="title" ...>Mesajına bir başlık ver</label>` → `{t('new_label_title', lang)}`
- `<label htmlFor="body" ...>Mesajını yaz</label>` → `{t('new_label_body', lang)}`
- `<label htmlFor="recipientEmail" ...>Alıcı e-posta adresi</label>` → `{t('new_label_recipient_email', lang)}`
- Alıcı ekle butonu metni `Ekle` → `{t('new_add', lang)}`
- `<label htmlFor="scheduledAt" ...>Gönderim tarihi</label>` → `{t('new_label_send_date', lang)}`
- `<span style={labelStyle}>Hızlı seç</span>` → `{t('new_quick_select', lang)}`
- `{y} Yıl Sonra` → `{t('new_years_later', lang).replace('%s', String(y))}`
- Adım 5 loading `Oluşturuluyor...` → `{t('new_loading', lang)}`
- `Tekrar Dene` → `{t('new_retry', lang)}`
- Navigasyon `← Geri` → `{t('new_back', lang)}`; `İleri →` → `{t('new_next', lang)}`; `Oluştur ✓` → `{t('new_create', lang)}`
- DOKUNMA: `aria-label="Geri"`, tüm `placeholder` (Anneme mektup, Sevgili..., ali@gmail.com), `setStepError`/`setSubmitError` metinleri.

## Dosya 2: `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `STATUS_LABELS` objesini (Record<string,string>) SİL; durum rozetinde `{STATUS_LABELS[message.status] ?? message.status}` → `{t('status_' + message.status, lang)}`.
- Butonlar: `İptal Et`→`{t('detail_cancel', lang)}`; `Yeniden Zamanla`→`{t('detail_reschedule', lang)}`; `Zamanla`→`{t('detail_schedule', lang)}`; `Sil`→`{t('detail_delete', lang)}`; `Kaldır`→`{t('detail_remove', lang)}`.
- Loading `Yükleniyor...` → `{t('common_loading', lang)}`.
- `MESAJ İÇERİĞİ` → `{t('detail_content_label', lang)}`.
- `ALICILAR ({recipients.length})` → `{t('detail_recipients_label', lang)} ({recipients.length})`.
- `Gönderilecek:` → `{t('detail_will_send', lang)}` (tarih `toLocaleString('tr-TR',...)` AYNEN).
- Alt-başlık `Alıcı Ekle` → `{t('detail_add_recipient_title', lang)}`; label `Ad Soyad`→`{t('detail_name_label', lang)}`; label `E-posta`→`{t('detail_email_label', lang)}`.
- Ekle butonu: `{addLoading ? 'Ekleniyor...' : '+ Alıcı Ekle'}` → `{addLoading ? t('detail_adding', lang) : t('detail_add_recipient_btn', lang)}`.
- DOKUNMA: iki `confirm('...')`, `setAddError('Alıcı eklenemedi.')`, placeholder'lar.

## Dosya 3: `vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- Başlık `Mesajı Zamanla` → `{t('sched_title', lang)}`.
- `Mesaj` (özet label) → `{t('sched_message_label', lang)}`.
- `Gönderilecek Tarih ve Saat` → `{t('sched_datetime_label', lang)}`.
- Buton: `{loading ? 'Zamanlanıyor...' : 'Zamanla'}` → `{loading ? t('sched_loading', lang) : t('sched_btn', lang)}`.
- Mesaj yokken `Yükleniyor...` → `{t('common_loading', lang)}`.
- DOKUNMA: `setError(...)` metni.

## Dosya 4: `vasi-web/src/app/(dashboard)/settings/page.tsx`
`useLang`/`t` import + `const [lang, setLang] = useLang()` ZATEN var (dil bölümü çevrili). Kalan:
- `Ayarlar` → `{t('settings_title', lang)}`.
- Loading `Yükleniyor...` → `{t('common_loading', lang)}`.
- `renderSection` çağrılarındaki başlık/açıklama argümanları:
  - profile: `'Profil'`→`t('settings_profile_title', lang)`, açıklama→`t('settings_profile_desc', lang)`.
  - email: `'E-posta'`→`t('settings_email_title', lang)`, açıklama→`t('settings_email_desc', lang)`.
  - password: `'Şifre'`→`t('settings_password_title', lang)`, açıklama→`t('settings_password_desc', lang)`.
- Alan label'ları: `Ad`→`{t('settings_label_firstname', lang)}`, `Soyad`→`{t('settings_label_lastname', lang)}`, `Telefon`→`{t('settings_label_phone', lang)}`, `Mevcut E-posta`→`{t('settings_label_current_email', lang)}`, `Yeni E-posta`→`{t('settings_label_new_email', lang)}`, `Mevcut Şifre`→`{t('settings_label_current_password', lang)}`, `Yeni Şifre`→`{t('settings_label_new_password', lang)}`.
- `OTP Kodu` → `{t('settings_otp_label', lang)}`.
- Butonlar: iki `Kaydet`→`{t('settings_save', lang)}`; `İptal`→`{t('settings_cancel', lang)}`; alttaki `Geri`→`{t('common_back', lang)}`.
- DOKUNMA: tüm `setSectionMessages`/`setError` metinleri (OTP zorunlu, Bilgiler güncellendi., Değişiklik yok., vb.), placeholder'lar.

## Dosya 5: `vasi-web/src/app/(dashboard)/upgrade/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `Planını Yükselt` → `{t('upgrade_title', lang)}`; altbaşlık → `{t('upgrade_subtitle', lang)}`.
- `Mevcut Plan` → `{t('upgrade_current_plan', lang)}`.
- `{plan.message_limit} mesaj` → `{plan.message_limit + ' ' + t('upgrade_messages_suffix', lang)}`.
- `{plan.recipient_limit} alıcı` → `{plan.recipient_limit + ' ' + t('common_recipients', lang)}`.
- `/ay` → `{t('upgrade_per_month', lang)}`.
- Buton: `{currentPlan === plan.slug ? 'Kullanımda' : 'Premium\'a Yükselt'}` → `{currentPlan === plan.slug ? t('upgrade_in_use', lang) : t('upgrade_btn', lang)}`.
- `Geri` → `{t('common_back', lang)}`; loading `Yükleniyor...` → `{t('common_loading', lang)}`.
- DOKUNMA: ödeme `setMessage`/`setError` metinleri.

## Dosya 6: `vasi-web/src/app/(auth)/verify-email/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `E-postanızı Doğrulayın` → `{t('verify_title', lang)}`; altbaşlık → `{t('verify_subtitle', lang)}`.
- Buton: `{loading ? 'Doğrulanıyor...' : 'Doğrula'}` → `{loading ? t('verify_loading', lang) : t('verify_submit', lang)}`.
- `Kod tekrar gönderildi.` → `{t('verify_resent', lang)}`.
- `Kodu almadınız mı? <span ...>Tekrar gönder</span>` → `{t('verify_resend_q', lang)} <span ...>{t('verify_resend_link', lang)}</span>`.
- DOKUNMA: `setError(...)` metni, placeholder `000000`.

## Bitince kendi kontrolün
- Değişen dosyalar: SADECE yukarıdaki 6 sayfa. `lib/i18n.ts`'e ve daha önce biten `dashboard`/`messages` sayfalarına DOKUNMA.
- Mümkünse `vasi-web` kökünde `pnpm exec tsc --noEmit` koş, çıktısını rapora ekle. Smoke'u SEN koşma.
- Yeni `any` / `useEffect` içi `setState` eklemedin.

## Çıktı (rapor)
(1) değişen dosya listesi, (2) `git status`, (3) varsa `tsc --noEmit` çıktısı. PR/commit/branch İDDİA ETME.
