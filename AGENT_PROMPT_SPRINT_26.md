# OpenHands Ajan Promtu — Sprint 26 (i18n turu 2)

> Yerel Qwen3.6-35B-A3B (LM Studio + OpenHands), klonda. **Aşağıdaki bloğu OLDUĞU GİBİ yapıştır.**
> Hatırlatma (iko): ajanı HEP klondan başlat; `task_tracker`'ı kapalı tut; ajan raporuna güvenme, `git -C ~/Projects/vasi-agent diff` ile çapraz doğrula.

---

Sen sadece KOD yazıyorsun. Branch açma, commit, push, git komutu YOK. `task_tracker` kullanma. Sadece çalışma ağacındaki dosyaları düzenle, bitince değişen dosya listesini + `git status` çıktısını ver.

## Görev

Vasi web uygulamasında, EN diline geçilince hâlâ Türkçe kalan KULLANICI sayfalarındaki STATİK arayüz metnini, mevcut i18n altyapısıyla çevir. Yeni API, yeni migration, stil değişikliği YOK. Yalnız `vasi-web/src/` altında 9 dosya.

Önce `/workspace/AGENTS.md` oku. Altyapı: `vasi-web/src/lib/i18n.ts` → `useLang()` ve `t(key, lang)`. Kullanım kalıbı (referans: `vasi-web/src/app/(dashboard)/dashboard/page.tsx` zaten böyle):

```
import { useLang, t } from '@/lib/i18n';
const [lang] = useLang();
<h1>{t('msgs_title', lang)}</h1>
```

## ÇOK ÖNEMLİ — DOKUNMA listesi (bunları TR bırak, hiç değiştirme)

- Doğrulama/hata mesajı string'leri (`setStepError(...)`, `setError(...)`, `setSubmitError(...)`, `setSectionMessages(... text: ...)`, `catch` içindeki metinler).
- Toast/durum mesajları (başarı + hata; örn. "Bilgiler güncellendi.", ödeme başarılı/başarısız metinleri).
- `placeholder="..."` öznitelikleri.
- `confirm('...')` diyalog metinleri.
- `aria-label="..."` metinleri.
- `toLocaleDateString(...)` / `toLocaleString(...)` çağrıları — TARİH BİÇİMİ `'tr-TR'` AYNEN KALIR.
- Stil/`style`/CSS, sınıf adları, layout. Yalnız metin değiştir.

Yeni `any` tipi EKLEME. `useEffect` içinde `setState` kalıbı EKLEME.

## ADIM 1 — `vasi-web/src/lib/i18n.ts`: DICT'e anahtar ekle

`DICT.tr` ve `DICT.en` objelerinin İÇİNE, mevcut anahtarları silmeden, aşağıdaki anahtarları ekle. Sol değer `tr`, sağ değer `en`.

