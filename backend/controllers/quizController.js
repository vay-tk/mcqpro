import Quiz from '../models/Quiz.js';
import MCQ from '../models/MCQ.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

export const getQuizzes = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { status: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate('mcqs')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json(quizzes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('mcqs')
      .populate('createdBy', 'name');

    if (!quiz || !quiz.status) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('mcqs');
    
    if (!quiz || !quiz.status) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Return quiz without correct answers
    const quizData = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz.mcqs.length,
      mcqs: quiz.mcqs.map(mcq => ({
        _id: mcq._id,
        question: mcq.question,
        options: mcq.options
      }))
    };

    res.json(quizData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTaken } = req.body;
    const userId = req.user._id;

    const quiz = await Quiz.findById(quizId).populate('mcqs');
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    const resultAnswers = [];

    quiz.mcqs.forEach((mcq, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer !== undefined && userAnswer === mcq.correctAnswer;
      
      if (isCorrect) {
        score++;
      }

      resultAnswers.push({
        mcq: mcq._id,
        selectedAnswer: userAnswer,
        correctAnswer: mcq.correctAnswer,
        isCorrect,
        question: mcq.question,
        options: mcq.options,
        explanation: mcq.explanation
      });
    });

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      answers: quiz.mcqs.map((mcq, index) => ({
        mcq: mcq._id,
        selectedAnswer: answers[index]
      })),
      score,
      totalQuestions: quiz.mcqs.length,
      timeTaken,
      completed: true
    });

    await quizAttempt.save();

    // Update user's quiz attempts
    await User.findByIdAndUpdate(userId, {
      $push: { quizAttempts: quizAttempt._id }
    });

    res.json({
      message: 'Quiz submitted successfully',
      score,
      totalQuestions: quiz.mcqs.length,
      percentage: ((score / quiz.mcqs.length) * 100).toFixed(2),
      timeTaken,
      answers: resultAnswers,
      attemptId: quizAttempt._id
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title category')
      .sort('-createdAt')
      .limit(20);

    res.json(attempts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Quiz.distinct('category', { status: true });
    res.json(categories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};