
'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/adminFetch'  // Assuming this is where adminFetch is defined
import { Stats, Plan } from '@/types'

const LANGS = {
  tr: {
    genel_bakis: "Genel Bakış",
    toplam_kullanici: "Toplam Kullanıcı",
    aktif_kullanici: "Aktif Kullanıcı",
    ucretli_abone: "Ücretli Abone",
    teslim_edilen: "Teslim Edilen",
    basarisiz: "Başarısız",
    bugunku_mesaj: "Bugünkü Mesaj",
    teslimat_orani: "Teslimat Oranı",
    plan_dagilimi: "Plan Dağılımı",
    yukleniyor: "Yükleniyor...",
    veriler_alinamadi: "Veriler alınamadı"
  },
  en: {
    genel_bakis: "General Overview",
    toplam_kullanici: "Total Users",
    aktif_kullanici: "Active Users",
    ucretli_abone: "Paid Subscriptions",
    teslim_edilen: "Delivered",
    basarisiz: "Failed",
    bugunku_mesaj: "Messages Today",
    teslimat_orani: "Delivery Rate",
    plan_dagilimi: "Plan Distribution",
    yukleniyor: "Loading...",
    veriler_alinamadi: "Data could not be retrieved"
  }
} as { [key: string]: { [key: string]: string } }

export const runtime = 'edge'

const AdminOverviewPage = () => {
  const [lang, setLang] = useState<'tr' | 'en'>('tr') // Default language
  const [stats, setStats] = useState<Stats | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse: Stats = await adminFetch('/api/v1/admin/stats/overview')
        const plansResponse: { plans: Plan[] } = await adminFetch('/api/v1/admin/stats/plans')

        setStats(statsResponse)
        setPlans(plansResponse.plans)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div style={{ color: 'var(--mist)' }}>{LANGS[lang].yukleniyor}</div>
  if (error) return <div style={{ color: '#EF4444' }}>{LANGS[lang].veriler_alinamadi}</div>

  const t = LANGS[lang]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.01em' }}>
        {t.genel_bakis}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
        {/* Statistic Cards */}
        {[
          { label: t.toplam_kullanici, value: stats?.total_users },
          { label: t.aktif_kullanici, value: stats?.active_users },
          { label: t.ucretli_abone, value: stats?.paid_subs },
          { label: t.teslim_edilen, value: stats?.total_delivered },
          { label: t.basarisiz, value: stats?.total_failed ?? 0, color: (stats?.total_failed ?? 0) > 0 ? '#EF4444' : 'var(--cream)' },
          { label: t.bugunku_mesaj, value: stats?.messages_today }
        ].map((item, index) => (
          <div key={index} style={{ background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '24px', transition: 'transform var(--dur) var(--ease), border-color var(--dur) var(--ease)' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: item.color || 'var(--cream)' }}>{item.value}</div>
            <div style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '8px' }}>{item.label}</div>
          </div>
        ))}
        {/* Delivery Rate Card */}
        <div style={{ background: 'var(--midnight)', border: 'var(--border-subtle)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: '24px', transition: 'transform var(--dur) var(--ease), border-color var(--dur) var(--ease)' }}>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--copper)' }}>{stats?.delivery_rate_pct ?? 0}%</div>
          <div style={{ fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '8px' }}>{t.teslimat_orani}</div>
        </div>
      </div>
      {/* Plan Distribution Section */}
      <h2 style={{ fontSize: '17px', fontWeight: '600', marginTop: '32px' }}>
        {t.plan_dagilimi}
      </h2>
      <div style={{ marginTop: '16px' }}>
        {plans.map((plan, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <span style={{ marginRight: '8px' }}>{plan.plan_type}</span>
            <span style={{ marginRight: '8px' }}>({plan.user_count})</span>
            <div style={{ width: '100%', height: '4px', background: 'var(--horizon)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(plan.user_count / (stats?.total_users ?? 1) * 100).toFixed(2)}%`, height: '100%', background: 'var(--copper)' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminOverviewPage
