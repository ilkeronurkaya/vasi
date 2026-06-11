'use client';
export const runtime = 'edge';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
const PLANS = [
    {
        key: 'free',
        name: 'Ücretsiz',
        price: '₺0',
        period: '/ay',
        features: ['10 mesaj', 'E-posta teslimi', '—', '—'],
    },
    {
        key: 'personal',
        name: 'Kişisel',
        price: '₺49',
        period: '/ay',
        features: ['100 mesaj', 'E-posta teslimi', 'Öncelikli destek', '—'],
    },
    {
        key: 'family',
        name: 'Aile',
        price: '₺99',
        period: '/ay',
        features: ['Sınırsız mesaj', 'E-posta teslimi', 'Öncelikli destek', '5 kullanıcı'],
    },
];
export default function UpgradePage() {
    const router = useRouter();
    const [currentPlan, setCurrentPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        apiFetch('/api/v1/me')
            .then(data => {
            setCurrentPlan(data.plan);
            setLoading(false);
        })
            .catch(error => {
            console.error('Error fetching current plan:', error);
            setLoading(false);
        });
    }, []);
    if (loading) {
        return React.createElement("div", { style: { color: 'var(--mist)', fontSize: '14px' } }, "Y\u00FCkleniyor...");
    }
    return (React.createElement("div", { style: { maxWidth: '640px', margin: '0 auto', padding: '32px' } },
        React.createElement("h1", { style: { fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--cream)' } }, "Plan Kar\u015F\u0131la\u015Ft\u0131rma"),
        React.createElement("div", { style: { display: 'flex', gap: '32px' } }, PLANS.map(plan => (React.createElement("div", { key: plan.key, style: {
                background: 'var(--midnight)',
                border: currentPlan === plan.key ? '2px solid var(--copper)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '24px',
            } },
            currentPlan === plan.key && React.createElement("div", { style: { background: 'var(--copper)', color: 'var(--obsidian)', fontSize: '11px', fontWeight: '700', borderRadius: '6px', padding: '2px 8px', marginBottom: '16px' } }, "Mevcut Plan"),
            React.createElement("h2", { style: { fontSize: '18px', fontWeight: '600', color: 'var(--cream)' } }, plan.name),
            React.createElement("p", { style: { fontSize: '28px', fontWeight: '700', color: 'var(--cream)', marginBottom: '8px' } },
                plan.price,
                React.createElement("span", { style: { fontSize: '14px', fontWeight: '400' } }, plan.period)),
            React.createElement("ul", { style: { listStyleType: 'none', padding: 0, margin: 0 } }, plan.features.map((feature, index) => (React.createElement("li", { key: index, style: { fontSize: '14px', color: 'var(--mist)', lineHeight: '2' } }, feature)))),
            React.createElement("button", { className: "btn btn-primary", style: { width: '100%', marginTop: '16px', opacity: currentPlan === plan.key ? 0.5 : 1 }, disabled: currentPlan === plan.key, onClick: () => { } }, "Y\u00FCkselt"))))),
        React.createElement("button", { className: "btn btn-secondary", style: { marginTop: '32px' }, onClick: () => router.back() }, "Geri")));
}
