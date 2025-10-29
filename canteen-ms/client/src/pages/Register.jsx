import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css'; // 👈 Import CSS file

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', cpass: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.password !== form.cpass) {
      setMsg('Passwords do not match');
      return;
    }
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, password: form.password
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      const m = err?.response?.data?.message || 'Register failed';
      setMsg(m);
    }
  };

  return (
    <div className="register-wrap">
      <div className="register-card">
        <h2 className="register-title"> Create Your Account</h2>
        <form onSubmit={onSubmit}>
          <label className="register-label">Name</label>
          <input name="name" value={form.name} onChange={onChange} required className="register-input" />

          <label className="register-label">Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} required className="register-input" />

          <label className="register-label">Password</label>
          <input name="password" type="password" value={form.password} onChange={onChange} required className="register-input" />

          <label className="register-label">Confirm Password</label>
          <input name="cpass" type="password" value={form.cpass} onChange={onChange} required className="register-input" />

          <button type="submit" className="register-btn">Register</button>
        </form>

        <p className="register-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>

        {msg && <p className="register-error">{msg}</p>}
      </div>
    </div>
  );
}
