import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [mode, setMode] = useState('user'); // 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); // for admin
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const saveAndGo = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/home');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (mode === 'admin') {
        const { data } = await api.post('/auth/login', {
          isAdmin: true,
          username,
          password
        });
        saveAndGo(data);
      } else {
        const { data } = await api.post('/auth/login', {
          email,
          password
        });
        saveAndGo(data);
      }
    } catch (err) {
      const m = err?.response?.data?.message || 'Login failed';
      setMsg(m);
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>🍔 Canteen Portal Login</h2>

        <div style={styles.tabs}>
          <button
            onClick={() => setMode('user')}
            style={{ ...styles.tab, ...(mode === 'user' ? styles.activeTab : {}) }}
          >
            User
          </button>
          <button
            onClick={() => setMode('admin')}
            style={{ ...styles.tab, ...(mode === 'admin' ? styles.activeTab : {}) }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
          {mode === 'user' ? (
            <>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <label style={styles.label}>Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </>
          ) : (
            <>
              <label style={styles.label}>Admin Username</label>
              <input
                style={styles.input}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />

              <label style={styles.label}>Admin Password</label>
              <input
                type="password"
                style={styles.input}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" style={styles.btn}>Login</button>
        </form>

        {mode === 'user' && (
          <p style={{ marginTop: 12 }}>
            New user? <Link to="/register" style={styles.link}>Create an account</Link>
          </p>
        )}

        {msg && <p style={{ color: '#e63946', marginTop: 10 }}>{msg}</p>}
      </div>
    </div>
  );
}

const styles = {
  wrap: { 
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative'
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // dark overlay for readability
    zIndex: 0
  },
  card: { 
    width: 380, 
    background: '#fff', 
    padding: 28, 
    borderRadius: 20, 
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    textAlign: 'center',
    zIndex: 1,
    position: 'relative'
  },
  title: { 
    marginBottom: 16, 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#ff6b6b' 
  },
  tabs: { 
    display: 'flex', 
    gap: 10, 
    background: '#ffe3e3', 
    padding: 6, 
    borderRadius: 999, 
    marginBottom: 12 
  },
  tab: { 
    flex: 1, 
    padding: '8px 12px', 
    borderRadius: 999, 
    border: 'none', 
    background: 'transparent', 
    cursor: 'pointer',
    fontWeight: 500,
    color: '#555'
  },
  activeTab: { 
    background: '#ff6b6b', 
    color: '#fff',
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)' 
  },
  label: { 
    display: 'block', 
    marginTop: 12, 
    fontSize: 13, 
    color: '#333', 
    textAlign: 'left' 
  },
  input: { 
    width: '100%', 
    padding: '10px 12px', 
    borderRadius: 12, 
    border: '1px solid #ddd', 
    marginTop: 6,
    outline: 'none',
    fontSize: 14 
  },
  btn: { 
    width: '100%', 
    marginTop: 20, 
    padding: '12px', 
    border: 'none', 
    background: 'linear-gradient(90deg, #ff6b6b, #f06595)', 
    color: '#fff', 
    fontWeight: 'bold',
    borderRadius: 12, 
    cursor: 'pointer',
    transition: '0.3s' 
  },
  link: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    textDecoration: 'none'
  }
};