tr/en çiftleri:
- status_draft: 'Taslak' / 'Draft'
- status_scheduled: 'Zamanlanmış' / 'Scheduled'
- status_sent: 'Gönderildi' / 'Sent'
- status_delivered: 'Teslim Edildi' / 'Delivered'
- status_failed: 'Başarısız' / 'Failed'
- common_recipients: 'alıcı' / 'recipients'
- common_loading: 'Yükleniyor...' / 'Loading...'
- common_back: 'Geri' / 'Back'
- msgs_title: 'Mesajlarım' / 'My Messages'
- msgs_new: '+ Yeni Mesaj' / '+ New Message'
- msgs_empty_title: 'Henüz mesaj yok' / 'No messages yet'
- msgs_empty_subtitle: 'Sevdiklerine geleceğe mesaj bırak' / 'Leave a message for your loved ones in the future'
- msgs_create_first: 'İlk Mesajını Oluştur' / 'Create Your First Message'
- new_title: 'Yeni Mesaj' / 'New Message'
- new_subtitle: '5 adımda mesajını oluştur' / 'Create your message in 5 steps'
- new_step_content: 'İçerik' / 'Content'
- new_step_recipients: 'Alıcılar' / 'Recipients'
- new_step_schedule: 'Zamanlama' / 'Scheduling'
- new_step_preview: 'Önizleme' / 'Preview'
- new_step_create: 'Oluştur' / 'Create'
- new_label_title: 'Mesajına bir başlık ver' / 'Give your message a title'
- new_label_body: 'Mesajını yaz' / 'Write your message'
- new_label_recipient_email: 'Alıcı e-posta adresi' / 'Recipient email address'
- new_add: 'Ekle' / 'Add'
- new_label_send_date: 'Gönderim tarihi' / 'Send date'
- new_quick_select: 'Hızlı seç' / 'Quick select'
- new_years_later: '%s Yıl Sonra' / 'In %s Years'
- new_loading: 'Oluşturuluyor...' / 'Creating...'
- new_retry: 'Tekrar Dene' / 'Try Again'
- new_next: 'İleri →' / 'Next →'
- new_back: '← Geri' / '← Back'
- new_create: 'Oluştur ✓' / 'Create ✓'
- detail_cancel: 'İptal Et' / 'Cancel'
- detail_reschedule: 'Yeniden Zamanla' / 'Reschedule'
- detail_schedule: 'Zamanla' / 'Schedule'
- detail_delete: 'Sil' / 'Delete'
- detail_content_label: 'MESAJ İÇERİĞİ' / 'MESSAGE CONTENT'
- detail_recipients_label: 'ALICILAR' / 'RECIPIENTS'
- detail_will_send: 'Gönderilecek:' / 'Will be sent:'
- detail_add_recipient_title: 'Alıcı Ekle' / 'Add Recipient'
- detail_name_label: 'Ad Soyad' / 'Full Name'
- detail_email_label: 'E-posta' / 'Email'
- detail_remove: 'Kaldır' / 'Remove'
- detail_adding: 'Ekleniyor...' / 'Adding...'
- detail_add_recipient_btn: '+ Alıcı Ekle' / '+ Add Recipient'
- sched_title: 'Mesajı Zamanla' / 'Schedule Message'
- sched_message_label: 'Mesaj' / 'Message'
- sched_datetime_label: 'Gönderilecek Tarih ve Saat' / 'Send Date and Time'
- sched_btn: 'Zamanla' / 'Schedule'
- sched_loading: 'Zamanlanıyor...' / 'Scheduling...'
- settings_title: 'Ayarlar' / 'Settings'
- settings_profile_title: 'Profil' / 'Profile'
- settings_profile_desc: 'Ad, soyad ve telefon numaranızı güncelleyin.' / 'Update your first name, last name and phone number.'
- settings_email_title: 'E-posta' / 'Email'
- settings_email_desc: 'Yeni e-posta adresinizi girin. Değişiklik sonrası mevcut adresinize OTP gönderilecek.' / 'Enter your new email address. After the change, an OTP will be sent to your current address.'
- settings_password_title: 'Şifre' / 'Password'
- settings_password_desc: 'Mevcut şifrenizi ve yeni şifrenizi girin. Yeni şifre en az 8 hane olmalıdır.' / 'Enter your current and new password. The new password must be at least 8 characters.'
- settings_label_firstname: 'Ad' / 'First name'
- settings_label_lastname: 'Soyad' / 'Last name'
- settings_label_phone: 'Telefon' / 'Phone'
- settings_label_current_email: 'Mevcut E-posta' / 'Current Email'
- settings_label_new_email: 'Yeni E-posta' / 'New Email'
- settings_label_current_password: 'Mevcut Şifre' / 'Current Password'
- settings_label_new_password: 'Yeni Şifre' / 'New Password'
- settings_otp_label: 'OTP Kodu' / 'OTP Code'
- settings_save: 'Kaydet' / 'Save'
- settings_cancel: 'İptal' / 'Cancel'
- upgrade_title: 'Planını Yükselt' / 'Upgrade Your Plan'
- upgrade_subtitle: 'Farklı planlarımızla mesaj gönderme deneyiminizi artırın.' / 'Enhance your messaging experience with our different plans.'
- upgrade_current_plan: 'Mevcut Plan' / 'Current Plan'
- upgrade_messages_suffix: 'mesaj' / 'messages'
- upgrade_per_month: '/ay' / '/mo'
- upgrade_in_use: 'Kullanımda' / 'In Use'
- upgrade_btn: 'Premium\'a Yükselt' / 'Upgrade to Premium'
- verify_title: 'E-postanızı Doğrulayın' / 'Verify Your Email'
- verify_subtitle: 'E-postanıza gönderilen 6 haneli kodu girin.' / 'Enter the 6-digit code sent to your email.'
- verify_loading: 'Doğrulanıyor...' / 'Verifying...'
- verify_submit: 'Doğrula' / 'Verify'
- verify_resent: 'Kod tekrar gönderildi.' / 'Code resent.'
- verify_resend_q: 'Kodu almadınız mı?' / 'Didn\'t receive the code?'
- verify_resend_link: 'Tekrar gönder' / 'Resend'

