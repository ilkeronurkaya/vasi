
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

type MessageSummary = { id: string; title: string; status: string; created_at: string; recipient_count?: number };

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
    draft: { label: 'Taslak', bg: 'var(--horizon)', color: 'var(--mist)' },
    scheduled: { label: 'Zamanlanmış', bg: 'rgba(212,118,59,0.15)', color: 'var(--copper)' },
    sent: { label: 'Gönderildi', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
};

const LANGS = {
    TR: {
        page_title: 'Merhaba, %s 👋',
        page_subtitle: 'Bugün ne bırakmak istiyorsun?',
        new_message_button: '+ Yeni Mesaj',
        total_messages: 'Toplam',
        scheduled_messages: 'Zamanlanmış',
        sent_messages: 'Gönderildi',
        view_all_messages: 'Tümünü Gör →',
        no_messages_title: 'Henüz mesaj yok',
        no_messages_subtitle: 'Sevdiklerine geleceğe mesaj bırak',
        create_first_message_button: 'İlk Mesajını Oluştur',
    },
    EN: {
        page_title: 'Hello, %s 👋',
        page_subtitle: 'What would you like to leave today?',
        new_message_button: '+ New Message',
        total_messages: 'Total',
        scheduled_messages: 'Scheduled',
        sent_messages: 'Sent',
        view_all_messages: 'View All →',
        no_messages_title: 'No messages yet',
        no_messages_subtitle: 'Leave a message for your loved ones in the future',
        create_first_message_button: 'Create First Message',
    },
};

const Dashboard: React.FC = () => {
    const [userFirstName, setUserFirstName] = useState("");

    useEffect(() => {
        apiFetch("/api/v1/me")
            .then(user => setUserFirstName(user.first_name || ""))
            .catch(console.error);
    }, []);
    const [messages, setMessages] = useState<MessageSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const lang = 'TR'; // This should be dynamic based on user preference or browser settings

    useEffect(() => {
        apiFetch('/api/v1/messages')
            .then(data => setMessages(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const t = LANGS[lang];

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--cream)', margin: 0 }}>{t.page_title.replace("%s", userFirstName)}</h1>
                    <p style={{ fontSize: '14px', color: 'var(--mist)' }}>{t.page_subtitle}</p>
                </div>
                <button
                    onClick={() => router.push('/messages/new')}
                    className="btn btn-primary"
                >
                    {t.new_message_button}
                </button>
            </div>

            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' }}>
                {[
                    { label: t.total_messages, value: messages.length },
                    { label: t.scheduled_messages, value: messages.filter(msg => msg.status === 'scheduled').length },
                    { label: t.sent_messages, value: messages.filter(msg => msg.status === 'sent').length },
                ].map((stat, index) => (
                    <div key={index} style={{
                        background: 'var(--midnight)',
                        border: '1px solid var(--horizon)',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--cream)' }}>{stat.value}</p>
                        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--mist)' }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Message List Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--cream)' }}>Son Mesajlar</h2>
                <button
                    onClick={() => router.push('/messages')}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px' }}
                >
                    {t.view_all_messages}
                </button>
            </div>

            {/* Message Cards */}
            {loading ? (
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>
            ) : messages.length === 0 ? (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '48px',
                    textAlign: 'center',
                }}>
                    <span role="img" aria-label="letter">💌</span>
                    <p style={{ fontSize: '16px', color: 'var(--mist)', margin: '12px 0' }}>{t.no_messages_title}</p>
                    <p style={{ fontSize: '14px', color: 'var(--mist)', marginBottom: '24px' }}>{t.no_messages_subtitle}</p>
                    <button onClick={() => router.push('/messages/new')} className="btn btn-primary">
                        {t.create_first_message_button}
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
                                border: '1px solid var(--horizon)',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--copper)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--horizon)')}
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
