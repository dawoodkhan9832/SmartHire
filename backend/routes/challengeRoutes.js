const express = require('express');
const router = express.Router();
const {
  getChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge
} = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (any logged in user)
router.get('/', protect, getChallenges);
router.get('/:id', protect, getChallengeById);

// Admin only routes
router.post('/', protect, createChallenge);
router.put('/:id', protect, updateChallenge);
router.delete('/:id', protect, deleteChallenge);

module.exports = router;