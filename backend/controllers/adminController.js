import MCQ from '../models/MCQ.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalMCQs = await MCQ.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments();

    const recentAttempts = await QuizAttempt.find()
      .populate('user', 'name email')
      .populate('quiz', 'title')
      .sort('-createdAt')
      .limit(10);

    const categoryStats = await Quiz.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalUsers,
      totalQuizzes,
      totalMCQs,
      totalAttempts,
      recentAttempts,
      categoryStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllMCQs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }

    const mcqs = await MCQ.find(filter)
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MCQ.countDocuments(filter);

    res.json({
      mcqs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const createMCQ = async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty, explanation } = req.body;

    // Validation
    if (!question || !options || options.length !== 4) {
      return res.status(400).json({ message: 'Question and 4 options are required' });
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: 'Correct answer must be between 0 and 3' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const mcq = new MCQ({
      question,
      options,
      correctAnswer: parseInt(correctAnswer),
      category,
      difficulty: difficulty || 'medium',
      explanation: explanation || '',
      createdBy: req.user._id
    });

    await mcq.save();
    await mcq.populate('createdBy', 'name');
    res.status(201).json(mcq);
  } catch (error) {
    console.error('Create MCQ error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    res.json(mcq);
  } catch (error) {
    console.error('Update MCQ error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id);
    if (!mcq) {
      return res.status(404).json({ message: 'MCQ not found' });
    }

    // Remove from quizzes
    await Quiz.updateMany(
      { mcqs: req.params.id },
      { $pull: { mcqs: req.params.id } }
    );

    res.json({ message: 'MCQ deleted successfully' });
  } catch (error) {
    console.error('Delete MCQ error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('mcqs')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { title, description, mcqs, timeLimit, category, status } = req.body;

    console.log('Creating quiz with data:', { title, description, mcqs, timeLimit, category, status });

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    if (!mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ message: 'At least one MCQ must be selected' });
    }

    if (!timeLimit || timeLimit < 1) {
      return res.status(400).json({ message: 'Time limit must be at least 1 minute' });
    }

    // Verify all MCQs exist
    const existingMCQs = await MCQ.find({ _id: { $in: mcqs } });
    if (existingMCQs.length !== mcqs.length) {
      return res.status(400).json({ message: 'Some selected MCQs do not exist' });
    }

    const quiz = new Quiz({
      title,
      description,
      mcqs,
      timeLimit: parseInt(timeLimit),
      category,
      status: status !== undefined ? status : true,
      createdBy: req.user._id
    });

    await quiz.save();
    await quiz.populate(['mcqs', { path: 'createdBy', select: 'name' }]);
    
    console.log('Quiz created successfully:', quiz._id);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { title, description, mcqs, timeLimit, category, status } = req.body;

    // Validation
    if (mcqs && (!Array.isArray(mcqs) || mcqs.length === 0)) {
      return res.status(400).json({ message: 'At least one MCQ must be selected' });
    }

    if (timeLimit && timeLimit < 1) {
      return res.status(400).json({ message: 'Time limit must be at least 1 minute' });
    }

    // If MCQs are being updated, verify they exist
    if (mcqs) {
      const existingMCQs = await MCQ.find({ _id: { $in: mcqs } });
      if (existingMCQs.length !== mcqs.length) {
        return res.status(400).json({ message: 'Some selected MCQs do not exist' });
      }
    }

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(mcqs && { mcqs }),
      ...(timeLimit && { timeLimit: parseInt(timeLimit) }),
      ...(category && { category }),
      ...(status !== undefined && { status })
    };

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate(['mcqs', { path: 'createdBy', select: 'name' }]);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const bulkUploadMCQs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const mcqs = [];

    if (req.file.mimetype === 'text/csv') {
      // Parse CSV
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            for (const row of results) {
              if (row.question && row.option1 && row.option2 && row.option3 && row.option4) {
                const mcq = new MCQ({
                  question: row.question,
                  options: [row.option1, row.option2, row.option3, row.option4],
                  correctAnswer: parseInt(row.correctAnswer) || 0,
                  category: row.category || 'General',
                  difficulty: row.difficulty || 'medium',
                  explanation: row.explanation || '',
                  createdBy: req.user._id
                });
                mcqs.push(mcq);
              }
            }

            await MCQ.insertMany(mcqs);
            fs.unlinkSync(filePath);
            res.json({ message: `${mcqs.length} MCQs uploaded successfully` });
          } catch (error) {
            fs.unlinkSync(filePath);
            console.error('CSV upload error:', error);
            res.status(400).json({ message: error.message });
          }
        });
    } else {
      // Parse Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      for (const row of data) {
        if (row.question && row.option1 && row.option2 && row.option3 && row.option4) {
          const mcq = new MCQ({
            question: row.question,
            options: [row.option1, row.option2, row.option3, row.option4],
            correctAnswer: parseInt(row.correctAnswer) || 0,
            category: row.category || 'General',
            difficulty: row.difficulty || 'medium',
            explanation: row.explanation || '',
            createdBy: req.user._id
          });
          mcqs.push(mcq);
        }
      }

      await MCQ.insertMany(mcqs);
      fs.unlinkSync(filePath);
      res.json({ message: `${mcqs.length} MCQs uploaded successfully` });
    }
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Bulk upload error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .populate('quizAttempts')
      .sort('-createdAt');

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate('user', 'name email')
      .populate('quiz', 'title category')
      .sort('-createdAt');

    res.json(attempts);
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(400).json({ message: error.message });
  }
};
