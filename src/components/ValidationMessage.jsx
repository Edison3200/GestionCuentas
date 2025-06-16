import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

function ValidationMessage({ type = 'error', message, className = '' }) {
  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'warning':
        return <FaExclamationTriangle className="w-4 h-4" />;
      case 'info':
        return <FaInfoCircle className="w-4 h-4" />;
      default:
        return <FaExclamationTriangle className="w-4 h-4" />;
    }
  };

  const getClasses = () => {
    const baseClasses = 'flex items-center gap-2 text-sm font-medium mt-2 px-3 py-2 rounded-lg border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-400 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-400 text-blue-800`;
      default:
        return `${baseClasses} bg-red-50 border-red-400 text-red-800`;
    }
  };

  return (
    <div className={`validation-container ${className}`}>
      {message && (
        <div className={`${getClasses()} fade-in`}>
          {getIcon()}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}

export default ValidationMessage;