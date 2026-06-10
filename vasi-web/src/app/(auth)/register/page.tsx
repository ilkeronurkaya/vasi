'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '10px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: '8px',
    color: 'var(--cream)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginTop: '6px',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiFetch('/api/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            // Kayıt sonrası e-posta doğrulama ekranına yönlendir
            router.push('/verify-email');
        } catch (err: any) {
            setError(err?.data?.error ?? 'Kayıt başarısız. Tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', marginBottom: '24px', textAlign: 'center' }}>
                Hesap Oluştur
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Ad + Soyad yan yana */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Ad</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            onFocus={() => setFocusField('first')}
                            onBlur={() => setFocusField('')}
                            required
                            placeholder="Ali"
                            style={{ ...inputStyle, borderColor: focusField === 'first' ? 'var(--copper)' : 'var(--horizon)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Soyad</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            onFocus={() => setFocusField('last')}
                            onBlur={() => setFocusField('')}
                            required
                            placeholder="Veli"
                            style={{ ...inputStyle, borderColor: focusField === 'last' ? 'var(--copper)' : 'var(--horizon)' }}
                        />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>E-posta</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onFocus={() => setFocusField('email')}
                        onBlur={() => setFocusField('')}
                        required
                        placeholder="ali@example.com"
                        style={{ ...inputStyle, borderColor: focusField === 'email' ? 'var(--copper)' : 'var(--horizon)' }}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocusField('pass')}
                        onBlur={() => setFocusField('')}
                        required
                        minLength={8}
                        placeholder="En az 8 karakter"
                        style={{ ...inputStyle, borderColor: focusField === 'pass' ? 'var(--copper)' : 'var(--horizon)' }}
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
                    {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <a href="/login" style={{ fontSize: '13px', color: 'var(--copper)', textDecoration: 'none' }}>
                    Zaten hesabınız var mı? Giriş yapın
                </a>
            </div>
        </div>
    );
}
