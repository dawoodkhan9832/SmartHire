import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser({ name, email, password, role: 'student' });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.leftPanel}>
        <div style={s.brand}>
          <div style={s.logo}>S</div>
          <span style={s.brandName}>SmartHire</span>
        </div>
        <h1 style={s.headline}>
          Start your journey<br />
          <span style={s.highlight}>today. It's free.</span>
        </h1>
        <p style={s.subtext}>
          Join thousands of students preparing for top placement interviews with real coding challenges and AI-powered feedback.
        </p>
        <div style={s.featureList}>
          {[
            '✓ 500+ coding challenges',
            '✓ MCQ quizzes for DBMS, OS, CN and more',
            '✓ Real-time 1v1 battle mode',
            '✓ AI performance feedback',
            '✓ Leaderboard & badges'
          ].map((f, i) => (
            <p key={i} style={s.featureItem}>{f}</p>
          ))}
        </div>
      </div>

      <div style={s.rightPanel}>
        <div style={s.formBox}>
          <h2 style={s.formTitle}>Create your account</h2>
          <p style={s.formSubtitle}>Free forever. No credit card needed.</p>

          {error && (
            <div style={s.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={s.field}>
              <label style={s.label}>Full name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Create a strong password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={s.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={s.switchLink}>Sign in</Link>
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
    display: 'flex', alignItems: 'center',
    gap: '12px', marginBottom: '48px'
  },
  logo: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '700', color: '#0d1117'
  },
  brandName: { fontSize: '22px', fontWeight: '700', color: '#e6edf3' },
  headline: {
    fontSize: '38px', fontWeight: '700', color: '#e6edf3',
    lineHeight: '1.2', marginBottom: '16px'
  },
  highlight: { color: '#f0883e' },
  subtext: {
    fontSize: '15px', color: '#8b949e', lineHeight: '1.7',
    marginBottom: '32px', maxWidth: '400px'
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  featureItem: { fontSize: '15px', color: '#3fb950', fontWeight: '500' },
  rightPanel: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '48px',
    backgroundColor: '#0d1117'
  },
  formBox: { width: '100%', maxWidth: '400px' },
  formTitle: {
    fontSize: '28px', fontWeight: '700',
    color: '#e6edf3', marginBottom: '8px'
  },
  formSubtitle: { fontSize: '15px', color: '#8b949e', marginBottom: '32px' },
  errorBox: {
    background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)',
    color: '#f85149', padding: '12px 16px', borderRadius: '8px',
    marginBottom: '20px', fontSize: '14px'
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '13px', fontWeight: '500',
    color: '#8b949e', marginBottom: '8px'
  },
  submitBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    color: '#0d1117', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: '700', marginTop: '8px', marginBottom: '24px'
  },
  switchText: { textAlign: 'center', fontSize: '14px', color: '#8b949e' },
  switchLink: { color: '#f0883e', fontWeight: '600', textDecoration: 'none' }
};

export default Register;