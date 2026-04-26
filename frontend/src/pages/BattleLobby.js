
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function BattleLobby() {
  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') 
  || 'http://localhost:5000';
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCode, setCreatedCode] = useState('');

  const token = localStorage.getItem('token');

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/battle/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedCode(data.roomCode);
        setMode('waiting');
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (err) {
      setError('Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/battle/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomCode: roomCode.trim().toUpperCase() })
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/battle/${data.roomCode}`);
      } else {
        setError(data.message || 'Failed to join room');
      }
    } catch (err) {
      setError('Server error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnterRoom = () => {
    navigate(`/battle/${createdCode}`);
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.navLogo}>SmartHire</h1>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </nav>

      <div style={styles.main}>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>⚔️ 1v1 Battle Mode</h2>
          <p style={styles.subtitle}>
            Challenge a friend to a real-time coding battle!
          </p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Waiting for friend screen */}
        {mode === 'waiting' && createdCode ? (
          <div style={styles.waitingCard}>
            <div style={styles.waitingIcon}>⏳</div>
            <h3 style={styles.waitingTitle}>Room Created!</h3>
            <p style={styles.waitingDesc}>
              Share this code with your friend:
            </p>
            <div style={styles.codeBox}>
              <span style={styles.codeText}>{createdCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(createdCode);
                  alert('Code copied!');
                }}
                style={styles.copyBtn}
              >
                Copy
              </button>
            </div>
            <p style={styles.waitingNote}>
              Once your friend joins with this code, click Enter Room to start!
            </p>
            <button onClick={handleEnterRoom} style={styles.enterBtn}>
              Enter Battle Room →
            </button>
          </div>
        ) : (
          /* Mode Selection */
          <div style={styles.modeGrid}>

            {/* Create Room Card */}
            <div style={styles.modeCard}>
              <div style={styles.modeIcon}>🏆</div>
              <h3 style={styles.modeTitle}>Create Room</h3>
              <p style={styles.modeDesc}>
                Create a new battle room and invite a friend with a room code
              </p>
              <div style={styles.stepsList}>
                <p style={styles.step}>1. Click Create Room</p>
                <p style={styles.step}>2. Share the 6-digit code</p>
                <p style={styles.step}>3. Wait for friend to join</p>
                <p style={styles.step}>4. Battle starts automatically!</p>
              </div>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                style={styles.createBtn}
              >
                {loading ? 'Creating...' : '🚀 Create Room'}
              </button>
            </div>

            {/* Join Room Card */}
            <div style={styles.modeCard}>
              <div style={styles.modeIcon}>🎯</div>
              <h3 style={styles.modeTitle}>Join Room</h3>
              <p style={styles.modeDesc}>
                Enter a room code shared by your friend to join their battle
              </p>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Enter Room Code</label>
                <input
                  style={styles.codeInput}
                  placeholder="e.g. ABC123"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                style={styles.joinBtn}
              >
                {loading ? 'Joining...' : '⚡ Join Room'}
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div style={styles.howItWorks}>
          <h3 style={styles.howTitle}>How Battle Mode Works</h3>
          <div style={styles.howGrid}>
            {[
              { icon: '👥', text: 'Two players, same problem' },
              { icon: '⏱️', text: '30 minute time limit' },
              { icon: '🏆', text: 'First to pass all tests wins' },
              { icon: '⭐', text: 'Winner earns bonus points' },
            ].map((item, i) => (
              <div key={i} style={styles.howItem}>
                <span style={styles.howIcon}>{item.icon}</span>
                <span style={styles.howText}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
  minHeight: '100vh',
  backgroundColor: '#0a0a0a',
  color: 'white'
  },
  navbar: {
  backgroundColor: '#1a1a1a',
  borderBottom: '1px solid #2a2a2a',
  padding: '0 32px',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
  },
  navLogo: { color: 'white', fontSize: '24px', fontWeight: '700' },
  backBtn: {
    backgroundColor: 'transparent', color: 'white',
    border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px',
    borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  },
  main: { maxWidth: '900px', margin: '0 auto', padding: '32px 16px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '36px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  subtitle: { color: '#6b7280', fontSize: '18px' },
  error: {
    backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px',
    borderRadius: '8px', marginBottom: '20px',
    textAlign: 'center', fontWeight: '600'
  },
  modeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' },
  modeCard: {
    backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '16px'
  },
  modeIcon: { fontSize: '48px' },
  modeTitle: { fontSize: '22px', fontWeight: '700', color: '#1f2937' },
  modeDesc: { color: '#6b7280', fontSize: '15px', lineHeight: '1.6' },
  stepsList: {
    backgroundColor: '#f9fafb', borderRadius: '8px',
    padding: '16px', textAlign: 'left'
  },
  step: { color: '#374151', fontSize: '14px', marginBottom: '6px' },
  createBtn: {
    backgroundColor: '#4f46e5', color: 'white', border: 'none',
    padding: '14px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '16px', fontWeight: '700', marginTop: 'auto'
  },
  inputGroup: { textAlign: 'left' },
  inputLabel: {
    display: 'block', fontSize: '14px', fontWeight: '600',
    color: '#374151', marginBottom: '8px'
  },
  codeInput: {
    width: '100%', padding: '14px', borderRadius: '8px',
    border: '2px solid #e5e7eb', fontSize: '24px', fontWeight: '700',
    textAlign: 'center', letterSpacing: '8px', color: '#4f46e5',
    boxSizing: 'border-box'
  },
  joinBtn: {
    backgroundColor: '#10b981', color: 'white', border: 'none',
    padding: '14px 24px', borderRadius: '10px', cursor: 'pointer',
    fontSize: '16px', fontWeight: '700', width: '100%', marginTop: 'auto'
  },
  waitingCard: {
    backgroundColor: 'white', borderRadius: '20px', padding: '48px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '32px'
  },
  waitingIcon: { fontSize: '64px', marginBottom: '16px' },
  waitingTitle: { fontSize: '28px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  waitingDesc: { color: '#6b7280', fontSize: '16px', marginBottom: '20px' },
  codeBox: {
    display: 'inline-flex', alignItems: 'center', gap: '16px',
    backgroundColor: '#f0f4ff', border: '2px solid #4f46e5',
    borderRadius: '12px', padding: '16px 32px', marginBottom: '20px'
  },
  codeText: {
    fontSize: '40px', fontWeight: '700', color: '#4f46e5', letterSpacing: '8px'
  },
  copyBtn: {
    backgroundColor: '#4f46e5', color: 'white', border: 'none',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  },
  waitingNote: { color: '#6b7280', fontSize: '14px', marginBottom: '24px' },
  enterBtn: {
    backgroundColor: '#4f46e5', color: 'white', border: 'none',
    padding: '16px 40px', borderRadius: '12px', cursor: 'pointer',
    fontSize: '18px', fontWeight: '700'
  },
  howItWorks: {
    backgroundColor: 'white', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  howTitle: { fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' },
  howGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  howItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '8px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px'
  },
  howIcon: { fontSize: '28px' },
  howText: { fontSize: '13px', color: '#374151', textAlign: 'center', fontWeight: '500' }
};

export default BattleLobby;