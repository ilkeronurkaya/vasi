# Sprint 26 — i18n Turu 2 (kalan kullanıcı sayfaları)

> Tasarım + kabul kriterleri. Uygulama: yerel Qwen3.6-35B-A3B (OpenHands, klonda). Ajan promtu: `AGENT_PROMPT_SPRINT_26.md`.
> Taban: S25 altyapısı (`vasi-web/src/lib/i18n.ts` — `useLang()` + `t(key, lang)`, localStorage `'vasi_lang'`, `useSyncExternalStore`).
> **Saf frontend. Yeni API YOK, yeni migration YOK, smoke etkilenmez (58/58 kalmalı), tsc temiz kalmalı.**

## CLOSED = False

---

## 1. Amaç

EN'e geçildiğinde hâlâ Türkçe kalan **kullanıcı** sayfalarındaki **statik arayüz metnini** S25 i18n altyapısıyla çevirmek. Admin paneli kapsam dışı (sonraki tura).

## 2. Karar verilen kapsam (iko + Claude, 06-15)

**Çeviri derinliği: YALNIZCA statik UI.** Çevrilecek: sayfa başlıkları, bölüm başlık/açıklamaları, alan label'ları, buton metinleri (loading durumundaki buton metni dahil), statik bilgi metinleri, durum etiketleri (`STATUS_LABELS`), sihirbaz adım adları, plan kartı statik metinleri.

**Olduğu gibi TR kalacak (DOKUNMA):**
- Doğrulama/hata mesajları (`setStepError`, `setError`, `submitError`, `setSectionMessages` metinleri, `catch` mesajları).
- Toast/durum mesajları (başarı + hata; örn. "Bilgiler güncellendi.", ödeme başarılı/başarısız bannerları).
- Input `placeholder` öznitelikleri.
- `confirm()` diyalog metinleri.
- `aria-label` metinleri.

**Tarih biçimi: her dilde `tr-TR` SABİT.** `toLocaleDateString`/`toLocaleString` çağrıları DEĞİŞMEZ. Yalnız metin çevrilir.

## 3. Kapsam — sayfalar

1. `/dashboard` — `STATUS_LABELS` + "X alıcı · tarih" satırındaki "alıcı".
2. `/messages` — `STATUS_LABELS` + "alıcı" + **stray `LANGS` bloğu temizliği** (aşağıda).
3. `/messages/new` — sihirbaz: adım adları, başlık/altbaşlık, label'lar, buton metinleri, "Hızlı seç", "X Yıl Sonra", loading.
4. `/messages/[id]` — `STATUS_LABELS`, buton metinleri, statik bölüm başlıkları ("MESAJ İÇERİĞİ", "ALICILAR (n)"), "Gönderilecek:", "Alıcı Ekle" alt-başlık + label'lar, loading.
5. `/messages/[id]/schedule` — başlık, "Mesaj", "Gönderilecek Tarih ve Saat", buton + loading.
6. `/settings` — profil/email/şifre bölüm başlık+açıklama+label'ları, "OTP Kodu", Kaydet/İptal/Geri, "Ayarlar", loading. (Dil bölümü S25'te çevrildi.)
7. `/upgrade` — başlık+altbaşlık, "Mevcut Plan", "X mesaj"/"X alıcı"/"/ay", "Kullanımda"/"Premium'a Yükselt", "Geri", loading.
8. `/verify-email` — başlık+altbaşlık, "Doğrula"/loading, "Kodu almadınız mı? Tekrar gönder", "Kod tekrar gönderildi.".

**KAPSAM DIŞI:** `app/admin/*` (panel sonraki tura), API, migration, tasarım/stil, hata/placeholder/confirm metinleri (madde 2).

## 4. Kritik temizlik — `/messages` stray `LANGS`

