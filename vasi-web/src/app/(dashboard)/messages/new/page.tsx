'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const runtime = 'edge';

const STEPS = ['İçerik', 'Alıcılar', 'Zamanlama', 'Önizleme', 'Gönder'];
const BODY_MAX = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '44px',
    padding: '10px 14px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '15px',
    outline: 'none',
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
    marginBottom: '6px',
};

const cardStyle: React.CSSProperties = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
    transition: `transform var(--dur) var(--ease), border-color var(--dur) var(--ease)`,
};



function minScheduleDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
}

function yearsFromNow(years: number): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().slice(0, 16);
}

const NewMessage: React.FC = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        body: '',
        recipients: [] as string[],
        scheduledAt: '',
    });
    const [emailInput, setEmailInput] = useState('');
    const [stepError, setStepError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState('');

    const focusBorder = (name: string): React.CSSProperties =>
        focusField === name
            ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' }
            : {};

    const goNext = () => {
        setStepError('');
        if (step === 1) {
            if (form.title.trim().length < 3) { setStepError('Başlık en az 3 karakter olmalı.'); return; }
            if (form.body.trim().length < 10) { setStepError('Mesaj en az 10 karakter olmalı.'); return; }
        }
        if (step === 2 && form.recipients.length === 0) {
            setStepError('En az bir alıcı eklemelisin.');
            return;
        }
        if (step === 3 && !form.scheduledAt) {
            setStepError('Bir gönderim tarihi seç.');
            return;
        }
        setStep(s => Math.min(s + 1, 5));
    };

    const goBack = () => {
        setStepError('');
        setStep(s => Math.max(s - 1, 1));
    };

    const addRecipient = () => {
        const email = emailInput.trim().toLowerCase();
        setStepError('');
        if (!EMAIL_RE.test(email)) { setStepError('Geçerli bir e-posta adresi gir.'); return; }
        if (form.recipients.includes(email)) { setStepError('Bu alıcı zaten ekli.'); return; }
        setForm(f => ({ ...f, recipients: [...f.recipients, email] }));
        setEmailInput('');
    };

    const removeRecipient = (email: string) => {
        setForm(f => ({ ...f, recipients: f.recipients.filter(r => r !== email) }));
    };

    const handleSubmit = async () => {
        setSubmitError('');
        setLoading(true);
        setStep(5);
        try {
            const message = await apiFetch('/api/v1/messages', {
                method: 'POST',
                body: JSON.stringify({
                    title: form.title.trim(),
                    message_type: 'text',
                    content_text: form.body.trim(),
                }),
            });
            for (const email of form.recipients) {
                await apiFetch(`/api/v1/messages/${message.id}/recipients`, {
                    method: 'POST',
                    body: JSON.stringify({ email, full_name: email.split('@')[0] }),
                });
            }
            if (form.scheduledAt) {
                await apiFetch(`/api/v1/messages/${message.id}/schedule`, {
                    method: 'POST',
                    body: JSON.stringify({ scheduled_at: new Date(form.scheduledAt).toISOString() }),
                });
            }
            router.push(`/messages/${message.id}`);
        } catch (err: unknown) {
const e = err as { data?: { error?: string; code?: string } };
if (e?.data?.code === 'LIMIT_REACHED') {
setSubmitError('Mesaj hakkın doldu. Daha fazla mesaj için Pro plana geçebilirsin.');
} else {
setSubmitError(e?.data?.error ?? 'Mesaj gönderilemedi. Tekrar deneyin.');
}
        setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                    onClick={() => router.back()}
                    aria-label="Geri"
                    className="btn btn-ghost btn-md"
                >
                    ←
                </button>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 }}>
                    Yeni Mesaj
                </h1>
            </div>
            <p style={{ color: 'var(--mist)', fontSize: '14px', margin: '0 0 28px 36px' }}>
                5 adımda mesajını oluştur
            </p>

            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
                {STEPS.map((label, i) => {
                    const n = i + 1;
                    const done = n < step;
                    const active = n === step;
                    return (
                        <React.Fragment key={label}>
                            {i > 0 && (
                                <div style={{ flex: 1, height: '2px', background: n <= step ? 'var(--copper)' : 'var(--horizon)', margin: '0 6px', marginBottom: '20px' }} />
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    background: done || active ? 'var(--copper)' : 'transparent',
                                    border: done || active ? 'none' : '2px solid var(--horizon)',
                                    color: done || active ? 'var(--obsidian)' : 'var(--mist)',
                                }}>
                                    {done ? '✓' : n}
                                </div>
                                <span style={{ fontSize: '11px', color: active ? 'var(--copper)' : 'var(--mist)', fontWeight: active ? 600 : 400 }}>
                                    {label}
                                </span>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Step Card */}
            <div style={cardStyle}>

                {/* Adım 1: İçerik */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label htmlFor="title" style={labelStyle}>Mesajına bir başlık ver</label>
                            <input
                                id="title"
                                type="text"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                onFocus={() => setFocusField('title')}
                                onBlur={() => setFocusField('')}
                                placeholder="Anneme mektup"
                                style={{ ...inputStyle, ...focusBorder('title') }}
                            />
                        </div>
                        <div>
                            <label htmlFor="body" style={labelStyle}>Mesajını yaz</label>
                            <textarea
                                id="body"
                                value={form.body}
                                onChange={e => setForm(f => ({ ...f, body: e.target.value.slice(0, BODY_MAX) }))}
                                onFocus={() => setFocusField('body')}
                                onBlur={() => setFocusField('')}
                                rows={8}
                                placeholder="Sevgili..."
                                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', ...focusBorder('body') }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--mist)', marginTop: '4px' }}>
                                {form.body.length} / {BODY_MAX}
                            </div>
                        </div>
                    </div>
                )}

                {/* Adım 2: Alıcılar */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label htmlFor="recipientEmail" style={labelStyle}>Alıcı e-posta adresi</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    id="recipientEmail"
                                    type="email"
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }}
                                    onFocus={() => setFocusField('email')}
                                    onBlur={() => setFocusField('')}
                                    placeholder="ali@gmail.com"
                                    style={{ ...inputStyle, ...focusBorder('email') }}
                                />
                                <button
                                    type="button"
                                    onClick={addRecipient}
                                    className="btn btn-primary btn-md"
                                    style={{ marginTop: '6px', whiteSpace: 'nowrap' }}
                                >
                                    Ekle
                                </button>
                            </div>
                        </div>
                        {form.recipients.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {form.recipients.map(email => (
                                    <span
                                        key={email}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid var(--copper)',
                                            color: 'var(--copper)',
                                            borderRadius: '999px',
                                            padding: '6px 12px',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {email}
                                        <button
                                            type="button"
                                            onClick={() => removeRecipient(email)}
                                            aria-label={`${email} alıcısını kaldır`}
                                            style={{ background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Adım 3: Zamanlama */}
                {step === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label htmlFor="scheduledAt" style={labelStyle}>Gönderim tarihi</label>
                            <input
                                id="scheduledAt"
                                type="datetime-local"
                                value={form.scheduledAt}
                                min={minScheduleDate()}
                                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                                onFocus={() => setFocusField('schedule')}
                                onBlur={() => setFocusField('')}
                                style={{ ...inputStyle, colorScheme: 'dark', ...focusBorder('schedule') }}
                            />
                        </div>
                        <div>
                            <span style={labelStyle}>Hızlı seç</span>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                                {[1, 5, 10].map(y => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, scheduledAt: yearsFromNow(y) }))}
                                        className="btn btn-ghost btn-md"
                                    >
                                        {y} Yıl Sonra
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Adım 4: Önizleme */}
                {step === 4 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h2 style={{ color: 'var(--cream)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                            {form.title}
                        </h2>
                        <p style={{ color: 'var(--mist)', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                            {form.body.length > 200 ? `${form.body.slice(0, 200)}...` : form.body}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {form.recipients.map(email => (
                                <span key={email} style={{ border: '1px solid var(--copper)', color: 'var(--copper)', borderRadius: '999px', padding: '4px 12px', fontSize: '13px' }}>
                                    {email}
                                </span>
                            ))}
                        </div>
                        <div style={{ color: 'var(--copper)', fontSize: '14px' }}>
                            📅 {form.scheduledAt ? new Date(form.scheduledAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : '—'}
                        </div>
                    </div>
                )}

                {/* Adım 5: Gönder */}
                {step === 5 && (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                        {loading ? (
                            <p style={{ color: 'var(--cream)', fontSize: '16px', margin: 0 }}>Gönderiliyor...</p>
                        ) : submitError ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                                <p style={{ color: '#EF4444', fontSize: '14px', margin: 0 }}>{submitError}</p>
                                <button type="button" onClick={handleSubmit} className="btn btn-primary btn-md">
                                    Tekrar Dene
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Hata */}
                {stepError && step < 5 && (
                    <p style={{ color: '#EF4444', fontSize: '13px', margin: '14px 0 0' }}>{stepError}</p>
                )}

                {/* Navigasyon */}
                {step < 5 && (
                    <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', marginTop: '24px' }}>
                        {step > 1 && (
                            <button type="button" onClick={goBack} className="btn btn-ghost btn-md">
                                ← Geri
                            </button>
                        )}
                        {step < 4 && (
                            <button type="button" onClick={goNext} className="btn btn-primary btn-md">
                                İleri →
                            </button>
                        )}
                        {step === 4 && (
                            <button type="button" onClick={handleSubmit} className="btn btn-primary btn-md">
                                Gönder ✓
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewMessage;
