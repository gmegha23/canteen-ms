import { Link, Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    nav('/');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ background: '#0f172a', color: '#fff', padding: 16 }}>
        <h2 style={{ margin: '8px 0 16px' }}>Admin Panel</h2>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link style={link} to="/admin">Overview</Link>
          <Link style={link} to="/admin/menu">Manage Menu</Link>
          <Link style={link} to="/admin/orders">Orders</Link>
          <Link style={link} to="/admin/users">Users</Link>
          <button onClick={logout} style={{ ...btn, marginTop: 24 }}>Logout</button>
        </nav>
      </aside>
      <main style={{ padding: 24, background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}

const link = {
  color: '#cbd5e1',
  textDecoration: 'none',
  padding: '8px 12px',
  borderRadius: 10,
  background: '#1e293b'
};
const btn = {
  padding: '8px 12px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer'
};
