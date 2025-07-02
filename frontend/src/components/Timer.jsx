import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Timer = ({ duration, onTimeUp, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const { t } = useLanguage();

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-600 dark:text-red-400'; // Last minute
    if (timeLeft <= 300) return 'text-yellow-600 dark:text-yellow-400'; // Last 5 minutes
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressPercentage = () => {
    return ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('timeRemaining')}
          </span>
        </div>
        
        {timeLeft <= 60 && (
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
        )}
      </div>

      <div className="text-center">
        <div className={`text-2xl font-bold ${getTimeColor()} transition-colors`}>
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              timeLeft <= 60
                ? 'bg-red-500'
                : timeLeft <= 300
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {Math.floor(getProgressPercentage())}% completed
        </div>
      </div>

      {timeLeft <= 60 && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
          <p className="text-xs text-red-700 dark:text-red-400 text-center font-medium">
            ⚠️ Less than 1 minute remaining!
          </p>
        </div>
      )}
    </div>
  );
};

export default Timer;