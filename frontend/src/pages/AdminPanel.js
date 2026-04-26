
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function AdminPanel() {
  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') 
  || 'http://localhost:5000';
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [mcqs, setMcqs] = useState([]);
  const [mcqFilter, setMcqFilter] = useState('All');
  const [mcqLoading, setMcqLoading] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [editChallengeForm, setEditChallengeForm] = useState(null);
  const [deleteChallengeConfirm, setDeleteChallengeConfirm] = useState(null);
  const [editChallengeMsg, setEditChallengeMsg] = useState('');
  const [challengeForm, setChallengeForm] = useState({
    title: '', description: '', difficulty: 'Easy',
    maxScore: 100, testCases: [{ input: '', output: '' }]
  });
  const [mcqForm, setMcqForm] = useState({
    question: '', options: { A: '', B: '', C: '', D: '' },
    correctAnswer: 'A', category: 'Aptitude', difficulty: 'Easy'
  });
  const [challengeMsg, setChallengeMsg] = useState('');
  const [mcqMsg, setMcqMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    if (activeTab === 'viewQuestions') fetchAllMCQs();
  }, [activeTab, mcqFilter]);
  useEffect(() => {
    if (activeTab === 'viewChallenges') fetchAllChallenges();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) { console.log(err); }
    finally { setStatsLoading(false); }
  };

  const fetchAllMCQs = async () => {
    setMcqLoading(true);
    try {
      const url = mcqFilter === 'All'
        ? 'http://localhost:5000/api/mcqs/admin/all'
        : `http://localhost:5000/api/mcqs/admin/all?category=${mcqFilter}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setMcqs(data);
    } catch (err) { console.log(err); }
    finally { setMcqLoading(false); }
  };

  const fetchAllChallenges = async () => {
    setChallengeLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/challenges/admin/all',
        { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setChallenges(data);
    } catch (err) { console.log(err); }
    finally { setChallengeLoading(false); }
  };

  const handleDeleteMCQ = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mcqs/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { setMcqs(mcqs.filter(m => m._id !== id)); setDeleteConfirm(null); fetchStats(); }
    } catch (err) { console.log(err); }
  };

  const handleEditMCQClick = (mcq) => {
    setEditingMCQ(mcq._id);
    setEditForm({ question: mcq.question, options: { ...mcq.options }, correctAnswer: mcq.correctAnswer, category: mcq.category, difficulty: mcq.difficulty });
    setEditMsg('');
  };

  const handleEditMCQSave = async () => {
    setLoading(true); setEditMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/mcqs/${editingMCQ}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) { setEditMsg('✅ Updated!'); setEditingMCQ(null); fetchAllMCQs(); }
      else { setEditMsg('❌ ' + data.message); }
    } catch (err) { setEditMsg('❌ Error'); }
    finally { setLoading(false); }
  };

  const handleDeleteChallenge = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/challenges/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { setChallenges(challenges.filter(c => c._id !== id)); setDeleteChallengeConfirm(null); fetchStats(); }
    } catch (err) { console.log(err); }
  };

  const handleEditChallengeClick = (ch) => {
    setEditingChallenge(ch._id);
    setEditChallengeForm({ title: ch.title, description: ch.description, difficulty: ch.difficulty, maxScore: ch.maxScore, testCases: ch.testCases || [] });
    setEditChallengeMsg('');
  };

  const handleEditChallengeSave = async () => {
    setLoading(true); setEditChallengeMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/challenges/${editingChallenge}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editChallengeForm)
      });
      const data = await res.json();
      if (res.ok) { setEditChallengeMsg('✅ Updated!'); setEditingChallenge(null); fetchAllChallenges(); }
      else { setEditChallengeMsg('❌ ' + data.message); }
    } catch (err) { setEditChallengeMsg('❌ Error'); }
    finally { setLoading(false); }
  };

  const handleChallengeSubmit = async () => {
    setLoading(true); setChallengeMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(challengeForm)
      });
      const data = await res.json();
      if (res.ok) { setChallengeMsg('✅ Challenge created!'); setChallengeForm({ title: '', description: '', difficulty: 'Easy', maxScore: 100, testCases: [{ input: '', output: '' }] }); fetchStats(); }
      else { setChallengeMsg('❌ ' + data.message); }
    } catch (err) { setChallengeMsg('❌ Error'); }
    finally { setLoading(false); }
  };

  const handleMCQSubmit = async () => {
    setLoading(true); setMcqMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(mcqForm)
      });
      const data = await res.json();
      if (res.ok) { setMcqMsg('✅ MCQ created!'); setMcqForm({ question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', category: 'Aptitude', difficulty: 'Easy' }); fetchStats(); }
      else { setMcqMsg('❌ ' + data.message); }
    } catch (err) { setMcqMsg('❌ Error'); }
    finally { setLoading(false); }
  };

  const addTestCase = () => setChallengeForm({ ...challengeForm, testCases: [...challengeForm.testCases, { input: '', output: '' }] });
  const updateTestCase = (i, field, value) => { const u = [...challengeForm.testCases]; u[i][field] = value; setChallengeForm({ ...challengeForm, testCases: u }); };
  const handleLogout = () => { logout(); navigate('/login'); };

  const categories = ['Aptitude', 'DBMS', 'OS', 'OOPS', 'CN'];
  const catColors = { Aptitude: '#8b5cf6', DBMS: '#3b82f6', OS: '#00b8a3', OOPS: '#f0a500', CN: '#ef4444' };
  const diffColors = { Easy: '#00b8a3', Medium: '#f0a500', Hard: '#ef4444' };

  const sidebarItems = [
    { id: 'stats', icon: '📊', label: 'Overview' },
    { id: 'challenges', icon: '➕', label: 'Add Challenge' },
    { id: 'mcq', icon: '➕', label: 'Add MCQ' },
    { id: 'viewChallenges', icon: '💻', label: 'Challenges' },
    { id: 'viewQuestions', icon: '📋', label: 'Questions' },
  ];

  return (
    <div style={s.container}>

      {/* ── SIDEBAR ── */}
      <div style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.sidebarBrand}>
            <span style={s.brandLogo}>⚡</span>
            <div>
              <p style={s.brandName}>SmartHire</p>
              <p style={s.brandRole}>Admin Console</p>
            </div>
          </div>

          <div style={s.adminProfile}>
            <div style={s.adminAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={s.adminName}>{user?.name}</p>
              <p style={s.adminRoleTag}>Administrator</p>
            </div>
          </div>

          <nav style={s.sidebarNav}>
            <p style={s.navSection}>MANAGEMENT</p>
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...s.navItem,
                  backgroundColor: activeTab === item.id
                    ? '#f0a50015' : 'transparent',
                  color: activeTab === item.id
                    ? '#f0a500' : '#8b8b8b',
                  borderLeft: activeTab === item.id
                    ? '3px solid #f0a500' : '3px solid transparent'
                }}
              >
                <span style={s.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={s.sidebarBottom}>
          <button
            onClick={() => navigate('/dashboard')}
            style={s.viewStudentBtn}
          >
            👤 Student View
          </button>
          <button onClick={handleLogout} style={s.logoutBtn}>
            ← Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={s.main}>

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div style={s.content}>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Platform Overview</h1>
              <p style={s.pageSubtitle}>
                Real-time statistics and performance metrics
              </p>
            </div>

            {statsLoading ? (
              <p style={s.loadingText}>Loading stats...</p>
            ) : (
              <>
                {/* Stats Grid */}
                <div style={s.statsGrid}>
                  {[
                    { label: 'Total Students', value: stats?.totalUsers || 0, icon: '👥', color: '#3b82f6', change: '+12%' },
                    { label: 'Challenges', value: stats?.totalChallenges || 0, icon: '💻', color: '#00b8a3', change: '+3' },
                    { label: 'MCQ Questions', value: stats?.totalMCQs || 0, icon: '🧠', color: '#8b5cf6', change: '+28' },
                    { label: 'Submissions', value: stats?.totalSubmissions || 0, icon: '📝', color: '#f0a500', change: '+45%' },
                    { label: 'Avg Score', value: stats?.avgScore || 0, icon: '⭐', color: '#ef4444', change: '↑ 12pts' },
                  ].map((stat, i) => (
                    <div key={i} style={{
                      ...s.statCard,
                      borderTop: `3px solid ${stat.color}`
                    }}>
                      <div style={s.statCardTop}>
                        <span style={s.statIcon}>{stat.icon}</span>
                        <span style={{
                          ...s.statChange,
                          color: stat.color
                        }}>
                          {stat.change}
                        </span>
                      </div>
                      <p style={{ ...s.statValue, color: stat.color }}>
                        {stat.value}
                      </p>
                      <p style={s.statLabel}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tables Row */}
                <div style={s.tablesRow}>
                  {/* Top Students */}
                  <div style={s.tableCard}>
                    <div style={s.tableHeader}>
                      <h3 style={s.tableTitle}>🏆 Top Students</h3>
                      <span style={s.tableBadge}>Top 5</span>
                    </div>
                    {stats?.topStudents?.map((student, i) => (
                      <div key={i} style={s.tableRow}>
                        <span style={{
                          ...s.tableRank,
                          color: i === 0 ? '#f0a500' :
                            i === 1 ? '#8b8b8b' : '#cd7f32'
                        }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>
                        <div style={s.tableAvatar}>
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={s.tableName}>{student.name}</span>
                        <div style={s.tableBadges}>
                          {student.badges?.slice(0, 1).map((b, j) => (
                            <span key={j} style={{
                              ...s.badge,
                              backgroundColor: '#f0a50020',
                              color: '#f0a500',
                              border: '1px solid #f0a50040'
                            }}>
                              {b}
                            </span>
                          ))}
                        </div>
                        <span style={s.tableScore}>
                          {student.totalScore} pts
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Students */}
                  <div style={s.tableCard}>
                    <div style={s.tableHeader}>
                      <h3 style={s.tableTitle}>🆕 Recent Students</h3>
                      <span style={s.tableBadge}>Latest</span>
                    </div>
                    {stats?.recentUsers?.map((u, i) => (
                      <div key={i} style={s.tableRow}>
                        <div style={s.tableAvatar}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={s.tableName}>{u.name}</p>
                          <p style={s.tableEmail}>{u.email}</p>
                        </div>
                        <span style={s.tableScore}>{u.totalScore} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ADD CHALLENGE TAB ── */}
        {activeTab === 'challenges' && (
          <div style={s.content}>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Create Challenge</h1>
              <p style={s.pageSubtitle}>Add a new coding challenge for students</p>
            </div>

            <div style={s.formCard}>
              {challengeMsg && (
                <div style={{
                  ...s.msgBox,
                  backgroundColor: challengeMsg.includes('✅') ? '#00b8a310' : '#ef444410',
                  borderColor: challengeMsg.includes('✅') ? '#00b8a340' : '#ef444440',
                  color: challengeMsg.includes('✅') ? '#00b8a3' : '#ef4444'
                }}>
                  {challengeMsg}
                </div>
              )}

              <div style={s.formGrid2}>
                <div style={s.formGroup}>
                  <label style={s.label}>Challenge Title</label>
                  <input style={s.input}
                    placeholder="e.g. Two Sum Problem"
                    value={challengeForm.title}
                    onChange={e => setChallengeForm({ ...challengeForm, title: e.target.value })}
                  />
                </div>
                <div style={s.formRow}>
                  <div style={s.formGroup}>
                    <label style={s.label}>Difficulty</label>
                    <select style={s.select} value={challengeForm.difficulty}
                      onChange={e => setChallengeForm({ ...challengeForm, difficulty: e.target.value })}>
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                  <div style={s.formGroup}>
                    <label style={s.label}>Max Score</label>
                    <input style={s.input} type="number"
                      value={challengeForm.maxScore}
                      onChange={e => setChallengeForm({ ...challengeForm, maxScore: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Problem Description</label>
                <textarea style={{ ...s.input, ...s.textarea }} rows={5}
                  placeholder="Describe the problem clearly..."
                  value={challengeForm.description}
                  onChange={e => setChallengeForm({ ...challengeForm, description: e.target.value })}
                />
              </div>

              <div style={s.formGroup}>
                <div style={s.labelRow}>
                  <label style={s.label}>Test Cases</label>
                  <button onClick={addTestCase} style={s.addBtn}>
                    + Add Test Case
                  </button>
                </div>
                {challengeForm.testCases.map((tc, i) => (
                  <div key={i} style={s.testCaseRow}>
                    <div style={s.formGroup}>
                      <label style={s.subLabel}>Input {i + 1}</label>
                      <input style={s.input} placeholder="Input value"
                        value={tc.input}
                        onChange={e => updateTestCase(i, 'input', e.target.value)}
                      />
                    </div>
                    <div style={s.formGroup}>
                      <label style={s.subLabel}>Expected Output</label>
                      <input style={s.input} placeholder="Expected output"
                        value={tc.output}
                        onChange={e => updateTestCase(i, 'output', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleChallengeSubmit} disabled={loading} style={s.submitBtn}>
                {loading ? '⏳ Creating...' : '🚀 Create Challenge'}
              </button>
            </div>
          </div>
        )}

        {/* ── ADD MCQ TAB ── */}
        {activeTab === 'mcq' && (
          <div style={s.content}>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Create MCQ Question</h1>
              <p style={s.pageSubtitle}>Add a new multiple choice question</p>
            </div>

            <div style={s.formCard}>
              {mcqMsg && (
                <div style={{
                  ...s.msgBox,
                  backgroundColor: mcqMsg.includes('✅') ? '#00b8a310' : '#ef444410',
                  borderColor: mcqMsg.includes('✅') ? '#00b8a340' : '#ef444440',
                  color: mcqMsg.includes('✅') ? '#00b8a3' : '#ef4444'
                }}>
                  {mcqMsg}
                </div>
              )}

              <div style={s.formGroup}>
                <label style={s.label}>Question</label>
                <textarea style={{ ...s.input, ...s.textarea }} rows={3}
                  placeholder="Type your MCQ question here..."
                  value={mcqForm.question}
                  onChange={e => setMcqForm({ ...mcqForm, question: e.target.value })}
                />
              </div>

              <div style={s.formGroup}>
                <label style={s.label}>Answer Options</label>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt} style={s.optionInputRow}>
                    <span style={{
                      ...s.optionKeyLabel,
                      backgroundColor: mcqForm.correctAnswer === opt
                        ? '#f0a500' : '#1a1a1a',
                      color: mcqForm.correctAnswer === opt ? '#000' : '#8b8b8b',
                      border: `1px solid ${mcqForm.correctAnswer === opt ? '#f0a500' : '#2a2a2a'}`
                    }}>
                      {opt}
                    </span>
                    <input style={{ ...s.input, flex: 1, marginBottom: 0 }}
                      placeholder={`Option ${opt}`}
                      value={mcqForm.options[opt]}
                      onChange={e => setMcqForm({ ...mcqForm, options: { ...mcqForm.options, [opt]: e.target.value } })}
                    />
                  </div>
                ))}
              </div>

              <div style={s.formRow3}>
                <div style={s.formGroup}>
                  <label style={s.label}>Correct Answer</label>
                  <select style={s.select} value={mcqForm.correctAnswer}
                    onChange={e => setMcqForm({ ...mcqForm, correctAnswer: e.target.value })}>
                    <option>A</option><option>B</option>
                    <option>C</option><option>D</option>
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Category</label>
                  <select style={s.select} value={mcqForm.category}
                    onChange={e => setMcqForm({ ...mcqForm, category: e.target.value })}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Difficulty</label>
                  <select style={s.select} value={mcqForm.difficulty}
                    onChange={e => setMcqForm({ ...mcqForm, difficulty: e.target.value })}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <button onClick={handleMCQSubmit} disabled={loading} style={s.submitBtn}>
                {loading ? '⏳ Creating...' : '🚀 Create MCQ'}
              </button>
            </div>
          </div>
        )}

        {/* ── VIEW CHALLENGES TAB ── */}
        {activeTab === 'viewChallenges' && (
          <div style={s.content}>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>Coding Challenges</h1>
              <p style={s.pageSubtitle}>
                {challenges.length} challenges in the system
              </p>
            </div>

            {challengeLoading ? (
              <p style={s.loadingText}>Loading challenges...</p>
            ) : (
              <div style={s.itemsList}>
                {challenges.map((ch, index) => (
                  <div key={ch._id} style={s.itemCard}>
                    {editingChallenge === ch._id ? (
                      <div>
                        <p style={s.editingLabel}>✏️ Editing Challenge</p>
                        {editChallengeMsg && (
                          <p style={{
                            color: editChallengeMsg.includes('✅') ? '#00b8a3' : '#ef4444',
                            marginBottom: '12px', fontSize: '14px'
                          }}>{editChallengeMsg}</p>
                        )}
                        <div style={s.formGroup}>
                          <label style={s.subLabel}>Title</label>
                          <input style={s.input} value={editChallengeForm.title}
                            onChange={e => setEditChallengeForm({ ...editChallengeForm, title: e.target.value })} />
                        </div>
                        <div style={s.formGroup}>
                          <label style={s.subLabel}>Description</label>
                          <textarea style={{ ...s.input, ...s.textarea }} rows={3}
                            value={editChallengeForm.description}
                            onChange={e => setEditChallengeForm({ ...editChallengeForm, description: e.target.value })} />
                        </div>
                        <div style={s.formRow}>
                          <div style={s.formGroup}>
                            <label style={s.subLabel}>Difficulty</label>
                            <select style={s.select} value={editChallengeForm.difficulty}
                              onChange={e => setEditChallengeForm({ ...editChallengeForm, difficulty: e.target.value })}>
                              <option>Easy</option><option>Medium</option><option>Hard</option>
                            </select>
                          </div>
                          <div style={s.formGroup}>
                            <label style={s.subLabel}>Max Score</label>
                            <input style={s.input} type="number" value={editChallengeForm.maxScore}
                              onChange={e => setEditChallengeForm({ ...editChallengeForm, maxScore: Number(e.target.value) })} />
                          </div>
                        </div>
                        <div style={s.formGroup}>
                          <label style={s.subLabel}>Test Cases</label>
                          {editChallengeForm.testCases.map((tc, i) => (
                            <div key={i} style={s.testCaseRow}>
                              <input style={s.input} placeholder="Input" value={tc.input}
                                onChange={e => { const u = [...editChallengeForm.testCases]; u[i].input = e.target.value; setEditChallengeForm({ ...editChallengeForm, testCases: u }); }} />
                              <input style={s.input} placeholder="Output" value={tc.output}
                                onChange={e => { const u = [...editChallengeForm.testCases]; u[i].output = e.target.value; setEditChallengeForm({ ...editChallengeForm, testCases: u }); }} />
                            </div>
                          ))}
                        </div>
                        <div style={s.editBtns}>
                          <button onClick={handleEditChallengeSave} disabled={loading} style={s.saveBtn}>
                            {loading ? 'Saving...' : '💾 Save Changes'}
                          </button>
                          <button onClick={() => setEditingChallenge(null)} style={s.cancelBtn}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={s.itemHeader}>
                          <div style={s.itemMeta}>
                            <span style={{
                              ...s.diffTag,
                              color: diffColors[ch.difficulty],
                              borderColor: diffColors[ch.difficulty] + '40',
                              backgroundColor: diffColors[ch.difficulty] + '15'
                            }}>
                              {ch.difficulty}
                            </span>
                            <span style={s.ptsTag}>{ch.maxScore} pts</span>
                            <span style={s.indexTag}>#{index + 1}</span>
                          </div>
                          <div style={s.itemActions}>
                            <button onClick={() => handleEditChallengeClick(ch)} style={s.editBtn}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => setDeleteChallengeConfirm(ch._id)} style={s.deleteBtn}>
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                        <h3 style={s.itemTitle}>{ch.title}</h3>
                        <p style={s.itemDesc}>{ch.description}</p>
                        <div style={s.testCasesList}>
                          <span style={s.tcLabel}>🧪 {ch.testCases?.length || 0} test cases</span>
                          {ch.testCases?.slice(0, 2).map((tc, i) => (
                            <span key={i} style={s.tcChip}>
                              {tc.input} → {tc.output}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {deleteChallengeConfirm && (
              <div style={s.modalOverlay}>
                <div style={s.modal}>
                  <p style={s.modalIcon}>🗑️</p>
                  <h3 style={s.modalTitle}>Delete Challenge?</h3>
                  <p style={s.modalDesc}>This action cannot be undone!</p>
                  <div style={s.modalBtns}>
                    <button onClick={() => setDeleteChallengeConfirm(null)} style={s.modalCancelBtn}>Cancel</button>
                    <button onClick={() => handleDeleteChallenge(deleteChallengeConfirm)} style={s.modalDeleteBtn}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW QUESTIONS TAB ── */}
        {activeTab === 'viewQuestions' && (
          <div style={s.content}>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>MCQ Questions</h1>
              <p style={s.pageSubtitle}>{mcqs.length} questions found</p>
            </div>

            {/* Filter Pills */}
            <div style={s.filterRow}>
              {['All', ...categories].map(cat => (
                <button key={cat} onClick={() => setMcqFilter(cat)} style={{
                  ...s.filterPill,
                  backgroundColor: mcqFilter === cat ? '#f0a500' : '#1a1a1a',
                  color: mcqFilter === cat ? '#000000' : '#8b8b8b',
                  border: `1px solid ${mcqFilter === cat ? '#f0a500' : '#2a2a2a'}`
                }}>
                  {cat !== 'All' && <span style={{ marginRight: '6px' }}>
                    {cat === 'Aptitude' ? '🔢' : cat === 'DBMS' ? '🗄️' :
                     cat === 'OS' ? '💻' : cat === 'OOPS' ? '🧩' : '🌐'}
                  </span>}
                  {cat}
                </button>
              ))}
            </div>

            {mcqLoading ? (
              <p style={s.loadingText}>Loading questions...</p>
            ) : (
              <div style={s.itemsList}>
                {mcqs.map((mcq, index) => (
                  <div key={mcq._id} style={s.itemCard}>
                    {editingMCQ === mcq._id ? (
                      <div>
                        <p style={s.editingLabel}>✏️ Editing Question</p>
                        {editMsg && (
                          <p style={{ color: editMsg.includes('✅') ? '#00b8a3' : '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
                            {editMsg}
                          </p>
                        )}
                        <div style={s.formGroup}>
                          <label style={s.subLabel}>Question</label>
                          <textarea style={{ ...s.input, ...s.textarea }} rows={3}
                            value={editForm.question}
                            onChange={e => setEditForm({ ...editForm, question: e.target.value })} />
                        </div>
                        <div style={s.formGroup}>
                          <label style={s.subLabel}>Options</label>
                          {['A', 'B', 'C', 'D'].map(opt => (
                            <div key={opt} style={s.optionInputRow}>
                              <span style={{
                                ...s.optionKeyLabel,
                                backgroundColor: editForm.correctAnswer === opt ? '#f0a500' : '#1a1a1a',
                                color: editForm.correctAnswer === opt ? '#000' : '#8b8b8b',
                                border: `1px solid ${editForm.correctAnswer === opt ? '#f0a500' : '#2a2a2a'}`
                              }}>{opt}</span>
                              <input style={{ ...s.input, flex: 1, marginBottom: 0 }}
                                value={editForm.options[opt]}
                                onChange={e => setEditForm({ ...editForm, options: { ...editForm.options, [opt]: e.target.value } })} />
                            </div>
                          ))}
                        </div>
                        <div style={s.formRow3}>
                          <div style={s.formGroup}>
                            <label style={s.subLabel}>Correct Answer</label>
                            <select style={s.select} value={editForm.correctAnswer}
                              onChange={e => setEditForm({ ...editForm, correctAnswer: e.target.value })}>
                              <option>A</option><option>B</option><option>C</option><option>D</option>
                            </select>
                          </div>
                          <div style={s.formGroup}>
                            <label style={s.subLabel}>Category</label>
                            <select style={s.select} value={editForm.category}
                              onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                              {categories.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div style={s.formGroup}>
                            <label style={s.subLabel}>Difficulty</label>
                            <select style={s.select} value={editForm.difficulty}
                              onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}>
                              <option>Easy</option><option>Medium</option><option>Hard</option>
                            </select>
                          </div>
                        </div>
                        <div style={s.editBtns}>
                          <button onClick={handleEditMCQSave} disabled={loading} style={s.saveBtn}>
                            {loading ? 'Saving...' : '💾 Save Changes'}
                          </button>
                          <button onClick={() => setEditingMCQ(null)} style={s.cancelBtn}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={s.itemHeader}>
                          <div style={s.itemMeta}>
                            <span style={{
                              ...s.catTag,
                              color: catColors[mcq.category],
                              borderColor: catColors[mcq.category] + '40',
                              backgroundColor: catColors[mcq.category] + '15'
                            }}>
                              {mcq.category}
                            </span>
                            <span style={{
                              ...s.diffTag,
                              color: diffColors[mcq.difficulty],
                              borderColor: diffColors[mcq.difficulty] + '40',
                              backgroundColor: diffColors[mcq.difficulty] + '15'
                            }}>
                              {mcq.difficulty}
                            </span>
                            <span style={s.indexTag}>#{index + 1}</span>
                          </div>
                          <div style={s.itemActions}>
                            <button onClick={() => handleEditMCQClick(mcq)} style={s.editBtn}>✏️ Edit</button>
                            <button onClick={() => setDeleteConfirm(mcq._id)} style={s.deleteBtn}>🗑️ Delete</button>
                          </div>
                        </div>
                        <p style={s.itemTitle}>{mcq.question}</p>
                        <div style={s.optionsPreview}>
                          {Object.entries(mcq.options).map(([key, val]) => (
                            <div key={key} style={{
                              ...s.optionPreviewItem,
                              backgroundColor: key === mcq.correctAnswer ? '#00b8a315' : '#1a1a1a',
                              borderColor: key === mcq.correctAnswer ? '#00b8a340' : '#2a2a2a'
                            }}>
                              <span style={{
                                ...s.optionPreviewKey,
                                backgroundColor: key === mcq.correctAnswer ? '#00b8a3' : '#2a2a2a',
                                color: key === mcq.correctAnswer ? '#000' : '#8b8b8b'
                              }}>
                                {key}
                              </span>
                              <span style={{
                                color: key === mcq.correctAnswer ? '#00b8a3' : '#eff1f6',
                                fontSize: '13px', flex: 1
                              }}>
                                {val}
                              </span>
                              {key === mcq.correctAnswer && (
                                <span style={{ color: '#00b8a3', fontSize: '12px', fontWeight: '700' }}>
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {deleteConfirm && (
              <div style={s.modalOverlay}>
                <div style={s.modal}>
                  <p style={s.modalIcon}>🗑️</p>
                  <h3 style={s.modalTitle}>Delete Question?</h3>
                  <p style={s.modalDesc}>This cannot be undone!</p>
                  <div style={s.modalBtns}>
                    <button onClick={() => setDeleteConfirm(null)} style={s.modalCancelBtn}>Cancel</button>
                    <button onClick={() => handleDeleteMCQ(deleteConfirm)} style={s.modalDeleteBtn}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: "'SF Pro Display', 'Segoe UI', sans-serif",
    overflow: 'hidden'
  },

  // ── SIDEBAR ──
  sidebar: {
    width: '240px',
    backgroundColor: '#0f0f0f',
    borderRight: '1px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,
    overflow: 'hidden'
  },
  sidebarTop: { padding: '24px 16px', flex: 1, overflow: 'auto' },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '28px',
    padding: '0 8px'
  },
  brandLogo: {
    fontSize: '28px',
    backgroundColor: '#f0a50020',
    border: '1px solid #f0a50040',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandName: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '16px',
    letterSpacing: '-0.5px',
    marginBottom: '2px'
  },
  brandRole: { color: '#f0a500', fontSize: '11px', fontWeight: '600', letterSpacing: '1px' },
  adminProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '12px',
    marginBottom: '24px',
    border: '1px solid #2a2a2a'
  },
  adminAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#f0a500',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '16px',
    flexShrink: 0
  },
  adminName: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '2px'
  },
  adminRoleTag: { color: '#8b8b8b', fontSize: '11px' },
  sidebarNav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navSection: {
    color: '#3a3a3a',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2px',
    padding: '0 8px',
    marginBottom: '8px',
    marginTop: '8px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s',
    borderLeft: '3px solid transparent'
  },
  navIcon: { fontSize: '16px', width: '20px', textAlign: 'center' },
  sidebarBottom: {
    padding: '16px',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  viewStudentBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: '#ef444415',
    color: '#ef4444',
    border: '1px solid #ef444430',
    padding: '10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },

  // ── MAIN ──
  main: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#0a0a0a'
  },
  content: {
    padding: '36px 40px',
    maxWidth: '1000px'
  },
  pageHeader: { marginBottom: '32px' },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '6px',
    letterSpacing: '-0.5px'
  },
  pageSubtitle: { color: '#8b8b8b', fontSize: '15px' },
  loadingText: { color: '#8b8b8b', padding: '40px 0', fontSize: '15px' },

  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '28px'
  },
  statCard: {
    backgroundColor: '#111111',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #1a1a1a'
  },
  statCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  statIcon: { fontSize: '24px' },
  statChange: { fontSize: '12px', fontWeight: '700' },
  statValue: { fontSize: '36px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { color: '#8b8b8b', fontSize: '12px' },
  tablesRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  tableCard: {
    backgroundColor: '#111111',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid #1a1a1a'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  tableTitle: { fontSize: '16px', fontWeight: '700', color: '#ffffff' },
  tableBadge: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    border: '1px solid #2a2a2a'
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid #1a1a1a'
  },
  tableRank: { width: '30px', fontSize: '18px', textAlign: 'center' },
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#f0a50020',
    color: '#f0a500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
    border: '1px solid #f0a50040'
  },
  tableName: { color: '#ffffff', fontWeight: '600', fontSize: '14px', flex: 1 },
  tableEmail: { color: '#8b8b8b', fontSize: '12px' },
  tableBadges: { display: 'flex', gap: '6px' },
  badge: {
    padding: '3px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  tableScore: { color: '#f0a500', fontWeight: '700', fontSize: '14px' },

  // Forms
  formCard: {
    backgroundColor: '#111111',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #1a1a1a',
    maxWidth: '720px'
  },
  msgBox: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  formGrid2: { display: 'flex', flexDirection: 'column', gap: '0' },
  formGroup: { marginBottom: '20px' },
  formRow: { display: 'flex', gap: '16px' },
  formRow3: { display: 'flex', gap: '16px' },
  label: {
    display: 'block',
    color: '#8b8b8b',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  subLabel: {
    display: 'block',
    color: '#5a5a5a',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '6px'
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
    fontFamily: 'inherit'
  },
  textarea: { resize: 'vertical', lineHeight: '1.6' },
  select: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },
  addBtn: {
    backgroundColor: 'transparent',
    color: '#f0a500',
    border: '1px solid #f0a50040',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },
  testCaseRow: { display: 'flex', gap: '12px', marginBottom: '8px' },
  optionInputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  },
  optionKeyLabel: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
    cursor: 'default'
  },
  submitBtn: {
    backgroundColor: '#f0a500',
    color: '#000000',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    width: '100%'
  },

  // Items List
  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  filterPill: {
    padding: '7px 16px',
    borderRadius: '20px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center'
  },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  itemCard: {
    backgroundColor: '#111111',
    borderRadius: '14px',
    padding: '20px',
    border: '1px solid #1a1a1a'
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  itemMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  catTag: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid'
  },
  diffTag: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid'
  },
  ptsTag: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    border: '1px solid #2a2a2a'
  },
  indexTag: { color: '#3a3a3a', fontSize: '12px' },
  itemActions: { display: 'flex', gap: '8px' },
  editBtn: {
    backgroundColor: '#3b82f615',
    color: '#3b82f6',
    border: '1px solid #3b82f630',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  deleteBtn: {
    backgroundColor: '#ef444415',
    color: '#ef4444',
    border: '1px solid #ef444430',
    padding: '6px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  itemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '6px',
    lineHeight: '1.5'
  },
  itemDesc: {
    color: '#8b8b8b',
    fontSize: '13px',
    lineHeight: '1.6',
    marginBottom: '12px'
  },
  testCasesList: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  tcLabel: { color: '#5a5a5a', fontSize: '12px' },
  tcChip: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#8b8b8b',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontFamily: 'monospace'
  },
  optionsPreview: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '12px'
  },
  optionPreviewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid'
  },
  optionPreviewKey: {
    width: '22px',
    height: '22px',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '11px',
    flexShrink: 0
  },
  editingLabel: {
    color: '#f0a500',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2a2a2a'
  },
  editBtns: { display: 'flex', gap: '10px', marginTop: '16px' },
  saveBtn: {
    backgroundColor: '#00b8a3',
    color: '#000000',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  },
  cancelBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(8px)'
  },
  modal: {
    backgroundColor: '#111111',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    width: '380px',
    border: '1px solid #2a2a2a',
    boxShadow: '0 40px 80px rgba(0,0,0,0.8)'
  },
  modalIcon: { fontSize: '40px', marginBottom: '12px' },
  modalTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px'
  },
  modalDesc: { color: '#8b8b8b', fontSize: '14px', marginBottom: '24px' },
  modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
  modalCancelBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '10px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  modalDeleteBtn: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700'
  }
};

export default AdminPanel;

