
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useLang, t } from '@/lib/i18n';

export const runtime = 'edge';

type StatusKey = 'draft' | 'scheduled' | 'sent' | 'delivered' | 'failed';
type Message = {
    id: string;
    title: string;
    status: StatusKey;
    recipient_count: number;
    created_at: string;
};


const STATUS_LABELS: Record<string, { bg: string; color: string }> = {
    draft: { bg: 'var(--horizon)', color: 'var(--mist)' },
    scheduled: { bg: 'rgba(212,118,59,0.15)', color: 'var(--copper)' },
    sent: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    delivered: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    failed: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};


const Messages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [lang] = useLang();

    useEffect(() => {
        apiFetch('/api/v1/messages')
            .then(data => setMessages(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 }}>{t('msgs_title', lang)}</h1>
                <button
                    onClick={() => router.push('/messages/new')}
                    className="btn btn-primary btn-md"
                >
                    {t('msgs_new', lang)}
                </button>
            </div>

            {/* Message Cards */}
            {loading ? (
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>{t('common_loading', lang)}</p>
            ) : messages.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '48px',
                    textAlign: 'center',
                }}>
                    <span role="img" aria-label="letter">💌</span>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', margin: '12px 0 4px' }}>{t('msgs_empty_title', lang)}</p>
                    <p style={{ fontSize: '14px', color: 'var(--mist)', marginBottom: '24px' }}>{t('msgs_empty_subtitle', lang)}</p>
                    <button onClick={() => router.push('/messages/new')} className="btn btn-primary btn-md">
                        {t('msgs_create_first', lang)}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map((msg, index) => {
                        const status = STATUS_LABELS[msg.status] ?? STATUS_LABELS.draft;
                        return (
                            <div
                                key={index}
                                onClick={() => router.push(`/messages/${msg.id}`)}
                                style={{
                                    background: 'var(--midnight)',
                                    border: 'var(--border-subtle)',
                                    borderRadius: 'var(--radius-card)',
                                    boxShadow: 'var(--shadow-card)',
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: `transform var(--dur) var(--ease), border-color var(--dur) var(--ease)`,
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.borderColor = 'rgba(212,118,59,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(237,233,224,0.08)';
                                }}
                            >
                                <div>
                                    <p style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '15px', margin: '0 0 4px' }}>
                                        {msg.title}
                                    </p>
                                    <p style={{ color: 'var(--mist)', fontSize: '13px', margin: 0 }}>
                                        {(msg.recipient_count ?? 0) + " " + t('common_recipients', lang) + " · " + new Date(msg.created_at).toLocaleDateString("tr-TR")}
                                    </p>
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    background: status.bg,
                                    color: status.color,
                                }}>
                                    {t('status_' + msg.status, lang)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Messages;
