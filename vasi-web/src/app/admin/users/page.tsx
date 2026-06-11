'use client';

import React, { useEffect, useRef, useState } from 'react';
import { adminFetch } from '@/lib/api';

export const runtime = 'edge';

interface AdminUser {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    status: string;
    email_verified: number;
    is_admin: number;
    created_at: string;
    plan_type: string;
    message_count: number;
}

const cardStyle: React.CSSProperties = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
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
    verticalAlign: 'middle',
};

const badgeStyle = (status: string): React.CSSProperties => ({
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: '20px',
    background: status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color: status === 'active' ? '#22C55E' : '#EF4444',
});

const selectStyle: React.CSSProperties = {
    background: 'var(--obsidian)',
    border: '1px solid var(--horizon)',
    borderRadius: 'var(--radius-input)',
    color: 'var(--cream)',
    fontSize: '12px',
    padding: '6px 8px',
    outline: 'none',
    cursor: 'pointer',
};

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const LIMIT = 20;

    const load = (pageNum: number, query: string) => {
        setLoading(true);
        setError('');
        adminFetch(`/api/v1/admin/users?page=${pageNum}&limit=${LIMIT}&q=${encodeURIComponent(query)}`)
            .then(data => { setUsers(data.users ?? []); setTotal(data.total ?? 0); })
            .catch(() => setError('Kullanıcılar alınamadı'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(1, ''); }, []);

    const onSearch = (value: string) => {
        setQ(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(1); load(1, value); }, 400);
    };

    const toggleStatus = async (user: AdminUser) => {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        try {
            await adminFetch(`/api/v1/admin/users/${user.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: newStatus } : u)));
        } catch {
            setError('Durum güncellenemedi');
        }
    };

    const changePlan = async (user: AdminUser, plan: string) => {
        try {
            await adminFetch(`/api/v1/admin/users/${user.id}/plan`, {
                method: 'PATCH',
                body: JSON.stringify({ plan_type: plan }),
            });
            setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, plan_type: plan } : u)));
        } catch {
            setError('Plan güncellenemedi');
        }
    };

    const totalPages = Math.max(1, Math.ceil(total / LIMIT));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--cream)', margin: 0 }}>
                    Kullanıcılar
                </h1>
                <input
                    type="text"
                    value={q}
                    onChange={e => onSearch(e.target.value)}
                    placeholder="E-posta veya ad ara..."
                    style={{
                        width: '260px',
                        minHeight: '40px',
                        padding: '8px 14px',
                        background: 'var(--obsidian)',
                        border: '1px solid var(--horizon)',
                        borderRadius: 'var(--radius-input)',
                        color: 'var(--cream)',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {error && <p style={{ color: '#EF4444', fontSize: '13px', margin: 0 }}>{error}</p>}

            <div style={cardStyle}>
                {loading ? (
                    <p style={{ color: 'var(--mist)', fontSize: '14px', margin: 0 }}>Yükleniyor...</p>
                ) : users.length === 0 ? (
                    <p style={{ color: 'var(--mist)', fontSize: '14px', margin: 0 }}>Kullanıcı bulunamadı.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Ad Soyad</th>
                                <th style={thStyle}>E-posta</th>
                                <th style={thStyle}>Plan</th>
                                <th style={thStyle}>Durum</th>
                                <th style={thStyle}>Mesaj</th>
                                <th style={thStyle}>Kayıt</th>
                                <th style={thStyle}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td style={tdStyle}>
                                        {user.first_name} {user.last_name}
                                        {user.is_admin === 1 && (
                                            <span style={{ marginLeft: '6px', fontSize: '10px', fontWeight: 600, color: 'var(--copper)', textTransform: 'uppercase' }}>
                                                admin
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle, color: 'var(--mist)' }}>{user.email}</td>
                                    <td style={{ ...tdStyle, color: user.plan_type === 'free' ? 'var(--mist)' : 'var(--copper)', fontWeight: 600 }}>
                                        {user.plan_type}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={badgeStyle(user.status)}>
                                            {user.status === 'active' ? 'Aktif' : user.status === 'suspended' ? 'Askıda' : user.status}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{user.message_count}</td>
                                    <td style={{ ...tdStyle, color: 'var(--mist)' }}>
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(user)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                {user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                                            </button>
                                            <select
                                                value={user.plan_type}
                                                onChange={e => changePlan(user, e.target.value)}
                                                style={selectStyle}
                                            >
                                                <option value="free">free</option>
                                                <option value="personal">personal</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Sayfalama */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    style={{ opacity: page <= 1 ? 0.5 : 1 }}
                    onClick={() => { const p = page - 1; setPage(p); load(p, q); }}
                >
                    ← Önceki
                </button>
                <span style={{ color: 'var(--mist)', fontSize: '13px' }}>
                    Sayfa {page} / {totalPages} — {total} kullanıcı
                </span>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={page >= totalPages}
                    style={{ opacity: page >= totalPages ? 0.5 : 1 }}
                    onClick={() => { const p = page + 1; setPage(p); load(p, q); }}
                >
                    Sonraki →
                </button>
            </div>
        </div>
    );
};

export default UsersPage;
