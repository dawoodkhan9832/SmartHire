const express = require('express');
const router = express.Router();
const {
  getMCQs,
  getAllMCQsAdmin,
  createMCQ,
  submitQuiz,
  deleteMCQ,
  updateMCQ
} = require('../controllers/mcqController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMCQs);
router.get('/admin/all', protect, getAllMCQsAdmin);
router.post('/submit', protect, submitQuiz);
router.post('/', protect, createMCQ);
router.delete('/:id', protect, deleteMCQ);
router.put('/:id', protect, updateMCQ);

module.exports = router;