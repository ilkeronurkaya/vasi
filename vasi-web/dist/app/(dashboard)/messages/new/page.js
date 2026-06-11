'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
export const runtime = 'edge';
const STEPS = ['İçerik', 'Alıcılar', 'Zamanlama', 'Önizleme', 'Gönder'];
const BODY_MAX = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    transition: `border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)`,
    boxSizing: 'border-box',
};
const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--mist)',
    marginBottom: '6px',
};
const cardStyle = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
    transition: `transform var(--dur) var(--ease), border-color var(--dur) var(--ease)`,
};
const ghostBtnStyle = {
    background: 'none',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--mist)',
    padding: '10px 18px',
    fontSize: '15px',
    cursor: 'pointer',
};
function minScheduleDate() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 16);
}
function yearsFromNow(years) {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().slice(0, 16);
}
const NewMessage = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        title: '',
        body: '',
        recipients: [],
        scheduledAt: '',
    });
    const [emailInput, setEmailInput] = useState('');
    const [stepError, setStepError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState('');
    const focusBorder = (name) => focusField === name
        ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' }
        : {};
    const goNext = () => {
        setStepError('');
        if (step === 1) {
            if (form.title.trim().length < 3) {
                setStepError('Başlık en az 3 karakter olmalı.');
                return;
            }
            if (form.body.trim().length < 10) {
                setStepError('Mesaj en az 10 karakter olmalı.');
                return;
            }
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
        if (!EMAIL_RE.test(email)) {
            setStepError('Geçerli bir e-posta adresi gir.');
            return;
        }
        if (form.recipients.includes(email)) {
            setStepError('Bu alıcı zaten ekli.');
            return;
        }
        setForm(f => ({ ...f, recipients: [...f.recipients, email] }));
        setEmailInput('');
    };
    const removeRecipient = (email) => {
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
        }
        catch (err) {
            const e = err;
            if (e?.data?.code === 'LIMIT_REACHED') {
                setSubmitError('Mesaj hakkın doldu. Daha fazla mesaj için Pro plana geçebilirsin.');
            }
            else {
                setSubmitError(e?.data?.error ?? 'Mesaj gönderilemedi. Tekrar deneyin.');
            }
            setLoading(false);
        }
    };
    return (React.createElement("div", { style: { maxWidth: '640px', margin: '0 auto', padding: '32px 16px' } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' } },
            React.createElement("button", { onClick: () => router.back(), "aria-label": "Geri", style: { background: 'none', border: 'none', color: 'var(--mist)', cursor: 'pointer', fontSize: '20px', padding: '0 4px', lineHeight: 1 } }, "\u2190"),
            React.createElement("h1", { style: { fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', margin: 0 } }, "Yeni Mesaj")),
        React.createElement("p", { style: { color: 'var(--mist)', fontSize: '14px', margin: '0 0 28px 36px' } }, "5 ad\u0131mda mesaj\u0131n\u0131 olu\u015Ftur"),
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', marginBottom: '28px' } }, STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (React.createElement(React.Fragment, { key: label },
                i > 0 && (React.createElement("div", { style: { flex: 1, height: '2px', background: n <= step ? 'var(--copper)' : 'var(--horizon)', margin: '0 6px', marginBottom: '20px' } })),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' } },
                    React.createElement("div", { style: {
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
                        } }, done ? '✓' : n),
                    React.createElement("span", { style: { fontSize: '11px', color: active ? 'var(--copper)' : 'var(--mist)', fontWeight: active ? 600 : 400 } }, label))));
        })),
        React.createElement("div", { style: cardStyle },
            step === 1 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "title", style: labelStyle }, "Mesaj\u0131na bir ba\u015Fl\u0131k ver"),
                    React.createElement("input", { id: "title", type: "text", value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })), onFocus: () => setFocusField('title'), onBlur: () => setFocusField(''), placeholder: "Anneme mektup", style: { ...inputStyle, ...focusBorder('title') } })),
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "body", style: labelStyle }, "Mesaj\u0131n\u0131 yaz"),
                    React.createElement("textarea", { id: "body", value: form.body, onChange: e => setForm(f => ({ ...f, body: e.target.value.slice(0, BODY_MAX) })), onFocus: () => setFocusField('body'), onBlur: () => setFocusField(''), rows: 8, placeholder: "Sevgili...", style: { ...inputStyle, resize: 'vertical', lineHeight: '1.6', ...focusBorder('body') } }),
                    React.createElement("div", { style: { textAlign: 'right', fontSize: '12px', color: 'var(--mist)', marginTop: '4px' } },
                        form.body.length,
                        " / ",
                        BODY_MAX)))),
            step === 2 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "recipientEmail", style: labelStyle }, "Al\u0131c\u0131 e-posta adresi"),
                    React.createElement("div", { style: { display: 'flex', gap: '10px' } },
                        React.createElement("input", { id: "recipientEmail", type: "email", value: emailInput, onChange: e => setEmailInput(e.target.value), onKeyDown: e => { if (e.key === 'Enter') {
                                e.preventDefault();
                                addRecipient();
                            } }, onFocus: () => setFocusField('email'), onBlur: () => setFocusField(''), placeholder: "ali@gmail.com", style: { ...inputStyle, ...focusBorder('email') } }),
                        React.createElement("button", { type: "button", onClick: addRecipient, className: "btn btn-primary", style: { marginTop: '6px', whiteSpace: 'nowrap' } }, "Ekle"))),
                form.recipients.length > 0 && (React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, form.recipients.map(email => (React.createElement("span", { key: email, style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--copper)',
                        color: 'var(--copper)',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        fontSize: '13px',
                    } },
                    email,
                    React.createElement("button", { type: "button", onClick: () => removeRecipient(email), "aria-label": `${email} alıcısını kaldır`, style: { background: 'none', border: 'none', color: 'var(--copper)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 } }, "\u00D7")))))))),
            step === 3 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '18px' } },
                React.createElement("div", null,
                    React.createElement("label", { htmlFor: "scheduledAt", style: labelStyle }, "G\u00F6nderim tarihi"),
                    React.createElement("input", { id: "scheduledAt", type: "datetime-local", value: form.scheduledAt, min: minScheduleDate(), onChange: e => setForm(f => ({ ...f, scheduledAt: e.target.value })), onFocus: () => setFocusField('schedule'), onBlur: () => setFocusField(''), style: { ...inputStyle, colorScheme: 'dark', ...focusBorder('schedule') } })),
                React.createElement("div", null,
                    React.createElement("span", { style: labelStyle }, "H\u0131zl\u0131 se\u00E7"),
                    React.createElement("div", { style: { display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' } }, [1, 5, 10].map(y => (React.createElement("button", { key: y, type: "button", onClick: () => setForm(f => ({ ...f, scheduledAt: yearsFromNow(y) })), style: ghostBtnStyle },
                        y,
                        " Y\u0131l Sonra"))))))),
            step === 4 && (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
                React.createElement("h2", { style: { color: 'var(--cream)', fontSize: '20px', fontWeight: 700, margin: 0 } }, form.title),
                React.createElement("p", { style: { color: 'var(--mist)', fontSize: '14px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' } }, form.body.length > 200 ? `${form.body.slice(0, 200)}...` : form.body),
                React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } }, form.recipients.map(email => (React.createElement("span", { key: email, style: { border: '1px solid var(--copper)', color: 'var(--copper)', borderRadius: '999px', padding: '4px 12px', fontSize: '13px' } }, email)))),
                React.createElement("div", { style: { color: 'var(--copper)', fontSize: '14px' } },
                    "\uD83D\uDCC5 ",
                    form.scheduledAt ? new Date(form.scheduledAt).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' }) : '—'))),
            step === 5 && (React.createElement("div", { style: { textAlign: 'center', padding: '24px 0' } }, loading ? (React.createElement("p", { style: { color: 'var(--cream)', fontSize: '16px', margin: 0 } }, "G\u00F6nderiliyor...")) : submitError ? (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' } },
                React.createElement("p", { style: { color: '#EF4444', fontSize: '14px', margin: 0 } }, submitError),
                React.createElement("button", { type: "button", onClick: handleSubmit, className: "btn btn-primary" }, "Tekrar Dene"))) : null)),
            stepError && step < 5 && (React.createElement("p", { style: { color: '#EF4444', fontSize: '13px', margin: '14px 0 0' } }, stepError)),
            step < 5 && (React.createElement("div", { style: { display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', marginTop: '24px' } },
                step > 1 && (React.createElement("button", { type: "button", onClick: goBack, style: ghostBtnStyle }, "\u2190 Geri")),
                step < 4 && (React.createElement("button", { type: "button", onClick: goNext, className: "btn btn-primary" }, "\u0130leri \u2192")),
                step === 4 && (React.createElement("button", { type: "button", onClick: handleSubmit, className: "btn btn-primary" }, "G\u00F6nder \u2713")))))));
};
export default NewMessage;
