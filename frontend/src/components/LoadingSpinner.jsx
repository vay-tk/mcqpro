import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LoadingSpinner = ({ size = 'md', text = null }) => {
  const { t } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className={`${sizeClasses[size]} border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin`}></div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
      {!text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {t('loading')}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;