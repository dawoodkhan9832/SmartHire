const MCQ = require('../models/MCQ');

// GET all MCQs for students (hide correct answer)
const getMCQs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const mcqs = await MCQ.find(filter).select('-correctAnswer');
    res.status(200).json(mcqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET all MCQs for admin (show correct answer)
const getAllMCQsAdmin = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    const mcqs = await MCQ.find(filter).sort({ category: 1 });
    res.status(200).json(mcqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE MCQ
const createMCQ = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty } = req.body;
    const mcq = await MCQ.create({
      question, options, correctAnswer, category, difficulty
    });
    res.status(201).json({ message: 'MCQ created successfully', mcq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SUBMIT quiz answers
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    let score = 0;
    let correct = 0;
    let wrong = 0;
    const total = answers.length;
    const detailedResults = [];

    for (const answer of answers) {
      const mcq = await MCQ.findById(answer.mcqId);
      if (mcq) {
        const isCorrect = mcq.correctAnswer === answer.selectedOption;
        if (isCorrect) { correct++; score += 10; }
        else { wrong++; }
        detailedResults.push({
          question: mcq.question,
          options: mcq.options,
          selectedOption: answer.selectedOption,
          correctAnswer: mcq.correctAnswer,
          isCorrect
        });
      }
    }

    const accuracy = total > 0
      ? ((correct / total) * 100).toFixed(2) : 0;

    res.status(200).json({
      score, correct, wrong, total,
      accuracy: `${accuracy}%`,
      detailedResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE MCQ
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

// UPDATE MCQ
const updateMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }
    res.status(200).json({ message: 'MCQ updated', mcq });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMCQs,
  getAllMCQsAdmin,
  createMCQ,
  submitQuiz,
  deleteMCQ,
  updateMCQ
};