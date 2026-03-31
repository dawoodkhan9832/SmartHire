const Challenge = require('../models/Challenge');

// GET all challenges for students (no test cases)
const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().select('-testCases');
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all challenges for admin (with test cases)
const getAllChallengesAdmin = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    const challengeData = {
      _id: challenge._id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      maxScore: challenge.maxScore,
      exampleInput: challenge.testCases[0]?.input || 'See description',
      exampleOutput: challenge.testCases[0]?.output || 'See description',
    };
    res.status(200).json(challengeData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE challenge (admin only)
const createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, maxScore, testCases } = req.body;
    const challenge = await Challenge.create({
      title, description, difficulty, maxScore, testCases,
      createdBy: req.user.id
    });
    res.status(201).json({
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE challenge (admin only)
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.status(200).json({ message: 'Challenge updated', challenge });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE challenge (admin only)
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.status(200).json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getChallenges,
  getAllChallengesAdmin,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge
};