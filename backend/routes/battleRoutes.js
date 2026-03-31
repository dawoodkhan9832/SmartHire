const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, getRoom } = require('../controllers/battleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createRoom);
router.post('/join', protect, joinRoom);
router.get('/:roomCode', protect, getRoom);

module.exports = router;