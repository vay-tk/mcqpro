import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  Target,
  Clock,
  BookOpen
} from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAttempts();
  }, []);

  const fetchUserAttempts = async () => {
    try {
      const response = await axios.get('/api/quiz/attempts');
      setAttempts(response.data);
    } catch (error) {
      console.error('Error fetching user attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeSpent: 0
      };
    }

    const totalAttempts = attempts.length;
    const scores = attempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const bestScore = Math.max(...scores);
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeTaken, 0);

    return {
      totalAttempts,
      averageScore: averageScore.toFixed(1),
      bestScore: bestScore.toFixed(1),
      totalTimeSpent: Math.floor(totalTimeSpent / 60) // Convert to minutes
    };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user?.name}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalAttempts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Attempts
            </div>
          </div>

          <div className="card p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.averageScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Score
            </div>
          </div>

          <div className="card p-6 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.bestScore}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Best Score
            </div>
          </div>

          <div className="card p-6 text-center">
            <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalTimeSpent}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Minutes Spent
            </div>
          </div>
        </div>

        {/* Quiz Attempts History */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Quiz History
          </h2>

          {attempts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quiz attempts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start taking quizzes to see your progress here.
              </p>
              <a
                href="/dashboard"
                className="btn btn-primary"
              >
                Browse Quizzes
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {attempts.map(attempt => (
                <QuizCard 
                  key={attempt._id} 
                  quiz={attempt.quiz} 
                  attempt={attempt}
                  showAttempts={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;