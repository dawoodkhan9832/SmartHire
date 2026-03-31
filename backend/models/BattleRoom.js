const mongoose = require('mongoose');

const battleRoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  player1: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    status: { type: String, default: 'waiting' },
    score: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    finishedAt: Date
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    status: { type: String, default: 'waiting' },
    score: { type: Number, default: 0 },
    passedTests: { type: Number, default: 0 },
    finishedAt: Date
  },
  status: {
    type: String,
    enum: ['waiting', 'ready', 'active', 'finished'],
    default: 'waiting'
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startedAt: Date,
  finishedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('BattleRoom', battleRoomSchema);