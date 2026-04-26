import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { getChallengeById, submitCode } from '../services/api';
import { theme } from '../theme';

function SolveChallenge() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState(
    '// Write your solution here\nfunction solve(input) {\n  \n}'
  );
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchChallenge();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchChallenge = async () => {
    try {
      const res = await getChallengeById(id);
      setChallenge(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    if (lang === 'python') {
      setCode('# Write your solution here\ndef solve(input_val):\n    pass');
    } else {
      setCode('// Write your solution here\nfunction solve(input) {\n  \n}');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await submitCode({ challengeId: id, code, language });
      setResult(res.data.result);
      setActiveTab('result');
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (!challenge) {
    return (
      <div style={s.loadingScreen}>
        <div style={s.loadingSpinner}>⚡</div>
        <p style={{ color: theme.text.muted }}>Loading challenge...</p>
      </div>
    );
  }

  return (
    <div style={s.container}>

      {/* ── TOP NAVBAR ── */}
      <nav style={s.navbar}>
        <div style={s.navLeft}>
          <span
            style={s.navLogo}
            onClick={() => navigate('/challenges')}
          >
            SmartHire
          </span>
          <span style={s.navSep}>/</span>
          <span style={s.navChallenge}>{challenge.title}</span>
        </div>

        <div style={s.navCenter}>
          <span style={{
            ...s.diffBadge,
            color: theme.difficulty[challenge.difficulty],
            borderColor: theme.difficulty[challenge.difficulty]
          }}>
            {challenge.difficulty}
          </span>
          <span style={s.maxScore}>{challenge.maxScore} pts</span>
        </div>

        <div style={s.navRight}>
          <span style={{
            ...s.timer,
            color: timeLeft < 300 ? theme.colors.error : theme.text.primary
          }}>
            ⏱ {formatTime(timeLeft)}
          </span>
          <button
            onClick={() => navigate('/challenges')}
            style={s.backBtn}
          >
            ← Back
          </button>
        </div>
      </nav>

      {/* ── MAIN LAYOUT ── */}
      <div style={s.mainLayout}>

        {/* ── LEFT PANEL ── */}
        <div style={s.leftPanel}>

          {/* Tabs */}
          <div style={s.tabs}>
            {['description', 'result'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...s.tabBtn,
                  color: activeTab === tab
                    ? theme.colors.primary : theme.text.muted,
                  borderBottom: activeTab === tab
                    ? `2px solid ${theme.colors.primary}` : '2px solid transparent'
                }}
              >
                {tab === 'description' ? '📋 Description' : '✅ Results'}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === 'description' && (
            <div style={s.tabContent}>
              <h2 style={s.challengeTitle}>{challenge.title}</h2>
              <p style={s.challengeDesc}>{challenge.description}</p>

              <div style={s.exampleBox}>
                <p style={s.exampleLabel}>📌 Example</p>
                <div style={s.exampleCode}>
                  <p style={s.exampleLine}>
                    <span style={s.exampleKey}>Input:</span>
                    <span style={s.exampleVal}>
                      "{challenge.exampleInput}"
                    </span>
                  </p>
                  <p style={s.exampleLine}>
                    <span style={s.exampleKey}>Output:</span>
                    <span style={s.exampleVal}>
                      "{challenge.exampleOutput}"
                    </span>
                  </p>
                </div>
              </div>

              <div style={s.noteBox}>
                <p style={s.noteLabel}>📝 Function Signature</p>
                <code style={s.noteCode}>
                  {language === 'python'
                    ? 'def solve(input_val): ...'
                    : 'function solve(input) { ... }'}
                </code>
              </div>

              <div style={s.constraintsBox}>
                <p style={s.constraintsLabel}>⚡ Constraints</p>
                <p style={s.constraintItem}>
                  • Time limit: 5 seconds
                </p>
                <p style={s.constraintItem}>
                  • Your function must be named{' '}
                  <code style={s.inlineCode}>solve</code>
                </p>
                <p style={s.constraintItem}>
                  • Return the answer, don't print it
                </p>
              </div>
            </div>
          )}

          {/* Result Tab */}
          {activeTab === 'result' && (
            <div style={s.tabContent}>
              {result ? (
                <div>
                  <div style={{
                    ...s.resultHeader,
                    borderColor: result.status === 'passed'
                      ? theme.colors.success
                      : result.status === 'partial'
                      ? theme.colors.warning
                      : theme.colors.error
                  }}>
                    <span style={{
                      fontSize: '32px',
                      color: result.status === 'passed'
                        ? theme.colors.success
                        : result.status === 'partial'
                        ? theme.colors.warning
                        : theme.colors.error
                    }}>
                      {result.status === 'passed' ? '✅' :
                       result.status === 'partial' ? '⚠️' : '❌'}
                    </span>
                    <div>
                      <p style={{
                        ...s.resultStatus,
                        color: result.status === 'passed'
                          ? theme.colors.success
                          : result.status === 'partial'
                          ? theme.colors.warning
                          : theme.colors.error
                      }}>
                        {result.status === 'passed'
                          ? 'Accepted!'
                          : result.status === 'partial'
                          ? 'Partial Solution'
                          : 'Wrong Answer'}
                      </p>
                      <p style={s.resultSub}>
                        {result.passedTests}/{result.totalTests} test cases passed
                      </p>
                    </div>
                  </div>

                  <div style={s.resultStats}>
                    <div style={s.resultStat}>
                      <p style={s.resultStatVal}>{result.score}</p>
                      <p style={s.resultStatLabel}>Score</p>
                    </div>
                    <div style={s.resultStat}>
                      <p style={s.resultStatVal}>
                        {result.passedTests}/{result.totalTests}
                      </p>
                      <p style={s.resultStatLabel}>Tests</p>
                    </div>
                    <div style={s.resultStat}>
                      <p style={s.resultStatVal}>{result.executionTime}ms</p>
                      <p style={s.resultStatLabel}>Runtime</p>
                    </div>
                  </div>

                  {/* Test case results */}
                  {result.testResults?.map((tc, i) => (
                    <div key={i} style={{
                      ...s.testCaseCard,
                      borderColor: tc.passed
                        ? theme.colors.success : theme.colors.error
                    }}>
                      <div style={s.testCaseHeader}>
                        <span style={{
                          color: tc.passed
                            ? theme.colors.success : theme.colors.error,
                          fontWeight: '700'
                        }}>
                          {tc.passed ? '✓' : '✗'} Test Case {i + 1}
                        </span>
                        <span style={{
                          ...s.testCaseBadge,
                          backgroundColor: tc.passed
                            ? '#00b8a320' : '#ef444420',
                          color: tc.passed
                            ? theme.colors.success : theme.colors.error
                        }}>
                          {tc.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div style={s.testCaseBody}>
                        <p style={s.tcLine}>
                          <span style={s.tcKey}>Input:</span>
                          <code style={s.tcVal}>{tc.input}</code>
                        </p>
                        <p style={s.tcLine}>
                          <span style={s.tcKey}>Expected:</span>
                          <code style={s.tcVal}>{tc.expected}</code>
                        </p>
                        <p style={s.tcLine}>
                          <span style={s.tcKey}>Got:</span>
                          <code style={{
                            ...s.tcVal,
                            color: tc.passed
                              ? theme.colors.success : theme.colors.error
                          }}>
                            {tc.got}
                          </code>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={s.noResult}>
                  <p style={{ fontSize: '48px' }}>🎯</p>
                  <p style={{ color: theme.text.muted }}>
                    Submit your code to see results here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL (Editor) ── */}
        <div style={s.rightPanel}>

          {/* Editor Header */}
          <div style={s.editorHeader}>
            <div style={s.langTabs}>
              {['javascript', 'python'].map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    ...s.langTab,
                    backgroundColor: language === lang
                      ? theme.bg.tertiary : 'transparent',
                    color: language === lang
                      ? theme.text.primary : theme.text.muted,
                    borderBottom: language === lang
                      ? `2px solid ${theme.colors.primary}`
                      : '2px solid transparent'
                  }}
                >
                  {lang === 'javascript' ? '⚡ JavaScript' : '🐍 Python'}
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...s.submitBtn,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <span>⏳ Running...</span>
              ) : (
                <span>▶ Run & Submit</span>
              )}
            </button>
          </div>

          {/* Monaco Editor */}
          <Editor
            height="calc(100vh - 110px)"
            language={language}
            value={code}
            onChange={(val) => setCode(val)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>
      </div>
    </div>
  );
}

const s = {
  loadingScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg.primary,
    gap: '16px'
  },
  loadingSpinner: { fontSize: '48px' },
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
  },
  navbar: {
    backgroundColor: theme.bg.navbar,
    borderBottom: `1px solid ${theme.border.primary}`,
    padding: '0 24px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  navLogo: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: '18px',
    cursor: 'pointer'
  },
  navSep: { color: theme.text.muted, fontSize: '16px' },
  navChallenge: {
    color: theme.text.secondary,
    fontSize: '14px',
    fontWeight: '500'
  },
  navCenter: { display: 'flex', alignItems: 'center', gap: '12px' },
  diffBadge: {
    border: '1px solid',
    padding: '3px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600'
  },
  maxScore: {
    color: theme.text.muted,
    fontSize: '13px'
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  timer: {
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'monospace'
  },
  backBtn: {
    backgroundColor: theme.bg.tertiary,
    color: theme.text.secondary,
    border: `1px solid ${theme.border.primary}`,
    padding: '5px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  mainLayout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  leftPanel: {
    width: '400px',
    backgroundColor: theme.bg.secondary,
    borderRight: `1px solid ${theme.border.primary}`,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden'
  },
  tabs: {
    display: 'flex',
    borderBottom: `1px solid ${theme.border.primary}`,
    flexShrink: 0
  },
  tabBtn: {
    padding: '12px 20px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  tabContent: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  challengeTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: '16px'
  },
  challengeDesc: {
    color: theme.text.secondary,
    fontSize: '15px',
    lineHeight: '1.8',
    marginBottom: '24px'
  },
  exampleBox: {
    backgroundColor: theme.bg.tertiary,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    border: `1px solid ${theme.border.primary}`
  },
  exampleLabel: {
    color: theme.text.muted,
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  exampleCode: { display: 'flex', flexDirection: 'column', gap: '6px' },
  exampleLine: { display: 'flex', alignItems: 'center', gap: '12px' },
  exampleKey: {
    color: theme.text.muted,
    fontSize: '13px',
    width: '60px'
  },
  exampleVal: {
    color: theme.colors.primary,
    fontFamily: 'monospace',
    fontSize: '14px',
    backgroundColor: theme.bg.primary,
    padding: '2px 8px',
    borderRadius: '4px'
  },
  noteBox: {
    backgroundColor: '#f0a50010',
    border: `1px solid #f0a50030`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  },
  noteLabel: {
    color: theme.colors.primary,
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  noteCode: {
    color: '#a8ff78',
    fontFamily: 'monospace',
    fontSize: '13px',
    backgroundColor: theme.bg.primary,
    padding: '8px 12px',
    borderRadius: '6px',
    display: 'block'
  },
  constraintsBox: {
    backgroundColor: theme.bg.tertiary,
    borderRadius: '8px',
    padding: '16px',
    border: `1px solid ${theme.border.primary}`
  },
  constraintsLabel: {
    color: theme.text.muted,
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  constraintItem: {
    color: theme.text.secondary,
    fontSize: '13px',
    marginBottom: '6px',
    lineHeight: '1.6'
  },
  inlineCode: {
    color: theme.colors.primary,
    backgroundColor: theme.bg.primary,
    padding: '1px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace'
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: theme.bg.tertiary,
    borderRadius: '10px',
    border: '1px solid',
    marginBottom: '20px'
  },
  resultStatus: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  resultSub: {
    color: theme.text.muted,
    fontSize: '13px'
  },
  resultStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  resultStat: {
    backgroundColor: theme.bg.tertiary,
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    border: `1px solid ${theme.border.primary}`
  },
  resultStatVal: {
    fontSize: '22px',
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: '4px'
  },
  resultStatLabel: {
    color: theme.text.muted,
    fontSize: '12px'
  },
  testCaseCard: {
    backgroundColor: theme.bg.tertiary,
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '12px',
    overflow: 'hidden'
  },
  testCaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    borderBottom: `1px solid ${theme.border.primary}`
  },
  testCaseBadge: {
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  testCaseBody: { padding: '12px 16px' },
  tcLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px'
  },
  tcKey: {
    color: theme.text.muted,
    fontSize: '12px',
    width: '70px',
    flexShrink: 0
  },
  tcVal: {
    color: theme.text.secondary,
    fontFamily: 'monospace',
    fontSize: '13px',
    backgroundColor: theme.bg.primary,
    padding: '2px 8px',
    borderRadius: '4px'
  },
  noResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: '16px'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  editorHeader: {
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.primary}`,
    padding: '0 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '45px',
    flexShrink: 0
  },
  langTabs: { display: 'flex', height: '100%' },
  langTab: {
    padding: '0 16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    height: '100%',
    transition: 'all 0.2s'
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    color: '#000000',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }
};

export default SolveChallenge;