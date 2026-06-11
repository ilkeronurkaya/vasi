
'use client'
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { adminFetch } from '@/lib/api';
import { VasiLogo } from '@/components/VasiLogo';

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--mist)', marginBottom: '6px' };
const inputStyle = { width: '100%', minHeight: '44px', padding: '10px 14px', background: 'var(--obsidian)', border: '1px solid var(--horizon)', borderRadius: 'var(--radius-input)', color: 'var(--cream)', fontSize: '15px', outline: 'none', transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)', boxSizing: 'border-box' as const };
const buttonStyle = { background: 'var(--copper)', color: 'var(--obsidian)', padding: '10px 24px', borderRadius: 'var(--radius-input)', cursor: 'pointer', transition: 'background-color var(--dur) var(--ease)' };

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await adminFetch('/api/v1/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            localStorage.setItem('adminToken', response.accessToken);
            router.push('/admin');
        } catch (err) {
            let errorMessage = 'Bir hata oluştu.';
            if (typeof err === 'object' && err !== null && 'data' in err && typeof err.data === 'object' && err.data !== null && 'error' in err.data) {
                const data = err.data as { error: string };
                errorMessage = data.error || errorMessage;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--obsidian)' }}>
            <form onSubmit={handleSubmit} style={{ width: '320px', padding: '48px', background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <VasiLogo height={36} />
                    <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--cream)', marginTop: '16px' }}>Yönetici Girişi</h1>
                </div>
                {error && <p style={{ color: '#EF4444', fontSize: '13px', marginBottom: '24px' }}>{error}</p>}
                <label style={labelStyle}>E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                <label style={{ ...labelStyle, marginTop: '16px' }}>Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
                <button type="submit" style={{ ...buttonStyle, marginTop: '24px', width: '100%' }}>
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
            </form>
        </div>
    );
}
