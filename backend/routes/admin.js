import express from 'express';
import multer from 'multer';
import {
  getDashboardStats,
  getAllMCQs,
  createMCQ,
  updateMCQ,
  deleteMCQ,
  getAllQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  bulkUploadMCQs,
  getAllUsers,
  getUserAttempts
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// MCQs
router.get('/mcqs', getAllMCQs);
router.post('/mcqs', createMCQ);
router.put('/mcqs/:id', updateMCQ);
router.delete('/mcqs/:id', deleteMCQ);
router.post('/mcqs/bulk-upload', upload.single('file'), bulkUploadMCQs);

// Quizzes
router.get('/quizzes', getAllQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Users and Attempts
router.get('/users', getAllUsers);
router.get('/attempts', getUserAttempts);

export default router;