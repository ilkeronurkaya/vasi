'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { VasiLogo } from '@/components/VasiLogo';
import { apiFetch } from '@/lib/api';

interface Me {
    user: {
        first_name: string;
        last_name: string;
        email: string;
    };
    plan: string;
    usage: {
        messages_used: number;
        messages_limit: number;
    };
}

export const runtime = 'edge';

const NAV = [
    { href: '/dashboard', label: 'Mesajlarım' },
    { href: '/messages/new', label: 'Yeni Mesaj' },
];

const progressBarStyle = {
    padding: '16px',
    borderTop: '1px solid var(--horizon)',
};

const labelStyle = {
    color: 'var(--mist)',
    fontSize: '12px',
    marginBottom: '4px',
};

const barContainerStyle: React.CSSProperties = {
    height: '6px',
    borderRadius: '3px',
    background: 'var(--horizon)',
    overflow: 'hidden',
    position: 'relative',
};

const fillStyle = (used: number, max: number): React.CSSProperties => ({
    width: `${(used / max) * 100}%`,
    height: '100%',
    background: 'var(--copper)',
    transition: 'width 0.3s ease',
});

const warningStyle = {
    color: 'var(--copper)',
    fontSize: '12px',
    marginTop: '4px',
};

const badgeStyle = (plan: string): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '16px',
    background: plan === 'free' ? 'var(--horizon)' : 'var(--copper)',
    color: plan === 'free' ? 'var(--mist)' : 'var(--obsidian)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
});

const buttonStyle = {
    width: '100%',
    marginTop: '8px',
};

const profileContainerStyle: React.CSSProperties = {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const avatarStyle = {
    background: 'var(--copper)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--obsidian)',
    fontSize: '24px',
    fontWeight: 700,
};

const userInfoStyle: React.CSSProperties = {
    marginTop: '16px',
    textAlign: 'center',
};

const logoutButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--mist)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: '8px',
    textAlign: 'left',
    width: '100%',
    transition: 'color 0.2s',
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) router.push('/login');

        apiFetch('/api/v1/me')
            .then(setMe)
            .catch(() => {});
    }, [router]);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--obsidian)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '240px',
                minHeight: '100vh',
                background: 'var(--midnight)',
                borderRight: '1px solid var(--horizon)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
            }}>
                {/* Logo */}
                <Link href="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    marginBottom: '32px',
                }}>
                    <VasiLogo height={32} />
                    <span style={{ fontSize: '17px', fontWeight: 700, color: 'var(--cream)' }}>Vasi</span>
                </Link>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {NAV.map(item => {
                        const active = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'block',
                                padding: active ? '10px 12px 10px 9px' : '10px 12px',
                                borderRadius: '8px',
                                borderLeft: active ? '3px solid var(--copper)' : '3px solid transparent',
                                color: active ? 'var(--copper)' : 'var(--mist)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: 500,
                                background: active ? 'rgba(212,118,59,0.08)' : 'transparent',
                                transition: 'all 0.2s',
                            }}>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Limit Progress Bar */}
                <div style={progressBarStyle}>
                    <div style={labelStyle}>Mesaj Hakkı</div>
                    <div style={barContainerStyle}>
                        <div style={fillStyle(me?.usage.messages_used || 0, me?.usage.messages_limit || 1)}></div>
                    </div>
                    {((me?.usage.messages_used || 0) / (me?.usage.messages_limit || 1) * 100 >= 80) && (
                        <div style={warningStyle}>Hakkın dolmak üzere</div>
                    )}
                </div>

                {/* Subscription Badge */}
                <div style={badgeStyle(me?.plan || 'free')}>
                    {me?.plan === 'free' ? (
                        <>
                            Free
                            <button onClick={() => router.push('/upgrade')} style={buttonStyle} className="btn btn-primary btn-sm">
                                Pro'ya Geç
                            </button>
                        </>
                    ) : (
                        <>Pro ✓</>
                    )}
                </div>

                {/* User Profile */}
                <div style={profileContainerStyle}>
                    <div style={avatarStyle}>{me?.user.first_name ? me.user.first_name[0] : ''}</div>
                    <div style={userInfoStyle}>
                        <span>{me?.user.first_name} {me?.user.last_name}</span>
                        <span>{me?.user.email}</span>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('authToken'); router.push('/login'); }}
                        style={logoutButtonStyle}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--mist)')}
                    >
                        Çıkış Yap
                    </button>
                </div>

            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '32px', minHeight: '100vh' }}>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
