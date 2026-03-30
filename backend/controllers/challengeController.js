const Challenge = require('../models/Challenge');

// GET all challenges (students see this)
const getChallenges = async (req, res) => {
  try {
    // Hide test cases from students
    const challenges = await Challenge.find()
      .select('-testCases');
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET single challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .select('-testCases');
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    res.status(200).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE challenge (admin only)
const createChallenge = async (req, res) => {
  try {
    const { title, description, difficulty, maxScore, testCases } = req.body;

    const challenge = await Challenge.create({
      title,
      description,
      difficulty,
      maxScore,
      testCases,
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
      req.params.id,
      req.body,
      { new: true }
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
  getChallengeById, 
  createChallenge, 
  updateChallenge, 
  deleteChallenge 
};