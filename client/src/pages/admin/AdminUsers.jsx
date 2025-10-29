import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/users');
      setUsers(data);
    })();
  }, []);

  return (
    <div>
      <h1>Users</h1>
      <div style={{ background: '#fff', borderRadius: 12, padding: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td style={td}>{u.name}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{new Date(u.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan="3" style={{ padding: 12 }}>No users</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', padding: 8, fontSize: 12, color: '#475569' };
const td = { padding: 8 };
