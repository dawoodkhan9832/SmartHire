const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const mcqRoutes = require('./routes/mcqRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const battleRoutes = require('./routes/battleRoutes');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/mcqs', mcqRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/battle', battleRoutes);

app.get('/', (req, res) => {
  res.send('SmartHire Backend is Running!');
});

// ── SOCKET.IO BATTLE LOGIC ──────────────────────

const battleRooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Player joins a battle room
  socket.on('join_battle', ({ roomCode, userId, userName }) => {
    socket.join(roomCode);

    if (!battleRooms[roomCode]) {
      battleRooms[roomCode] = { players: [], started: false };
    }

    // Add player if not already in room
    const existing = battleRooms[roomCode].players.find(p => p.userId === userId);
    if (!existing) {
      battleRooms[roomCode].players.push({ userId, userName, socketId: socket.id });
    }

    console.log(`${userName} joined room ${roomCode}`);

    // Notify everyone in room
    io.to(roomCode).emit('player_joined', {
      players: battleRooms[roomCode].players,
      count: battleRooms[roomCode].players.length
    });

    // Start game when 2 players are in room
    if (battleRooms[roomCode].players.length === 2 && !battleRooms[roomCode].started) {
      battleRooms[roomCode].started = true;

      // Countdown 3...2...1...GO!
      let count = 3;
      const countdown = setInterval(() => {
        io.to(roomCode).emit('countdown', { count });
        count--;
        if (count < 0) {
          clearInterval(countdown);
          io.to(roomCode).emit('battle_start');
          battleRooms[roomCode].startTime = Date.now();
        }
      }, 1000);
    }
  });

  // Player submitted code result
  socket.on('submit_result', ({ roomCode, userId, userName, passedTests, totalTests, score, status }) => {
    io.to(roomCode).emit('opponent_result', {
      userId, userName, passedTests, totalTests, score, status
    });

    // If someone passed all tests → they win!
    if (status === 'passed' && battleRooms[roomCode]) {
      io.to(roomCode).emit('battle_winner', {
        winnerId: userId,
        winnerName: userName
      });
    }
  });

  // Player typing update (optional live status)
  socket.on('typing_status', ({ roomCode, userId, status }) => {
    socket.to(roomCode).emit('opponent_typing', { userId, status });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Notify rooms this player was in
    for (const roomCode in battleRooms) {
      const room = battleRooms[roomCode];
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        io.to(roomCode).emit('player_left', { userName: player.userName });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});