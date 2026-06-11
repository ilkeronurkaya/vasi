'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '0.3em',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginTop: '6px',
    boxSizing: 'border-box',
};

export default function VerifyEmailPage() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resent, setResent] = useState(false);
    const [focused, setFocused] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiFetch('/api/v1/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ otp }),
            });
            router.push('/login');
        } catch (err: any) {
            setError(err?.data?.error ?? 'Kod hatalı veya süresi dolmuş.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await apiFetch('/api/v1/auth/resend-verification', { method: 'POST' });
            setResent(true);
        } catch {
            // sessiz hata
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {/* İkon */}
            <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(212,118,59,0.12)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '24px',
            }}>
                ✉️
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', marginBottom: '8px' }}>
                E-postanızı Doğrulayın
            </h2>
            <p style={{ color: 'var(--mist)', fontSize: '14px', lineHeight: '1.5', marginBottom: '28px' }}>
                E-postanıza gönderilen 6 haneli kodu girin.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                    <input
                        type="text"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        required
                        maxLength={6}
                        placeholder="000000"
                        style={{ ...inputStyle, borderColor: focused ? 'var(--copper)' : 'var(--horizon)' }}
                    />
                </div>

                {error && (
                    <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', opacity: (loading || otp.length < 6) ? 0.7 : 1 }}
                >
                    {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                </button>
            </form>

            <div style={{ marginTop: '20px' }}>
                {resent ? (
                    <p style={{ color: '#22C55E', fontSize: '13px' }}>Kod tekrar gönderildi.</p>
                ) : (
                    <button
                        onClick={handleResend}
                        style={{ background: 'none', border: 'none', color: 'var(--mist)', fontSize: '13px', cursor: 'pointer' }}
                    >
                        Kodu almadınız mı? <span style={{ color: 'var(--copper)' }}>Tekrar gönder</span>
                    </button>
                )}
            </div>
        </div>
    );
}
