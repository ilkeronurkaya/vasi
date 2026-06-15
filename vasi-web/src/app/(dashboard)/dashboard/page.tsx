
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useLang, t } from '@/lib/i18n';

export const runtime = 'edge';

type MessageSummary = { id: string; title: string; status: string; created_at: string; recipient_count?: number };


const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
    draft: { label: 'Taslak', bg: 'var(--horizon)', color: 'var(--mist)' },
    scheduled: { label: 'Zamanlanmış', bg: 'rgba(212,118,59,0.15)', color: 'var(--copper)' },
    sent: { label: 'Gönderildi', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    delivered: { label: 'Teslim Edildi', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    failed: { label: 'Başarısız', bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
};


const Dashboard: React.FC = () => {
    const [userFirstName, setUserFirstName] = useState("");

    useEffect(() => {
        apiFetch("/api/v1/me")
            .then(data => setUserFirstName(data?.user?.first_name || ""))
            .catch(console.error);
    }, []);
    const [messages, setMessages] = useState<MessageSummary[]>([]);
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
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 }}>{t('dash_greeting', lang).replace("%s", userFirstName)}</h1>
                    <p style={{ fontSize: '15px', color: 'var(--mist)', lineHeight: 1.5 }}>{t('dash_subtitle', lang)}</p>
                </div>
                <button
                    onClick={() => router.push('/messages/new')}
                    className="btn btn-primary btn-md"
                >
                    {t('dash_new_message', lang)}
                </button>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
                {[
                    { label: t('dash_total', lang), value: messages.length },
                    { label: t('dash_scheduled', lang), value: messages.filter(msg => msg.status === 'scheduled').length },
                    { label: t('dash_sent', lang), value: messages.filter(msg => msg.status === 'sent' || msg.status === 'delivered').length },
                ].map((stat, index) => (
                    <div key={index} style={{
                        background: 'var(--midnight)',
                        border: 'var(--border-subtle)',
                        borderRadius: 'var(--radius-card)',
                        boxShadow: 'var(--shadow-card)',
                        padding: '24px',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--cream)', margin: 0 }}>{stat.value}</p>
                        <p style={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mist)', marginTop: '4px' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Message List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)' }}>{t('dash_recent', lang)}</h2>
                <button
                    onClick={() => router.push('/messages')}
                    className="btn btn-secondary btn-sm"
                    
                >
                    {t('dash_view_all', lang)}
                </button>
            </div>

            {/* Message Cards */}
            {loading ? (
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>{t('dash_loading', lang)}</p>
            ) : messages.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '48px',
                    textAlign: 'center',
                }}>
                    <span role="img" aria-label="letter">💌</span>
                    <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', margin: '12px 0 4px' }}>{t('dash_empty_title', lang)}</p>
                    <p style={{ fontSize: '14px', color: 'var(--mist)', marginBottom: '24px' }}>{t('dash_empty_subtitle', lang)}</p>
                    <button onClick={() => router.push('/messages/new')} className="btn btn-primary btn-md">
                        {t('dash_create_first', lang)}
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map(msg => {
                        const status = STATUS_LABELS[msg.status] ?? STATUS_LABELS.draft;
                        return (
                        <div
                            key={msg.id}
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
                                    {(msg.recipient_count ?? 0) + " alıcı · " + new Date(msg.created_at).toLocaleDateString("tr-TR")}
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
                                {status.label}
                            </span>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
