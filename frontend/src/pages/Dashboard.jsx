import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quizzesRes, attemptsRes, categoriesRes] = await Promise.all([
        axios.get('/api/quiz'),
        axios.get('/api/quiz/attempts'),
        axios.get('/api/quiz/categories')
      ]);

      setQuizzes(quizzesRes.data);
      setRecentAttempts(attemptsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStats = () => {
    const totalAttempts = recentAttempts.length;
    const validAttempts = recentAttempts.filter(attempt => 
      attempt.score !== undefined && 
      attempt.totalQuestions !== undefined && 
      attempt.totalQuestions > 0
    );
    const averageScore = validAttempts.length > 0 
      ? (validAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / validAttempts.length).toFixed(1)
      : 0;
    const completedQuizzes = new Set(
      recentAttempts
        .filter(attempt => attempt.quiz && attempt.quiz._id)
        .map(attempt => attempt.quiz._id)
    ).size;
    
    return { totalAttempts, averageScore, completedQuizzes };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to test your knowledge? Choose from our collection of quizzes below.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Attempts</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Average Score</p>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
              </div>
              <Award className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed Quizzes</p>
                <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Available Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input pl-10 pr-8 appearance-none bg-white dark:bg-gray-800"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Quizzes */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('availableQuizzes')}
            </h2>
            
            {filteredQuizzes.length === 0 ? (
              <div className="card p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No quizzes match your search criteria.' 
                    : 'No quizzes available at the moment.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredQuizzes.map(quiz => (
                  <QuizCard key={quiz._id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Attempts */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('recentAttempts')}
            </h2>
            
            {recentAttempts.length === 0 ? (
              <div className="card p-6 text-center">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  No quiz attempts yet. Start your first quiz!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAttempts
                  .filter(attempt => attempt.quiz && attempt.quiz._id)
                  .slice(0, 5)
                  .map(attempt => (
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
    </div>
  );
};

export default Dashboard;