'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

type Message = { id: string; title: string; content_text?: string; content?: string; status: string };
type Recipient = { id: string; name: string; email: string };

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

const STATUS_LABELS: Record<string, string> = {
    draft: 'Taslak',
    scheduled: 'Zamanlandı',
    sent: 'Gönderildi',
};

const MessageDetail: React.FC = () => {
    const params = useParams<{ id: string }>();
    const [message, setMessage] = useState<Message | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
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
        if (!newName || !newEmail) return;
        setAddError('');
        setAddLoading(true);
        try {
            const created = await apiFetch(`/api/v1/messages/${params.id}/recipients`, {
                method: 'POST',
                body: JSON.stringify({ name: newName, email: newEmail }),
            });
            setRecipients(prev => [...prev, { id: created.id ?? '', name: newName, email: newEmail }]);
            setNewName('');
            setNewEmail('');
        } catch (err: any) {
            setAddError(err?.data?.error ?? 'Alıcı eklenemedi.');
        } finally {
            setAddLoading(false);
        }
    };

    const handleDeleteRecipient = async (recipientId: string) => {
        try {
            await apiFetch(`/api/v1/messages/${params.id}/recipients/${recipientId}`, { method: 'DELETE' });
            setRecipients(prev => prev.filter(r => r.id !== recipientId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMessage = async () => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        try {
            await apiFetch(`/api/v1/messages/${params.id}`, { method: 'DELETE' });
            router.push('/dashboard');
        } catch (err) {
            console.error(err);
        }
    };

    if (!message) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>
            </div>
        );
    }

    const statusColor = message.status === 'sent'
        ? '#4ade80'
        : message.status === 'scheduled'
            ? 'var(--copper)'
            : 'var(--mist)';

    return (
        <div style={{ maxWidth: '680px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <button
                    onClick={() => router.push('/dashboard')}
                    style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}
                >
                    ←
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--cream)', margin: '0 0 4px' }}>
                        {message.title}
                    </h1>
                    <span style={{ fontSize: '12px', color: statusColor }}>
                        {STATUS_LABELS[message.status] ?? message.status}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {message.status === 'draft' && (
                        <button
                            onClick={() => router.push(`/messages/${params.id}/schedule`)}
                            className="btn btn-primary"
                        >
                            Zamanla
                        </button>
                    )}
                    <button
                        onClick={handleDeleteMessage}
                        style={{
                            background: 'none',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                        }}
                    >
                        Sil
                    </button>
                </div>
            </div>

            {/* İçerik */}
            <div style={{
                background: 'var(--midnight)',
                border: '1px solid var(--horizon)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
            }}>
                <p style={{ color: 'var(--mist)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                    MESAJ İÇERİĞİ
                </p>
                <p style={{ color: 'var(--cream)', fontSize: '15px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {message.content_text ?? message.content ?? '—'}
                </p>
            </div>

            {/* Alıcılar */}
            <div style={{
                background: 'var(--midnight)',
                border: '1px solid var(--horizon)',
                borderRadius: '12px',
                padding: '24px',
            }}>
                <p style={{ color: 'var(--mist)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    ALICILAR ({recipients.length})
                </p>

                {/* Alıcı listesi */}
                {recipients.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                        {recipients.map(r => (
                            <div key={r.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: 'var(--obsidian)',
                                borderRadius: '8px',
                                border: '1px solid var(--horizon)',
                            }}>
                                <div>
                                    <span style={{ color: 'var(--cream)', fontSize: '14px', fontWeight: 500 }}>{r.name}</span>
                                    <span style={{ color: 'var(--mist)', fontSize: '13px', marginLeft: '8px' }}>{r.email}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteRecipient(r.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                                >
                                    Kaldır
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Alıcı ekle */}
                <div style={{ borderTop: recipients.length > 0 ? '1px solid var(--horizon)' : 'none', paddingTop: recipients.length > 0 ? '16px' : '0' }}>
                    <p style={{ color: 'var(--cream)', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Alıcı Ekle</p>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Ad Soyad</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onFocus={() => setFocusField('name')}
                                onBlur={() => setFocusField('')}
                                placeholder="Ali Veli"
                                style={{ ...inputStyle, borderColor: focusField === 'name' ? 'var(--copper)' : 'var(--horizon)' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>E-posta</label>
                            <input
                                type="email"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                onFocus={() => setFocusField('email')}
                                onBlur={() => setFocusField('')}
                                placeholder="ali@example.com"
                                style={{ ...inputStyle, borderColor: focusField === 'email' ? 'var(--copper)' : 'var(--horizon)' }}
                            />
                        </div>
                    </div>
                    {addError && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '8px' }}>{addError}</p>}
                    <button
                        type="button"
                        onClick={handleAddRecipient}
                        disabled={addLoading || !newName || !newEmail}
                        className="btn btn-primary"
                        style={{ opacity: addLoading ? 0.7 : 1 }}
                    >
                        {addLoading ? 'Ekleniyor...' : '+ Alıcı Ekle'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;
