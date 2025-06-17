import React from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

function ConfirmModal({ isOpen, message, onConfirm, onCancel, type = 'danger', confirmText = 'Confirmar', cancelText = 'Cancelar' }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="w-12 h-12 text-yellow-500" />;
      case 'info':
        return <FaCheck className="w-12 h-12 text-blue-500" />;
      default:
        return <FaExclamationTriangle className="w-12 h-12 text-red-500" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'warning':
        return 'btn bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'info':
        return 'btn btn-primary';
      default:
        return 'btn btn-danger';
    }
  };

  return (
    <div className="modal-overlay z-[9999]" style={{zIndex: 9999}}>
      <div className="modal-content max-w-md z-[9999]" style={{zIndex: 9999}}>
        <div className="card-body text-center space-y-4">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-gray-800">
            {type === 'danger' ? '¿Estás seguro?' : type === 'warning' ? 'Advertencia' : 'Confirmación'}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="card-footer flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className={`${getConfirmButtonClass()} flex items-center gap-2`}
          >
            <FaCheck className="w-4 h-4" />
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="btn btn-secondary flex items-center gap-2"
          >
            <FaTimes className="w-4 h-4" />
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
