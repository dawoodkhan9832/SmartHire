const User = require('../models/User');
const Challenge = require('../models/Challenge');
const MCQ = require('../models/MCQ');
const Submission = require('../models/Submission');

const getAdminStats = async (req, res) => {
  try {
    // Count everything
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalChallenges = await Challenge.countDocuments();
    const totalMCQs = await MCQ.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Calculate average score
    const users = await User.find({ role: 'student' });
    const avgScore = users.length > 0
      ? Math.round(
          users.reduce((sum, u) => sum + u.totalScore, 0) / users.length
        )
      : 0;

    // Get recent users
    const recentUsers = await User.find({ role: 'student' })
      .select('name email totalScore badges createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top performers
    const topStudents = await User.find({ role: 'student' })
      .select('name totalScore badges')
      .sort({ totalScore: -1 })
      .limit(5);

    res.status(200).json({
      totalUsers,
      totalChallenges,
      totalMCQs,
      totalSubmissions,
      avgScore,
      recentUsers,
      topStudents
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { getAdminStats };