## ADIM 2 — Sayfa sayfa dönüşümler

### Dosya: `vasi-web/src/app/(dashboard)/dashboard/page.tsx`
Zaten `useLang`/`t` import edilmiş, `const [lang]` var.
- `STATUS_LABELS` objesinden `label: '...'` alanlarını SİL (yalnız `bg`/`color` kalsın). Tip: `Record<string, { bg: string; color: string }>`.
- Rozet render'ında `{status.label}` → `{t('status_' + msg.status, lang)}`.
- "X alıcı · tarih" satırı: `(msg.recipient_count ?? 0) + " alıcı · " + new Date(msg.created_at).toLocaleDateString("tr-TR")` → `(msg.recipient_count ?? 0) + " " + t('common_recipients', lang) + " · " + new Date(msg.created_at).toLocaleDateString("tr-TR")`. (Tarih AYNEN.)

### Dosya: `vasi-web/src/app/(dashboard)/messages/page.tsx`
- Üstteki tüm `LANGS = { TR, EN, DE, FR, ES, AR }` objesini SİL.
- `const lang = 'TR';` ve `const t = LANGS[lang];` satırlarını SİL.
- Üste ekle: `import { useLang, t } from '@/lib/i18n';`. Bileşen başında: `const [lang] = useLang();`.
- `STATUS_LABELS`'ten `label` alanlarını sil (yalnız `bg`/`color`); render'da `{t('status_' + msg.status, lang)}`.
- `{t.page_title}` → `{t('msgs_title', lang)}`; `{t.new_message_button}` → `{t('msgs_new', lang)}`; `{t.no_messages_title}` → `{t('msgs_empty_title', lang)}`; `{t.no_messages_subtitle}` → `{t('msgs_empty_subtitle', lang)}`; `{t.create_first_message_button}` → `{t('msgs_create_first', lang)}`.
- Satır ~110'daki sabit `Yükleniyor...` → `{t('common_loading', lang)}`.
- "X alıcı · tarih": dashboard'la aynı dönüşüm (`" alıcı · "` → `" " + t('common_recipients', lang) + " · "`, tarih AYNEN).

