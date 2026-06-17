'use client'
export const runtime = 'edge'

import { apiFetch } from '@/lib/api'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useLang, t } from '@/lib/i18n'

interface Plan {
    slug: string
    name: string
    price_monthly: number
    message_limit: number
    recipient_limit: number
    is_active: boolean
}

export default function UpgradePage() {
  const router = useRouter()
  const [lang] = useLang()
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<Plan[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch('/api/v1/me'),
      apiFetch('/api/v1/public/pricing')
    ])
      .then(([meData, pricingData]) => {
        setCurrentPlan(meData.plan)
        setPlans(pricingData.plans)
        setLoading(false)
        const payment = new URLSearchParams(window.location.search).get('payment')
        if (payment === 'success') {
          setMessage('Ödeme başarılı, planın artık Premium.')
        } else if (payment === 'failed') {
          setError('Ödeme tamamlanamadı, tekrar deneyebilirsin.')
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error)
        setLoading(false)
      })
  }, [])

  const handleUpgrade = async (plan_slug: string) => {
    try {
        const { paymentPageUrl } = await apiFetch('/api/v1/payment/checkout/init', { method:'POST', body: JSON.stringify({ plan_slug }) })
        window.location.assign(paymentPageUrl)
    } catch (e: unknown) {
        setError('Ödeme başlatılamadı: ' + ((e as Error).message || 'Hata'))
    }
  }

  if (loading || !plans.length) {
    return <div style={{ color: 'var(--mist)', fontSize: '14px' }}>{t('common_loading', lang)}</div>
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
      {message && <div style={{ background: 'rgba(75, 181, 67, 0.2)', color: '#4bb543', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{message}</div>}
      {error && <div style={{ background: 'rgba(212, 59, 59, 0.2)', color: '#d43b3b', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
      <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em', color: 'var(--cream)' }}>{t('upgrade_title', lang)}</h1>
      <p style={{ fontSize: '15px', color: 'var(--mist)', marginBottom: '32px' }}>{t('upgrade_subtitle', lang)}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
        {plans.map((plan: Plan) => (
          <div key={plan.slug} style={{
            ...cardStyle,
            border: currentPlan === plan.slug ? '1px solid var(--copper)' : cardStyle.border,
          }}>
            {currentPlan === plan.slug && <div style={{ background: 'var(--copper)', color: 'var(--obsidian)', fontSize: '11px', fontWeight: '700', borderRadius: '6px', padding: '2px 8px', marginBottom: '16px', display: 'inline-block' }}>{t('upgrade_current_plan', lang)}</div>}
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--cream)' }}>{plan.name}</h2>
            <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--cream)', marginBottom: '8px' }}>₺{plan.price_monthly}<span style={{ fontSize: '14px', fontWeight: '400' }}>{t('upgrade_per_month', lang)}</span></p>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: '14px', color: 'var(--mist)', lineHeight: '2' }}>{plan.message_limit + ' ' + t('upgrade_messages_suffix', lang)}</li>
                <li style={{ fontSize: '14px', color: 'var(--mist)', lineHeight: '2' }}>{plan.recipient_limit + ' ' + t('common_recipients', lang)}</li>
            </ul>
            <button 
                className="btn btn-primary btn-md" 
                style={{ width: '100%', marginTop: '16px', opacity: currentPlan === plan.slug ? 0.5 : 1 }} 
                disabled={currentPlan === plan.slug}
                onClick={() => handleUpgrade(plan.slug)}
            >
              {currentPlan === plan.slug ? t('upgrade_in_use', lang) : t('upgrade_btn', lang)}
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-secondary btn-sm" style={{ marginTop: '32px' }} onClick={() => router.back()}>{t('common_back', lang)}</button>
    </div>
  )
}
