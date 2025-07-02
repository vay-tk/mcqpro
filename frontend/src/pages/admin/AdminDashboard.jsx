import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users, 
  BookOpen, 
  FileText, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Plus,
  Eye,
  Settings
} from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const quickActions = [
    {
      title: 'Add New MCQ',
      description: 'Create a new multiple choice question',
      icon: Plus,
      link: '/admin/mcqs',
      color: 'bg-blue-500'
    },
    {
      title: 'Create Quiz',
      description: 'Build a new quiz from existing MCQs',
      icon: FileText,
      link: '/admin/quizzes',
      color: 'bg-green-500'
    },
    {
      title: 'View Users',
      description: 'Manage registered users',
      icon: Users,
      link: '/admin/users',
      color: 'bg-purple-500'
    },
    {
      title: 'Quiz Attempts',
      description: 'Review user quiz attempts',
      icon: Eye,
      link: '/admin/attempts',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('adminDashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your MCQ platform and monitor performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">{t('totalUsers')}</p>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">{t('totalQuizzes')}</p>
                <p className="text-2xl font-bold">{stats?.totalQuizzes || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">{t('totalMCQs')}</p>
                <p className="text-2xl font-bold">{stats?.totalMCQs || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">{t('totalAttempts')}</p>
                <p className="text-2xl font-bold">{stats?.totalAttempts || 0}</p>
              </div>
              <Target className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.link}
                  className="card p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Category Statistics */}
            {stats?.categoryStats && stats.categoryStats.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Quiz Categories
                </h2>
                <div className="card p-6">
                  <div className="space-y-4">
                    {stats.categoryStats.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {category._id}
                        </span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${(category.count / Math.max(...stats.categoryStats.map(c => c.count))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                            {category.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Recent Quiz Attempts
            </h2>
            <div className="card p-6">
              {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentAttempts.slice(0, 8).map((attempt, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {attempt.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {attempt.quiz?.title || 'Unknown Quiz'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <Award className="w-3 h-3 text-primary-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {attempt.score}/{attempt.totalQuestions}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No recent attempts
                  </p>
                </div>
              )}
            </div>

            {/* Management Links */}
            <div className="mt-6 space-y-3">
              <Link
                to="/admin/mcqs"
                className="block w-full btn btn-outline text-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('manageMCQs')}
              </Link>
              <Link
                to="/admin/quizzes"
                className="block w-full btn btn-outline text-center"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('manageQuizzes')}
              </Link>
              <Link
                to="/admin/users"
                className="block w-full btn btn-outline text-center"
              >
                <Users className="w-4 h-4 mr-2" />
                {t('manageUsers')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;