`vasi-web/src/app/(dashboard)/messages/page.tsx` içinde eski bir ajandan kalma yerel `LANGS` objesi (TR/EN/**DE/FR/ES/AR** stub'ları) + sabit `const lang = 'TR'` var → sayfa dil anahtarına HİÇ tepki vermiyor; ayrıca satır 110'da sabit `Yükleniyor...`. 

**Yapılacak:** Tüm `LANGS` bloğunu ve `const lang = 'TR'` + `const t = LANGS[lang]` satırlarını **sil**; `dashboard/page.tsx`'teki gibi merkezi `useLang()` + `t()`'ye bağla. DE/FR/ES/AR tamamen kaldırılır (ürün yalnız TR/EN).

## 5. STATUS_LABELS birleştirme

İki kopya tutarsız: `dashboard`/`messages` `scheduled='Zamanlanmış'`, `[id]` `scheduled='Zamanlandı'`. **Tek anahtar setine** birleştir (`status_scheduled='Zamanlanmış' / 'Scheduled'`). `STATUS_LABELS` objesi yalnız `bg`/`color` için kalır; `label` artık render'da `t('status_' + status, lang)` ile çözülür.

## 6. Eklenecek DICT anahtarları (`lib/i18n.ts`)

Aşağıdaki anahtarlar `DICT.tr` ve `DICT.en`'e eklenir (mevcut S25 anahtarları korunur). `%s` yer tutucu `dash_greeting` kalıbıyla aynı (`.replace('%s', ...)`).

### Ortak / durum
| key | tr | en |
|-----|----|----|
| status_draft | Taslak | Draft |
| status_scheduled | Zamanlanmış | Scheduled |
| status_sent | Gönderildi | Sent |
| status_delivered | Teslim Edildi | Delivered |
| status_failed | Başarısız | Failed |
| common_recipients | alıcı | recipients |
| common_loading | Yükleniyor... | Loading... |
| common_back | Geri | Back |

### /messages
| key | tr | en |
|-----|----|----|
| msgs_title | Mesajlarım | My Messages |
| msgs_new | + Yeni Mesaj | + New Message |
| msgs_empty_title | Henüz mesaj yok | No messages yet |
| msgs_empty_subtitle | Sevdiklerine geleceğe mesaj bırak | Leave a message for your loved ones in the future |
| msgs_create_first | İlk Mesajını Oluştur | Create Your First Message |

### /messages/new
| key | tr | en |
|-----|----|----|
| new_title | Yeni Mesaj | New Message |
| new_subtitle | 5 adımda mesajını oluştur | Create your message in 5 steps |
| new_step_content | İçerik | Content |
| new_step_recipients | Alıcılar | Recipients |
| new_step_schedule | Zamanlama | Scheduling |
| new_step_preview | Önizleme | Preview |
| new_step_create | Oluştur | Create |
| new_label_title | Mesajına bir başlık ver | Give your message a title |
| new_label_body | Mesajını yaz | Write your message |
| new_label_recipient_email | Alıcı e-posta adresi | Recipient email address |
| new_add | Ekle | Add |
| new_label_send_date | Gönderim tarihi | Send date |
| new_quick_select | Hızlı seç | Quick select |
| new_years_later | %s Yıl Sonra | In %s Years |
| new_loading | Oluşturuluyor... | Creating... |
| new_retry | Tekrar Dene | Try Again |
| new_next | İleri → | Next → |
| new_back | ← Geri | ← Back |
| new_create | Oluştur ✓ | Create ✓ |

### /messages/[id]
| key | tr | en |
|-----|----|----|
| detail_cancel | İptal Et | Cancel |
| detail_reschedule | Yeniden Zamanla | Reschedule |
| detail_schedule | Zamanla | Schedule |
| detail_delete | Sil | Delete |
| detail_content_label | MESAJ İÇERİĞİ | MESSAGE CONTENT |
| detail_recipients_label | ALICILAR | RECIPIENTS |
| detail_will_send | Gönderilecek: | Will be sent: |
| detail_add_recipient_title | Alıcı Ekle | Add Recipient |
| detail_name_label | Ad Soyad | Full Name |
| detail_email_label | E-posta | Email |
| detail_remove | Kaldır | Remove |
| detail_adding | Ekleniyor... | Adding... |
| detail_add_recipient_btn | + Alıcı Ekle | + Add Recipient |

### /messages/[id]/schedule
| key | tr | en |
|-----|----|----|
| sched_title | Mesajı Zamanla | Schedule Message |
| sched_message_label | Mesaj | Message |
| sched_datetime_label | Gönderilecek Tarih ve Saat | Send Date and Time |
| sched_btn | Zamanla | Schedule |
| sched_loading | Zamanlanıyor... | Scheduling... |

### /settings (gövde — dil bölümü zaten var)
| key | tr | en |
|-----|----|----|
| settings_title | Ayarlar | Settings |
| settings_profile_title | Profil | Profile |
| settings_profile_desc | Ad, soyad ve telefon numaranızı güncelleyin. | Update your first name, last name and phone number. |
| settings_email_title | E-posta | Email |
| settings_email_desc | Yeni e-posta adresinizi girin. Değişiklik sonrası mevcut adresinize OTP gönderilecek. | Enter your new email address. After the change, an OTP will be sent to your current address. |
| settings_password_title | Şifre | Password |
| settings_password_desc | Mevcut şifrenizi ve yeni şifrenizi girin. Yeni şifre en az 8 hane olmalıdır. | Enter your current and new password. The new password must be at least 8 characters. |
| settings_label_firstname | Ad | First name |
| settings_label_lastname | Soyad | Last name |
| settings_label_phone | Telefon | Phone |
| settings_label_current_email | Mevcut E-posta | Current Email |
| settings_label_new_email | Yeni E-posta | New Email |
| settings_label_current_password | Mevcut Şifre | Current Password |
| settings_label_new_password | Yeni Şifre | New Password |
| settings_otp_label | OTP Kodu | OTP Code |
| settings_save | Kaydet | Save |
| settings_cancel | İptal | Cancel |

### /upgrade
| key | tr | en |
|-----|----|----|
| upgrade_title | Planını Yükselt | Upgrade Your Plan |
| upgrade_subtitle | Farklı planlarımızla mesaj gönderme deneyiminizi artırın. | Enhance your messaging experience with our different plans. |
| upgrade_current_plan | Mevcut Plan | Current Plan |
| upgrade_messages_suffix | mesaj | messages |
| upgrade_per_month | /ay | /mo |
| upgrade_in_use | Kullanımda | In Use |
| upgrade_btn | Premium'a Yükselt | Upgrade to Premium |

(`/upgrade`'de "alıcı" için `common_recipients` kullanılır.)

### /verify-email
| key | tr | en |
|-----|----|----|
| verify_title | E-postanızı Doğrulayın | Verify Your Email |
| verify_subtitle | E-postanıza gönderilen 6 haneli kodu girin. | Enter the 6-digit code sent to your email. |
| verify_loading | Doğrulanıyor... | Verifying... |
| verify_submit | Doğrula | Verify |
| verify_resent | Kod tekrar gönderildi. | Code resent. |
| verify_resend_q | Kodu almadınız mı? | Didn't receive the code? |
| verify_resend_link | Tekrar gönder | Resend |

> Toplam ~70 yeni anahtar (TR+EN). `t()` zaten eksik anahtarda TR'ye, sonra key'e düşüyor → kısmi ekleme bile patlamaz.

## 7. Dönüşüm kalıbı (her sayfada)

1. Sayfa zaten `'use client'`. Üste: `import { useLang, t } from '@/lib/i18n';` (yoksa).
2. Bileşen gövdesinde: `const [lang] = useLang();` (settings'te `const [lang, setLang] = useLang()` zaten var).
3. Statik string `'...'` → `{t('key', lang)}` (JSX) veya `t('key', lang)` (attribute/değişken).
4. `STATUS_LABELS`: `label` alanını sil, render'da `t('status_' + status, lang)`; bg/color kalır.
5. "X alıcı · tarih": `{count + ' alıcı · ' + date}` → `{count + ' ' + t('common_recipients', lang) + ' · ' + date}` (tarih `toLocaleDateString('tr-TR')` AYNEN kalır).
6. `%s` içeren ("X Yıl Sonra"): `t('new_years_later', lang).replace('%s', String(y))`.

## 8. Kabul kriterleri

1. Dil seçici EN ↔ TR her sekmede anında uygulanıyor (sayfa yenilemeden) — 8 sayfanın tamamı.
2. EN seçiliyken **statik UI'da** TR string kalmıyor (hata/placeholder/confirm/tarih HARİÇ — madde 2).
3. `/messages` artık dil anahtarına tepki veriyor; `LANGS`/DE/FR/ES/AR ve sabit `'TR'` kodda kalmadı.
4. `STATUS_LABELS` etiketleri her iki sayfada da `t()`'den; renkler korunmuş.
5. Tarih biçimleri değişmedi (`tr-TR`).
6. `pnpm --filter vasi-web exec tsc --noEmit` temiz (yeni tip hatası yok).
7. Yeni lint borcu YOK: yeni `any`, yeni efekt-içi-setState yok (S25 kuralı, B3 büyümez).
8. API/migration değişmedi → smoke **58/58** yeşil.
9. Görsel/stil değişmedi (yalnız metin + label çözümü).

## 9. Bağımsız doğrulama (iko + Claude)

- Claude: klonda `git -C ~/Projects/vasi-agent diff` ile yalnız 9 dosyanın (i18n.ts + 8 sayfa) değiştiğini, kapsam sızıntısı olmadığını doğrular; `LANGS` silinmiş mi, tarih çağrıları korunmuş mu, yeni `any`/efekt-setState girmiş mi kontrol eder.
- iko: değişiklikleri asıl repoya taşır → `tsc --noEmit` + smoke (`:3000` kapalıyken) + Chrome'dan TR↔EN her 8 sayfada elle.
- Smoke 58/58 + tsc temiz + UI TR↔EN OK olmadan sprint KAPANMAZ.

## 10. Sprint öncesi hazırlık (iko'da — S25'i main'e ilerlet + klonu tazele)

S25 i18n.ts S26'nın tabanı; klon eski tabanda olursa uyuşmaz. Asıl repoda:

```
cd ~/Projects/vasi
git checkout main
git merge --ff-only sprint-25-i18n
git push origin main
```

Sonra klonu tazele:

```
cd ~/Projects/vasi-agent
git fetch origin
git checkout main
git reset --hard origin/main
```

## 11. Bu sprintin bug bağlantısı

S26 yalnız i18n; doğrudan bağlı açık bug yok (B5–B9 → S27). Sprint kapanış ritüeli: S26'da bug düzeltilmediğinden ritüel "i18n kabul testi" (madde 8–9) ile karşılanır; ardından S27'ye geçilir.
