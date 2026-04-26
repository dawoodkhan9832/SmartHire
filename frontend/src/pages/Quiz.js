
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme';

function Quiz() {
  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') 
  || 'http://localhost:5000';
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);
  const [hoveredOption, setHoveredOption] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState('');

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const fetchQuestions = async (cat) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:5000/api/mcqs?category=${cat}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await res.json();
      setQuestions(data);
      setAnswers(new Array(data.length).fill(''));
      setStarted(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    fetchQuestions(cat);
  };

  const handleOptionSelect = (option) => {
    setSelected(option);
    const newAnswers = [...answers];
    newAnswers[current] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(answers[current + 1] || '');
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setSelected(answers[current - 1] || '');
    }
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = questions.map((q, i) => ({
        mcqId: q._id,
        selectedOption: answers[i] || 'A'
      }));
      const res = await fetch('http://localhost:5000/api/mcqs/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: payload })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setStarted(false);
    setResult(null);
    setCurrent(0);
    setAnswers([]);
    setSelected('');
    setTimeLeft(1800);
    setShowDetailed(false);
    setCategory('');
  };

  const categories = [
    { id: 'Aptitude', icon: '🔢', label: 'Aptitude', desc: 'Logical & Math', color: '#8b5cf6' },
    { id: 'DBMS', icon: '🗄️', label: 'DBMS', desc: 'Database Systems', color: '#3b82f6' },
    { id: 'OS', icon: '💻', label: 'OS', desc: 'Operating Systems', color: '#00b8a3' },
    { id: 'OOPS', icon: '🧩', label: 'OOPS', desc: 'OOP Concepts', color: '#f0a500' },
    { id: 'CN', icon: '🌐', label: 'CN', desc: 'Computer Networks', color: '#ef4444' },
  ];

  // ── SCREEN 1: Category Selection ──
  if (!started && !loading) {
    return (
      <div style={s.container}>
        <nav style={s.navbar}>
          <div style={s.navLeft}>
            <span style={s.navLogo}>SmartHire</span>
            <span style={s.navSep}>/</span>
            <span style={s.navPage}>Quiz Arena</span>
          </div>
          <button onClick={() => navigate('/dashboard')} style={s.backBtn}>
            ← Dashboard
          </button>
        </nav>

        <div style={s.categoryMain}>
          <div style={s.categoryHero}>
            <h1 style={s.categoryTitle}>
              Choose Your <span style={s.titleAccent}>Battle Ground</span>
            </h1>
            <p style={s.categorySubtitle}>
              Select a topic and test your knowledge. Each quiz has a 30-minute timer.
            </p>
          </div>

          <div style={s.categoryGrid}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  ...s.categoryCard,
                  borderColor: hoveredCategory === cat.id
                    ? cat.color : '#2a2a2a',
                  transform: hoveredCategory === cat.id
                    ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredCategory === cat.id
                    ? `0 20px 40px ${cat.color}20` : 'none'
                }}
                onClick={() => handleCategorySelect(cat.id)}
                onMouseEnter={() => setHoveredCategory(cat.id)}
                onMouseLeave={() => setHoveredCategory('')}
              >
                <div style={{
                  ...s.catIconWrap,
                  backgroundColor: `${cat.color}15`,
                  border: `1px solid ${cat.color}30`
                }}>
                  <span style={s.catIcon}>{cat.icon}</span>
                </div>
                <h3 style={s.catName}>{cat.label}</h3>
                <p style={s.catDesc}>{cat.desc}</p>
                <div style={{
                  ...s.catFooter,
                  borderTop: `1px solid ${cat.color}30`
                }}>
                  <span style={{ color: cat.color, fontSize: '13px', fontWeight: '600' }}>
                    Start Quiz →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div style={s.statsRow}>
            {[
              { icon: '⏱', label: '30 min', desc: 'Time Limit' },
              { icon: '🎯', label: '10 pts', desc: 'Per Question' },
              { icon: '📊', label: 'Instant', desc: 'Results' },
              { icon: '🔍', label: 'Review', desc: 'All Answers' },
            ].map((stat, i) => (
              <div key={i} style={s.statChip}>
                <span style={s.statChipIcon}>{stat.icon}</span>
                <div>
                  <p style={s.statChipVal}>{stat.label}</p>
                  <p style={s.statChipDesc}>{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading && !result) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingPulse}>⚡</div>
        <p style={{ color: theme.text.muted, fontSize: '16px' }}>
          Loading questions...
        </p>
      </div>
    );
  }

  // ── SCREEN 2: Result Screen ──
  if (result) {
    const accuracy = parseFloat(result.accuracy);
    const catInfo = categories.find(c => c.id === category);

    return (
      <div style={s.container}>
        <nav style={s.navbar}>
          <div style={s.navLeft}>
            <span style={s.navLogo}>SmartHire</span>
            <span style={s.navSep}>/</span>
            <span style={s.navPage}>{category} Results</span>
          </div>
        </nav>

        <div style={s.resultMain}>

          {/* Result Hero */}
          <div style={s.resultHero}>
            <div style={s.resultScoreCircle}>
              <svg viewBox="0 0 160 160" style={{ width: '160px', height: '160px' }}>
                <circle cx="80" cy="80" r="70" fill="none"
                  stroke="#2a2a2a" strokeWidth="10"/>
                <circle cx="80" cy="80" r="70" fill="none"
                  stroke={accuracy >= 70 ? '#00b8a3' : accuracy >= 40 ? '#f0a500' : '#ef4444'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - accuracy / 100)}`}
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div style={s.circleInner}>
                <span style={{
                  ...s.circleAccuracy,
                  color: accuracy >= 70 ? '#00b8a3' :
                    accuracy >= 40 ? '#f0a500' : '#ef4444'
                }}>
                  {result.accuracy}
                </span>
                <span style={s.circleAccLabel}>Accuracy</span>
              </div>
            </div>

            <div style={s.resultInfo}>
              <div style={s.resultBadge}>
                <span style={{ fontSize: '20px' }}>{catInfo?.icon}</span>
                <span style={{ color: catInfo?.color, fontWeight: '700' }}>
                  {category} Quiz
                </span>
              </div>
              <h2 style={s.resultTitle}>
                {accuracy >= 70 ? '🎉 Excellent Work!' :
                 accuracy >= 40 ? '👍 Good Attempt!' : '📚 Keep Practicing!'}
              </h2>

              <div style={s.resultStatGrid}>
                <div style={s.resultStatBox}>
                  <span style={s.resultStatNum}>{result.score}</span>
                  <span style={s.resultStatLbl}>Score</span>
                </div>
                <div style={s.resultStatBox}>
                  <span style={{
                    ...s.resultStatNum, color: '#00b8a3'
                  }}>
                    {result.correct}
                  </span>
                  <span style={s.resultStatLbl}>✅ Correct</span>
                </div>
                <div style={s.resultStatBox}>
                  <span style={{
                    ...s.resultStatNum, color: '#ef4444'
                  }}>
                    {result.wrong}
                  </span>
                  <span style={s.resultStatLbl}>❌ Wrong</span>
                </div>
                <div style={s.resultStatBox}>
                  <span style={s.resultStatNum}>{result.total}</span>
                  <span style={s.resultStatLbl}>Total</span>
                </div>
              </div>

              <div style={s.resultActions}>
                <button
                  onClick={() => setShowDetailed(!showDetailed)}
                  style={s.reviewBtn}
                >
                  {showDetailed ? '▲ Hide Review' : '🔍 Review Answers'}
                </button>
                <button onClick={resetQuiz} style={s.retryBtn}>
                  Try Another
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={s.dashBtn}
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Review */}
          {showDetailed && result.detailedResults && (
            <div style={s.reviewSection}>
              <h3 style={s.reviewTitle}>📝 Question Review</h3>
              {result.detailedResults.map((item, index) => (
                <div key={index} style={{
                  ...s.reviewCard,
                  borderLeft: `4px solid ${item.isCorrect ? '#00b8a3' : '#ef4444'}`
                }}>
                  <div style={s.reviewCardTop}>
                    <span style={{
                      ...s.reviewBadge,
                      backgroundColor: item.isCorrect ? '#00b8a320' : '#ef444420',
                      color: item.isCorrect ? '#00b8a3' : '#ef4444',
                      border: `1px solid ${item.isCorrect ? '#00b8a340' : '#ef444440'}`
                    }}>
                      {item.isCorrect ? '✓ Correct' : '✗ Wrong'}
                    </span>
                    <span style={s.reviewQNum}>Q{index + 1}</span>
                  </div>
                  <p style={s.reviewQuestion}>{item.question}</p>
                  <div style={s.reviewOptions}>
                    {Object.entries(item.options).map(([key, val]) => {
                      const isCorrect = key === item.correctAnswer;
                      const isSelected = key === item.selectedOption;
                      const isWrong = isSelected && !item.isCorrect;

                      return (
                        <div key={key} style={{
                          ...s.reviewOption,
                          backgroundColor: isCorrect ? '#00b8a315' :
                            isWrong ? '#ef444415' : '#1a1a1a',
                          borderColor: isCorrect ? '#00b8a3' :
                            isWrong ? '#ef4444' : '#2a2a2a',
                        }}>
                          <span style={{
                            ...s.reviewOptionKey,
                            backgroundColor: isCorrect ? '#00b8a3' :
                              isWrong ? '#ef4444' : '#2a2a2a',
                            color: (isCorrect || isWrong) ? 'white' : '#8b8b8b'
                          }}>
                            {key}
                          </span>
                          <span style={{
                            ...s.reviewOptionVal,
                            color: isCorrect ? '#00b8a3' :
                              isWrong ? '#ef4444' : '#eff1f6'
                          }}>
                            {val}
                          </span>
                          {isCorrect && (
                            <span style={s.correctTag}>✓ Correct Answer</span>
                          )}
                          {isWrong && (
                            <span style={s.wrongTag}>✗ Your Answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SCREEN 3: Quiz Questions ──
  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  const answeredCount = answers.filter(a => a !== '').length;
  const catInfo = categories.find(c => c.id === category);

  return (
    <div style={s.container}>
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>SmartHire</span>
          <span style={s.navSep}>/</span>
          <span style={{ color: catInfo?.color, fontWeight: '600', fontSize: '14px' }}>
            {catInfo?.icon} {category} Quiz
          </span>
        </div>
        <div style={s.navCenter}>
          <span style={s.answeredCount}>
            {answeredCount}/{questions.length} answered
          </span>
        </div>
        <span style={{
          ...s.timer,
          color: timeLeft < 300 ? '#ef4444' :
            timeLeft < 600 ? '#f0a500' : '#ffffff'
        }}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </nav>

      <div style={s.quizLayout}>

        {/* Left Sidebar — Question Navigator */}
        <div style={s.quizSidebar}>
          <p style={s.sidebarTitle}>Questions</p>
          <div style={s.qNavGrid}>
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrent(i);
                  setSelected(answers[i] || '');
                }}
                style={{
                  ...s.qNavBtn,
                  backgroundColor: i === current ? '#f0a500' :
                    answers[i] ? '#00b8a320' : '#1a1a1a',
                  color: i === current ? '#000000' :
                    answers[i] ? '#00b8a3' : '#8b8b8b',
                  border: `1px solid ${i === current ? '#f0a500' :
                    answers[i] ? '#00b8a340' : '#2a2a2a'}`
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div style={s.sidebarLegend}>
            <div style={s.legendItem}>
              <div style={{ ...s.legendDot, backgroundColor: '#f0a500' }} />
              <span>Current</span>
            </div>
            <div style={s.legendItem}>
              <div style={{ ...s.legendDot, backgroundColor: '#00b8a3' }} />
              <span>Answered</span>
            </div>
            <div style={s.legendItem}>
              <div style={{ ...s.legendDot, backgroundColor: '#2a2a2a' }} />
              <span>Skipped</span>
            </div>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            style={s.submitSideBtn}
          >
            Submit Quiz 🎯
          </button>
        </div>

        {/* Main Quiz Area */}
        <div style={s.quizMain}>

          {/* Progress Bar */}
          <div style={s.progressWrap}>
            <div style={s.progressBar}>
              <div style={{
                ...s.progressFill,
                width: `${progress}%`,
                backgroundColor: catInfo?.color || '#f0a500'
              }} />
            </div>
            <span style={s.progressLabel}>
              {Math.round(progress)}%
            </span>
          </div>

          {/* Question Card */}
          <div style={s.questionCard}>
            <div style={s.questionHeader}>
              <span style={{
                ...s.questionNum,
                color: catInfo?.color
              }}>
                Question {current + 1}
              </span>
              <span style={s.questionTotal}>
                of {questions.length}
              </span>
            </div>
            <p style={s.questionText}>{question?.question}</p>
          </div>

          {/* Options */}
          <div style={s.optionsGrid}>
            {question && Object.entries(question.options).map(([key, val]) => {
              const isSelected = selected === key;
              return (
                <div
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  onMouseEnter={() => setHoveredOption(key)}
                  onMouseLeave={() => setHoveredOption('')}
                  style={{
                    ...s.optionCard,
                    backgroundColor: isSelected ? '#f0a50015' : '#1a1a1a',
                    borderColor: isSelected ? '#f0a500' :
                      hoveredOption === key ? '#3a3a3a' : '#2a2a2a',
                    transform: hoveredOption === key && !isSelected
                      ? 'translateX(4px)' : 'translateX(0)',
                  }}
                >
                  <span style={{
                    ...s.optionKey,
                    backgroundColor: isSelected ? '#f0a500' : '#2a2a2a',
                    color: isSelected ? '#000000' : '#8b8b8b'
                  }}>
                    {key}
                  </span>
                  <span style={{
                    ...s.optionText,
                    color: isSelected ? '#f0a500' : '#eff1f6'
                  }}>
                    {val}
                  </span>
                  {isSelected && (
                    <span style={s.selectedCheck}>✓</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={s.navBtns}>
            <button
              onClick={handlePrev}
              disabled={current === 0}
              style={{
                ...s.prevBtn,
                opacity: current === 0 ? 0.3 : 1,
                cursor: current === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Previous
            </button>

            <div style={s.navCenter2}>
              {selected ? (
                <span style={s.answeredTag}>✓ Answered</span>
              ) : (
                <span style={s.notAnsweredTag}>Not answered</span>
              )}
            </div>

            {current === questions.length - 1 ? (
              <button
                onClick={() => setShowConfirm(true)}
                style={s.submitMainBtn}
              >
                Submit Quiz 🎯
              </button>
            ) : (
              <button onClick={handleNext} style={s.nextBtn}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalIcon}>🎯</div>
            <h3 style={s.modalTitle}>Submit Quiz?</h3>
            <p style={s.modalDesc}>
              You've answered{' '}
              <span style={{ color: '#f0a500', fontWeight: '700' }}>
                {answeredCount}
              </span>
              {' '}out of{' '}
              <span style={{ color: '#f0a500', fontWeight: '700' }}>
                {questions.length}
              </span>
              {' '}questions.
            </p>
            {answeredCount < questions.length && (
              <p style={s.modalWarning}>
                ⚠️ {questions.length - answeredCount} questions unanswered
              </p>
            )}
            <div style={s.modalBtns}>
              <button
                onClick={() => setShowConfirm(false)}
                style={s.modalCancelBtn}
              >
                Continue Quiz
              </button>
              <button
                onClick={handleSubmit}
                style={s.modalSubmitBtn}
              >
                Yes, Submit!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    fontFamily: "'SF Pro Display', 'Segoe UI', sans-serif"
  },
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    gap: '16px'
  },
  loadingPulse: { fontSize: '48px', animation: 'pulse 1s infinite' },
  navbar: {
    backgroundColor: '#111111',
    borderBottom: '1px solid #2a2a2a',
    padding: '0 32px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogo: {
    color: '#f0a500',
    fontWeight: '800',
    fontSize: '18px',
    letterSpacing: '-0.5px'
  },
  navSep: { color: '#3a3a3a', fontSize: '18px' },
  navPage: { color: '#8b8b8b', fontSize: '14px' },
  navCenter: { display: 'flex', alignItems: 'center' },
  backBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  timer: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '2px',
    transition: 'color 0.3s'
  },
  answeredCount: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    color: '#8b8b8b',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px'
  },

  // ── Category Screen ──
  categoryMain: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '48px 24px'
  },
  categoryHero: { textAlign: 'center', marginBottom: '48px' },
  categoryTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '12px',
    letterSpacing: '-1px'
  },
  titleAccent: { color: '#f0a500' },
  categorySubtitle: {
    color: '#8b8b8b',
    fontSize: '16px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '16px',
    marginBottom: '40px'
  },
  categoryCard: {
    backgroundColor: '#111111',
    borderRadius: '16px',
    border: '1px solid',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  catIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '24px 24px 16px'
  },
  catIcon: { fontSize: '28px' },
  catName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    padding: '0 24px',
    marginBottom: '6px'
  },
  catDesc: {
    fontSize: '13px',
    color: '#8b8b8b',
    padding: '0 24px',
    marginBottom: '20px',
    flex: 1
  },
  catFooter: {
    padding: '16px 24px',
    marginTop: 'auto'
  },
  statsRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center'
  },
  statChip: {
    backgroundColor: '#111111',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statChipIcon: { fontSize: '24px' },
  statChipVal: {
    color: '#f0a500',
    fontWeight: '700',
    fontSize: '15px',
    marginBottom: '2px'
  },
  statChipDesc: { color: '#8b8b8b', fontSize: '12px' },

  // ── Quiz Screen ──
  quizLayout: {
    display: 'flex',
    height: 'calc(100vh - 52px)',
    overflow: 'hidden'
  },
  quizSidebar: {
    width: '220px',
    backgroundColor: '#111111',
    borderRight: '1px solid #2a2a2a',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    flexShrink: 0
  },
  sidebarTitle: {
    color: '#8b8b8b',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
  },
  qNavGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '6px'
  },
  qNavBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.2s'
  },
  sidebarLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#8b8b8b',
    fontSize: '12px'
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
    flexShrink: 0
  },
  submitSideBtn: {
    backgroundColor: '#f0a500',
    color: '#000000',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    marginTop: 'auto'
  },
  quizMain: {
    flex: 1,
    padding: '32px 48px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  progressWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  progressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  progressLabel: {
    color: '#8b8b8b',
    fontSize: '12px',
    width: '36px',
    textAlign: 'right'
  },
  questionCard: {
    backgroundColor: '#111111',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #2a2a2a'
  },
  questionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  questionNum: {
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.5px'
  },
  questionTotal: {
    color: '#8b8b8b',
    fontSize: '13px'
  },
  questionText: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#eff1f6',
    lineHeight: '1.7'
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  optionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 20px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  optionKey: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '14px',
    flexShrink: 0,
    transition: 'all 0.2s'
  },
  optionText: {
    fontSize: '15px',
    fontWeight: '500',
    flex: 1,
    transition: 'color 0.2s'
  },
  selectedCheck: {
    color: '#f0a500',
    fontWeight: '700',
    fontSize: '16px',
    marginLeft: 'auto'
  },
  navBtns: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px'
  },
  prevBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '10px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  navCenter2: { display: 'flex', alignItems: 'center' },
  answeredTag: {
    backgroundColor: '#00b8a320',
    color: '#00b8a3',
    border: '1px solid #00b8a340',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  notAnsweredTag: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px'
  },
  nextBtn: {
    backgroundColor: '#f0a500',
    color: '#000000',
    border: 'none',
    padding: '10px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700'
  },
  submitMainBtn: {
    backgroundColor: '#00b8a3',
    color: '#000000',
    border: 'none',
    padding: '10px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700'
  },

  // ── Result Screen ──
  resultMain: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px'
  },
  resultHero: {
    display: 'flex',
    gap: '40px',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: '20px',
    padding: '40px',
    border: '1px solid #2a2a2a',
    marginBottom: '24px'
  },
  resultScoreCircle: {
    position: 'relative',
    width: '160px',
    height: '160px',
    flexShrink: 0
  },
  circleInner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  circleAccuracy: {
    fontSize: '24px',
    fontWeight: '700',
    display: 'block'
  },
  circleAccLabel: {
    fontSize: '11px',
    color: '#8b8b8b',
    letterSpacing: '1px'
  },
  resultInfo: { flex: 1 },
  resultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '20px',
    padding: '6px 14px',
    marginBottom: '16px'
  },
  resultTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '24px'
  },
  resultStatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '28px'
  },
  resultStatBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultStatNum: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f0a500'
  },
  resultStatLbl: { fontSize: '12px', color: '#8b8b8b' },
  resultActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  reviewBtn: {
    backgroundColor: '#f0a500',
    color: '#000000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  },
  retryBtn: {
    backgroundColor: '#1a1a1a',
    color: '#eff1f6',
    border: '1px solid #2a2a2a',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  dashBtn: {
    backgroundColor: '#00b8a3',
    color: '#000000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  },

  // ── Review Section ──
  reviewSection: { display: 'flex', flexDirection: 'column', gap: '16px' },
  reviewTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '8px'
  },
  reviewCard: {
    backgroundColor: '#111111',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #2a2a2a',
    borderLeft: '4px solid'
  },
  reviewCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  reviewBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },
  reviewQNum: { color: '#8b8b8b', fontSize: '12px' },
  reviewQuestion: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#eff1f6',
    marginBottom: '16px',
    lineHeight: '1.6'
  },
  reviewOptions: { display: 'flex', flexDirection: 'column', gap: '8px' },
  reviewOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    transition: 'all 0.2s'
  },
  reviewOptionKey: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
    flexShrink: 0
  },
  reviewOptionVal: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500'
  },
  correctTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#00b8a3',
    flexShrink: 0
  },
  wrongTag: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ef4444',
    flexShrink: 0
  },

  // ── Modal ──
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    backgroundColor: '#111111',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    width: '400px',
    border: '1px solid #2a2a2a',
    boxShadow: '0 40px 80px rgba(0,0,0,0.8)'
  },
  modalIcon: { fontSize: '48px', marginBottom: '16px' },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '12px'
  },
  modalDesc: {
    color: '#8b8b8b',
    fontSize: '15px',
    marginBottom: '8px',
    lineHeight: '1.6'
  },
  modalWarning: {
    color: '#f59e0b',
    fontSize: '13px',
    marginBottom: '24px',
    backgroundColor: '#f59e0b10',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #f59e0b30'
  },
  modalBtns: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginTop: '24px'
  },
  modalCancelBtn: {
    backgroundColor: '#1a1a1a',
    color: '#8b8b8b',
    border: '1px solid #2a2a2a',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  modalSubmitBtn: {
    backgroundColor: '#f0a500',
    color: '#000000',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px'
  }
};

export default Quiz;