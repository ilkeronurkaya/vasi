'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type Lang = 'tr' | 'en';
export const LANG_STORAGE_KEY = 'vasi_lang';
const LANG_CHANGE_EVENT = 'vasi-lang-change';

export const DICT: Record<Lang, Record<string, string>> = {
    tr: {
        // login
        login_title: 'Giriş Yap',
        login_email: 'E-posta',
        login_password: 'Şifre',
        login_forgot: 'Şifremi unuttum',
        login_register_link: 'Hesabınız yok mu? Kayıt ol',
        login_submit: 'Giriş Yap',
        login_loading: 'Giriş yapılıyor...',
        login_error_default: 'E-posta veya şifre hatalı.',
        // register
        register_title: 'Hesap Oluştur',
        register_firstname: 'Ad',
        register_lastname: 'Soyad',
        register_email: 'E-posta',
        register_password: 'Şifre',
        register_password_ph: 'En az 8 karakter',
        register_submit: 'Kayıt Ol',
        register_loading: 'Kaydediliyor...',
        register_error_default: 'Kayıt başarısız. Tekrar deneyin.',
        register_login_link: 'Zaten hesabınız var mı? Giriş yapın',
        // dashboard layout / nav
        nav_home: 'Ana Sayfa',
        nav_messages: 'Mesajlarım',
        nav_new_message: 'Yeni Mesaj',
        nav_settings: 'Ayarlar',
        sidebar_quota: 'Mesaj Hakkı',
        sidebar_quota_warning: 'Hakkın dolmak üzere',
        sidebar_upgrade: "Pro'ya Geç",
        sidebar_logout: 'Çıkış Yap',
        // dashboard home
        dash_greeting: 'Merhaba, %s 👋',
        dash_subtitle: 'Bugün ne bırakmak istiyorsun?',
        dash_new_message: '+ Yeni Mesaj',
        dash_total: 'Toplam',
        dash_scheduled: 'Zamanlanmış',
        dash_sent: 'Gönderildi',
        dash_recent: 'Son Mesajlar',
        dash_view_all: 'Tümünü Gör →',
        dash_loading: 'Yükleniyor...',
        dash_empty_title: 'Henüz mesaj yok',
        dash_empty_subtitle: 'Sevdiklerine geleceğe mesaj bırak',
        dash_create_first: 'İlk Mesajını Oluştur',
        // settings — dil bölümü
        settings_lang_title: 'Dil',
        settings_lang_desc: 'Arayüz dilini seçin. Değişiklik anında uygulanır.',
        settings_lang_tr: 'Türkçe',
        settings_lang_en: 'İngilizce',
        // status labels
        status_draft: 'Taslak',
        status_scheduled: 'Zamanlanmış',
        status_sent: 'Gönderildi',
        status_delivered: 'Teslim Edildi',
        status_failed: 'Başarısız',
        // common
        common_recipients: 'alıcı',
        common_loading: 'Yükleniyor...',
        common_back: 'Geri',
        // messages list
        msgs_title: 'Mesajlarım',
        msgs_new: '+ Yeni Mesaj',
        msgs_empty_title: 'Henüz mesaj yok',
        msgs_empty_subtitle: 'Sevdiklerine geleceğe mesaj bırak',
        msgs_create_first: 'İlk Mesajını Oluştur',
        // new message
        new_title: 'Yeni Mesaj',
        new_subtitle: '5 adımda mesajını oluştur',
        new_step_content: 'İçerik',
        new_step_recipients: 'Alıcılar',
        new_step_schedule: 'Zamanlama',
        new_step_preview: 'Önizleme',
        new_step_create: 'Oluştur',
        new_label_title: 'Mesajına bir başlık ver',
        new_label_body: 'Mesajını yaz',
        new_label_recipient_email: 'Alıcı e-posta adresi',
        new_add: 'Ekle',
        new_label_send_date: 'Gönderim tarihi',
        new_quick_select: 'Hızlı seç',
        new_years_later: '%s Yıl Sonra',
        new_loading: 'Oluşturuluyor...',
        new_retry: 'Tekrar Dene',
        new_next: 'İleri →',
        new_back: '← Geri',
        new_create: 'Oluştur ✓',
        // message detail
        detail_cancel: 'İptal Et',
        detail_reschedule: 'Yeniden Zamanla',
        detail_schedule: 'Zamanla',
        detail_delete: 'Sil',
        detail_content_label: 'MESAJ İÇERİĞİ',
        detail_recipients_label: 'ALICILAR',
        detail_will_send: 'Gönderilecek:',
        detail_add_recipient_title: 'Alıcı Ekle',
        detail_name_label: 'Ad Soyad',
        detail_email_label: 'E-posta',
        detail_remove: 'Kaldır',
        detail_adding: 'Ekleniyor...',
        detail_add_recipient_btn: '+ Alıcı Ekle',
        // schedule
        sched_title: 'Mesajı Zamanla',
        sched_message_label: 'Mesaj',
        sched_datetime_label: 'Gönderilecek Tarih ve Saat',
        sched_btn: 'Zamanla',
        sched_loading: 'Zamanlanıyor...',
        // settings
        settings_title: 'Ayarlar',
        settings_profile_title: 'Profil',
        settings_profile_desc: 'Ad, soyad ve telefon numaranızı güncelleyin.',
        settings_email_title: 'E-posta',
        settings_email_desc: 'Yeni e-posta adresinizi girin. Değişiklik sonrası mevcut adresinize OTP gönderilecek.',
        settings_password_title: 'Şifre',
        settings_password_desc: 'Mevcut şifrenizi ve yeni şifrenizi girin. Yeni şifre en az 8 hane olmalıdır.',
        settings_label_firstname: 'Ad',
        settings_label_lastname: 'Soyad',
        settings_label_phone: 'Telefon',
        settings_label_current_email: 'Mevcut E-posta',
        settings_label_new_email: 'Yeni E-posta',
        settings_label_current_password: 'Mevcut Şifre',
        settings_label_new_password: 'Yeni Şifre',
        settings_otp_label: 'OTP Kodu',
        settings_save: 'Kaydet',
        settings_cancel: 'İptal',
        // upgrade
        upgrade_title: 'Planını Yükselt',
        upgrade_subtitle: 'Farklı planlarımızla mesaj gönderme deneyiminizi artırın.',
        upgrade_current_plan: 'Mevcut Plan',
        upgrade_messages_suffix: 'mesaj',
        upgrade_per_month: '/ay',
        upgrade_in_use: 'Kullanımda',
        upgrade_btn: "Premium'a Yükselt",
        // verify
        verify_title: 'E-postanızı Doğrulayın',
        verify_subtitle: 'E-postanıza gönderilen 6 haneli kodu girin.',
        verify_loading: 'Doğrulanıyor...',
        verify_submit: 'Doğrula',
        verify_resent: 'Kod tekrar gönderildi.',
        verify_resend_q: "Kodu almadınız mı?",
        verify_resend_link: 'Tekrar gönder',
    },
    en: {
        login_title: 'Sign In',
        login_email: 'Email',
        login_password: 'Password',
        login_forgot: 'Forgot password?',
        login_register_link: "Don't have an account? Register",
        login_submit: 'Sign In',
        login_loading: 'Signing in...',
        login_error_default: 'Invalid email or password.',
        register_title: 'Create Account',
        register_firstname: 'First name',
        register_lastname: 'Last name',
        register_email: 'Email',
        register_password: 'Password',
        register_password_ph: 'At least 8 characters',
        register_submit: 'Register',
        register_loading: 'Saving...',
        register_error_default: 'Registration failed. Please try again.',
        register_login_link: 'Already have an account? Sign in',
        nav_home: 'Home',
        nav_messages: 'My Messages',
        nav_new_message: 'New Message',
        nav_settings: 'Settings',
        sidebar_quota: 'Message Quota',
        sidebar_quota_warning: 'Almost out of quota',
        sidebar_upgrade: 'Upgrade to Pro',
        sidebar_logout: 'Log Out',
        dash_greeting: 'Hello, %s 👋',
        dash_subtitle: 'What would you like to leave today?',
        dash_new_message: '+ New Message',
        dash_total: 'Total',
        dash_scheduled: 'Scheduled',
        dash_sent: 'Sent',
        dash_recent: 'Recent Messages',
        dash_view_all: 'View All →',
        dash_loading: 'Loading...',
        dash_empty_title: 'No messages yet',
        dash_empty_subtitle: 'Leave a message for your loved ones in the future',
        dash_create_first: 'Create Your First Message',
        settings_lang_title: 'Language',
        settings_lang_desc: 'Choose the interface language. Changes apply instantly.',
        settings_lang_tr: 'Turkish',
        settings_lang_en: 'English',
        // status labels
        status_draft: 'Draft',
        status_scheduled: 'Scheduled',
        status_sent: 'Sent',
        status_delivered: 'Delivered',
        status_failed: 'Failed',
        // common
        common_recipients: 'recipients',
        common_loading: 'Loading...',
        common_back: 'Back',
        // messages list
        msgs_title: 'My Messages',
        msgs_new: '+ New Message',
        msgs_empty_title: 'No messages yet',
        msgs_empty_subtitle: 'Leave a message for your loved ones in the future',
        msgs_create_first: 'Create Your First Message',
        // new message
        new_title: 'New Message',
        new_subtitle: 'Create your message in 5 steps',
        new_step_content: 'Content',
        new_step_recipients: 'Recipients',
        new_step_schedule: 'Scheduling',
        new_step_preview: 'Preview',
        new_step_create: 'Create',
        new_label_title: 'Give your message a title',
        new_label_body: 'Write your message',
        new_label_recipient_email: 'Recipient email address',
        new_add: 'Add',
        new_label_send_date: 'Send date',
        new_quick_select: 'Quick select',
        new_years_later: 'In %s Years',
        new_loading: 'Creating...',
        new_retry: 'Try Again',
        new_next: 'Next →',
        new_back: '← Back',
        new_create: 'Create ✓',
        // message detail
        detail_cancel: 'Cancel',
        detail_reschedule: 'Reschedule',
        detail_schedule: 'Schedule',
        detail_delete: 'Delete',
        detail_content_label: 'MESSAGE CONTENT',
        detail_recipients_label: 'RECIPIENTS',
        detail_will_send: 'Will be sent:',
        detail_add_recipient_title: 'Add Recipient',
        detail_name_label: 'Full Name',
        detail_email_label: 'Email',
        detail_remove: 'Remove',
        detail_adding: 'Adding...',
        detail_add_recipient_btn: '+ Add Recipient',
        // schedule
        sched_title: 'Schedule Message',
        sched_message_label: 'Message',
        sched_datetime_label: 'Send Date and Time',
        sched_btn: 'Schedule',
        sched_loading: 'Scheduling...',
        // settings
        settings_title: 'Settings',
        settings_profile_title: 'Profile',
        settings_profile_desc: 'Update your first name, last name and phone number.',
        settings_email_title: 'Email',
        settings_email_desc: 'Enter your new email address. After the change, an OTP will be sent to your current address.',
        settings_password_title: 'Password',
        settings_password_desc: 'Enter your current and new password. The new password must be at least 8 characters.',
        settings_label_firstname: 'First name',
        settings_label_lastname: 'Last name',
        settings_label_phone: 'Phone',
        settings_label_current_email: 'Current Email',
        settings_label_new_email: 'New Email',
        settings_label_current_password: 'Current Password',
        settings_label_new_password: 'New Password',
        settings_otp_label: 'OTP Code',
        settings_save: 'Save',
        settings_cancel: 'Cancel',
        // upgrade
        upgrade_title: 'Upgrade Your Plan',
        upgrade_subtitle: 'Enhance your messaging experience with our different plans.',
        upgrade_current_plan: 'Current Plan',
        upgrade_messages_suffix: 'messages',
        upgrade_per_month: '/mo',
        upgrade_in_use: 'In Use',
        upgrade_btn: 'Upgrade to Premium',
        // verify
        verify_title: 'Verify Your Email',
        verify_subtitle: 'Enter the 6-digit code sent to your email.',
        verify_loading: 'Verifying...',
        verify_submit: 'Verify',
        verify_resent: 'Code resent.',
        verify_resend_q: "Didn't receive the code?",
        verify_resend_link: 'Resend',
    },
};

export function getLang(): Lang {
    if (typeof window === 'undefined') return 'tr';
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'tr';
}

export function setStoredLang(lang: Lang): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
}

export function t(key: string, lang: Lang): string {
    return DICT[lang][key] ?? DICT.tr[key] ?? key;
}

function subscribeLang(callback: () => void): () => void {
    window.addEventListener(LANG_CHANGE_EVENT, callback);
    window.addEventListener('storage', callback);
    return () => {
        window.removeEventListener(LANG_CHANGE_EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}

// useSyncExternalStore: hydration-güvenli (server snapshot 'tr', client snapshot getLang).
// Efekt içi setState YOK → react-hooks/set-state-in-effect tetiklenmez (B3 borcu büyümez).
// setLang localStorage'a yazar + event yayar → tüm useLang örnekleri yeniden render olur.
export function useLang(): [Lang, (lang: Lang) => void] {
    const lang = useSyncExternalStore<Lang>(subscribeLang, getLang, () => 'tr');

    const update = useCallback((next: Lang) => {
        setStoredLang(next);
    }, []);

    return [lang, update];
}