### Dosya: `vasi-web/src/app/(dashboard)/messages/new/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `STEPS` kullanımı: progress bar'da adım adı `{label}` gösteriliyor. `STEPS` dizisini anahtar dizisine çevir: `const STEP_KEYS = ['new_step_content','new_step_recipients','new_step_schedule','new_step_preview','new_step_create'];` ve `STEPS.map((label, i) => ...)` yerine `STEP_KEYS.map((key, i) => ...)`, gösterimde `{t(key, lang)}`. `React.Fragment key={label}` → `key={key}`.
- Başlık `Yeni Mesaj` → `{t('new_title', lang)}`.
- `5 adımda mesajını oluştur` → `{t('new_subtitle', lang)}`.
- Adım 1 label'lar: `Mesajına bir başlık ver` → `{t('new_label_title', lang)}`; `Mesajını yaz` → `{t('new_label_body', lang)}`.
- Adım 2 label: `Alıcı e-posta adresi` → `{t('new_label_recipient_email', lang)}`; buton `Ekle` → `{t('new_add', lang)}`.
- Adım 3 label `Gönderim tarihi` → `{t('new_label_send_date', lang)}`; `Hızlı seç` → `{t('new_quick_select', lang)}`; `{y} Yıl Sonra` → `{t('new_years_later', lang).replace('%s', String(y))}`.
- Adım 5 loading `Oluşturuluyor...` → `{t('new_loading', lang)}`; buton `Tekrar Dene` → `{t('new_retry', lang)}`.
- Navigasyon: `← Geri` → `{t('new_back', lang)}`; `İleri →` → `{t('new_next', lang)}`; `Oluştur ✓` → `{t('new_create', lang)}`.
- DOKUNMA: `aria-label="Geri"`, tüm `placeholder`, `setStepError`/`setSubmitError` metinleri, `toLocaleString('tr-TR', ...)`.

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `STATUS_LABELS` objesini SİL; durum rozetinde `{STATUS_LABELS[message.status] ?? message.status}` → `{t('status_' + message.status, lang)}`.
- Butonlar: `İptal Et` → `{t('detail_cancel', lang)}`; `Yeniden Zamanla` → `{t('detail_reschedule', lang)}`; `Zamanla` → `{t('detail_schedule', lang)}`; `Sil` → `{t('detail_delete', lang)}`; `Kaldır` → `{t('detail_remove', lang)}`.
- Loading `Yükleniyor...` → `{t('common_loading', lang)}`.
- `MESAJ İÇERİĞİ` → `{t('detail_content_label', lang)}`.
- `ALICILAR ({recipients.length})` → `{t('detail_recipients_label', lang)} ({recipients.length})`.
- "Gönderilecek:" (scheduled_at satırı) → `{t('detail_will_send', lang)}` (tarih `toLocaleString('tr-TR',...)` AYNEN).
- `Alıcı Ekle` (alt-başlık) → `{t('detail_add_recipient_title', lang)}`; label `Ad Soyad` → `{t('detail_name_label', lang)}`; label `E-posta` → `{t('detail_email_label', lang)}`.
- Ekle butonu: `{addLoading ? 'Ekleniyor...' : '+ Alıcı Ekle'}` → `{addLoading ? t('detail_adding', lang) : t('detail_add_recipient_btn', lang)}`.
- DOKUNMA: `confirm('Zamanlamayı iptal...')`, `confirm('Bu mesajı silmek...')`, `setAddError('Alıcı eklenemedi.')`, placeholder'lar.

### Dosya: `vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- Başlık `Mesajı Zamanla` → `{t('sched_title', lang)}`.
- `Mesaj` (özet label) → `{t('sched_message_label', lang)}`.
- `Gönderilecek Tarih ve Saat` → `{t('sched_datetime_label', lang)}`.
- Buton: `{loading ? 'Zamanlanıyor...' : 'Zamanla'}` → `{loading ? t('sched_loading', lang) : t('sched_btn', lang)}`.
- Yükleniyor (mesaj yokken) `Yükleniyor...` → `{t('common_loading', lang)}`.
- DOKUNMA: `setError(...)` metni.

### Dosya: `vasi-web/src/app/(dashboard)/settings/page.tsx`
Zaten `useLang`/`t` import + `const [lang, setLang]` var (dil bölümü çevrili).
- `Ayarlar` → `{t('settings_title', lang)}`.
- Yükleniyor `Yükleniyor...` → `{t('common_loading', lang)}`.
- `renderSection` çağrıları statik metinle yapılıyor; her çağrıdaki başlık/açıklamayı `t()`'ye çevir:
  - profile: `'Profil'` → `t('settings_profile_title', lang)`, `'Ad, soyad ve telefon numaranızı güncelleyin.'` → `t('settings_profile_desc', lang)`.
  - email: `'E-posta'` → `t('settings_email_title', lang)`, açıklama → `t('settings_email_desc', lang)`.
  - password: `'Şifre'` → `t('settings_password_title', lang)`, açıklama → `t('settings_password_desc', lang)`.
