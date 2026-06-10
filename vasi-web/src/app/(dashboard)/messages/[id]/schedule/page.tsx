'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

type Message = { id: string; title: string; scheduled_at?: string; status: string };

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

const ScheduleMessage: React.FC = () => {
    const params = useParams<{ id: string }>();
    const [message, setMessage] = useState<Message | null>(null);
    const [scheduleTime, setScheduleTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [focused, setFocused] = useState(false);
    const router = useRouter();

    useEffect(() => {
        apiFetch(`/api/v1/messages/${params.id}`)
            .then(data => {
                setMessage(data);
                if (data.scheduled_at) {
                    setScheduleTime(new Date(data.scheduled_at).toISOString().slice(0, 16));
                }
            })
            .catch(console.error);
    }, [params.id]);

    const handleSchedule = async () => {
        if (!scheduleTime) return;
        setError('');
        setLoading(true);
        try {
            await apiFetch(`/api/v1/messages/${params.id}/schedule`, {
                method: 'POST',
                body: JSON.stringify({ scheduled_at: scheduleTime }),
            });
            router.push(`/messages/${params.id}`);
        } catch (err: any) {
            setError(err?.data?.error ?? 'Zamanlama başarısız. Tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    if (!message) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '480px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}
                >
                    ←
                </button>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', margin: 0 }}>
                    Mesajı Zamanla
                </h1>
            </div>

            <div style={{
                background: 'var(--midnight)',
                border: '1px solid var(--horizon)',
                borderRadius: '12px',
                padding: '28px',
            }}>
                {/* Mesaj başlığı özeti */}
                <div style={{
                    padding: '12px 14px',
                    background: 'var(--obsidian)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                }}>
                    <p style={{ color: 'var(--mist)', fontSize: '12px', margin: '0 0 4px' }}>Mesaj</p>
                    <p style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '14px', margin: 0 }}>{message.title}</p>
                </div>

                {/* Tarih/saat seçici */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--mist)' }}>
                        Gönderilecek Tarih ve Saat
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                        style={{ ...inputStyle, borderColor: focused ? 'var(--copper)' : 'var(--horizon)' }}
                    />
                </div>

                {error && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                <button
                    type="button"
                    onClick={handleSchedule}
                    disabled={loading || !scheduleTime}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Zamanlanıyor...' : 'Zamanla'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleMessage;
