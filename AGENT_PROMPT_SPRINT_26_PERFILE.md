# OpenHands Ajan Promtu — Sprint 26, DOSYA DOSYA (5 mini-tur, mutlak yollu)

> HER promtu AYRI/YENİ bir OpenHands konuşmasına yapıştır. Her promt kendi içinde tamdır (ortak kural bloğu her birinin başında).
> Repo `/workspace/vasi-web` altında (`/workspace/project` BOŞ). Dosyalar mutlak yolla verildi.
> `file_editor` için parantezler `(dashboard)` olduğu gibi yazılır. Sadece `terminal`/`grep`'te kaçış gerekir.
> iko: her tur öncesi bayat kilit varsa temizle → `rm -f ~/Projects/vasi-agent/.git/index.lock`. Tur bitince Claude diff'i doğrular, sonra sıradaki promt.

---

## === PROMT 1 — messages/[id]/page.tsx (alt yarı, tamamla) ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda verilen TEK dosyayı düzenle; başka dosyayı açma/değiştirme. `/workspace/vasi-web/src/lib/i18n.ts`'e DOKUNMA — gereken tüm `t()` anahtarları orada ZATEN var, yeni anahtar EKLEME. Düzenleyeceğin dosyayı önce kendi araçlarınla OKU. Büyük blok yerine küçük, hedefli `str_replace` yap. Bitince yalnız o dosyanın diff'ini + `git status` ver. "Bitti" demeden önce listedeki HER maddeyi gerçekten uyguladığından emin ol.

Dosya (mutlak yol): `/workspace/vasi-web/src/app/(dashboard)/messages/[id]/page.tsx`

Bu dosyada import + `const [lang] = useLang()` + durum etiketi + üst aksiyon butonları (İptal Et/Yeniden Zamanla/Zamanla/Sil) + loading ZATEN yapıldı. Kalan hardcoded TR'leri mevcut anahtarlarla değiştir:
- `MESAJ İÇERİĞİ` → `{t('detail_content_label', lang)}`
- `ALICILAR ({recipients.length})` → `{t('detail_recipients_label', lang)} ({recipients.length})`
- `Gönderilecek:` (scheduled_at satırı) → `{t('detail_will_send', lang)}` (yanındaki `toLocaleString('tr-TR', ...)` tarih çağrısı AYNEN kalır)
- Alt-başlık `Alıcı Ekle` → `{t('detail_add_recipient_title', lang)}`
- Label `Ad Soyad` → `{t('detail_name_label', lang)}`
- Label `E-posta` → `{t('detail_email_label', lang)}`
- Buton `Kaldır` → `{t('detail_remove', lang)}`
- Ekle butonu: `{addLoading ? 'Ekleniyor...' : '+ Alıcı Ekle'}` → `{addLoading ? t('detail_adding', lang) : t('detail_add_recipient_btn', lang)}`

DOKUNMA: iki `confirm('...')` metni, `setAddError('Alıcı eklenemedi.')`, tüm `placeholder` (Ali Veli, ali@example.com).

---

## === PROMT 2 — messages/[id]/schedule/page.tsx ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda verilen TEK dosyayı düzenle; başka dosyayı açma/değiştirme. `/workspace/vasi-web/src/lib/i18n.ts`'e DOKUNMA — gereken tüm `t()` anahtarları orada ZATEN var, yeni anahtar EKLEME. Düzenleyeceğin dosyayı önce kendi araçlarınla OKU. Büyük blok yerine küçük, hedefli `str_replace` yap. Bitince yalnız o dosyanın diff'ini + `git status` ver. "Bitti" demeden önce listedeki HER maddeyi gerçekten uyguladığından emin ol.

Dosya (mutlak yol): `/workspace/vasi-web/src/app/(dashboard)/messages/[id]/schedule/page.tsx`

