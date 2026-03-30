const Submission = require('../models/Submission');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// SUBMIT code for a challenge
const submitCode = async (req, res) => {
  try {
    const { challengeId, code, language } = req.body;
    const userId = req.user.id;

    // Find the challenge with test cases
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const testCases = challenge.testCases;
    const totalTests = testCases.length;
    let passedTests = 0;

    // Simple evaluation logic
    // We simulate running code against test cases
    for (const testCase of testCases) {
      try {
        if (language === 'javascript') {
          // Create a function from submitted code and test it
          const fn = new Function('input', code + '\nreturn solve(input);');
          const result = fn(testCase.input);
          if (String(result).trim() === String(testCase.output).trim()) {
            passedTests++;
          }
        }
      } catch (err) {
        // Test case failed due to error
      }
    }

    // Calculate score
    const score = Math.round((passedTests / totalTests) * challenge.maxScore);

    // Determine status
    let status = 'failed';
    if (passedTests === totalTests) status = 'passed';
    else if (passedTests > 0) status = 'partial';

    // Save submission
    const submission = await Submission.create({
      userId,
      challengeId,
      code,
      language,
      score,
      passedTests,
      totalTests,
      executionTime: Math.floor(Math.random() * 500),
      status
    });

    // Update user total score
    await User.findByIdAndUpdate(userId, {
      $inc: { totalScore: score }
    });

    // Update badges based on total score
    const user = await User.findById(userId);
    const badges = [];
    if (user.totalScore >= 100) badges.push('Beginner');
    if (user.totalScore >= 500) badges.push('Intermediate');
    if (user.totalScore >= 1000) badges.push('Advanced');
    if (user.totalScore >= 2000) badges.push('Placement Ready');

    await User.findByIdAndUpdate(userId, { badges });

    res.status(201).json({
      message: 'Code submitted successfully',
      result: {
        passedTests,
        totalTests,
        score,
        status,
        executionTime: submission.executionTime
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all submissions by logged in student
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id })
      .populate('challengeId', 'title difficulty maxScore')
      .sort({ createdAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('name totalScore badges')
      .sort({ totalScore: -1 })
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { submitCode, getMySubmissions, getLeaderboard };