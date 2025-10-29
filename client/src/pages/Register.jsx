// client/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const [currentStep, setCurrentStep] = useState(1); // Step 1 = enter details, Step 2 = enter OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Send OTP to email
  const sendOtp = async () => {
    if (!form.name || !form.email || !form.password) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      alert(data.message || 'OTP sent successfully');
      setCurrentStep(2); // Move to OTP input step
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send OTP';
      alert(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!form.otp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: form.email,
        otp: form.otp,
      });
      localStorage.setItem('token', data.token); // Save JWT
      alert('✅ Registration successful!');
      navigate('/home'); // Redirect to home/dashboard
    } catch (err) {
      const message = err?.response?.data?.message || 'Verification failed';
      alert(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        <h2 style={styles.title}>🍔 Canteen Registration</h2>
        <p style={styles.subtitle}>Join us for delicious meals!</p>

        {currentStep === 1 ? (
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter your full name"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="Enter your email"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create a password"
                style={styles.input}
              />
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
            >
              {loading ? '📧 Sending OTP...' : '📧 Send OTP'}
            </button>
          </div>
        ) : (
          <div style={styles.form}>
            <div style={styles.otpSection}>
              <p style={styles.otpText}>We've sent a 6-digit OTP to your email</p>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter OTP</label>
                <input
                  name="otp"
                  type="text"
                  value={form.otp}
                  onChange={onChange}
                  placeholder="000000"
                  style={styles.otpInput}
                  maxLength="6"
                />
              </div>
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              style={{ ...styles.button, backgroundColor: '#28a745', ...(loading ? styles.buttonDisabled : {}) }}
            >
              {loading ? '🔄 Verifying...' : '✅ Verify & Register'}
            </button>

            <button
              onClick={() => setCurrentStep(1)}
              style={styles.backButton}
            >
              ← Back to Details
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <a href="/login" style={styles.link}>Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: "url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '20px',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 0,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    padding: '40px 30px',
    borderRadius: '20px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.3)',
    textAlign: 'center',
    zIndex: 1,
    position: 'relative',
  },
  title: {
    marginBottom: '8px',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  subtitle: {
    marginBottom: '30px',
    fontSize: '16px',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e1e5e9',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  otpSection: {
    marginBottom: '20px',
  },
  otpText: {
    marginBottom: '15px',
    fontSize: '14px',
    color: '#666',
  },
  otpInput: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e1e5e9',
    fontSize: '18px',
    textAlign: 'center',
    letterSpacing: '4px',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff6b6b, #f06595)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '10px',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },
  backButton: {
    width: '100%',
    padding: '12px',
    border: '2px solid #ff6b6b',
    borderRadius: '12px',
    background: 'transparent',
    color: '#ff6b6b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '15px',
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e1e5e9',
  },
  footerText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  link: {
    color: '#ff6b6b',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
