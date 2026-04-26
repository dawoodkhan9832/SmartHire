import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import { AuthContext } from '../context/AuthContext';

function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(r => { setLeaderboard(r.data); setLoading(false); }).catch(console.log);
  }, []);

  const myRank = leaderboard.findIndex(u => u.name === user?.name) + 1;

  const getBadgeColor = (badge) => {
    const c = { 'Beginner': '#3fb950', 'Intermediate': '#58a6ff', 'Advanced': '#bc8cff', 'Placement Ready': '#f0883e' };
    return c[badge] || '#8b949e';
  };

  const rankStyle = (i) => {
    if (i === 0) return { color: '#f0883e', label: '🥇' };
    if (i === 1) return { color: '#8b949e', label: '🥈' };
    if (i === 2) return { color: '#d29922', label: '🥉' };
    return { color: '#484f58', label: `#${i + 1}` };
  };

  return (
    <div style={s.page}>
      <aside style={s.sidebar}>
        <div style={s.brand} onClick={() => navigate('/dashboard')}>
          <div style={s.logo}>S</div>
          <span style={s.brandName}>SmartHire</span>
        </div>
        <nav style={s.nav}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Challenges', path: '/challenges' },
            { label: 'Quiz', path: '/quiz' },
            { label: 'Leaderboard', path: '/leaderboard', active: true },
            { label: '⚔️ Battle', path: '/battle' },
            { label: 'AI Feedback', path: '/feedback' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ ...s.navItem, ...(item.active ? s.navActive : {}) }}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Leaderboard</h1>
            <p style={s.subtitle}>Top performers on SmartHire</p>
          </div>
          {myRank > 0 && (
            <div style={s.myRankCard}>
              <p style={s.myRankLabel}>Your Rank</p>
              <p style={s.myRankVal}>#{myRank}</p>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div style={s.podium}>
            {[1, 0, 2].map(idx => (
              <div key={idx} style={{ ...s.podiumItem, order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}>
                <div style={{
                  ...s.podiumAvatar,
                  width: idx === 0 ? '64px' : '52px',
                  height: idx === 0 ? '64px' : '52px',
                  fontSize: idx === 0 ? '26px' : '20px',
                  border: `2px solid ${idx === 0 ? '#f0883e' : idx === 1 ? '#8b949e' : '#d29922'}`
                }}>
                  {leaderboard[idx]?.name?.charAt(0).toUpperCase()}
                </div>
                <p style={{ fontSize: idx === 0 ? '28px' : '20px' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </p>
                <p style={{ ...s.podiumName, color: idx === 0 ? '#e6edf3' : '#8b949e' }}>
                  {leaderboard[idx]?.name}
                </p>
                <p style={{ ...s.podiumScore, color: idx === 0 ? '#f0883e' : '#8b949e' }}>
                  {leaderboard[idx]?.totalScore} pts
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Full Table */}
        <div style={s.table}>
          <div style={s.tableHeader}>
            <span style={{ width: '60px' }}>Rank</span>
            <span style={{ flex: 1 }}>Player</span>
            <span style={{ width: '150px' }}>Badges</span>
            <span style={{ width: '100px', textAlign: 'right' }}>Score</span>
          </div>
          {loading ? (
            <div style={s.empty}>Loading...</div>
          ) : (
            leaderboard.map((player, i) => {
              const rs = rankStyle(i);
              const isMe = player.name === user?.name;
              return (
                <div key={player._id} style={{
                  ...s.tableRow,
                  backgroundColor: isMe ? '#f0883e10' : 'transparent',
                  border: isMe ? '1px solid #f0883e30' : '1px solid transparent'
                }}>
                  <span style={{ width: '60px', fontSize: '18px', fontWeight: '700', color: rs.color }}>
                    {rs.label}
                  </span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      ...s.avatar,
                      backgroundColor: isMe ? '#f0883e20' : '#21262d',
                      color: isMe ? '#f0883e' : '#8b949e',
                      border: isMe ? '1px solid #f0883e40' : '1px solid #30363d'
                    }}>
                      {player.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: isMe ? '#f0883e' : '#e6edf3' }}>
                      {player.name} {isMe && <span style={{ fontSize: '12px', color: '#8b949e' }}>(You)</span>}
                    </span>
                  </div>
                  <div style={{ width: '150px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {player.badges?.map((b, j) => (
                      <span key={j} style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '10px',
                        backgroundColor: getBadgeColor(b) + '20',
                        color: getBadgeColor(b), fontWeight: '600'
                      }}>{b}</span>
                    ))}
                  </div>
                  <span style={{
                    width: '100px', textAlign: 'right',
                    fontSize: '15px', fontWeight: '700',
                    color: i === 0 ? '#f0883e' : '#e6edf3'
                  }}>
                    {player.totalScore}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#0d1117' },
  sidebar: {
    width: '240px', backgroundColor: '#161b22', borderRight: '1px solid #30363d',
    padding: '24px 16px', position: 'fixed', height: '100vh',
    display: 'flex', flexDirection: 'column', gap: '32px'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingLeft: '8px' },
  logo: {
    width: '36px', height: '36px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: '700', color: '#0d1117', flexShrink: 0
  },
  brandName: { fontSize: '18px', fontWeight: '700', color: '#e6edf3' },
  nav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: {
    width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none',
    backgroundColor: 'transparent', color: '#8b949e', fontSize: '14px',
    fontWeight: '500', textAlign: 'left', cursor: 'pointer'
  },
  navActive: { backgroundColor: '#21262d', color: '#e6edf3' },
  main: { marginLeft: '240px', flex: 1, padding: '32px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '32px'
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#e6edf3', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#8b949e' },
  myRankCard: {
    backgroundColor: '#f0883e15', border: '1px solid #f0883e40',
    borderRadius: '12px', padding: '16px 24px', textAlign: 'center'
  },
  myRankLabel: { fontSize: '12px', color: '#8b949e', marginBottom: '4px' },
  myRankVal: { fontSize: '28px', fontWeight: '700', color: '#f0883e' },
  podium: {
    display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
    gap: '24px', marginBottom: '32px', padding: '32px',
    backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid #30363d'
  },
  podiumItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  podiumAvatar: {
    borderRadius: '50%', backgroundColor: '#21262d',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', color: '#e6edf3'
  },
  podiumName: { fontSize: '14px', fontWeight: '600', color: '#e6edf3' },
  podiumScore: { fontSize: '13px', fontWeight: '600' },
  table: {
    backgroundColor: '#161b22', border: '1px solid #30363d',
    borderRadius: '12px', overflow: 'hidden'
  },
  tableHeader: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    fontSize: '12px', color: '#8b949e', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #30363d', backgroundColor: '#0d1117'
  },
  tableRow: {
    display: 'flex', alignItems: 'center', padding: '16px 20px',
    borderBottom: '1px solid #21262d', borderRadius: '4px', transition: 'background 0.15s'
  },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', flexShrink: 0
  },
  empty: { textAlign: 'center', color: '#484f58', padding: '48px' }
};

export default Leaderboard;