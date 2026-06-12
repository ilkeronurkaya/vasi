'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

export const runtime = 'edge';

interface RevenueItem {
    plan_type: string;
    subscriber_count: number;
    unit_price: number;
    monthly_revenue: number;
}

interface FailedDelivery {
    message_id: string;
    title: string;
    updated_at: string;
    user_email: string;
    first_name: string;
    last_name: string;
    recipient_count: number;
}

const cardStyle: React.CSSProperties = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: 600,
    color: 'var(--cream)',
    margin: '0 0 16px',
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--mist)',
    padding: '8px 12px',
    borderBottom: '1px solid var(--horizon)',
};

const tdStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'var(--cream)',
    padding: '10px 12px',
    borderBottom: '1px solid rgba(237,233,224,0.04)',
};

const ReportsPage: React.FC = () => {
    const [revenue, setRevenue] = useState<{ breakdown: RevenueItem[]; total_monthly_revenue: number } | null>(null);
    const [failed, setFailed] = useState<{ data: FailedDelivery[]; total: number } | null>(null);
    const [retrying, setRetrying] = useState<Record<string, boolean>>({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const handleRetry = async (messageId: string) => {
        setRetrying(prev => ({ ...prev, [messageId]: true }));
        try {
            await adminFetch(`/api/v1/admin/delivery/retry/${messageId}`, {
                method: 'POST',
            });
            const fail = await adminFetch('/api/v1/admin/reports/failed-deliveries?page=1&limit=30');
            setFailed(fail);
        } catch {
            alert('Yeniden deneme başarısız oldu.');
        } finally {
            setRetrying(prev => ({ ...prev, [messageId]: false }));
        }
    };

    useEffect(() => {
        Promise.all([
            adminFetch('/api/v1/admin/reports/revenue'),
            adminFetch('/api/v1/admin/reports/failed-deliveries?page=1&limit=30'),
        ])
            .then(([rev, fail]) => { setRevenue(rev); setFailed(fail); })
            .catch(() => setError('Veriler alınamadı'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</p>;
    if (error) return <p style={{ color: '#EF4444', fontSize: '14px' }}>{error}</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--cream)', margin: 0 }}>
                Raporlar
            </h1>

            {/* Aylık Gelir */}
            <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>Aylık Gelir (Tahmini)</h2>
                <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--copper)', margin: '0 0 16px' }}>
                    {(revenue?.total_monthly_revenue ?? 0).toLocaleString('tr-TR')} ₺
                </p>
                {(revenue?.breakdown ?? []).length === 0 ? (
                    <p style={{ color: 'var(--mist)', fontSize: '13px', margin: 0 }}>Henüz ücretli abone yok.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Plan</th>
                                <th style={thStyle}>Abone</th>
                                <th style={thStyle}>Birim Fiyat</th>
                                <th style={thStyle}>Aylık Tutar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenue!.breakdown.map(item => (
                                <tr key={item.plan_type}>
                                    <td style={{ ...tdStyle, color: 'var(--copper)', fontWeight: 600 }}>{item.plan_type}</td>
                                    <td style={tdStyle}>{item.subscriber_count}</td>
                                    <td style={tdStyle}>{item.unit_price} ₺</td>
                                    <td style={tdStyle}>{item.monthly_revenue.toLocaleString('tr-TR')} ₺</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Başarısız Teslimatlar */}
            <div style={cardStyle}>
                <h2 style={sectionTitleStyle}>Başarısız Teslimatlar</h2>
                {(failed?.total ?? 0) === 0 ? (
                    <p style={{ color: '#22C55E', fontSize: '14px', margin: 0 }}>✓ Başarısız teslimat yok</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Mesaj Başlığı</th>
                                <th style={thStyle}>Kullanıcı</th>
                                <th style={thStyle}>Alıcı</th>
                                <th style={thStyle}>Tarih</th>
                                <th style={thStyle}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {failed!.data.map(item => (
                                <tr key={item.message_id}>
                                    <td style={tdStyle}>{item.title}</td>
                                    <td style={tdStyle}>
                                        {item.first_name} {item.last_name}
                                        <span style={{ color: 'var(--mist)', marginLeft: '8px', fontSize: '12px' }}>{item.user_email}</span>
                                    </td>
                                    <td style={tdStyle}>{item.recipient_count}</td>
                                    <td style={{ ...tdStyle, color: 'var(--mist)' }}>
                                        {new Date(item.updated_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            disabled={retrying[item.message_id]}
                                            onClick={() => handleRetry(item.message_id)}
                                        >
                                            {retrying[item.message_id] ? 'Deneniyor...' : 'Yeniden Dene'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
