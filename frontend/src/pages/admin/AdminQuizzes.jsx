import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Clock,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

const AdminQuizzes = () => {
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedMCQs, setSelectedMCQs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    category: '',
    status: true
  });

  useEffect(() => {
    fetchQuizzes();
    fetchMCQs();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/api/admin/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setError('Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchMCQs = async () => {
    try {
      const response = await axios.get('/api/admin/mcqs', { params: { limit: 1000 } });
      setMcqs(response.data.mcqs);
    } catch (error) {
      console.error('Error fetching MCQs:', error);
      setError('Failed to fetch MCQs');
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return false;
    }
    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters long');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Quiz description is required');
      return false;
    }
    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return false;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return false;
    }
    if (selectedMCQs.length === 0) {
      setError('At least one MCQ must be selected');
      return false;
    }
    if (formData.timeLimit < 1 || formData.timeLimit > 300) {
      setError('Time limit must be between 1 and 300 minutes');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const quizData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        timeLimit: parseInt(formData.timeLimit),
        status: formData.status,
        mcqs: selectedMCQs
      };


      if (editingQuiz) {
        await axios.put(`/api/admin/quizzes/${editingQuiz._id}`, quizData);
        setShowEditModal(false);
      } else {
        await axios.post('/api/admin/quizzes', quizData);
        setShowAddModal(false);
      }
      
      await fetchQuizzes();
      resetForm();
      setError('');
    } catch (error) {
      console.error('Error saving quiz:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || 'Error saving quiz. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`/api/admin/quizzes/${id}`);
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Error deleting quiz. Please try again.');
      }
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      category: quiz.category,
      status: quiz.status
    });
    setSelectedMCQs(quiz.mcqs.map(mcq => mcq._id));
    setError('');
    setShowEditModal(true);
  };

  const toggleQuizStatus = async (quiz) => {
    try {
      await axios.put(`/api/admin/quizzes/${quiz._id}`, {
        ...quiz,
        status: !quiz.status
      });
      fetchQuizzes();
    } catch (error) {
      console.error('Error updating quiz status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      timeLimit: 30,
      category: '',
      status: true
    });
    setSelectedMCQs([]);
    setEditingQuiz(null);
    setError('');
  };

  const handleMCQToggle = (mcqId) => {
    setSelectedMCQs(prev => 
      prev.includes(mcqId) 
        ? prev.filter(id => id !== mcqId)
        : [...prev, mcqId]
    );
    setError(''); // Clear error when MCQs are selected
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMCQs = mcqs.filter(mcq =>
    formData.category === '' || mcq.category === formData.category
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('manageQuizzes')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage quiz collections
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2 mt-4 md:mt-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz</span>
          </button>
        </div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {/* Quizzes List */}
        <div className="card p-6">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No quizzes found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'No quizzes match your search criteria.' 
                  : 'Get started by creating your first quiz.'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="btn btn-primary"
              >
                Create First Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map(quiz => (
                <div key={quiz._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {quiz.title}
                        </h3>
                        <button
                          onClick={() => toggleQuizStatus(quiz)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            quiz.status 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {quiz.status ? (
                            <>
                              <ToggleRight className="w-3 h-3" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-3 h-3" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {quiz.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{quiz.mcqs?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{quiz.timeLimit} minutes</span>
                        </div>
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
                          {quiz.category}
                        </span>
                        <span>By {quiz.createdBy?.name}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(quiz)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Quiz Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        setError('');
                      }}
                      className="input w-full"
                      placeholder="Enter quiz title..."
                      required
                      minLength={3}
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, category: e.target.value }));
                        setError('');
                      }}
                      className="input w-full"
                      placeholder="e.g., Mathematics, Science"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, description: e.target.value }));
                      setError('');
                    }}
                    className="input w-full h-24 resize-none"
                    placeholder="Describe what this quiz covers..."
                    required
                    minLength={10}
                    maxLength={500}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 1 }));
                        setError('');
                      }}
                      className="input w-full"
                      min="1"
                      max="300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === 'true' }))}
                      className="input w-full"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* MCQ Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Select Questions ({selectedMCQs.length} selected) *
                  </label>
                  
                  {filteredMCQs.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No MCQs available for this category. Create some MCQs first.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {filteredMCQs.map(mcq => (
                        <div
                          key={mcq._id}
                          className="flex items-start space-x-3 p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMCQs.includes(mcq._id)}
                            onChange={() => handleMCQToggle(mcq._id)}
                            className="mt-1 text-primary-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {mcq.question}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                {mcq.category}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                mcq.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
                                mcq.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                              }`}>
                                {mcq.difficulty}
                              </span>
                            </div>
                          </div>
                          {selectedMCQs.includes(mcq._id) && (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="btn btn-outline flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || selectedMCQs.length === 0}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="spinner"></div>
                        <span>{editingQuiz ? 'Updating...' : 'Creating...'}</span>
                      </div>
                    ) : (
                      editingQuiz ? 'Update Quiz' : 'Create Quiz'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;