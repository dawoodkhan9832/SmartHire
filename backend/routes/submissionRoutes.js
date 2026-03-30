const express = require('express');
const router = express.Router();
const {
  submitCode,
  getMySubmissions,
  getLeaderboard
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

// Submit code
router.post('/', protect, submitCode);

// Get my submissions
router.get('/my', protect, getMySubmissions);

// Get leaderboard
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;