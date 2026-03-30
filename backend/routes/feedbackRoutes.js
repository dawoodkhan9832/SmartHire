const express = require('express');
const router = express.Router();
const { getAIFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAIFeedback);

module.exports = router;