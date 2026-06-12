'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VasiLogo } from '@/components/VasiLogo';

export const runtime = 'edge';

interface PreviewData {
    title: string;
    sender_name: string;
    recipient_name: string;
    delivered_at: string;
    otp_required: boolean;
}

interface FullMessage {
    title: string;
    content_text: string;
    sender_name: string;
    recipient_name: string;
    delivered_at: string;
}

type Step = 'intro' | 'otp' | 'revealed';

const MessageViewPage: React.FC = () => {
    const params = useParams<{ token: string }>();
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [message, setMessage] = useState<FullMessage | null>(null);
    const [step, setStep] = useState<Step>('intro');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [maskedEmail, setMaskedEmail] = useState('');
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpBusy, setOtpBusy] = useState(false);
    const [otpFocused, setOtpFocused] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/public/view/${params.token}`)
            .then(async r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(setPreview)
            .catch(() => setError('Bu bağlantı geçersiz ya da mesaj bulunamadı.'))
            .finally(() => setLoading(false));
    }, [params.token]);

    const requestOtp = async () => {
        setOtpBusy(true);
        setOtpError('');
        try {
            const r = await fetch(`/api/v1/public/view/${params.token}/otp`, { method: 'POST' });
            const body = await r.json().catch(() => ({}));
            if (!r.ok) {
                setOtpError(body?.error ?? 'Kod gönderilemedi. Tekrar dene.');
                return;
            }
            setMaskedEmail(body.email_masked ?? '');
            setOtpValue('');
            setStep('otp');
        } catch {
            setOtpError('Kod gönderilemedi. Tekrar dene.');
        } finally {
            setOtpBusy(false);
        }
    };

    const verifyOtp = async () => {
        if (!/^\d{6}$/.test(otpValue)) {
            setOtpError('6 haneli kodu gir.');
            return;
        }
        setOtpBusy(true);
        setOtpError('');
        try {
            const r = await fetch(`/api/v1/public/view/${params.token}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otpValue }),
            });
            const body = await r.json().catch(() => ({}));
            if (!r.ok) {
                if (body?.code === 'INVALID_OTP') {
                    setOtpError(`Kod hatalı. ${body.remaining_attempts ?? 0} deneme hakkın kaldı.`);
                } else if (body?.code === 'OTP_EXPIRED') {
                    setOtpError('Kodun süresi doldu. Yeni kod iste.');
                } else if (body?.code === 'TOO_MANY_ATTEMPTS') {
                    setOtpError('Çok fazla yanlış deneme. Yeni kod iste.');
                } else {
                    setOtpError(body?.error ?? 'Doğrulama başarısız. Tekrar dene.');
                }
                return;
            }
            setMessage(body);
            setStep('revealed');
        } catch {
            setOtpError('Doğrulama başarısız. Tekrar dene.');
        } finally {
            setOtpBusy(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--obsidian)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 16px',
        }}>
            {/* Marka */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                <VasiLogo height={36} />
                <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cream)' }}>Vasi</span>
            </div>

            {loading && (
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Mesajın hazırlanıyor...</p>
            )}

            {error && (
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🕯️</div>
                    <p style={{ color: 'var(--cream)', fontSize: '17px', fontWeight: 600, margin: '0 0 8px' }}>
                        Mesaj bulunamadı
                    </p>
                    <p style={{ color: 'var(--mist)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                        {error}
                    </p>
                </div>
            )}

            {preview && step === 'intro' && (
                <div style={{ textAlign: 'center', maxWidth: '440px' }}>
                    <div style={{ fontSize: '44px', marginBottom: '24px' }}>💌</div>
                    <p style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--copper)', margin: '0 0 12px',
                    }}>
                        Geleceğinden bir mesaj
                    </p>
                    <h1 style={{
                        fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em',
                        color: 'var(--cream)', lineHeight: 1.2, margin: '0 0 16px',
                    }}>
                        {preview.title}
                    </h1>
                    <p style={{ color: 'var(--mist)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 36px' }}>
                        Sevgili {preview.recipient_name}, <strong style={{ color: 'var(--cream)' }}>{preview.sender_name}</strong> bu
                        mesajı senin için yazdı ve bugüne kadar sakladı. Güvenliğin için önce
                        e-postana göndereceğimiz kodla kimliğini doğrulayacağız.
                    </p>
                    {otpError && (
                        <p style={{ color: '#EF4444', fontSize: '13px', margin: '0 0 16px' }}>{otpError}</p>
                    )}
                    <button onClick={requestOtp} disabled={otpBusy} className="btn btn-primary btn-lg"
                        style={{ opacity: otpBusy ? 0.7 : 1 }}>
                        {otpBusy ? 'Kod gönderiliyor...' : 'Mesajı Aç'}
                    </button>
                </div>
            )}

            {preview && step === 'otp' && (
                <div style={{
                    maxWidth: '420px',
                    width: '100%',
                    background: 'var(--midnight)',
                    border: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '36px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔐</div>
                    <h2 style={{
                        fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em',
                        color: 'var(--cream)', margin: '0 0 10px',
                    }}>
                        Doğrulama kodu
                    </h2>
                    <p style={{ color: 'var(--mist)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px' }}>
                        {maskedEmail ? <>6 haneli kodu <strong style={{ color: 'var(--cream)' }}>{maskedEmail}</strong> adresine gönderdik.</>
                            : '6 haneli kodu e-posta adresine gönderdik.'}
                    </p>
                    <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpValue}
                        onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        onFocus={() => setOtpFocused(true)}
                        onBlur={() => setOtpFocused(false)}
                        onKeyDown={e => { if (e.key === 'Enter') verifyOtp(); }}
                        placeholder="······"
                        style={{
                            width: '100%', minHeight: '52px', padding: '10px 14px',
                            background: 'var(--obsidian)',
                            border: otpFocused ? '1px solid var(--copper)' : '1px solid var(--horizon)',
                            boxShadow: otpFocused ? 'var(--focus-ring)' : 'none',
                            borderRadius: 'var(--radius-input)', color: 'var(--cream)',
                            fontSize: '24px', fontWeight: 700, letterSpacing: '0.4em', textAlign: 'center',
                            outline: 'none', boxSizing: 'border-box',
                            transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
                            marginBottom: '14px',
                        }}
                    />
                    {otpError && (
                        <p style={{ color: '#EF4444', fontSize: '13px', margin: '0 0 14px' }}>{otpError}</p>
                    )}
                    <button onClick={verifyOtp} disabled={otpBusy || otpValue.length !== 6}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', opacity: otpBusy ? 0.7 : 1 }}>
                        {otpBusy ? 'Doğrulanıyor...' : 'Doğrula ve Aç'}
                    </button>
                    <button onClick={requestOtp} disabled={otpBusy}
                        style={{
                            background: 'none', border: 'none', color: 'var(--copper)',
                            fontSize: '13px', cursor: 'pointer', marginTop: '16px', padding: 0,
                        }}>
                        Kodu yeniden gönder
                    </button>
                </div>
            )}

            {message && step === 'revealed' && (
                <div style={{
                    maxWidth: '560px',
                    width: '100%',
                    background: 'var(--midnight)',
                    border: 'var(--border-subtle)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                    padding: '40px',
                    animation: 'vasi-reveal 600ms var(--ease)',
                }}>
                    <p style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--copper)', margin: '0 0 8px',
                    }}>
                        {message.sender_name} yazdı
                    </p>
                    <h1 style={{
                        fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em',
                        color: 'var(--cream)', lineHeight: 1.25, margin: '0 0 24px',
                    }}>
                        {message.title}
                    </h1>
                    <p style={{
                        color: 'var(--cream)', fontSize: '16px', lineHeight: 1.75,
                        whiteSpace: 'pre-wrap', margin: '0 0 32px',
                    }}>
                        {message.content_text}
                    </p>
                    <div style={{
                        borderTop: 'var(--border-subtle)', paddingTop: '16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ color: 'var(--mist)', fontSize: '12px' }}>
                            {message.delivered_at
                                ? `Teslim: ${new Date(message.delivered_at).toLocaleDateString('tr-TR', { dateStyle: 'long' })}`
                                : ''}
                        </span>
                        <a href="/" style={{ color: 'var(--copper)', fontSize: '12px', textDecoration: 'none' }}>
                            Sen de geleceğe mesaj bırak →
                        </a>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes vasi-reveal {
                    from { opacity: 0; transform: translateY(12px) scale(0.98); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default MessageViewPage;
