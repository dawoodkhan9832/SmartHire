import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallenges } from '../services/api';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchChallenges(); }, []);

  const fetchChallenges = async () => {
    try {
      const res = await getChallenges();
      setChallenges(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const filtered = challenges.filter(c => {
    const matchDiff = filter === 'All' || c.difficulty === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchDiff && matchSearch;
  });

  const counts = {
    All: challenges.length,
    Easy: challenges.filter(c => c.difficulty === 'Easy').length,
    Medium: challenges.filter(c => c.difficulty === 'Medium').length,
    Hard: challenges.filter(c => c.difficulty === 'Hard').length,
  };

  const diffStyle = (diff) => {
    if (diff === 'Easy') return { color: '#3fb950', bg: '#3fb95015' };
    if (diff === 'Medium') return { color: '#d29922', bg: '#d2992215' };
    return { color: '#f85149', bg: '#f8514915' };
  };

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand} onClick={() => navigate('/dashboard')}>
          <div style={s.logo}>S</div>
          <span style={s.brandName}>SmartHire</span>
        </div>
        <nav style={s.nav}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Challenges', path: '/challenges', active: true },
            { label: 'Quiz', path: '/quiz' },
            { label: 'Leaderboard', path: '/leaderboard' },
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
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Challenges</h1>
            <p style={s.subtitle}>{challenges.length} problems available</p>
          </div>
          <input
            placeholder="🔍  Search problems..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...s.searchInput, width: '280px' }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={s.filterRow}>
          {['All', 'Easy', 'Medium', 'Hard'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              ...s.filterBtn,
              ...(filter === f ? s.filterActive : {}),
              ...(f !== 'All' && filter === f ? { color: diffStyle(f).color, borderColor: diffStyle(f).color } : {})
            }}>
              {f}
              <span style={{
                ...s.filterCount,
                backgroundColor: filter === f ? '#30363d' : '#21262d'
              }}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div style={s.tableHeader}>
          <span style={{ flex: 1 }}>Title</span>
          <span style={{ width: '100px', textAlign: 'center' }}>Difficulty</span>
          <span style={{ width: '80px', textAlign: 'center' }}>Points</span>
          <span style={{ width: '120px', textAlign: 'center' }}>Action</span>
        </div>

        {/* Challenges List */}
        {loading ? (
          <div style={s.empty}>Loading challenges...</div>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No challenges found.</div>
        ) : (
          filtered.map((c, i) => {
            const diff = diffStyle(c.difficulty);
            return (
              <div key={c._id} style={{
                ...s.row,
                backgroundColor: i % 2 === 0 ? '#161b22' : '#0d1117'
              }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#21262d'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#161b22' : '#0d1117'}
              >
                <span style={{ flex: 1, fontSize: '14px', color: '#e6edf3', fontWeight: '500' }}>
                  {i + 1}. {c.title}
                </span>
                <span style={{ width: '100px', textAlign: 'center' }}>
                  <span style={{
                    backgroundColor: diff.bg, color: diff.color,
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: '600'
                  }}>
                    {c.difficulty}
                  </span>
                </span>
                <span style={{
                  width: '80px', textAlign: 'center',
                  fontSize: '13px', color: '#f0883e', fontWeight: '600'
                }}>
                  {c.maxScore}
                </span>
                <span style={{ width: '120px', textAlign: 'center' }}>
                  <button
                    onClick={() => navigate(`/challenges/${c._id}`)}
                    style={s.solveBtn}
                  >
                    Solve →
                  </button>
                </span>
              </div>
            );
          })
        )}
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
  brand: {
    display: 'flex', alignItems: 'center', gap: '10px',
    cursor: 'pointer', paddingLeft: '8px'
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
    fontWeight: '500', textAlign: 'left', cursor: 'pointer'
  },
  navActive: { backgroundColor: '#21262d', color: '#e6edf3' },
  main: { marginLeft: '240px', flex: 1, padding: '32px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px'
  },
  title: { fontSize: '24px', fontWeight: '700', color: '#e6edf3', marginBottom: '4px' },
  subtitle: { fontSize: '14px', color: '#8b949e' },
  searchInput: {
    backgroundColor: '#161b22', border: '1px solid #30363d',
    borderRadius: '8px', padding: '10px 16px', color: '#e6edf3',
    fontSize: '14px', outline: 'none'
  },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '20px' },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 16px', borderRadius: '8px',
    border: '1px solid #30363d', backgroundColor: 'transparent',
    color: '#8b949e', fontSize: '14px', fontWeight: '500', cursor: 'pointer'
  },
  filterActive: { backgroundColor: '#21262d', color: '#e6edf3', borderColor: '#484f58' },
  filterCount: {
    fontSize: '12px', padding: '1px 7px', borderRadius: '10px', color: '#8b949e'
  },
  tableHeader: {
    display: 'flex', alignItems: 'center', padding: '12px 20px',
    fontSize: '12px', color: '#8b949e', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '0.05em',
    borderBottom: '1px solid #30363d', marginBottom: '4px'
  },
  row: {
    display: 'flex', alignItems: 'center', padding: '14px 20px',
    borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.15s'
  },
  solveBtn: {
    backgroundColor: 'transparent', border: '1px solid #30363d',
    color: '#58a6ff', padding: '6px 14px', borderRadius: '6px',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  empty: { textAlign: 'center', color: '#484f58', padding: '48px', fontSize: '15px' }
};

export default Challenges;