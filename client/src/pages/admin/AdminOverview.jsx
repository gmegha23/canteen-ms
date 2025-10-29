import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/overview');
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'Failed to load overview');
      }
    })();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Dashboard</h1>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      {!data ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Card title="Today's Sales (₹)" value={data.todaysSales.toFixed(2)} />
          <Card title="Active Orders" value={data.activeOrders} />
          <Card title="Total Users" value={data.totals.users} />
          <Card title="Menu Items" value={data.totals.menuItems} />
        </div>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 16, boxShadow: '0 6px 16px rgba(0,0,0,0.07)' }}>
      <div style={{ fontSize: 12, color: '#64748b' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
