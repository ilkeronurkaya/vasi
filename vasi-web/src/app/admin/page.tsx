
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { adminFetch } from '@/lib/api'
import { Stats, Plan } from '@/types'

const PlanDistributionChart = dynamic(() => import('@/components/PlanDistributionChart'), { ssr: false })

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
    veriler_alinamadi: "Veriler alınamadı",
    teslimat_calistir: "Teslimatları Şimdi Çalıştır",
    teslimat_calisiyor: "Çalışıyor...",
    teslimat_sonuc: "Sonuç: %d teslim edildi, %f başarısız",
    teslimat_hata: "Teslimat tetiklenemedi",
    teslimat_aciklama: "Vadesi gelen zamanlanmış mesajları hemen işler (lokal ortamda cron çalışmaz)."
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
    veriler_alinamadi: "Data could not be retrieved",
    teslimat_calistir: "Run Deliveries Now",
    teslimat_calisiyor: "Running...",
    teslimat_sonuc: "Result: %d delivered, %f failed",
    teslimat_hata: "Delivery trigger failed",
    teslimat_aciklama: "Processes due scheduled messages immediately (cron does not run locally)."
  }
} as { [key: string]: { [key: string]: string } }

export const runtime = 'edge'

const AdminOverviewPage = () => {
  const [lang, setLang] = useState<'tr' | 'en'>('tr') // Default language
  const [stats, setStats] = useState<Stats | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [runDueBusy, setRunDueBusy] = useState(false)
  const [runDueResult, setRunDueResult] = useState('')

  const runDue = async () => {
    setRunDueBusy(true)
    setRunDueResult('')
    try {
      const r: { delivered?: number; failed?: number } = await adminFetch(
        '/api/v1/admin/delivery/run-due', { method: 'POST' }
      )
      setRunDueResult(
        LANGS[lang].teslimat_sonuc
          .replace('%d', String(r.delivered ?? 0))
          .replace('%f', String(r.failed ?? 0))
      )
    } catch {
      setRunDueResult(LANGS[lang].teslimat_hata)
    } finally {
      setRunDueBusy(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse: Stats = await adminFetch('/api/v1/admin/stats/overview')
        const plansResponse: { plans: Plan[] } = await adminFetch('/api/v1/admin/stats/plans')

        setStats(statsResponse)
        setPlans(plansResponse.plans)
      } catch (err) {
        queueMicrotask(() => setError(true))
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
      {/* Manuel teslimat tetikleyici — lokal ortamda cron çalışmaz (TestBulgulari_1 #5) */}
      <div style={{
        background: 'var(--midnight)', border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)',
        padding: '24px', marginTop: '32px',
        display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        <button className="btn btn-primary btn-md" onClick={runDue} disabled={runDueBusy}>
          {runDueBusy ? t.teslimat_calisiyor : t.teslimat_calistir}
        </button>
        <div className="flex-1 min-w-0">
          {runDueResult
            ? <span className="text-sm" style={{ color: 'var(--copper)', fontWeight: 600 }}>{runDueResult}</span>
            : <span className="text-xs" style={{ color: 'var(--mist)' }}>{t.teslimat_aciklama}</span>}
        </div>
      </div>

      {/* Plan Distribution Section */}
      <h2 style={{ fontSize: '17px', fontWeight: '600', marginTop: '32px' }}>
        {t.plan_dagilimi}
      </h2>
      <div style={{ marginTop: '16px', background: 'var(--midnight)', padding: '24px', borderRadius: 'var(--radius-card)', border: 'var(--border-subtle)' }}>
        <PlanDistributionChart plans={plans} />
      </div>
    </div>
  )
}

export default AdminOverviewPage
