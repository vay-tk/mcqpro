import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Search, 
  Filter, 
  Award, 
  Clock, 
  Calendar,
  User,
  FileText,
  Target,
  TrendingUp,
  Download
} from 'lucide-react';
import axios from 'axios';

const AdminAttempts = () => {
  const { t } = useLanguage();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchAttempts();
    fetchQuizzes();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await axios.get('/api/admin/attempts');
      setAttempts(response.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/admin/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = 
      attempt.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.quiz?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesQuiz = selectedQuiz === 'all' || attempt.quiz?._id === selectedQuiz;
    
    return matchesSearch && matchesQuiz;
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStats = () => {
    if (filteredAttempts.length === 0) {
      return { totalAttempts: 0, averageScore: 0, passRate: 0 };
    }

    const totalAttempts = filteredAttempts.length;
    const scores = filteredAttempts.map(attempt => (attempt.score / attempt.totalQuestions) * 100);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const passCount = scores.filter(score => score >= 70).length;
    const passRate = (passCount / totalAttempts) * 100;

    return {
      totalAttempts,
      averageScore: averageScore.toFixed(1),
      passRate: passRate.toFixed(1)
    };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('viewAttempts')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and analyze quiz performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Pass Rate</p>
                <p className="text-2xl font-bold">{stats.passRate}%</p>
              </div>
              <Award className="w-8 h-8 text-purple-200" />
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
                placeholder="Search by user name, email, or quiz title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="input pl-10 pr-8 appearance-none bg-white dark:bg-gray-800"
              >
                <option value="all">All Quizzes</option>
                {quizzes.map(quiz => (
                  <option key={quiz._id} value={quiz._id}>{quiz.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        <div className="card p-6">
          {filteredAttempts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No attempts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedQuiz !== 'all'
                  ? 'No attempts match your search criteria.'
                  : 'No quiz attempts have been made yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAttempts.map(attempt => {
                    const percentage = (attempt.score / attempt.totalQuestions) * 100;
                    return (
                      <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-xs">
                                {attempt.user?.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {attempt.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {attempt.user?.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.quiz?.title || 'Unknown Quiz'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {attempt.quiz?.category || 'No category'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 mr-2 text-gray-400" />
                            <div>
                              <div className={`text-sm font-medium ${getScoreColor(percentage)}`}>
                                {attempt.score}/{attempt.totalQuestions}
                              </div>
                              <div className={`text-xs ${getScoreColor(percentage)}`}>
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                            {formatTime(attempt.timeTaken)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            percentage >= 70
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {percentage >= 70 ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttempts;