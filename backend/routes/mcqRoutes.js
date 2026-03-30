const express = require('express');
const router = express.Router();
const { 
  getMCQs, 
  createMCQ, 
  submitQuiz, 
  deleteMCQ 
} = require('../controllers/mcqController');
const { protect } = require('../middleware/authMiddleware');

// Get all MCQs (students)
router.get('/', protect, getMCQs);

// Create MCQ (admin)
router.post('/', protect, createMCQ);

// Submit quiz answers
router.post('/submit', protect, submitQuiz);

// Delete MCQ (admin)
router.delete('/:id', protect, deleteMCQ);

module.exports = router;