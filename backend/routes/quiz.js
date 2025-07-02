import express from 'express';
import {
  getQuizzes,
  getQuizById,
  startQuiz,
  submitQuiz,
  getUserAttempts,
  getCategories
} from '../controllers/quizController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQuizzes);
router.get('/categories', getCategories);
router.get('/attempts', authenticateToken, getUserAttempts);
router.get('/:id', getQuizById);
router.get('/:id/start', authenticateToken, startQuiz);
router.post('/:id/submit', authenticateToken, submitQuiz);

export default router;