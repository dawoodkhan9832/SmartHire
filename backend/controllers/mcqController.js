const MCQ = require('../models/MCQ');

// GET all MCQs (with optional category filter)
const getMCQs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    // Hide correct answer from students
    const mcqs = await MCQ.find(filter).select('-correctAnswer');
    res.status(200).json(mcqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE MCQ (admin only)
const createMCQ = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;

    const mcq = await MCQ.create({
      question,
      options,
      correctAnswer,
      category,
      difficulty
    });

    res.status(201).json({ message: 'MCQ created successfully', mcq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SUBMIT quiz answers and get score
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    // answers = [ { mcqId: "xxx", selectedOption: "A" }, ... ]

    let score = 0;
    let correct = 0;
    let wrong = 0;
    const total = answers.length;

    for (const answer of answers) {
      const mcq = await MCQ.findById(answer.mcqId);
      if (mcq && mcq.correctAnswer === answer.selectedOption) {
        correct++;
        score += 10; // 10 points per correct answer
      } else {
        wrong++;
      }
    }

    const accuracy = ((correct / total) * 100).toFixed(2);

    res.status(200).json({
      score,
      correct,
      wrong,
      total,
      accuracy: `${accuracy}%`
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE MCQ (admin only)
const deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }
    res.status(200).json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMCQs, createMCQ, submitQuiz, deleteMCQ };