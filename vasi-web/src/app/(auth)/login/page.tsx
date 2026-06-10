'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '44px',
    padding: '10px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '15px',
    outline: 'none',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
    marginBottom: '6px',
};

const LANGS = {
    TR: {
        title: 'Giriş Yap',
        email: 'E-posta',
        password: 'Şifre',
        forgot: 'Şifremi unuttum',
        register: 'Hesabınız yok mu? Kayıt ol',
        submit: 'Giriş Yap',
        loading: 'Giriş yapılıyor...',
        error_default: 'E-posta veya şifre hatalı.',
    },
    EN: {
        title: 'Sign In',
        email: 'Email',
        password: 'Password',
        forgot: 'Forgot password?',
        register: "Don't have an account? Register",
        submit: 'Sign In',
        loading: 'Signing in...',
        error_default: 'Invalid email or password.',
    },
};

export default function LoginPage() {
    const lang = (typeof navigator !== 'undefined'
        ? navigator.language.split('-')[0].toUpperCase()
        : 'TR') as keyof typeof LANGS;
    const t = LANGS[lang] ?? LANGS.TR;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState('');
    const router = useRouter();

    React.useEffect(() => {
        document.documentElement.dir = (lang as string) === 'AR' ? 'rtl' : 'ltr';
    }, [lang]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await apiFetch('/api/v1/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            localStorage.setItem('authToken', response.accessToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err?.data?.error ?? t.error_default);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', marginBottom: '24px', textAlign: 'center' }}>
                {t.title}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <label htmlFor="email" style={labelStyle}>{t.email}</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusField('email')}
                        onBlur={() => setFocusField('')}
                        required
                        style={{ ...inputStyle, ...(focusField === 'email' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
                    />
                </div>

                <div>
                    <label htmlFor="password" style={labelStyle}>{t.password}</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusField('password')}
                        onBlur={() => setFocusField('')}
                        required
                        style={{ ...inputStyle, ...(focusField === 'password' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
                    />
                </div>

                {error && (
                    <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? t.loading : t.submit}
                </button>
            </form>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <a href="#" style={{ fontSize: '13px', color: 'var(--mist)', textDecoration: 'none' }}>
                    {t.forgot}
                </a>
                <a href="/register" style={{ fontSize: '13px', color: 'var(--copper)', textDecoration: 'none' }}>
                    {t.register}
                </a>
            </div>
        </div>
    );
}
