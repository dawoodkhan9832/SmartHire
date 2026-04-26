
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { theme } from '../theme';

function AIFeedback() {
  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') 
  || 'http://localhost:5000';
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [feedback, setFeedback] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data.feedback);
        setStudentData(data.studentData);
      } else {
        setError(data.message || 'Failed to get feedback');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating === 'Good') return theme.colors.success;
    if (rating === 'Average') return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <div style={s.container}>

      {/* Navbar */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>SmartHire</span>
          <span style={s.navSep}>/</span>
          <span style={s.navPage}>AI Feedback</span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>
          ← Dashboard
        </button>
      </nav>

      <div style={s.main}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerIcon}>🤖</div>
          <h1 style={s.headerTitle}>AI Performance Analysis</h1>
          <p style={s.headerSub}>
            Powered by Gemini AI — Get personalized insights on your performance
          </p>
        </div>

        {/* Get Feedback Screen */}
        {!feedback && (
          <div style={s.startCard}>
            <div style={s.startGrid}>
              {[
                { icon: '📊', title: 'Performance Analysis', desc: 'Deep dive into your coding performance' },
                { icon: '💡', title: 'Smart Suggestions', desc: 'Personalized topics to improve' },
                { icon: '🎯', title: 'Next Steps', desc: 'Clear action plan for placement prep' },
                { icon: '⚡', title: 'Instant Results', desc: 'AI analysis in seconds' },
              ].map((item, i) => (
                <div key={i} style={s.featureCard}>
                  <span style={s.featureIcon}>{item.icon}</span>
                  <h3 style={s.featureTitle}>{item.title}</h3>
                  <p style={s.featureDesc}>{item.desc}</p>
                </div>
              ))}
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button
              onClick={getFeedback}
              disabled={loading}
              style={s.analyzeBtn}
            >
              {loading ? (
                <span>⏳ Analyzing your performance...</span>
              ) : (
                <span>🚀 Generate AI Analysis</span>
              )}
            </button>
          </div>
        )}

        {/* Feedback Results */}
        {feedback && studentData && (
          <div style={s.feedbackContainer}>

            {/* Rating Hero Card */}
            <div style={s.ratingCard}>
              <div style={s.ratingLeft}>
                <p style={s.ratingLabel}>OVERALL RATING</p>
                <h2 style={{
                  ...s.ratingValue,
                  color: getRatingColor(feedback.overallRating)
                }}>
                  {feedback.overallRating}
                </h2>
                <p style={s.ratingSummary}>{feedback.summary}</p>
              </div>
              <div style={s.readinessCircle}>
                <svg viewBox="0 0 120 120" style={{ width: '120px', height: '120px' }}>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2a" strokeWidth="8"/>
                  <circle
                    cx="60" cy="60" r="54"
                    fill="none"
                    stroke={getRatingColor(feedback.overallRating)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - parseInt(feedback.estimatedReadiness) / 100)}`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div style={s.circleInner}>
                  <span style={{
                    ...s.circleValue,
                    color: getRatingColor(feedback.overallRating)
                  }}>
                    {feedback.estimatedReadiness}
                  </span>
                  <span style={s.circleLabel}>Ready</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div style={s.statsRow}>
              {[
                { label: 'Total Score', value: studentData.totalScore, icon: '⭐' },
                { label: 'Submissions', value: studentData.totalSubmissions, icon: '📝' },
                { label: 'Passed', value: studentData.passedSubmissions, icon: '✅' },
                { label: 'Avg Score', value: studentData.avgScore, icon: '📊' },
              ].map((stat, i) => (
                <div key={i} style={s.statCard}>
                  <span style={s.statIcon}>{stat.icon}</span>
                  <span style={s.statValue}>{stat.value}</span>
                  <span style={s.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Areas Grid */}
            <div style={s.areasGrid}>
              {/* Strong Areas */}
              <div style={{ ...s.areaCard, borderTop: `3px solid ${theme.colors.success}` }}>
                <h3 style={{ ...s.areaTitle, color: theme.colors.success }}>
                  ✅ Strong Areas
                </h3>
                {feedback.strongAreas?.map((area, i) => (
                  <div key={i} style={s.areaItem}>
                    <span style={{ ...s.areaDot, backgroundColor: theme.colors.success }} />
                    <span style={s.areaText}>{area}</span>
                  </div>
                ))}
              </div>

              {/* Weak Areas */}
              <div style={{ ...s.areaCard, borderTop: `3px solid ${theme.colors.error}` }}>
                <h3 style={{ ...s.areaTitle, color: theme.colors.error }}>
                  ⚠️ Needs Improvement
                </h3>
                {feedback.weakAreas?.map((area, i) => (
                  <div key={i} style={s.areaItem}>
                    <span style={{ ...s.areaDot, backgroundColor: theme.colors.error }} />
                    <span style={s.areaText}>{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div style={s.sectionCard}>
              <h3 style={s.sectionTitle}>💡 Suggested Improvements</h3>
              {feedback.improvements?.map((imp, i) => (
                <div key={i} style={s.listItem}>
                  <span style={s.listNum}>{i + 1}</span>
                  <span style={s.listText}>{imp}</span>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div style={s.sectionCard}>
              <h3 style={s.sectionTitle}>🎯 Action Plan</h3>
              {feedback.nextSteps?.map((step, i) => (
                <div key={i} style={s.listItem}>
                  <span style={{ ...s.listArrow }}>→</span>
                  <span style={s.listText}>{step}</span>
                </div>
              ))}
            </div>

            {/* Motivation */}
            <div style={s.motivationCard}>
              <span style={s.quoteIcon}>"</span>
              <p style={s.motivationText}>
                {feedback.motivationalMessage}
              </p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => { setFeedback(null); setStudentData(null); }}
              style={s.refreshBtn}
            >
              🔄 Regenerate Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    backgroundColor: theme.bg.primary,
    color: theme.text.primary
  },
  navbar: {
    backgroundColor: theme.bg.navbar,
    borderBottom: `1px solid ${theme.border.primary}`,
    padding: '0 32px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogo: { color: theme.colors.primary, fontWeight: '700', fontSize: '18px' },
  navSep: { color: theme.text.muted },
  navPage: { color: theme.text.secondary, fontSize: '14px' },
  backBtn: {
    backgroundColor: theme.bg.tertiary,
    color: theme.text.secondary,
    border: `1px solid ${theme.border.primary}`,
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  headerIcon: { fontSize: '56px', marginBottom: '16px' },
  headerTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: '8px'
  },
  headerSub: { color: theme.text.muted, fontSize: '16px' },
  startCard: {
    backgroundColor: theme.bg.secondary,
    borderRadius: '16px',
    padding: '40px',
    border: `1px solid ${theme.border.primary}`
  },
  startGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '32px'
  },
  featureCard: {
    backgroundColor: theme.bg.tertiary,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: `1px solid ${theme.border.primary}`
  },
  featureIcon: { fontSize: '32px', display: 'block', marginBottom: '12px' },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: '8px'
  },
  featureDesc: { fontSize: '12px', color: theme.text.muted, lineHeight: '1.5' },
  error: {
    backgroundColor: '#ef444420',
    color: theme.colors.error,
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  analyzeBtn: {
    backgroundColor: theme.colors.primary,
    color: '#000000',
    border: 'none',
    padding: '16px 40px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    display: 'block',
    margin: '0 auto'
  },
  feedbackContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  ratingCard: {
    backgroundColor: theme.bg.secondary,
    borderRadius: '16px',
    padding: '32px',
    border: `1px solid ${theme.border.primary}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ratingLeft: { flex: 1 },
  ratingLabel: {
    color: theme.text.muted,
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    marginBottom: '8px'
  },
  ratingValue: {
    fontSize: '40px',
    fontWeight: '700',
    marginBottom: '12px'
  },
  ratingSummary: {
    color: theme.text.secondary,
    fontSize: '15px',
    lineHeight: '1.7',
    maxWidth: '500px'
  },
  readinessCircle: {
    position: 'relative',
    width: '120px',
    height: '120px',
    flexShrink: 0
  },
  circleInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  circleValue: { fontSize: '22px', fontWeight: '700', display: 'block' },
  circleLabel: { fontSize: '11px', color: theme.text.muted },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px'
  },
  statCard: {
    backgroundColor: theme.bg.secondary,
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: `1px solid ${theme.border.primary}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statIcon: { fontSize: '24px' },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.primary
  },
  statLabel: { fontSize: '12px', color: theme.text.muted },
  areasGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  areaCard: {
    backgroundColor: theme.bg.secondary,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${theme.border.primary}`
  },
  areaTitle: { fontSize: '16px', fontWeight: '700', marginBottom: '16px' },
  areaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  areaDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0
  },
  areaText: { color: theme.text.secondary, fontSize: '14px' },
  sectionCard: {
    backgroundColor: theme.bg.secondary,
    borderRadius: '12px',
    padding: '24px',
    border: `1px solid ${theme.border.primary}`
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: '20px'
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    marginBottom: '14px'
  },
  listNum: {
    backgroundColor: theme.colors.primary,
    color: '#000000',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0
  },
  listArrow: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0
  },
  listText: { color: theme.text.secondary, fontSize: '14px', lineHeight: '1.6' },
  motivationCard: {
    backgroundColor: '#f0a50010',
    border: `1px solid #f0a50030`,
    borderRadius: '12px',
    padding: '28px',
    position: 'relative'
  },
  quoteIcon: {
    position: 'absolute',
    top: '12px',
    left: '20px',
    fontSize: '48px',
    color: theme.colors.primary,
    opacity: 0.3,
    lineHeight: 1
  },
  motivationText: {
    color: theme.text.secondary,
    fontSize: '16px',
    fontStyle: 'italic',
    lineHeight: '1.8',
    paddingLeft: '16px'
  },
  refreshBtn: {
    backgroundColor: theme.bg.secondary,
    color: theme.text.secondary,
    border: `1px solid ${theme.border.primary}`,
    padding: '12px 32px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'block',
    margin: '0 auto'
  }
};

export default AIFeedback;