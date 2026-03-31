const BattleRoom = require('../models/BattleRoom');
const Challenge = require('../models/Challenge');

// Generate random room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// CREATE a battle room
const createRoom = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name ||'Player';

    // Pick a random challenge
    const challenges = await Challenge.find();
    if (challenges.length === 0) {
      return res.status(400).json({ message: 'No challenges available' });
    }
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    // Generate unique room code
    let roomCode = generateRoomCode();
    let existing = await BattleRoom.findOne({ roomCode });
    while (existing) {
      roomCode = generateRoomCode();
      existing = await BattleRoom.findOne({ roomCode });
    }

    const room = await BattleRoom.create({
      roomCode,
      challengeId: randomChallenge._id,
      player1: {
        userId,
        name: userName,
        status: 'waiting'
      },
      status: 'waiting'
    });

    res.status(201).json({
      message: 'Room created',
      roomCode: room.roomCode,
      roomId: room._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// JOIN a battle room
const joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const userId = req.user.id;
    const userName = req.user.name || 'Player';

    const room = await BattleRoom.findOne({ roomCode: roomCode.toUpperCase() });

    if (!room) {
      return res.status(404).json({ message: 'Room not found! Check the code.' });
    }
    if (room.status !== 'waiting') {
      return res.status(400).json({ message: 'Room is already full or game started!' });
    }
    if (room.player1.userId.toString() === userId) {
      return res.status(400).json({ message: 'You created this room! Share the code with a friend.' });
    }

    room.player2 = { userId, name: userName, status: 'waiting' };
    room.status = 'ready';
    await room.save();

    res.status(200).json({
      message: 'Joined room!',
      roomCode: room.roomCode,
      roomId: room._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET room details
const getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const room = await BattleRoom.findOne({ roomCode })
      .populate('challengeId', 'title description difficulty maxScore testCases exampleInput exampleOutput');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRoom, joinRoom, getRoom };