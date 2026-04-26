import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLeaderboard, getMySubmissions } from '../services/api';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [userRank, setUserRank] = useState('-');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const lb = await getLeaderboard();
      setLeaderboard(lb.data);
      const rank = lb.data.findIndex(u => u._id === user?.id) + 1;
      setUserRank(rank || '-');
      const sub = await getMySubmissions();
      setSubmissions(sub.data);
    } catch (err) { console.log(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', active: true },
    { label: 'Challenges', path: '/challenges' },
    { label: 'Quiz', path: '/quiz' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: '⚔️ Battle', path: '/battle' },
    { label: 'AI Feedback', path: '/feedback' },
  ];

  const quickActions = [
    { icon: '💻', title: 'Challenges', desc: 'Solve coding problems', path: '/challenges', color: '#58a6ff' },
    { icon: '🧠', title: 'Quiz', desc: 'Test your knowledge', path: '/quiz', color: '#3fb950' },
    { icon: '⚔️', title: '1v1 Battle', desc: 'Challenge a friend', path: '/battle', color: '#f0883e' },
    { icon: '🏆', title: 'Leaderboard', desc: 'See your rank', path: '/leaderboard', color: '#bc8cff' },
    { icon: '🤖', title: 'AI Feedback', desc: 'Get AI analysis', path: '/feedback', color: '#d29922' },
  ];

  const getBadgeColor = (badge) => {
    const c = { 'Beginner': '#3fb950', 'Intermediate': '#58a6ff', 'Advanced': '#bc8cff', 'Placement Ready': '#f0883e' };
    return c[badge] || '#8b949e';
  };

  return (
    <div style={s.page}>

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.brand} onClick={() => navigate('/dashboard')}>
            <div style={s.logo}>S</div>
            <span style={s.brandName}>SmartHire</span>
          </div>
          <nav style={s.nav}>
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...s.navItem,
                  ...(item.active ? s.navItemActive : {})
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={s.sidebarBottom}>
          <div style={s.userInfo}>
            <div style={s.userAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={s.userName}>{user?.name}</p>
              <p style={s.userRole}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={s.main}>

        {/* Top bar */}
        <div style={s.topBar}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Welcome back, {user?.name}!</p>
          </div>
          <div style={s.topBarRight}>
            {user?.badges?.slice(-1).map((b, i) => (
              <span key={i} style={{ ...s.badgePill, backgroundColor: getBadgeColor(b) + '20', color: getBadgeColor(b), border: `1px solid ${getBadgeColor(b)}40` }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            { label: 'Total Score', value: user?.totalScore || 0, color: '#f0883e', icon: '⭐' },
            { label: 'Global Rank', value: `#${userRank}`, color: '#bc8cff', icon: '🏆' },
            { label: 'Submissions', value: submissions.length, color: '#58a6ff', icon: '📝' },
            { label: 'Badges', value: user?.badges?.length || 0, color: '#3fb950', icon: '🎖️' },
          ].map((stat, i) => (
            <div key={i} style={s.statCard}>
              <div style={s.statTop}>
                <span style={s.statIcon}>{stat.icon}</span>
                <span style={{ ...s.statValue, color: stat.color }}>{stat.value}</span>
              </div>
              <p style={s.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div style={s.contentGrid}>

          {/* Quick Actions */}
          <div>
            <h2 style={s.sectionTitle}>Quick Actions</h2>
            <div style={s.actionsGrid}>
              {quickActions.map((action, i) => (
                <div
                  key={i}
                  style={s.actionCard}
                  onClick={() => navigate(action.path)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#30363d'}
                >
                  <span style={s.actionIcon}>{action.icon}</span>
                  <div>
                    <p style={s.actionTitle}>{action.title}</p>
                    <p style={s.actionDesc}>{action.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Badges */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Your Badges</h3>
              {user?.badges?.length > 0 ? (
                <div style={s.badgesRow}>
                  {user.badges.map((badge, i) => (
                    <span key={i} style={{
                      ...s.badgePill,
                      backgroundColor: getBadgeColor(badge) + '20',
                      color: getBadgeColor(badge),
                      border: `1px solid ${getBadgeColor(badge)}40`,
                      fontSize: '13px',
                      padding: '6px 14px'
                    }}>
                      {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={s.emptyText}>Solve challenges to earn badges!</p>
              )}
            </div>

            {/* Recent Submissions */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Recent Submissions</h3>
              {submissions.length > 0 ? (
                submissions.slice(0, 5).map((sub, i) => (
                  <div key={i} style={s.subRow}>
                    <span style={{
                      ...s.subStatus,
                      color: sub.status === 'passed' ? '#3fb950' : sub.status === 'partial' ? '#d29922' : '#f85149',
                      backgroundColor: sub.status === 'passed' ? '#3fb95015' : sub.status === 'partial' ? '#d2992215' : '#f8514915'
                    }}>
                      {sub.status === 'passed' ? '✓' : sub.status === 'partial' ? '~' : '✗'}
                    </span>
                    <span style={s.subTitle}>
                      {sub.challengeId?.title || 'Challenge'}
                    </span>
                    <span style={s.subScore}>{sub.score} pts</span>
                  </div>
                ))
              ) : (
                <p style={s.emptyText}>No submissions yet. Try a challenge!</p>
              )}
            </div>

            {/* Top Players */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>Top Players</h3>
              {leaderboard.slice(0, 5).map((player, i) => (
                <div key={i} style={s.playerRow}>
                  <span style={{
                    ...s.playerRank,
                    color: i === 0 ? '#f0883e' : i === 1 ? '#8b949e' : i === 2 ? '#d29922' : '#484f58'
                  }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div style={s.playerAvatar2}>
                    {player.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    ...s.playerName,
                    color: player._id === user?.id ? '#f0883e' : '#e6edf3'
                  }}>
                    {player.name} {player._id === user?.id ? '(You)' : ''}
                  </span>
                  <span style={s.playerScore}>{player.totalScore} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#0d1117' },
  sidebar: {
    width: '240px', backgroundColor: '#161b22', borderRight: '1px solid #30363d',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '24px 16px', position: 'fixed', height: '100vh', overflowY: 'auto'
  },
  sidebarTop: { display: 'flex', flexDirection: 'column', gap: '32px' },
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', paddingLeft: '8px'
  },
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
    fontWeight: '500', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s'
  },
  navItemActive: { backgroundColor: '#21262d', color: '#e6edf3' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: '12px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#21262d', borderRadius: '8px' },
  userAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #f0883e, #e07830)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#0d1117', flexShrink: 0
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#e6edf3', marginBottom: '2px' },
  userRole: { fontSize: '11px', color: '#8b949e', textTransform: 'capitalize' },
  logoutBtn: {
    width: '100%', padding: '8px', border: '1px solid #30363d', borderRadius: '8px',
    backgroundColor: 'transparent', color: '#8b949e', fontSize: '13px', cursor: 'pointer'
  },
  main: { marginLeft: '240px', flex: 1, padding: '32px', maxWidth: 'calc(100vw - 240px)' },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px'
  },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#e6edf3', marginBottom: '4px' },
  pageSubtitle: { fontSize: '14px', color: '#8b949e' },
  topBarRight: { display: 'flex', gap: '8px', alignItems: 'center' },
  badgePill: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' },
  statCard: {
    backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '20px'
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statIcon: { fontSize: '20px' },
  statValue: { fontSize: '28px', fontWeight: '700' },
  statLabel: { fontSize: '13px', color: '#8b949e' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#e6edf3', marginBottom: '16px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  actionCard: {
    backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '12px',
    padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center',
    gap: '14px', transition: 'border-color 0.2s'
  },
  actionIcon: { fontSize: '28px', flexShrink: 0 },
  actionTitle: { fontSize: '14px', fontWeight: '600', color: '#e6edf3', marginBottom: '2px' },
  actionDesc: { fontSize: '12px', color: '#8b949e' },
  card: {
    backgroundColor: '#161b22', border: '1px solid #30363d',
    borderRadius: '12px', padding: '20px'
  },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#e6edf3', marginBottom: '16px' },
  badgesRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  emptyText: { fontSize: '13px', color: '#484f58', textAlign: 'center', padding: '16px 0' },
  subRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 0', borderBottom: '1px solid #21262d'
  },
  subStatus: {
    width: '24px', height: '24px', borderRadius: '6px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '13px',
    fontWeight: '700', flexShrink: 0
  },
  subTitle: { flex: 1, fontSize: '13px', color: '#e6edf3' },
  subScore: { fontSize: '13px', color: '#f0883e', fontWeight: '600' },
  playerRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 0', borderBottom: '1px solid #21262d'
  },
  playerRank: { width: '28px', fontSize: '16px', textAlign: 'center' },
  playerAvatar2: {
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: '#21262d', color: '#8b949e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', flexShrink: 0
  },
  playerName: { flex: 1, fontSize: '13px', fontWeight: '500' },
  playerScore: { fontSize: '13px', color: '#8b949e' }
};

export default Dashboard;