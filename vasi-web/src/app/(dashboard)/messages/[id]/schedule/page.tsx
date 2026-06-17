
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useLang, t } from '@/lib/i18n';

export const runtime = 'edge';

type Message = { id: string; title: string; scheduled_at?: string; status: string };

const inputStyle: React.CSSProperties = {
    width: '100%', minHeight: '44px', padding: '10px 14px',
    background: 'var(--obsidian)', border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: 'var(--mist)', marginBottom: '6px',
};

const ScheduleMessage: React.FC = () => {
    const params = useParams<{ id: string }>();
    const [lang] = useLang();
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
                // datetime-local yerel saattir — UTC ISO'ya çevir (saat dilimi kayması olmasın)
                body: JSON.stringify({ scheduled_at: new Date(scheduleTime).toISOString() }),
            });
            router.push(`/messages/${params.id}`);
        } catch (err: unknown) {
            const msg = (err as { data?: { error?: string } })?.data?.error ?? 'Zamanlama başarısız. Tekrar deneyin.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!message) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                <p style={{ color: 'var(--mist)', fontSize: '14px' }}>{t('common_loading', lang)}</p>
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
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 }}>
                    {t('sched_title', lang)}
                </h1>
            </div>

            <div style={{
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '28px',
            }}>
                {/* Mesaj başlığı özeti */}
                <div style={{
                    padding: '12px 14px',
                    background: 'var(--obsidian)',
                    borderRadius: 'var(--radius-input)',
                    marginBottom: '20px',
                }}>
                    <p style={{ color: 'var(--mist)', fontSize: '12px', margin: '0 0 4px' }}>{t('sched_message_label', lang)}</p>
                    <p style={{ color: 'var(--cream)', fontWeight: 600, fontSize: '14px', margin: 0 }}>{message.title}</p>
                </div>

                {/* Tarih/saat seçici */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>
                        {t('sched_datetime_label', lang)}
                    </label>
                    <input
                        type="datetime-local"
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        min={new Date().toISOString().slice(0, 16)}
                        required
                        style={{
                            ...inputStyle,
                            ...(focused ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {})
                        }}
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
                    {loading ? t('sched_loading', lang) : t('sched_btn', lang)}
                </button>
            </div>
        </div>
    );
};

export default ScheduleMessage;
