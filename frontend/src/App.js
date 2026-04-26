import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import SolveChallenge from './pages/SolveChallenge';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import AIFeedback from './pages/AIFeedback';
import BattleLobby from './pages/BattleLobby';
import BattleArena from './pages/BattleArena';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<SolveChallenge />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/feedback" element={<AIFeedback />} />
          <Route path="/battle" element={<BattleLobby />} />
          <Route path="/battle/:roomCode" element={<BattleArena />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;