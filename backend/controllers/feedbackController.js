const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Submission = require('../models/Submission');

const getAIFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data from MongoDB
    const user = await User.findById(userId);

    // Get user submissions
    const submissions = await Submission.find({ userId })
      .populate('challengeId', 'title difficulty')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate stats
    const totalSubmissions = submissions.length;
    const passedSubmissions = submissions.filter(
      s => s.status === 'passed'
    ).length;
    const avgScore = totalSubmissions > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions
        )
      : 0;
    const passRate = totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

    // Build submission summary
    const submissionSummary = submissions.length > 0
      ? submissions.map(s =>
          `- ${s.challengeId?.title || 'Challenge'} (${s.challengeId?.difficulty || 'Unknown'}): ${s.status} — ${s.score} pts`
        ).join('\n')
      : 'No submissions yet';

    // Build prompt for Gemini
    const prompt = `
You are an expert placement preparation coach for a platform called SmartHire.

Analyze this student's performance and provide detailed feedback:

Student Name: ${user.name}
Total Score: ${user.totalScore}
Badges Earned: ${user.badges.length > 0 ? user.badges.join(', ') : 'None yet'}
Total Submissions: ${totalSubmissions}
Passed Challenges: ${passedSubmissions}
Pass Rate: ${passRate}%
Average Score: ${avgScore} pts

Recent Submissions:
${submissionSummary}

Based on this data, provide a comprehensive performance analysis.

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "overallRating": "Good",
  "summary": "2-3 sentence personalized summary mentioning the student by name",
  "strongAreas": ["specific area 1", "specific area 2", "specific area 3"],
  "weakAreas": ["specific area 1", "specific area 2", "specific area 3"],
  "improvements": [
    "specific actionable improvement tip 1",
    "specific actionable improvement tip 2",
    "specific actionable improvement tip 3",
    "specific actionable improvement tip 4"
  ],
  "nextSteps": [
    "concrete next step 1",
    "concrete next step 2",
    "concrete next step 3"
  ],
  "motivationalMessage": "personalized encouraging message for ${user.name}",
  "estimatedReadiness": "65%"
}

Rules:
- overallRating must be exactly one of: "Good", "Average", "Needs Improvement"
- estimatedReadiness must be a percentage like "65%"
- Base the rating on: score >= 1000 = Good, score >= 300 = Average, else Needs Improvement
- Make feedback specific to their actual performance data
- Be encouraging but honest
`;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Response:', text);

    // Parse JSON from response
    let feedback;
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      feedback = JSON.parse(cleanText);
    } catch (parseErr) {
      console.log('Parse error, using fallback');

      // Fallback to smart mock if parsing fails
      feedback = generateSmartMock(
        user.name,
        user.totalScore,
        totalSubmissions,
        passedSubmissions,
        passRate,
        avgScore
      );
    }

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

    // If Gemini fails, use smart mock as backup
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const submissions = await Submission.find({ userId });
      const totalSubmissions = submissions.length;
      const passedSubmissions = submissions.filter(s => s.status === 'passed').length;
      const avgScore = totalSubmissions > 0
        ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions)
        : 0;
      const passRate = totalSubmissions > 0
        ? Math.round((passedSubmissions / totalSubmissions) * 100)
        : 0;

      const feedback = generateSmartMock(
        user.name,
        user.totalScore,
        totalSubmissions,
        passedSubmissions,
        passRate,
        avgScore
      );

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
    } catch (fallbackErr) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      });
    }
  }
};

// Smart mock fallback function
const generateSmartMock = (
  name, totalScore, totalSubmissions,
  passedSubmissions, passRate, avgScore
) => {
  let overallRating = 'Needs Improvement';
  let readiness = '30%';

  if (totalScore >= 1000) { overallRating = 'Good'; readiness = '85%'; }
  else if (totalScore >= 500) { overallRating = 'Good'; readiness = '70%'; }
  else if (totalScore >= 300) { overallRating = 'Average'; readiness = '55%'; }
  else if (totalScore >= 100) { overallRating = 'Average'; readiness = '40%'; }

  return {
    overallRating,
    summary: `${name} has completed ${totalSubmissions} coding challenges with a ${passRate}% pass rate and earned ${totalScore} total points. ${
      totalScore >= 500
        ? 'Showing strong and consistent performance across challenges.'
        : 'Keep practicing consistently to improve your placement readiness.'
    }`,
    strongAreas: totalScore >= 200
      ? ['Problem Solving', 'Code Logic', 'String Manipulation']
      : ['Attempting Challenges', 'Learning Attitude', 'Consistency'],
    weakAreas: passRate < 70
      ? ['Algorithm Optimization', 'Time Complexity', 'Edge Cases']
      : ['Advanced Data Structures', 'System Design', 'Dynamic Programming'],
    improvements: [
      'Practice at least 2 coding challenges every day',
      'Study DBMS concepts — SQL queries, Normalization, Joins',
      'Review OS concepts — Process Management, Memory Management',
      'Focus on understanding time and space complexity',
      'Attempt mock placement tests regularly to build confidence'
    ],
    nextSteps: [
      `Complete ${Math.max(5 - totalSubmissions, 1)} more coding challenges this week`,
      'Take the DBMS quiz to identify knowledge gaps',
      'Aim for the next badge level to track your progress',
      'Review your failed test cases and understand the correct approach'
    ],
    motivationalMessage: totalScore >= 500
      ? `Excellent work ${name}! You are well on your way to placement success. Keep this momentum going and you will crack your dream company!`
      : `Keep going ${name}! Every challenge you solve brings you one step closer to your dream placement. Consistency is the key to success!`,
    estimatedReadiness: readiness
  };
};

module.exports = { getAIFeedback };