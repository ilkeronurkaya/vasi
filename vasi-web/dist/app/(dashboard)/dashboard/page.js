'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
export const runtime = 'edge';
const STATUS_LABELS = {
    draft: { label: 'Taslak', bg: 'var(--horizon)', color: 'var(--mist)' },
    scheduled: { label: 'Zamanlanmış', bg: 'rgba(212,118,59,0.15)', color: 'var(--copper)' },
    sent: { label: 'Gönderildi', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    delivered: { label: 'Teslim Edildi', bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
    failed: { label: 'Başarısız', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
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
const Dashboard = () => {
    const [userFirstName, setUserFirstName] = useState("");
    useEffect(() => {
        apiFetch("/api/v1/me")
            .then(data => setUserFirstName(data?.user?.first_name || ""))
            .catch(console.error);
    }, []);
    const [messages, setMessages] = useState([]);
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
    return (React.createElement("div", { style: { padding: '24px' } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px' } },
            React.createElement("div", null,
                React.createElement("h1", { style: { fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 } }, t.page_title.replace("%s", userFirstName)),
                React.createElement("p", { style: { fontSize: '15px', color: 'var(--mist)', lineHeight: 1.5 } }, t.page_subtitle)),
            React.createElement("button", { onClick: () => router.push('/messages/new'), className: "btn btn-primary" }, t.new_message_button)),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '36px' } }, [
            { label: t.total_messages, value: messages.length },
            { label: t.scheduled_messages, value: messages.filter(msg => msg.status === 'scheduled').length },
            { label: t.sent_messages, value: messages.filter(msg => msg.status === 'sent').length },
        ].map((stat, index) => (React.createElement("div", { key: index, style: {
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '24px',
                textAlign: 'center',
            } },
            React.createElement("p", { style: { fontSize: '32px', fontWeight: 700, color: 'var(--cream)', margin: 0 } }, stat.value),
            React.createElement("p", { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--mist)', marginTop: '4px' } }, stat.label))))),
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' } },
            React.createElement("h2", { style: { fontSize: '17px', fontWeight: 600, color: 'var(--cream)' } }, "Son Mesajlar"),
            React.createElement("button", { onClick: () => router.push('/messages'), className: "btn btn-secondary", style: { padding: '6px 12px' } }, t.view_all_messages)),
        loading ? (React.createElement("p", { style: { color: 'var(--mist)', fontSize: '14px' } }, "Y\u00FCkleniyor...")) : messages.length === 0 ? (React.createElement("div", { style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '48px',
                textAlign: 'center',
            } },
            React.createElement("span", { role: "img", "aria-label": "letter" }, "\uD83D\uDC8C"),
            React.createElement("p", { style: { fontSize: '16px', color: 'var(--mist)', margin: '12px 0' } }, t.no_messages_title),
            React.createElement("p", { style: { fontSize: '14px', color: 'var(--mist)', marginBottom: '24px' } }, t.no_messages_subtitle),
            React.createElement("button", { onClick: () => router.push('/messages/new'), className: "btn btn-primary" }, t.create_first_message_button))) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, messages.map(msg => {
            const status = STATUS_LABELS[msg.status] ?? STATUS_LABELS.draft;
            return (React.createElement("div", { key: msg.id, onClick: () => router.push(`/messages/${msg.id}`), style: {
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
                }, onMouseEnter: e => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = 'rgba(212,118,59,0.3)';
                }, onMouseLeave: e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(237,233,224,0.08)';
                } },
                React.createElement("div", null,
                    React.createElement("p", { style: { color: 'var(--cream)', fontWeight: 600, fontSize: '15px', margin: '0 0 4px' } }, msg.title),
                    React.createElement("p", { style: { color: 'var(--mist)', fontSize: '13px', margin: 0 } }, (msg.recipient_count ?? 0) + " alıcı · " + new Date(msg.created_at).toLocaleDateString("tr-TR"))),
                React.createElement("span", { style: {
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        background: status.bg,
                        color: status.color,
                    } }, status.label)));
        })))));
};
export default Dashboard;