Üste ekle: `import { useLang, t } from '@/lib/i18n';`. Bileşen gövdesinin başında: `const [lang] = useLang();`. Sonra:
- Başlık `Mesajı Zamanla` → `{t('sched_title', lang)}`
- Özet label `Mesaj` → `{t('sched_message_label', lang)}`
- `Gönderilecek Tarih ve Saat` → `{t('sched_datetime_label', lang)}`
- Buton: `{loading ? 'Zamanlanıyor...' : 'Zamanla'}` → `{loading ? t('sched_loading', lang) : t('sched_btn', lang)}`
- Mesaj yokken gösterilen `Yükleniyor...` → `{t('common_loading', lang)}`

DOKUNMA: `setError(...)` metni, `datetime-local` ve tarih mantığı.

---

## === PROMT 3 — settings/page.tsx ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda verilen TEK dosyayı düzenle; başka dosyayı açma/değiştirme. `/workspace/vasi-web/src/lib/i18n.ts`'e DOKUNMA — gereken tüm `t()` anahtarları orada ZATEN var, yeni anahtar EKLEME. Düzenleyeceğin dosyayı önce kendi araçlarınla OKU. Büyük blok yerine küçük, hedefli `str_replace` yap. Bitince yalnız o dosyanın diff'ini + `git status` ver. "Bitti" demeden önce listedeki HER maddeyi gerçekten uyguladığından emin ol.

Dosya (mutlak yol): `/workspace/vasi-web/src/app/(dashboard)/settings/page.tsx`

Bu dosyada `useLang`/`t` import + `const [lang, setLang] = useLang()` ZATEN var (dil bölümü çevrili). Sadece şu hardcoded TR'leri değiştir:
- Sayfa başlığı `Ayarlar` → `{t('settings_title', lang)}`
- Yükleniyor durumu `Yükleniyor...` → `{t('common_loading', lang)}`
- `renderSection(...)` çağrılarındaki başlık/açıklama metin argümanları:
  - profile: `'Profil'` → `t('settings_profile_title', lang)`, açıklama → `t('settings_profile_desc', lang)`
  - email: `'E-posta'` → `t('settings_email_title', lang)`, açıklama → `t('settings_email_desc', lang)`
  - password: `'Şifre'` → `t('settings_password_title', lang)`, açıklama → `t('settings_password_desc', lang)`
- Alan label'ları: `Ad`→`{t('settings_label_firstname', lang)}`, `Soyad`→`{t('settings_label_lastname', lang)}`, `Telefon`→`{t('settings_label_phone', lang)}`, `Mevcut E-posta`→`{t('settings_label_current_email', lang)}`, `Yeni E-posta`→`{t('settings_label_new_email', lang)}`, `Mevcut Şifre`→`{t('settings_label_current_password', lang)}`, `Yeni Şifre`→`{t('settings_label_new_password', lang)}`
- `OTP Kodu` → `{t('settings_otp_label', lang)}`
- Butonlar: iki `Kaydet` → `{t('settings_save', lang)}`; `İptal` → `{t('settings_cancel', lang)}`; en alttaki `Geri` → `{t('common_back', lang)}`

DOKUNMA: tüm `setSectionMessages`/`setError` metinleri (OTP zorunlu, Bilgiler güncellendi., Değişiklik yok., E-posta değişikliği yok., Yeni şifre zorunlu, Şifre en az 8 hane olmalı, Veriler yüklenemedi., vb.), tüm `placeholder`'lar, dil seçici (zaten çevrili).

---

## === PROMT 4 — upgrade/page.tsx ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda verilen TEK dosyayı düzenle; başka dosyayı açma/değiştirme. `/workspace/vasi-web/src/lib/i18n.ts`'e DOKUNMA — gereken tüm `t()` anahtarları orada ZATEN var, yeni anahtar EKLEME. Düzenleyeceğin dosyayı önce kendi araçlarınla OKU. Büyük blok yerine küçük, hedefli `str_replace` yap. Bitince yalnız o dosyanın diff'ini + `git status` ver. "Bitti" demeden önce listedeki HER maddeyi gerçekten uyguladığından emin ol.

