const User = require('../models/User');
const Submission = require('../models/Submission');

const getAIFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    const submissions = await Submission.find({ userId })
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter(
      s => s.status === 'passed'
    ).length;
    const avgScore = totalSubmissions > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions
        )
      : 0;

    const totalScore = user.totalScore;

    let overallRating = 'Needs Improvement';
    let readiness = '30%';
    if (totalScore >= 1000) { overallRating = 'Good'; readiness = '85%'; }
    else if (totalScore >= 500) { overallRating = 'Good'; readiness = '70%'; }
    else if (totalScore >= 200) { overallRating = 'Average'; readiness = '50%'; }
    else if (totalScore >= 100) { overallRating = 'Average'; readiness = '40%'; }

    const passRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    const feedback = {
      overallRating,
      summary: `${user.name} has completed ${totalSubmissions} coding challenges with a ${passRate}% pass rate and earned ${totalScore} total points. ${
        totalScore >= 500
          ? 'Showing strong consistent performance.'
          : 'Keep practicing to improve your placement readiness.'
      }`,
      strongAreas: totalScore >= 200
        ? ['Problem Solving', 'Code Logic', 'String Manipulation']
        : ['Attempting Challenges', 'Learning Attitude'],
      weakAreas: passRate < 70
        ? ['Algorithm Optimization', 'Time Complexity', 'Edge Cases']
        : ['Advanced Data Structures', 'System Design'],
      improvements: [
        'Practice at least 2 coding challenges daily',
        'Study DBMS concepts — SQL, Normalization, Joins',
        'Review OS concepts — Process Management, Memory',
        'Focus on time and space complexity',
        'Attempt mock placement tests regularly'
      ],
      nextSteps: [
        `Complete ${Math.max(5 - totalSubmissions, 1)} more coding challenges`,
        'Take the DBMS quiz to test your knowledge',
        'Aim for the Intermediate badge (500 points)',
        'Review failed test cases and learn from them'
      ],
      motivationalMessage: totalScore >= 500
        ? `Excellent work ${user.name}! You are well on your way to placement success!`
        : `Keep going ${user.name}! Every challenge brings you closer to your dream placement!`,
      estimatedReadiness: readiness
    };

    res.status(200).json({
      feedback,
      studentData: {
        name: user.name,
        totalScore: user.totalScore,
        badges: user.badges,
        totalSubmissions,
        passedSubmissions,
        avgScore
      }
    });

  } catch (error) {
    console.log('Feedback Error:', error.message);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { getAIFeedback };