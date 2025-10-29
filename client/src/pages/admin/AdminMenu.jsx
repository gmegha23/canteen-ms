import { useEffect, useState } from 'react';
import api from '../../api';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    count: '',
    isAvailable: true,
    imageUrl: ''
  });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const { data } = await api.get('/menu');
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', count: '', isAvailable: true, imageUrl: '' });
    setEditId(null);
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        count: Number(form.count)
      };
      if (editId) {
        await api.put(`/menu/${editId}`, payload);
      } else {
        await api.post('/menu', payload);
      }
      await load();
      resetForm();
      setMsg('✅ Saved successfully');
    } catch (e) {
      setMsg(e?.response?.data?.message || '❌ Save failed');
    }
  };

  const edit = (it) => {
    setEditId(it._id);
    setForm({
      name: it.name,
      description: it.description || '',
      price: it.price,
      category: it.category || '',
      count: it.count || '',
      isAvailable: it.isAvailable,
      imageUrl: it.imageUrl || ''
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this item?')) return;
    await api.delete(`/menu/${id}`);
    await load();
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>🍔 Manage Menu</h1>
      {msg && <p style={{ color: msg.includes('failed') ? 'crimson' : 'limegreen', fontWeight: 'bold' }}>{msg}</p>}
      
      <div style={styles.grid}>
        {/* Table */}
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Avail</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it._id} style={styles.tr}>
                  <td style={styles.td}>{it.name}</td>
                  <td style={styles.td}>{it.category}</td>
                  <td style={styles.td}>₹{it.price.toFixed(2)}</td>
                  <td style={styles.td}>{it.count}</td>
                  <td style={styles.td}>{it.isAvailable ? '✅' : '❌'}</td>
                  <td style={styles.td}>
                    <button onClick={() => edit(it)} style={{ ...styles.btn, background: '#3b82f6' }}>Edit</button>
                    <button
                      onClick={() => remove(it._id)}
                      style={{ ...styles.btn, background: '#ef4444' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan="6" style={{ padding: 12 }}>No items</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <form onSubmit={save} style={styles.card}>
          <h3 style={{ marginBottom: 12 }}>{editId ? '✏️ Update Item' : '➕ Add Item'}</h3>
          <label style={styles.label}>Name
            <input required name="name" value={form.name} onChange={onChange} style={styles.input} />
          </label>
          <label style={styles.label}>Description
            <textarea name="description" value={form.description} onChange={onChange} style={{ ...styles.input, height: 70 }} />
          </label>
          <label style={styles.label}>Price
            <input required type="number" step="0.01" name="price" value={form.price} onChange={onChange} style={styles.input} />
          </label>
          <label style={styles.label}>Category
            <input name="category" value={form.category} onChange={onChange} style={styles.input} />
          </label>
          <label style={styles.label}>Stock Count
            <input required type="number" name="count" value={form.count} onChange={onChange} style={styles.input} />
          </label>
          <label style={{ ...styles.label, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={onChange} />
            Available
          </label>
          <label style={styles.label}>Image URL
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} style={styles.input} />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="submit" style={{ ...styles.btn, background: '#10b981' }}>{editId ? 'Update' : 'Add'}</button>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                style={{ ...styles.btn, background: '#6b7280' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    padding: 20,
    background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    fontFamily: 'Segoe UI, sans-serif'
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 20
  },
  card: {
    background: '#ffffffcc',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(6px)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: 10,
    textAlign: 'left',
    background: '#3b82f6',
    color: '#fff',
    fontSize: 13
  },
  tr: {
    background: '#f9fafb'
  },
  td: {
    padding: 10,
    borderTop: '1px solid #e5e7eb',
    fontSize: 14
  },
  label: {
    display: 'block',
    fontSize: 13,
    color: '#374151',
    marginTop: 8
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    marginTop: 4
  },
  btn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    color: '#fff',
    fontWeight: '500',
    cursor: 'pointer',
    transition: '0.2s'
  }
};
