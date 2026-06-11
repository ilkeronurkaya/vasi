'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { VasiLogo } from '@/components/VasiLogo';

export const runtime = 'edge';

interface ViewData {
    title: string;
    content_text: string;
    sender_name: string;
    recipient_name: string;
    delivered_at: string;
}

const MessageViewPage: React.FC = () => {
    const params = useParams<{ token: string }>();
    const [data, setData] = useState<ViewData | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/public/view/${params.token}`)
            .then(async r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(setData)
            .catch(() => setError('Bu bağlantı geçersiz ya da mesaj bulunamadı.'))
            .finally(() => setLoading(false));
    }, [params.token]);

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

            {data && !revealed && (
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
                        {data.title}
                    </h1>
                    <p style={{ color: 'var(--mist)', fontSize: '15px', lineHeight: 1.6, margin: '0 0 36px' }}>
                        Sevgili {data.recipient_name}, <strong style={{ color: 'var(--cream)' }}>{data.sender_name}</strong> bu
                        mesajı senin için yazdı ve bugüne kadar sakladı. Hazır olduğunda aç.
                    </p>
                    <button onClick={() => setRevealed(true)} className="btn btn-primary btn-lg">
                        Mesajı Aç
                    </button>
                </div>
            )}

            {data && revealed && (
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
                        {data.sender_name} yazdı
                    </p>
                    <h1 style={{
                        fontSize: '24px', fontWeight: 700, letterSpacing: '-0.01em',
                        color: 'var(--cream)', lineHeight: 1.25, margin: '0 0 24px',
                    }}>
                        {data.title}
                    </h1>
                    <p style={{
                        color: 'var(--cream)', fontSize: '16px', lineHeight: 1.75,
                        whiteSpace: 'pre-wrap', margin: '0 0 32px',
                    }}>
                        {data.content_text}
                    </p>
                    <div style={{
                        borderTop: 'var(--border-subtle)', paddingTop: '16px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ color: 'var(--mist)', fontSize: '12px' }}>
                            {data.delivered_at
                                ? `Teslim: ${new Date(data.delivered_at).toLocaleDateString('tr-TR', { dateStyle: 'long' })}`
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
