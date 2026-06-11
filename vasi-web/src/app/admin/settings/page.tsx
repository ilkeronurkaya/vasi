'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

export const runtime = 'edge';

const LABELS: Record<string, string> = {
    plan_limit_free: 'Ücretsiz Plan Mesaj Limiti',
    plan_limit_personal: 'Kişisel Plan Mesaj Limiti',
    plan_limit_unlimited: 'Sınırsız Plan Mesaj Limiti',
    recipient_limit_free: 'Ücretsiz Plan Alıcı Limiti',
    recipient_limit_personal: 'Kişisel Plan Alıcı Limiti',
    price_personal_monthly: 'Kişisel Plan Fiyatı',
    price_family_monthly: 'Aile Planı Fiyatı',
};

const LIMIT_KEYS = ['plan_limit_free', 'plan_limit_personal', 'plan_limit_unlimited', 'recipient_limit_free', 'recipient_limit_personal'];
const PRICE_KEYS = ['price_personal_monthly', 'price_family_monthly'];

const cardStyle: React.CSSProperties = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
};

const inputStyle: React.CSSProperties = {
    width: '120px',
    minHeight: '40px',
    padding: '8px 12px',
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
};

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState<Record<string, boolean>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminFetch('/api/v1/admin/settings')
            .then(data => {
                setSettings(data.settings ?? {});
                setDrafts(data.settings ?? {});
            })
            .catch(() => setError('Ayarlar alınamadı'))
            .finally(() => setLoading(false));
    }, []);

    const save = async (key: string) => {
        setError('');
        try {
            await adminFetch('/api/v1/admin/settings', {
                method: 'PUT',
                body: JSON.stringify({ key, value: drafts[key] }),
            });
            setSettings(prev => ({ ...prev, [key]: drafts[key] }));
            setSaved(prev => ({ ...prev, [key]: true }));
            setTimeout(() => setSaved(prev => ({ ...prev, [key]: false })), 2000);
        } catch {
            setError(`"${LABELS[key] ?? key}" kaydedilemedi`);
        }
    };

    const renderRow = (key: string, suffix = '') => {
        const changed = drafts[key] !== settings[key];
        return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(237,233,224,0.04)' }}>
                <span style={{ fontSize: '14px', color: 'var(--cream)' }}>{LABELS[key] ?? key}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {saved[key] && <span style={{ color: '#22C55E', fontSize: '13px' }}>✓ Kaydedildi</span>}
                    <input
                        type="number"
                        value={drafts[key] ?? ''}
                        onChange={e => setDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                        style={inputStyle}
                    />
                    {suffix && <span style={{ color: 'var(--mist)', fontSize: '13px' }}>{suffix}</span>}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        disabled={!changed}
                        style={{ opacity: changed ? 1 : 0.5 }}
                        onClick={() => save(key)}
                    >
                        Kaydet
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--cream)', margin: 0 }}>
                Ayarlar
            </h1>

            {error && <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{error}</p>}

            <div style={cardStyle}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', margin: '0 0 8px' }}>Plan Limitleri</h2>
                {LIMIT_KEYS.filter(k => k in settings).map(k => renderRow(k))}
            </div>

            <div style={cardStyle}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)', margin: '0 0 8px' }}>Fiyatlandırma</h2>
                {PRICE_KEYS.filter(k => k in settings).map(k => renderRow(k, '₺/ay'))}
            </div>
        </div>
    );
};

export default SettingsPage;
