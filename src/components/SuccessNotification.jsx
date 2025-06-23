import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

function SuccessNotification({ 
  isOpen, 
  message, 
  onClose, 
  type = 'success', 
  duration = 2000,
  position = 'top-right' // Siempre top-right por defecto
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200); // Esperar a que termine la animación
  };

  if (!isOpen || !message) return null; // Solo muestra si hay mensaje y está abierto

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'warning':
        return <FaExclamationTriangle className="w-5 h-5" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5" />;
      default:
        return <FaCheckCircle className="w-5 h-5" />;
    }
  };

  const getClasses = () => {
    const baseClasses = 'px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-80 max-w-md border-l-4';
    
    switch (type) {
      case 'error':
        return `${baseClasses} bg-red-50 text-red-800 border-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-500`;
      case 'info':
        return `${baseClasses} bg-blue-50 text-blue-800 border-blue-500`;
      default:
        return `${baseClasses} bg-green-50 text-green-800 border-green-500`;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-[2147483649] transition-all duration-200 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`} style={{zIndex:2147483649}}>
      <div className={getClasses()}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar notificación"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default SuccessNotification;
