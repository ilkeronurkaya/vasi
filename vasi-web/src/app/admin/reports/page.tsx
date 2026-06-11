
import React from 'react';
import { adminFetch } from '@/lib/api';

const ReportsPage = async () => {
  const revenueData = await adminFetch('/api/v1/admin/reports/revenue');
  const failedDeliveriesData = await adminFetch('/api/v1/admin/reports/failed-deliveries?page=1&limit=30');

  return (
    <div>
      <h1>Raporlar</h1>
      <RevenueBreakdown breakdown={revenueData.breakdown} total_monthly_revenue={revenueData.total_monthly_revenue} />
      <FailedDeliveriesTable data={failedDeliveriesData.data} total={failedDeliveriesData.total} />
    </div>
  );
};

const RevenueBreakdown = ({ breakdown, total_monthly_revenue }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <h2>Aylık Gelir (Tahmini)</h2>
    <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--copper)' }}>{total_monthly_revenue} ₺</p>
    {breakdown.map((item) => (
      <div key={item.plan_type}>
        <p>{item.plan_type}</p>
        <p>{item.subscriber_count}</p>
        <p>{item.unit_price}</p>
        <p>{item.monthly_revenue}</p>
      </div>
    ))}
  </div>
);

const FailedDeliveriesTable = ({ data, total }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <h2>Başarısız Teslimatlar</h2>
    {total === 0 ? (
      <p style={{ color: 'var(--cream)' }}>✓ Başarısız teslimat yok</p>
    ) : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Mesaj Başlığı</th>
            <th>Kullanıcı (ad + e-posta)</th>
            <th>Alıcı Sayısı</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.message_id}>
              <td>{item.title}</td>
              <td>{item.first_name} {item.last_name}, {item.user_email}</td>
              <td>{item.recipient_count}</td>
              <td>{item.updated_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default ReportsPage;
