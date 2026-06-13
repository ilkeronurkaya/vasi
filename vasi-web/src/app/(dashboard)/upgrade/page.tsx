'use client'
export const runtime = 'edge'

import { apiFetch } from '@/lib/api'
import { planLabel } from '@/lib/plans'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

export default function UpgradePage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/me'),
      apiFetch('/api/v1/public/pricing')
    ])
      .then(([meData, pricingData]) => {
        setCurrentPlan(meData.plan)
        setPlans(pricingData.plans)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })
  }, [])

  if (loading || !plans.length) {
    return <div style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</div>
  }

  const cardStyle = {
    background: 'var(--midnight)',
    border: 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--cream)' }}>Planını Yükselt</h1>
      <p style={{ fontSize: '15px', color: 'var(--mist)', marginBottom: '32px' }}>Farklı planlarımızla mesaj gönderme deneyiminizi artırın.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
        {plans.map((plan: any) => (
          <div key={plan.slug} style={{
            ...cardStyle,
            border: currentPlan === plan.slug ? '1px solid var(--copper)' : cardStyle.border,
          }}>
            {currentPlan === plan.slug && <div style={{ background: 'var(--copper)', color: 'var(--obsidian)', fontSize: '11px', fontWeight: '700', borderRadius: '6px', padding: '2px 8px', marginBottom: '16px', display: 'inline-block' }}>Mevcut Plan</div>}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--cream)' }}>{plan.name}</h2>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cream)', marginBottom: '8px' }}>₺{plan.price_monthly}<span style={{ fontSize: '14px', fontWeight: '400' }}>/ay</span></p>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: '14px', color: 'var(--mist)', lineHeight: '2' }}>{plan.message_limit} mesaj</li>
                <li style={{ fontSize: '14px', color: 'var(--mist)', lineHeight: '2' }}>{plan.recipient_limit} alıcı</li>
            </ul>
            <button className="btn btn-primary btn-md" style={{ width: '100%', marginTop: '16px', opacity: currentPlan === plan.slug ? 0.5 : 1, cursor: currentPlan === plan.slug ? 'not-allowed' : 'pointer' }} disabled={currentPlan === plan.slug}>
              {currentPlan === plan.slug ? 'Kullanımda' : 'Yakında'}
            </button>
            {plan.slug !== currentPlan && <p style={{ fontSize: '12px', color: 'var(--mist)', marginTop: '8px' }}>Ödeme entegrasyonu yakında</p>}
          </div>
        ))}
      </div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: '32px' }} onClick={() => router.back()}>Geri</button>
    </div>
  )
}
