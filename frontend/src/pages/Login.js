import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left Panel */}
      <div style={s.leftPanel}>
        <div style={s.brand}>
          <div style={s.logo}>S</div>
          <span style={s.brandName}>SmartHire</span>
        </div>
        <h1 style={s.headline}>
          Master coding.<br />
          <span style={s.highlight}>Get placed.</span>
        </h1>
        <p style={s.subtext}>
          Practice with real interview problems, compete in live battles, and track your growth — all in one platform.
        </p>
        <div style={s.statsRow}>
          {[
            { val: '500+', label: 'Challenges' },
            { val: '1v1', label: 'Battle Mode' },
            { val: 'AI', label: 'Feedback' },
          ].map((s2, i) => (
            <div key={i} style={s.statItem}>
              <span style={s.statVal}>{s2.val}</span>
              <span style={s.statLabel}>{s2.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.rightPanel}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Welcome back</h2>
          <p style={s.formSubtitle}>Sign in to your account</p>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={s.field}>
              <label style={s.label}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={s.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={s.switchLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    backgroundColor: '#0d1117'
  },
  leftPanel: {
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRight: '1px solid #30363d',
    background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '48px'
  },
  logo: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0d1117'
  },
  brandName: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#e6edf3'
  },
  headline: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#e6edf3',
    lineHeight: '1.2',
    marginBottom: '16px'
  },
  highlight: {
    color: '#f0883e'
  },
  subtext: {
    fontSize: '16px',
    color: '#8b949e',
    lineHeight: '1.7',
    marginBottom: '40px',
    maxWidth: '400px'
  },
  statsRow: {
    display: 'flex',
    gap: '32px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statVal: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f0883e'
  },
  statLabel: {
    fontSize: '13px',
    color: '#8b949e'
  },
  rightPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    backgroundColor: '#0d1117'
  },
  formBox: {
    width: '100%',
    maxWidth: '400px'
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#e6edf3',
    marginBottom: '8px'
  },
  formSubtitle: {
    fontSize: '15px',
    color: '#8b949e',
    marginBottom: '32px'
  },
  errorBox: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    color: '#f85149',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  errorIcon: { marginRight: '8px' },
  field: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#8b949e',
    marginBottom: '8px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    color: '#0d1117',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    marginTop: '8px',
    marginBottom: '24px'
  },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#8b949e'
  },
  switchLink: {
    color: '#f0883e',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Login;