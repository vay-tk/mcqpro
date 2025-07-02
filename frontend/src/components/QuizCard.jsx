import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Award, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const QuizCard = ({ quiz, showAttempts = false, attempt = null }) => {
  const { t } = useLanguage();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (showAttempts && attempt) {
    return (
      <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {attempt.quiz?.title || 'Quiz'}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>{attempt.score}/{attempt.totalQuestions}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {((attempt.score / attempt.totalQuestions) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('score')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(attempt.quiz?.category)}`}>
            {attempt.quiz?.category || 'General'}
          </span>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Time: {Math.floor(attempt.timeTaken / 60)}:{(attempt.timeTaken % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {quiz.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
            {quiz.description}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.category)}`}>
          {quiz.category}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{quiz.mcqs?.length || 0} {t('question')}s</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{quiz.timeLimit} min</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Created {new Date(quiz.createdAt).toLocaleDateString()}
        </div>
        <Link
          to={`/quiz/${quiz._id}`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t('startQuiz')}
        </Link>
      </div>
    </div>
  );
};

export default QuizCard;