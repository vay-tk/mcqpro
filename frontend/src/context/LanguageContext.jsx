import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Common
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    
    // Authentication
    name: 'Name',
    email: 'Email',
    password: 'Password',
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Sign in to your account',
    registerTitle: 'Create Account',
    registerSubtitle: 'Join our quiz platform',
    dontHaveAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    
    // Quiz
    startQuiz: 'Start Quiz',
    submitQuiz: 'Submit Quiz',
    nextQuestion: 'Next Question',
    previousQuestion: 'Previous Question',
    timeRemaining: 'Time Remaining',
    question: 'Question',
    of: 'of',
    score: 'Score',
    result: 'Result',
    correctAnswers: 'Correct Answers',
    incorrectAnswers: 'Incorrect Answers',
    
    // Dashboard
    availableQuizzes: 'Available Quizzes',
    recentAttempts: 'Recent Attempts',
    categories: 'Categories',
    difficulty: 'Difficulty',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    manageMCQs: 'Manage MCQs',
    manageQuizzes: 'Manage Quizzes',
    manageUsers: 'Manage Users',
    viewAttempts: 'View Attempts',
    totalUsers: 'Total Users',
    totalQuizzes: 'Total Quizzes',
    totalMCQs: 'Total MCQs',
    totalAttempts: 'Total Attempts',
    
    // Messages
    loginSuccess: 'Login successful',
    registerSuccess: 'Registration successful',
    quizSubmitted: 'Quiz submitted successfully',
    dataUpdated: 'Data updated successfully',
    dataDeleted: 'Data deleted successfully',
    error: 'An error occurred',
  },
  hi: {
    // Navigation
    home: 'होम',
    dashboard: 'डैशबोर्ड',
    profile: 'प्रोफाइल',
    admin: 'एडमिन',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    
    // Common
    loading: 'लोड हो रहा है...',
    submit: 'सबमिट करें',
    cancel: 'रद्द करें',
    save: 'सेव करें',
    delete: 'डिलीट करें',
    edit: 'एडिट करें',
    add: 'जोड़ें',
    search: 'खोजें',
    filter: 'फिल्टर',
    
    // Authentication
    name: 'नाम',
    email: 'ईमेल',
    password: 'पासवर्ड',
    loginTitle: 'वापस आपका स्वागत है',
    loginSubtitle: 'अपने अकाउंट में साइन इन करें',
    registerTitle: 'अकाउंट बनाएं',
    registerSubtitle: 'हमारे क्विज प्लेटफॉर्म में शामिल हों',
    dontHaveAccount: 'अकाउंट नहीं है?',
    haveAccount: 'पहले से अकाउंट है?',
    
    // Quiz
    startQuiz: 'क्विज शुरू करें',
    submitQuiz: 'क्विज सबमिट करें',
    nextQuestion: 'अगला प्रश्न',
    previousQuestion: 'पिछला प्रश्न',
    timeRemaining: 'बचा हुआ समय',
    question: 'प्रश्न',
    of: 'का',
    score: 'स्कोर',
    result: 'परिणाम',
    correctAnswers: 'सही उत्तर',
    incorrectAnswers: 'गलत उत्तर',
    
    // Dashboard
    availableQuizzes: 'उपलब्ध क्विज',
    recentAttempts: 'हाल की कोशिशें',
    categories: 'श्रेणियां',
    difficulty: 'कठिनाई',
    
    // Admin
    adminDashboard: 'एडमिन डैशबोर्ड',
    manageMCQs: 'MCQ प्रबंधन',
    manageQuizzes: 'क्विज प्रबंधन',
    manageUsers: 'यूजर प्रबंधन',
    viewAttempts: 'कोशिशें देखें',
    totalUsers: 'कुल यूजर',
    totalQuizzes: 'कुल क्विज',
    totalMCQs: 'कुल MCQ',
    totalAttempts: 'कुल कोशिशें',
    
    // Messages
    loginSuccess: 'लॉगिन सफल',
    registerSuccess: 'रजिस्ट्रेशन सफल',
    quizSubmitted: 'क्विज सफलतापूर्वक सबमिट हुई',
    dataUpdated: 'डेटा सफलतापूर्वक अपडेट हुआ',
    dataDeleted: 'डेटा सफलतापूर्वक डिलीट हुआ',
    error: 'एक त्रुटि हुई',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'hi' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t,
    isHindi: language === 'hi'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};