'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
export const runtime = 'edge';
const inputStyle = {
    width: '100%', minHeight: '44px', padding: '10px 14px',
    background: 'var(--obsidian)', border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
};
const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 500,
    color: 'var(--mist)', marginBottom: '6px',
};
const ScheduleMessage = () => {
    const params = useParams();
    const [message, setMessage] = useState(null);
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
        if (!scheduleTime)
            return;
        setError('');
        setLoading(true);
        try {
            await apiFetch(`/api/v1/messages/${params.id}/schedule`, {
                method: 'POST',
                body: JSON.stringify({ scheduled_at: scheduleTime }),
            });
            router.push(`/messages/${params.id}`);
        }
        catch (err) {
            setError(err?.data?.error ?? 'Zamanlama başarısız. Tekrar deneyin.');
        }
        finally {
            setLoading(false);
        }
    };
    if (!message) {
        return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' } },
            React.createElement("p", { style: { color: 'var(--mist)', fontSize: '14px' } }, "Y\u00FCkleniyor...")));
    }
    return (React.createElement("div", { style: { maxWidth: '480px' } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' } },
            React.createElement("button", { onClick: () => router.back(), style: { background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '20px', padding: '0 4px' } }, "\u2190"),
            React.createElement("h1", { style: { fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 } }, "Mesaj\u0131 Zamanla")),
        React.createElement("div", { style: {
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '28px',
            } },
            React.createElement("div", { style: {
                    padding: '12px 14px',
                    background: 'var(--obsidian)',
                    borderRadius: 'var(--radius-input)',
                    marginBottom: '20px',
                } },
                React.createElement("p", { style: { color: 'var(--mist)', fontSize: '12px', margin: '0 0 4px' } }, "Mesaj"),
                React.createElement("p", { style: { color: 'var(--cream)', fontWeight: 600, fontSize: '14px', margin: 0 } }, message.title)),
            React.createElement("div", { style: { marginBottom: '20px' } },
                React.createElement("label", { style: labelStyle }, "G\u00F6nderilecek Tarih ve Saat"),
                React.createElement("input", { type: "datetime-local", value: scheduleTime, onChange: e => setScheduleTime(e.target.value), onFocus: () => setFocused(true), onBlur: () => setFocused(false), min: new Date().toISOString().slice(0, 16), required: true, style: {
                        ...inputStyle,
                        ...(focused ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {})
                    } })),
            error && React.createElement("p", { style: { color: '#EF4444', fontSize: '13px', marginBottom: '12px' } }, error),
            React.createElement("button", { type: "button", onClick: handleSchedule, disabled: loading || !scheduleTime, className: "btn btn-primary btn-lg", style: { width: '100%', opacity: loading ? 0.7 : 1 } }, loading ? 'Zamanlanıyor...' : 'Zamanla'))));
};
export default ScheduleMessage;
