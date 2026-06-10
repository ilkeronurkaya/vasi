
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

type StatusKey = 'draft' | 'scheduled' | 'sent';
type Message = {
    id: string;
    title: string;
    status: StatusKey;
    recipient_count: number;
    created_at: string;
};

const STATUS_LABELS: Record<StatusKey, { label: string; bg: string; color: string }> = {
    draft: { label: 'Taslak', bg: 'var(--horizon)', color: 'var(--mist)' },
    scheduled: { label: 'Zamanlanmış', bg: 'rgba(212,118,59,0.15)', color: 'var(--copper)' },
    sent: { label: 'Gönderildi', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
};

const LANGS = {
    TR: {
        page_title: 'Mesajlarım',
        new_message_button: '+ Yeni Mesaj',
        no_messages_title: 'Henüz mesaj yok',
        no_messages_subtitle: 'Sevdiklerine geleceğe mesaj bırak',
        create_first_message_button: 'İlk Mesajını Oluştur',
        loading: 'Yükleniyor...',
    },
    EN: {
        page_title: 'My Messages',
        new_message_button: '+ New Message',
        no_messages_title: 'No messages yet',
        no_messages_subtitle: 'Leave a message for your loved ones in the future',
        create_first_message_button: 'Create First Message',
        loading: 'Loading...',
    },
    DE: { // TODO: translate
        page_title: 'Meine Nachrichten',
        new_message_button: '+ Neue Nachricht',
        no_messages_title: 'Noch keine Nachrichten',
        no_messages_subtitle: 'Hinterlasse deinen Lieben eine Nachricht für die Zukunft',
        create_first_message_button: 'Erste Nachricht erstellen',
        loading: 'Wird geladen...',
    },
    FR: { // TODO: translate
        page_title: 'Mes Messages',
        new_message_button: '+ Nouveau Message',
        no_messages_title: 'Aucun message pour l\'instant',
        no_messages_subtitle: 'Laissez un message à vos proches pour le futur',
        create_first_message_button: 'Créer le premier message',
        loading: 'Chargement...',
    },
    ES: { // TODO: translate
        page_title: 'Mis Mensajes',
        new_message_button: '+ Nuevo Mensaje',
        no_messages_title: 'Aún no hay mensajes',
        no_messages_subtitle: 'Deja un mensaje para tus seres queridos en el futuro',
        create_first_message_button: 'Crear primer mensaje',
        loading: 'Cargando...',
    },
    AR: { // TODO: translate
        page_title: 'رسائلي',
        new_message_button: '+ رسالة جديدة',
        no_messages_title: 'لا توجد رسائل بعد',
        no_messages_subtitle: 'اترك رسالة لأحبائك في المستقبل',
        create_first_message_button: 'إنشاء أول رسالة',
        loading: 'جاري التحميل...',
    },
};

const Messages: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
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
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 }}>{t.page_title}</h1>
                <button
                    onClick={() => router.push('/messages/new')}
                    className="btn btn-primary"
                >
                    {t.new_message_button}
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

export default Messages;
