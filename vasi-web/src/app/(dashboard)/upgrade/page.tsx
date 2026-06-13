'use client'
export const runtime = 'edge'

import { apiFetch } from '@/lib/api'
import { planLabel } from '@/lib/plans'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'

const PLANS = (pricing: any) => [
  {
    key: 'free',
    name: planLabel['free'],
    price: '₺0',
    period: '/ay',
    features: [`${pricing.plan_limit_free} mesaj`, 'E-posta teslimi'],
  },
  {
    key: 'personal',
    name: planLabel['personal'],
    price: `₺${pricing.price_personal_monthly}`,
    period: '/ay',
    features: [`${pricing.plan_limit_personal} mesaj`, 'Medya ekleri', 'SMS+e-posta'],
  },
];

export default function UpgradePage() {
  const router = useRouter()
  const [currentPlan, setCurrentPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pricing, setPricing] = useState(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/me'),
      apiFetch('/api/v1/public/pricing')
    ])
      .then(([meData, pricingData]) => {
        setCurrentPlan(meData.plan)
        setPricing(pricingData.pricing)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })
  }, [])

  if (loading || !pricing) {
    return <div style={{ color: 'var(--mist)', fontSize: '14px' }}>Yükleniyor...</div>
  }

  const cardStyle = {
    background: 'var(--midnight)',
    border: currentPlan === 'personal' ? '2px solid var(--copper)' : 'var(--border-subtle)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: '24px',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--cream)' }}>Planını Yükselt</h1>
      <p style={{ fontSize: '15px', color: 'var(--mist)', marginBottom: '32px' }}>Farklı planlarımızla mesaj gönderme deneyiminizi artırın.</p>
      <div style={{ display: 'flex', gap: '32px' }}>
        {PLANS(pricing).map(plan => (
          <div key={plan.key} style={{
            ...cardStyle,
            border: currentPlan === plan.key ? '1px solid var(--copper)' : cardStyle.border,
          }}>
            {currentPlan === plan.key && <div style={{ background: 'var(--copper)', color: 'var(--obsidian)', fontSize: '11px', fontWeight: '700', borderRadius: '6px', padding: '2px 8px', marginBottom: '16px' }}>Mevcut Plan</div>}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--cream)' }}>{plan.name}</h2>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cream)', marginBottom: '8px' }}>{plan.price}<span style={{ fontSize: '14px', fontWeight: '400' }}>{plan.period}</span></p>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {plan.features.map((feature, index) => (
                <li key={index} style={{ fontSize: '14px', color: 'var(--mist)', lineHeight: '2' }}>{feature}</li>
              ))}
            </ul>
            <button className="btn btn-primary btn-md" style={{ width: '100%', marginTop: '16px', opacity: currentPlan === plan.key ? 0.5 : 1, cursor: currentPlan === plan.key ? 'not-allowed' : 'pointer' }} disabled={currentPlan === plan.key} onClick={() => { /* TODO: Implement upgrade logic */ }}>
              {currentPlan === plan.key ? 'Kullanımda' : 'Yakında'}
            </button>
            {plan.key !== currentPlan && <p style={{ fontSize: '12px', color: 'var(--mist)', marginTop: '8px' }}>Ödeme entegrasyonu yakında</p>}
          </div>
        ))}
      </div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: '32px' }} onClick={() => router.back()}>Geri</button>
    </div>
  )
}
