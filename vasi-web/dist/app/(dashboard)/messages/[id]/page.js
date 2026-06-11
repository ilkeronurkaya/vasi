'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
export const runtime = 'edge';
const inputStyle = {
    width: '100%',
    minHeight: '44px',
    padding: '10px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
};
const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
    marginBottom: '6px',
};
const STATUS_LABELS = {
    draft: 'Taslak',
    scheduled: 'Zamanlandı',
    sent: 'Gönderildi',
};
const MessageDetail = () => {
    const params = useParams();
    const [message, setMessage] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [focusField, setFocusField] = useState('');
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const router = useRouter();
    useEffect(() => {
        apiFetch(`/api/v1/messages/${params.id}`)
            .then(data => {
            setMessage(data);
            setRecipients(data.recipients ?? []);
        })
            .catch(console.error);
    }, [params.id]);
    const handleAddRecipient = async () => {
        if (!newName || !newEmail)
            return;
        setAddError('');
        setAddLoading(true);
        try {
            const created = await apiFetch(`/api/v1/messages/${params.id}/recipients`, {
                method: 'POST',
                body: JSON.stringify({ full_name: newName, email: newEmail }),
            });
            setRecipients(prev => [...prev, { id: created.id ?? '', full_name: newName, email: newEmail }]);
            setNewName('');
            setNewEmail('');
        }
        catch (err) {
            setAddError(err?.data?.error ?? 'Alıcı eklenemedi.');
        }
        finally {
            setAddLoading(false);
        }
    };
    const handleDeleteRecipient = async (recipientId) => {
        try {
            await apiFetch(`/api/v1/messages/${params.id}/recipients/${recipientId}`, { method: 'DELETE' });
            setRecipients(prev => prev.filter(r => r.id !== recipientId));
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleCancelSchedule = async () => {
        if (!confirm('Zamanlamayı iptal etmek istediğinize emin misiniz?'))
            return;
        try {
            await apiFetch(`/api/v1/messages/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'draft' }),
            });
            setMessage(prev => prev ? { ...prev, status: 'draft', scheduled_at: undefined } : null);
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleDeleteMessage = async () => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?'))
            return;
        try {
            await apiFetch(`/api/v1/messages/${params.id}`, { method: 'DELETE' });
            router.push('/dashboard');
        }
        catch (err) {
            console.error(err);
        }
    };
    if (!message) {
        return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' } },
            React.createElement("p", { style: { color: 'var(--mist)', marginBottom: '6px', fontSize: '14px' } }, "Y\u00FCkleniyor...")));
    }
    const statusColor = message.status === 'sent'
        ? '#4ade80'
        : message.status === 'scheduled'
            ? 'var(--copper)'
            : 'var(--mist)';
    return (React.createElement("div", { style: { maxWidth: '680px' } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' } },
            React.createElement("button", { onClick: () => router.push('/dashboard'), style: { background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '22px', letterSpacing: '-0.01em', padding: '0 4px' } }, "\u2190"),
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("h1", { style: { fontSize: '22px', letterSpacing: '-0.01em', fontWeight: 700, color: 'var(--cream)', margin: '0 0 4px' } }, message.title),
                React.createElement("span", { style: { fontSize: '12px', color: statusColor } }, STATUS_LABELS[message.status] ?? message.status)),
            React.createElement("div", { style: { display: 'flex', gap: '8px' } },
                message.status === 'scheduled' && (React.createElement(React.Fragment, null,
                    React.createElement("button", { onClick: handleCancelSchedule, style: {
                            background: 'none',
                            border: '1px solid var(--mist)',
                            color: 'var(--mist)',
                            borderRadius: 'var(--radius-input)',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        } }, "\u0130ptal Et"),
                    React.createElement("button", { onClick: () => router.push(`/messages/${params.id}/schedule`), className: "btn btn-primary" }, "Yeniden Zamanla"))),
                message.status === 'draft' && (React.createElement("button", { onClick: () => router.push(`/messages/${params.id}/schedule`), className: "btn btn-primary" }, "Zamanla")),
                React.createElement("button", { onClick: handleDeleteMessage, style: {
                        background: 'none',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: 'var(--radius-input)',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                    } }, "Sil"))),
        React.createElement("div", { style: {
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '24px',
                marginBottom: '20px',
            } },
            React.createElement("p", { style: { color: 'var(--mist)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' } }, "MESAJ \u0130\u00C7ER\u0130\u011E\u0130"),
            React.createElement("p", { style: { color: 'var(--cream)', fontSize: '15px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' } }, message.content_text ?? message.content ?? '—'),
            message.status === 'scheduled' && message.scheduled_at && (React.createElement("p", { style: { marginTop: '12px', fontSize: '13px', color: 'var(--copper)', display: 'flex', alignItems: 'center', gap: '6px' } },
                React.createElement("span", null, "\u23F0"),
                React.createElement("span", null,
                    "G\u00F6nderilecek:",
                    ' ',
                    new Date(message.scheduled_at).toLocaleString('tr-TR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                    }))))),
        React.createElement("div", { style: {
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '24px',
            } },
            React.createElement("p", { style: { color: 'var(--mist)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' } },
                "ALICILAR (",
                recipients.length,
                ")"),
            recipients.length > 0 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' } }, recipients.map(r => (React.createElement("div", { key: r.id, style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--obsidian)',
                    borderRadius: 'var(--radius-input)',
                    border: '1px solid var(--horizon)',
                } },
                React.createElement("div", null,
                    React.createElement("span", { style: { color: 'var(--cream)', fontSize: '15px', fontWeight: 500 } }, r.full_name),
                    React.createElement("span", { style: { color: 'var(--mist)', fontSize: '13px', marginLeft: '8px' } }, r.email)),
                React.createElement("button", { onClick: () => handleDeleteRecipient(r.id), style: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' } }, "Kald\u0131r")))))),
            React.createElement("div", { style: { borderTop: recipients.length > 0 ? '1px solid var(--horizon)' : 'none', paddingTop: recipients.length > 0 ? '16px' : '0' } },
                React.createElement("p", { style: { color: 'var(--cream)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' } }, "Al\u0131c\u0131 Ekle"),
                React.createElement("div", { style: { display: 'flex', gap: '10px', marginBottom: '10px' } },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("label", { style: labelStyle }, "Ad Soyad"),
                        React.createElement("input", { type: "text", value: newName, onChange: e => setNewName(e.target.value), onFocus: () => setFocusField('name'), onBlur: () => setFocusField(''), placeholder: "Ali Veli", style: { ...inputStyle, ...(focusField === 'name' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } })),
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("label", { style: labelStyle }, "E-posta"),
                        React.createElement("input", { type: "email", value: newEmail, onChange: e => setNewEmail(e.target.value), onFocus: () => setFocusField('email'), onBlur: () => setFocusField(''), placeholder: "ali@example.com", style: { ...inputStyle, ...(focusField === 'email' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } }))),
                addError && React.createElement("p", { style: { color: '#EF4444', fontSize: '13px', marginBottom: '8px' } }, addError),
                React.createElement("button", { type: "button", onClick: handleAddRecipient, disabled: addLoading || !newName || !newEmail, className: "btn btn-primary", style: { opacity: addLoading ? 0.7 : 1 } }, addLoading ? 'Ekleniyor...' : '+ Alıcı Ekle')))));
};
export default MessageDetail;
