'use client';

import React from 'react';
import { VasiLogo } from '@/components/VasiLogo';

export const runtime = 'edge';

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--obsidian)',
            padding: '24px 16px',
        }}>
            <div style={{
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '40px',
                width: '100%',
                maxWidth: '440px',
            }}>
                <a href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    marginBottom: '32px',
                }}>
                    <VasiLogo height={36} />
                    <span style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--cream)',
                        letterSpacing: '-0.3px',
                    }}>Vasi</span>
                </a>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
