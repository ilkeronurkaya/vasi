'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
export default function RegisterPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState('');
    const router = useRouter();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await apiFetch('/api/v1/auth/register', {
                method: 'POST',
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            // Kayıt sonrası e-posta doğrulama ekranına yönlendir
            router.push('/verify-email');
        }
        catch (err) {
            setError(err?.data?.error ?? 'Kayıt başarısız. Tekrar deneyin.');
        }
        finally {
            setLoading(false);
        }
    };
    return (React.createElement("div", null,
        React.createElement("h2", { style: { fontSize: '22px', fontWeight: 700, color: 'var(--cream)', letterSpacing: '-0.01em', marginBottom: '24px', textAlign: 'center' } }, "Hesap Olu\u015Ftur"),
        React.createElement("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
            React.createElement("div", { style: { display: 'flex', gap: '12px' } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: labelStyle }, "Ad"),
                    React.createElement("input", { type: "text", value: firstName, onChange: e => setFirstName(e.target.value), onFocus: () => setFocusField('first'), onBlur: () => setFocusField(''), required: true, placeholder: "Ali", style: { ...inputStyle, ...(focusField === 'first' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: labelStyle }, "Soyad"),
                    React.createElement("input", { type: "text", value: lastName, onChange: e => setLastName(e.target.value), onFocus: () => setFocusField('last'), onBlur: () => setFocusField(''), required: true, placeholder: "Veli", style: { ...inputStyle, ...(focusField === 'last' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } }))),
            React.createElement("div", null,
                React.createElement("label", { style: labelStyle }, "E-posta"),
                React.createElement("input", { type: "email", value: email, onChange: e => setEmail(e.target.value), onFocus: () => setFocusField('email'), onBlur: () => setFocusField(''), required: true, placeholder: "ali@example.com", style: { ...inputStyle, ...(focusField === 'email' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } })),
            React.createElement("div", null,
                React.createElement("label", { style: labelStyle }, "\u015Eifre"),
                React.createElement("input", { type: "password", value: password, onChange: e => setPassword(e.target.value), onFocus: () => setFocusField('pass'), onBlur: () => setFocusField(''), required: true, minLength: 8, placeholder: "En az 8 karakter", style: { ...inputStyle, ...(focusField === 'pass' ? { border: '1px solid var(--copper)', boxShadow: 'var(--focus-ring)' } : {}) } })),
            error && (React.createElement("p", { style: { color: '#EF4444', fontSize: '13px', margin: 0 } }, error)),
            React.createElement("button", { type: "submit", disabled: loading, className: "btn btn-primary btn-lg", style: { width: '100%', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' } }, loading ? 'Kaydediliyor...' : 'Kayıt Ol')),
        React.createElement("div", { style: { textAlign: 'center', marginTop: '20px' } },
            React.createElement("a", { href: "/login", style: { fontSize: '13px', color: 'var(--copper)', textDecoration: 'none' } }, "Zaten hesab\u0131n\u0131z var m\u0131? Giri\u015F yap\u0131n"))));
}