- Alan label'ları (`fields` JSX içinde): `Ad`→`{t('settings_label_firstname', lang)}`, `Soyad`→`{t('settings_label_lastname', lang)}`, `Telefon`→`{t('settings_label_phone', lang)}`, `Mevcut E-posta`→`{t('settings_label_current_email', lang)}`, `Yeni E-posta`→`{t('settings_label_new_email', lang)}`, `Mevcut Şifre`→`{t('settings_label_current_password', lang)}`, `Yeni Şifre`→`{t('settings_label_new_password', lang)}`.
- `OTP Kodu` → `{t('settings_otp_label', lang)}`.
- Butonlar: iki `Kaydet` → `{t('settings_save', lang)}`; `İptal` → `{t('settings_cancel', lang)}`; alttaki `Geri` → `{t('common_back', lang)}`.
- DOKUNMA: tüm `setSectionMessages`/`setError` metinleri (OTP zorunlu, Bilgiler güncellendi., Değişiklik yok., vb.), placeholder'lar.

### Dosya: `vasi-web/src/app/(dashboard)/upgrade/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `Planını Yükselt` → `{t('upgrade_title', lang)}`.
- Altbaşlık → `{t('upgrade_subtitle', lang)}`.
- `Mevcut Plan` → `{t('upgrade_current_plan', lang)}`.
- `{plan.message_limit} mesaj` → `{plan.message_limit + ' ' + t('upgrade_messages_suffix', lang)}`.
- `{plan.recipient_limit} alıcı` → `{plan.recipient_limit + ' ' + t('common_recipients', lang)}`.
- `/ay` → `{t('upgrade_per_month', lang)}`.
- Buton: `{currentPlan === plan.slug ? 'Kullanımda' : 'Premium\'a Yükselt'}` → `{currentPlan === plan.slug ? t('upgrade_in_use', lang) : t('upgrade_btn', lang)}`.
- `Geri` → `{t('common_back', lang)}`.
- Yükleniyor `Yükleniyor...` → `{t('common_loading', lang)}`.
- DOKUNMA: ödeme `setMessage`/`setError` metinleri ("Ödeme başarılı...", "Ödeme tamamlanamadı...", "Ödeme başlatılamadı...").

### Dosya: `vasi-web/src/app/(auth)/verify-email/page.tsx`
- Üste `import { useLang, t } from '@/lib/i18n';`; bileşen başında `const [lang] = useLang();`.
- `E-postanızı Doğrulayın` → `{t('verify_title', lang)}`.
- Altbaşlık → `{t('verify_subtitle', lang)}`.
- Buton: `{loading ? 'Doğrulanıyor...' : 'Doğrula'}` → `{loading ? t('verify_loading', lang) : t('verify_submit', lang)}`.
- `Kod tekrar gönderildi.` → `{t('verify_resent', lang)}`.
- Tekrar gönder bloğu: `Kodu almadınız mı? <span ...>Tekrar gönder</span>` → `{t('verify_resend_q', lang)} <span ...>{t('verify_resend_link', lang)}</span>`.
- DOKUNMA: `setError(...)` metni, placeholder `000000`.

## ADIM 3 — Kendi kontrolün (bitince)
- Değişen dosyalar SADECE şunlar olmalı (9): `lib/i18n.ts` + yukarıdaki 8 sayfa. Başka dosyaya dokunma.
- `vasi-web` kökünde: `pnpm exec tsc --noEmit` (varsa) tip hatası vermemeli. Mümkünse koş, çıktısını rapora ekle. (Smoke'u SEN koşma; iko koşacak.)
- `LANGS`/`DE`/`FR`/`ES`/`AR` kelimeleri `messages/page.tsx`'te KALMAMALI.
- Yeni `any` veya `useEffect` içi `setState` EKLEMEDİN.

## Çıktı (rapor)
Şunları ver: (1) değişen dosya listesi, (2) `git status` çıktısı, (3) varsa `tsc --noEmit` çıktısı. PR/commit/branch İDDİA ETME — onları yapmıyorsun.
