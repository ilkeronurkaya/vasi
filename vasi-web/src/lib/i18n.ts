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
    const lang = useSyncExternalStore(subscribeLang, getLang, () => 'tr');

    const update = useCallback((next: Lang) => {
        setStoredLang(next);
    }, []);

    return [lang, update];
}
