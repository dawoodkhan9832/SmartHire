
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

function BattleArena() {
  const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') 
  || 'http://localhost:5000';
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('// Write your solution here\nfunction solve(input) {\n  \n}');
  const [language, setLanguage] = useState('javascript');
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleFinished, setBattleFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [opponentResult, setOpponentResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [submitting, setSubmitting] = useState(false);
  const [playerLeft, setPlayerLeft] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/battle/${roomCode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setRoom(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRoom();
  }, [roomCode]);

  // Connect Socket.io
  useEffect(() => {
    if (!user) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL 
  || 'http://localhost:5000';
socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join_battle', {
      roomCode,
      userId: user.id,
      userName: user.name
    });

    socketRef.current.on('player_joined', ({ players, count }) => {
      setPlayers(players);
    });

    socketRef.current.on('countdown', ({ count }) => {
      setCountdown(count);
    });

    socketRef.current.on('battle_start', () => {
      setCountdown(null);
      setBattleStarted(true);
    });

    socketRef.current.on('opponent_result', (result) => {
      setOpponentResult(result);
    });

    socketRef.current.on('battle_winner', ({ winnerId, winnerName }) => {
      setWinner({ winnerId, winnerName });
      setBattleFinished(true);
    });

    socketRef.current.on('player_left', ({ userName }) => {
      setPlayerLeft(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, roomCode]);

  // Timer
  useEffect(() => {
    if (!battleStarted || battleFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setBattleFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [battleStarted, battleFinished]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async () => {
    if (!room?.challengeId) return;
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: room.challengeId._id,
          code,
          language
        })
      });
      const data = await res.json();
      if (res.ok) {
        const result = data.result;
        setMyResult(result);

        // Emit result to opponent via socket
        socketRef.current.emit('submit_result', {
          roomCode,
          userId: user.id,
          userName: user.name,
          passedTests: result.passedTests,
          totalTests: result.totalTests,
          score: result.score,
          status: result.status
        });

        if (result.status === 'passed') {
          setBattleFinished(true);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const getOpponentName = () => {
    if (!players.length) return 'Opponent';
    const opponent = players.find(p => p.userId !== user?.id);
    return opponent?.userName || 'Opponent';
  };

  // SCREEN: Waiting for opponent
  if (!battleStarted && countdown === null && !battleFinished) {
    return (
      <div style={styles.container}>
        <nav style={styles.navbar}>
          <h1 style={styles.navLogo}>SmartHire ⚔️ Battle</h1>
          <span style={styles.roomCodeBadge}>Room: {roomCode}</span>
        </nav>
        <div style={styles.centerScreen}>
          <div style={styles.waitingBox}>
            <div style={styles.pulseIcon}>⏳</div>
            <h2 style={styles.waitingTitle}>Waiting for opponent...</h2>
            <p style={styles.waitingDesc}>
              Share code <strong>{roomCode}</strong> with your friend!
            </p>
            <div style={styles.playersList}>
              {players.map((p, i) => (
                <div key={i} style={styles.playerChip}>
                  <div style={styles.playerAvatar}>
                    {p.userName?.charAt(0).toUpperCase()}
                  </div>
                  <span>{p.userName}</span>
                  {p.userId === user?.id && (
                    <span style={styles.youTag}>(You)</span>
                  )}
                </div>
              ))}
              {players.length < 2 && (
                <div style={{ ...styles.playerChip, opacity: 0.4 }}>
                  <div style={{ ...styles.playerAvatar, backgroundColor: '#e5e7eb' }}>?</div>
                  <span>Waiting...</span>
                </div>
              )}
            </div>
            <p style={styles.playersCount}>
              {players.length}/2 players joined
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN: Countdown
  if (countdown !== null && !battleStarted) {
    return (
      <div style={styles.container}>
        <nav style={styles.navbar}>
          <h1 style={styles.navLogo}>SmartHire ⚔️ Battle</h1>
        </nav>
        <div style={styles.centerScreen}>
          <div style={styles.countdownBox}>
            <p style={styles.getReady}>Get Ready!</p>
            <div style={styles.countdownNumber}>{countdown}</div>
            <p style={styles.countdownDesc}>Battle starting...</p>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN: Battle Finished
  if (battleFinished) {
    const iWon = winner?.winnerId === user?.id;
    return (
      <div style={styles.container}>
        <nav style={styles.navbar}>
          <h1 style={styles.navLogo}>SmartHire ⚔️ Battle</h1>
        </nav>
        <div style={styles.centerScreen}>
          <div style={styles.resultBox}>
            <div style={styles.resultEmoji}>
              {playerLeft ? '🚪' : iWon ? '🏆' : '😢'}
            </div>
            <h2 style={{
              ...styles.resultTitle,
              color: playerLeft ? '#f59e0b' : iWon ? '#10b981' : '#ef4444'
            }}>
              {playerLeft
                ? 'Opponent Left!'
                : iWon
                ? 'You Won! 🎉'
                : `${winner?.winnerName} Won!`}
            </h2>

            {myResult && (
              <div style={styles.myScore}>
                <p style={styles.myScoreLabel}>Your Result</p>
                <p style={styles.myScoreValue}>
                  {myResult.passedTests}/{myResult.totalTests} tests passed
                  — {myResult.score} pts
                </p>
              </div>
            )}

            {opponentResult && (
              <div style={{ ...styles.myScore, backgroundColor: '#fef2f2' }}>
                <p style={styles.myScoreLabel}>
                  {getOpponentName()}'s Result
                </p>
                <p style={styles.myScoreValue}>
                  {opponentResult.passedTests}/{opponentResult.totalTests} tests
                  — {opponentResult.score} pts
                </p>
              </div>
            )}

            <div style={styles.resultBtns}>
              <button
                onClick={() => navigate('/battle')}
                style={styles.playAgainBtn}
              >
                Play Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={styles.dashBtn}
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN: Battle Arena
  return (
    <div style={styles.arenaContainer}>
      {/* Navbar */}
      <nav style={styles.arenNavbar}>
        <span style={styles.roomBadge}>⚔️ {roomCode}</span>

        {/* Players status */}
        <div style={styles.playersStatus}>
          <div style={styles.playerStatus}>
            <div style={styles.statusAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.statusName}>{user?.name}</span>
            {myResult && (
              <span style={{
                ...styles.statusBadge,
                backgroundColor: myResult.status === 'passed' ? '#10b981' : '#f59e0b'
              }}>
                {myResult.passedTests}/{myResult.totalTests}
              </span>
            )}
          </div>

          <div style={styles.vsText}>VS</div>

          <div style={styles.playerStatus}>
            <div style={{ ...styles.statusAvatar, backgroundColor: '#ef4444' }}>
              {getOpponentName()?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.statusName}>{getOpponentName()}</span>
            {opponentResult && (
              <span style={{
                ...styles.statusBadge,
                backgroundColor: opponentResult.status === 'passed' ? '#10b981' : '#f59e0b'
              }}>
                {opponentResult.passedTests}/{opponentResult.totalTests}
              </span>
            )}
          </div>
        </div>

        <span style={{
          ...styles.timer,
          color: timeLeft < 300 ? '#ef4444' : 'white'
        }}>
          ⏱ {formatTime(timeLeft)}
        </span>
      </nav>

      <div style={styles.arenaLayout}>
        {/* Left — Problem */}
        <div style={styles.problemPanel}>
          {room?.challengeId ? (
            <>
              <div style={styles.problemHeader}>
                <span style={{
                  ...styles.diffBadge,
                  backgroundColor:
                    room.challengeId.difficulty === 'Easy' ? '#10b981' :
                    room.challengeId.difficulty === 'Medium' ? '#f59e0b' : '#ef4444'
                }}>
                  {room.challengeId.difficulty}
                </span>
                <span style={styles.maxScore}>
                  {room.challengeId.maxScore} pts
                </span>
              </div>
              <h2 style={styles.problemTitle}>
                {room.challengeId.title}
              </h2>
              <p style={styles.problemDesc}>
                {room.challengeId.description}
              </p>
              <div style={styles.exampleBox}>
                <h4 style={styles.exampleTitle}>📌 Example:</h4>
                <p style={styles.exampleText}>
                  Input: "{room.challengeId.exampleInput}"<br />
                  Output: "{room.challengeId.exampleOutput}"
                </p>
              </div>
              <div style={styles.noteBox}>
                <h4 style={styles.noteTitle}>📝 Note:</h4>
                <code style={styles.codeHint}>
                  {language === 'python'
                    ? 'def solve(input_val): ...'
                    : 'function solve(input) { ... }'}
                </code>
              </div>

              {/* My result */}
              {myResult && (
                <div style={{
                  ...styles.resultCard,
                  borderColor: myResult.status === 'passed' ? '#10b981' :
                    myResult.status === 'partial' ? '#f59e0b' : '#ef4444'
                }}>
                  <h3 style={{
                    color: myResult.status === 'passed' ? '#10b981' :
                      myResult.status === 'partial' ? '#f59e0b' : '#ef4444',
                    marginBottom: '8px'
                  }}>
                    {myResult.status === 'passed' ? '🎉 All Tests Passed!' :
                     myResult.status === 'partial' ? '⚠️ Partial' : '❌ Failed'}
                  </h3>
                  <p>✅ {myResult.passedTests}/{myResult.totalTests} tests</p>
                  <p>🏆 {myResult.score} pts</p>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#6b7280' }}>Loading challenge...</p>
          )}
        </div>

        {/* Right — Editor */}
        <div style={styles.editorPanel}>
          <div style={styles.editorHeader}>
            <select
              value={language}
              onChange={e => {
                setLanguage(e.target.value);
                if (e.target.value === 'python') {
                  setCode('# Write your solution here\ndef solve(input_val):\n    pass');
                } else {
                  setCode('// Write your solution here\nfunction solve(input) {\n  \n}');
                }
              }}
              style={styles.langSelect}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? '⏳ Submitting...' : '🚀 Submit Code'}
            </button>
          </div>
          <Editor
            height="calc(100vh - 110px)"
            language={language}
            value={code}
            onChange={val => setCode(val)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 }
            }}
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4ff' },
  navbar: {
    backgroundColor: '#4f46e5', padding: '16px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  navLogo: { color: 'white', fontSize: '22px', fontWeight: '700' },
  roomCodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', color: 'white',
    padding: '6px 16px', borderRadius: '20px', fontSize: '16px', fontWeight: '700'
  },
  centerScreen: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: 'calc(100vh - 70px)'
  },
  waitingBox: {
    backgroundColor: 'white', borderRadius: '20px', padding: '48px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '480px', width: '100%'
  },
  pulseIcon: { fontSize: '64px', marginBottom: '16px' },
  waitingTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' },
  waitingDesc: { color: '#6b7280', marginBottom: '24px', fontSize: '16px' },
  playersList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' },
  playerChip: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: '#f9fafb', borderRadius: '10px', padding: '12px 16px'
  },
  playerAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: '#4f46e5', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '16px'
  },
  youTag: { color: '#4f46e5', fontSize: '13px', fontWeight: '600', marginLeft: 'auto' },
  playersCount: { color: '#9ca3af', fontSize: '14px' },
  countdownBox: { textAlign: 'center' },
  getReady: { fontSize: '24px', color: '#4f46e5', fontWeight: '600', marginBottom: '16px' },
  countdownNumber: {
    fontSize: '120px', fontWeight: '700', color: '#4f46e5',
    lineHeight: 1, marginBottom: '16px'
  },
  countdownDesc: { fontSize: '18px', color: '#6b7280' },
  resultBox: {
    backgroundColor: 'white', borderRadius: '20px', padding: '48px',
    textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '480px', width: '100%'
  },
  resultEmoji: { fontSize: '80px', marginBottom: '16px' },
  resultTitle: { fontSize: '32px', fontWeight: '700', marginBottom: '24px' },
  myScore: {
    backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px',
    marginBottom: '12px'
  },
  myScoreLabel: { color: '#6b7280', fontSize: '13px', marginBottom: '4px' },
  myScoreValue: { color: '#1f2937', fontWeight: '600', fontSize: '16px' },
  resultBtns: { display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' },
  playAgainBtn: {
    backgroundColor: '#4f46e5', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
  },
  dashBtn: {
    backgroundColor: 'white', color: '#4f46e5', border: '2px solid #4f46e5',
    padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
  },
  arenaContainer: { height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e' },
  arenNavbar: {
    backgroundColor: '#4f46e5', padding: '10px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0
  },
  roomBadge: { color: 'white', fontWeight: '700', fontSize: '16px' },
  playersStatus: { display: 'flex', alignItems: 'center', gap: '16px' },
  playerStatus: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    backgroundColor: '#4f46e5', border: '2px solid white',
    color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontWeight: '700', fontSize: '14px'
  },
  statusName: { color: 'white', fontSize: '14px', fontWeight: '500' },
  statusBadge: {
    color: 'white', padding: '2px 8px', borderRadius: '10px',
    fontSize: '12px', fontWeight: '700'
  },
  vsText: {
    color: 'white', fontWeight: '700', fontSize: '18px',
    backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '8px'
  },
  timer: { fontSize: '18px', fontWeight: '700', color: 'white' },
  arenaLayout: { display: 'flex', flex: 1, overflow: 'hidden' },
  problemPanel: {
    width: '380px', backgroundColor: 'white', padding: '24px',
    overflowY: 'auto', flexShrink: 0
  },
  problemHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '16px'
  },
  diffBadge: {
    color: 'white', padding: '4px 12px', borderRadius: '12px',
    fontSize: '12px', fontWeight: '600'
  },
  maxScore: { color: '#4f46e5', fontWeight: '700' },
  problemTitle: { fontSize: '22px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' },
  problemDesc: { color: '#4b5563', lineHeight: '1.7', marginBottom: '16px', fontSize: '15px' },
  exampleBox: { backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '12px' },
  exampleTitle: { color: '#1f2937', marginBottom: '8px', fontSize: '14px' },
  exampleText: { fontFamily: 'monospace', fontSize: '14px', color: '#374151', lineHeight: '1.6' },
  noteBox: { backgroundColor: '#eff6ff', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid #bfdbfe' },
  noteTitle: { color: '#1e40af', marginBottom: '8px', fontSize: '14px' },
  codeHint: { backgroundColor: '#1e1e1e', color: '#10b981', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', display: 'block' },
  resultCard: { border: '2px solid', borderRadius: '12px', padding: '16px', marginTop: '16px' },
  editorPanel: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  editorHeader: {
    backgroundColor: '#2d2d2d', padding: '10px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  langSelect: {
    backgroundColor: '#3d3d3d', color: 'white', border: 'none',
    padding: '6px 12px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer'
  },
  submitBtn: {
    backgroundColor: '#10b981', color: 'white', border: 'none',
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600'
  }
};

export default BattleArena;