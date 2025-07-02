import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Timer from '../components/Timer';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import axios from 'axios';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeStarted, setTimeStarted] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/api/quiz/${id}/start`);
      setQuiz(response.data);
      setTimeStarted(Date.now());
    } catch (error) {
      console.error('Error fetching quiz:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (!timeStarted) return;
    
    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - timeStarted) / 1000);
    
    // Convert answers object to array format expected by backend
    const answersArray = quiz.mcqs.map((_, index) => answers[index]);
    
    try {
      const response = await axios.post(`/api/quiz/${id}/submit`, {
        quizId: id,
        answers: answersArray,
        timeTaken
      });
      
      // Navigate to results page with the result data
      navigate(`/quiz/${id}/result`, { 
        state: { 
          result: response.data,
          quiz: quiz
        } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getUnansweredQuestions = () => {
    const unanswered = [];
    for (let i = 0; i < quiz.mcqs.length; i++) {
      if (answers[i] === undefined) {
        unanswered.push(i + 1);
      }
    }
    return unanswered;
  };

  if (loading) {
    return <LoadingSpinner text="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Quiz Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The quiz you're looking for doesn't exist or has been disabled.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentMCQ = quiz.mcqs[currentQuestion];
  const unansweredQuestions = getUnansweredQuestions();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiz Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {quiz.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{quiz.totalQuestions} questions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.timeLimit} minutes</span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Timer 
                duration={quiz.timeLimit} 
                onTimeUp={handleTimeUp}
                isActive={!submitting}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{getAnsweredCount()}/{quiz.totalQuestions} answered</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(getAnsweredCount() / quiz.totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Navigation */}
          <div className="flex flex-wrap gap-2">
            {quiz.mcqs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary-600 text-white'
                    : answers[index] !== undefined
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="card p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('question')} {currentQuestion + 1} {t('of')} {quiz.totalQuestions}
              </h2>
              {answers[currentQuestion] !== undefined && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
              {currentMCQ.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentMCQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestion] === index
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation and Submit */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('previousQuestion')}</span>
            </button>

            <button
              onClick={() => setCurrentQuestion(Math.min(quiz.mcqs.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === quiz.mcqs.length - 1}
              className="btn btn-outline flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{t('nextQuestion')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="btn btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : t('submitQuiz')}</span>
          </button>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Confirm Submission
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Are you sure you want to submit your quiz?
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Answered:</span>
                    <span className="font-medium">{getAnsweredCount()}/{quiz.totalQuestions}</span>
                  </div>
                  
                  {unansweredQuestions.length > 0 && (
                    <div className="text-sm text-amber-600 dark:text-amber-400">
                      <p className="font-medium mb-1">Unanswered questions:</p>
                      <p>{unansweredQuestions.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    handleSubmit();
                  }}
                  className="btn btn-primary flex-1"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;