'use client';
import React from 'react';
import { VasiLogo } from '@/components/VasiLogo';
export const runtime = 'edge';
const AuthLayout = ({ children }) => {
    return (React.createElement("div", { style: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--obsidian)',
            padding: '24px 16px',
        } },
        React.createElement("div", { style: {
                background: 'var(--midnight)',
                border: 'var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                padding: '40px',
                width: '100%',
                maxWidth: '440px',
            } },
            React.createElement("a", { href: "/", style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    marginBottom: '32px',
                } },
                React.createElement(VasiLogo, { height: 36 }),
                React.createElement("span", { style: {
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--cream)',
                        letterSpacing: '-0.3px',
                    } }, "Vasi")),
            children)));
};
export default AuthLayout;
