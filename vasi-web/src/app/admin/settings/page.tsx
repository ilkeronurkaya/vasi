'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

export const runtime = 'edge';

const cardStyle: React.CSSProperties = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
};

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
    boxSizing: 'border-box',
    marginBottom: '12px'
};

interface Plan {
    id: string;
    slug: string;
    name: string;
    price_monthly: number;
    message_limit: number;
    recipient_limit: number;
    is_active: number;
    sort_order: number;
}

const SettingsPage: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const fetchPlans = useCallback(async () => {
        try {
            const data = await adminFetch('/api/v1/admin/plans');
            queueMicrotask(() => setPlans(data.plans ?? []));
        } catch {
            queueMicrotask(() => setError('Paketler alınamadı'));
        } finally {
            queueMicrotask(() => setLoading(false));
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const deletePlan = async (id: string) => {
        try {
            await adminFetch(`/api/v1/admin/plans/${id}`, { method: 'DELETE' });
            await fetchPlans();
        } catch (e: unknown) {
             const status = (e as { status?: number }).status;
             if (status === 409) {
                 alert('Bu paketi kullanan kullanıcı var, silinemez.');
             } else {
                 setError('Paket silinemedi');
             }
        }
    };

    const savePlan = async (plan: Plan) => {
        try {
            if (plan.id === 'new') {
                await adminFetch('/api/v1/admin/plans', {
                    method: 'POST',
                    body: JSON.stringify(plan),
                });
            } else {
                await adminFetch(`/api/v1/admin/plans/${plan.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(plan),
                });
            }
            setEditingPlan(null);
            await fetchPlans();
        } catch {
            setError('Paket kaydedilemedi');
        }
    };

    if (loading) return <p>Yükleniyor...</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--cream)' }}>Paket Yönetimi</h1>
                <button className="btn btn-primary btn-md" onClick={() => setEditingPlan({ id: 'new', slug: '', name: '', price_monthly: 0, message_limit: 0, recipient_limit: 0, is_active: 1, sort_order: 0 })}>Yeni Paket</button>
            </div>

            {error && <p style={{ color: '#EF4444' }}>{error}</p>}

            <div style={cardStyle}>
                {plans.map(plan => (
                    <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: 'var(--border-subtle)' }}>
                        <div>
                            <div style={{ color: 'var(--cream)', fontWeight: 600 }}>{plan.name} ({plan.slug})</div>
                            <div style={{ color: 'var(--mist)', fontSize: '13px' }}>{plan.price_monthly}₺/ay | {plan.message_limit} mesaj | {plan.recipient_limit} alıcı | {plan.is_active ? 'Aktif' : 'Pasif'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingPlan(plan)}>Düzenle</button>
                            <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }} onClick={() => deletePlan(plan.id)}>Sil</button>
                        </div>
                    </div>
                ))}
            </div>

            {editingPlan && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ ...cardStyle, width: '400px' }}>
                        <h2 style={{ color: 'var(--cream)' }}>{editingPlan.id === 'new' ? 'Yeni Paket' : 'Paketi Düzenle'}</h2>
                        <input style={inputStyle} placeholder="Slug (örn: pro)" value={editingPlan.slug} onChange={e => setEditingPlan({ ...editingPlan, slug: e.target.value })} />
                        <input style={inputStyle} placeholder="İsim (örn: Pro)" value={editingPlan.name} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} />
                        <label style={{ color: 'var(--mist)', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Fiyat (₺)</label>
                        <input type="number" style={inputStyle} placeholder="Fiyat (₺)" value={editingPlan.price_monthly === 0 ? '' : editingPlan.price_monthly} onChange={e => setEditingPlan({ ...editingPlan, price_monthly: parseInt(e.target.value) || 0 })} />
                        <label style={{ color: 'var(--mist)', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Mesaj Limiti</label>
                        <input type="number" style={inputStyle} placeholder="Mesaj Limiti" value={editingPlan.message_limit === 0 ? '' : editingPlan.message_limit} onChange={e => setEditingPlan({ ...editingPlan, message_limit: parseInt(e.target.value) || 0 })} />
                        <label style={{ color: 'var(--mist)', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Alıcı Limiti</label>
                        <input type="number" style={inputStyle} placeholder="Alıcı Limiti" value={editingPlan.recipient_limit === 0 ? '' : editingPlan.recipient_limit} onChange={e => setEditingPlan({ ...editingPlan, recipient_limit: parseInt(e.target.value) || 0 })} />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button className="btn btn-primary btn-md" onClick={() => savePlan(editingPlan)}>Kaydet</button>
                            <button className="btn btn-ghost btn-md" onClick={() => setEditingPlan(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
