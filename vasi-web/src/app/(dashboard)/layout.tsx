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
    { href: '/dashboard', label: 'Ana Sayfa' },
    { href: '/messages', label: 'Mesajlarım' },
    { href: '/messages/new', label: 'Yeni Mesaj' },
];

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
    transition: `width var(--dur) var(--ease)`,
});

const badgeStyle = (plan: string): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 'var(--radius-input)',
    background: plan === 'free' ? 'var(--horizon)' : 'var(--copper)',
    color: plan === 'free' ? 'var(--mist)' : 'var(--obsidian)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
});

const avatarStyle: React.CSSProperties = {
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

const logoutButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--mist)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: 'var(--radius-input)',
    textAlign: 'left',
    width: '100%',
    transition: `color var(--dur) var(--ease)`,
};

const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    padding: '0 12px',
    borderRadius: '10px',
    color: active ? 'var(--copper)' : 'var(--mist)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    background: active ? 'rgba(212,118,59,0.12)' : 'transparent',
    transition: `background var(--dur) var(--ease), color var(--dur) var(--ease)`,
});

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
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderRight: 'var(--border-subtle)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                position: 'sticky',
                top: 0,
                height: '100vh',
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
                            <Link
                                key={item.href}
                                href={item.href}
                                style={navLinkStyle(active)}
                                onMouseEnter={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(237,233,224,0.04)';
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--mist)';
                                    }
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Limit Progress Bar */}
                <div style={{ padding: '16px 0', borderTop: 'var(--border-subtle)' }}>
                    <div style={{ color: 'var(--mist)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Mesaj Hakkı
                    </div>
                    <div style={barContainerStyle}>
                        <div style={fillStyle(me?.usage.messages_used || 0, me?.usage.messages_limit || 1)} />
                    </div>
                    {((me?.usage.messages_used || 0) / (me?.usage.messages_limit || 1) * 100 >= 80) && (
                        <div style={{ color: 'var(--copper)', fontSize: '12px', marginTop: '4px' }}>Hakkın dolmak üzere</div>
                    )}
                </div>

                {/* Subscription Badge */}
                <div style={badgeStyle(me?.plan || 'free')}>
                    {me?.plan === 'free' ? (
                        <>
                            Free
                            <button onClick={() => router.push('/upgrade')} style={{ width: '100%', marginTop: '8px' }} className="btn btn-primary btn-sm">
                                Pro'ya Geç
                            </button>
                        </>
                    ) : (
                        <>Pro ✓</>
                    )}
                </div>

                {/* User Profile */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px' }}>
                    <div style={avatarStyle}>{me?.user.first_name ? me.user.first_name[0] : ''}</div>
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--cream)', fontSize: '13px', fontWeight: 500 }}>{me?.user.first_name} {me?.user.last_name}</div>
                        <div style={{ color: 'var(--mist)', fontSize: '11px', marginTop: '2px' }}>{me?.user.email}</div>
                    </div>
                    <button
                        onClick={() => { localStorage.removeItem('authToken'); router.push('/login'); }}
                        style={logoutButtonStyle}
                        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--mist)')}
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
