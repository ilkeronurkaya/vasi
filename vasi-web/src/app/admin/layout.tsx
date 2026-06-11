
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { VasiLogo } from '@/components/VasiLogo';

export const runtime = 'edge';

const NAV = [
    { href: '/admin', label: 'Genel Bakış' },
    { href: '/admin/users', label: 'Kullanıcılar' },
    { href: '/admin/reports', label: 'Raporlar' },
    { href: '/admin/settings', label: 'Ayarlar' },
];

const sidebarStyle = {
    width: '240px',
    minHeight: '100vh',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    borderRight: 'var(--border-subtle)',
    padding: '24px 16px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    flexShrink: 0,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
};

const navLinkStyle = (active: boolean) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
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

const adminBadgeStyle = {
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(212,118,59,0.12)',
    color: 'var(--copper)',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
};

const logoutButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--mist)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '10px 12px',
    borderRadius: 'var(--radius-input)',
    textAlign: 'left' as const,
    width: '100%',
    transition: `color var(--dur) var(--ease)`,
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();

    const isLogin = pathname === '/admin/login';

    useEffect(() => {
        if (!isLogin && !localStorage.getItem('adminToken')) {
            router.push('/admin/login');
        }
    }, [isLogin, router]);

    // Login sayfası sidebar'sız, çıplak render edilir
    if (isLogin) return <>{children}</>;

    return (
        <div style={{ display: 'flex' as const, minHeight: '100vh', background: 'var(--obsidian)' }}>
            {/* Sidebar */}
            <aside style={sidebarStyle}>
                {/* Logo and Admin Text */}
                <div style={{ marginBottom: '32px' }}>
                    <Link href="/admin" style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '10px', textDecoration: 'none' }}>
                        <VasiLogo height={32} />
                        <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--cream)' }}>Vasi Admin</span>
                    </Link>
                    <div style={adminBadgeStyle}>ADMIN</div>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, display: 'flex' as const, flexDirection: 'column' as const, gap: '4px' }}>
                    {NAV.map(item => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={navLinkStyle(active)}
                                onMouseEnter={(e) => {
                                    if (!active) {
                                        (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(237,233,224,0.04)';
                                        (e.currentTarget as HTMLAnchorElement).style.color = 'var(--cream)';
                                    }
                                }}
                                onMouseLeave={(e) => {
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

                {/* Logout Button */}
                <button
                    onClick={() => {
                        localStorage.removeItem('adminToken');
                        router.push('/admin/login');
                    }}
                    style={logoutButtonStyle}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--cream)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--mist)')}
                >
                    Çıkış Yap
                </button>
            </aside>

            {/* Main */}
            <main style={{ flex: 1, padding: '32px', minHeight: '100vh' }}>
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
