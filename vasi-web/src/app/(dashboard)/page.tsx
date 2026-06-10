'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

// The dashboard is at /dashboard. This file shouldn't be needed but
// acts as a safety redirect if someone hits / while inside the dashboard layout.
export default function DashboardIndex() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);
    return null;
}