Dosya (mutlak yol): `/workspace/vasi-web/src/app/(dashboard)/upgrade/page.tsx`

Üste ekle: `import { useLang, t } from '@/lib/i18n';`. Bileşen başında: `const [lang] = useLang();`. Sonra:
- `Planını Yükselt` → `{t('upgrade_title', lang)}`
- Altbaşlık `Farklı planlarımızla mesaj gönderme deneyiminizi artırın.` → `{t('upgrade_subtitle', lang)}`
- `Mevcut Plan` → `{t('upgrade_current_plan', lang)}`
- `{plan.message_limit} mesaj` → `{plan.message_limit + ' ' + t('upgrade_messages_suffix', lang)}`
- `{plan.recipient_limit} alıcı` → `{plan.recipient_limit + ' ' + t('common_recipients', lang)}`
- `/ay` → `{t('upgrade_per_month', lang)}`
- Buton: `{currentPlan === plan.slug ? 'Kullanımda' : 'Premium\'a Yükselt'}` → `{currentPlan === plan.slug ? t('upgrade_in_use', lang) : t('upgrade_btn', lang)}`
- En alttaki `Geri` → `{t('common_back', lang)}`
- Yükleniyor `Yükleniyor...` → `{t('common_loading', lang)}`

DOKUNMA: ödeme `setMessage`/`setError` metinleri ("Ödeme başarılı...", "Ödeme tamamlanamadı...", "Ödeme başlatılamadı...").

---

## === PROMT 5 — verify-email/page.tsx ===

Sen YALNIZCA kod yazan uygulayıcısın. Git'e DOKUNMA (branch/commit/push/checkout YOK). task_tracker KULLANMA. SADECE aşağıda verilen TEK dosyayı düzenle; başka dosyayı açma/değiştirme. `/workspace/vasi-web/src/lib/i18n.ts`'e DOKUNMA — gereken tüm `t()` anahtarları orada ZATEN var, yeni anahtar EKLEME. Düzenleyeceğin dosyayı önce kendi araçlarınla OKU. Büyük blok yerine küçük, hedefli `str_replace` yap. Bitince yalnız o dosyanın diff'ini + `git status` ver. "Bitti" demeden önce listedeki HER maddeyi gerçekten uyguladığından emin ol.

Dosya (mutlak yol): `/workspace/vasi-web/src/app/(auth)/verify-email/page.tsx`

Üste ekle: `import { useLang, t } from '@/lib/i18n';`. Bileşen başında: `const [lang] = useLang();`. Sonra:
- `E-postanızı Doğrulayın` → `{t('verify_title', lang)}`
- Altbaşlık `E-postanıza gönderilen 6 haneli kodu girin.` → `{t('verify_subtitle', lang)}`
- Buton: `{loading ? 'Doğrulanıyor...' : 'Doğrula'}` → `{loading ? t('verify_loading', lang) : t('verify_submit', lang)}`
- `Kod tekrar gönderildi.` → `{t('verify_resent', lang)}`
- Tekrar gönder bloğu `Kodu almadınız mı? <span ...>Tekrar gönder</span>` → `{t('verify_resend_q', lang)} <span ...>{t('verify_resend_link', lang)}</span>`

DOKUNMA: `setError(...)` metni, `placeholder="000000"`.

---

## Her tur sonrası (Claude doğrular)
Claude `git -C ~/Projects/vasi-agent diff <dosya>` ile yalnız o dosyanın doğru çevrildiğini, kapsam sızıntısı/tarih bozulması/yeni `any` olmadığını kontrol eder. 5 dosya da bitince: iko asıl repoya taşır → `tsc --noEmit` + smoke (`:3000` kapalı) + Chrome'dan TR↔EN.
