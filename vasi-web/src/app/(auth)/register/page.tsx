'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useLang, t } from '@/lib/i18n';

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

export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState('');
    const router = useRouter();
    const [lang] = useLang();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiFetch('/api/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
            });
            // Kayıt sonrası e-posta doğrulama ekranına yönlendir
            // Doğrulama ekranı e-postayı API'ye göndermek için saklar
            try { localStorage.setItem('verifyEmail', email); } catch {}
            router.push('/verify-email');
        } catch (err: any) {
            setError(err?.data?.error ?? t('register_error_default', lang));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', marginBottom: '24px', textAlign: 'center' }}>
                Hesap Oluştur
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Ad + Soyad yan yana */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>{t('register_firstname', lang)}</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            onFocus={() => setFocusField('first')}
                            onBlur={() => setFocusField('')}
                            required
                            placeholder="Ali"
                            style={{ ...inputStyle, ...(focusField === 'first' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>{t('register_lastname', lang)}</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            onFocus={() => setFocusField('last')}
                            onBlur={() => setFocusField('')}
                            required
                            placeholder="Veli"
                            style={{ ...inputStyle, ...(focusField === 'last' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>{t('register_email', lang)}</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusField('email')}
                        onBlur={() => setFocusField('')}
                        required
                        placeholder="ali@example.com"
                        style={{ ...inputStyle, ...(focusField === 'email' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
                    />
                </div>

                <div>
                    <label style={labelStyle}>{t('register_password', lang)}</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusField('pass')}
                        onBlur={() => setFocusField('')}
                        required
                        minLength={8}
                        placeholder={t('register_password_ph', lang)}
                        style={{ ...inputStyle, ...(focusField === 'pass' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) }}
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
                    {loading ? t('register_loading', lang) : t('register_submit', lang)}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <a href="/login" style={{ fontSize: '13px', color: 'var(--copper)', textDecoration: 'none', fontWeight: 700 }}>
                    {t('register_login_link', lang)}
                </a>
            </div>
        </div>
    );
}
