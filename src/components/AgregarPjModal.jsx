import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { FaUserPlus, FaUser } from 'react-icons/fa';

function AgregarPjModal({ isOpen, onClose, onAdd, value, setValue }) {
  const inputRef = useRef(null);

  // Bloquear scroll del body y enfocar input
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 z-[2147483647]" style={{zIndex:2147483647, pointerEvents:'auto'}}>
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-green-200" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:2147483647,boxShadow:'0 8px 32px rgba(0,0,0,0.25)',maxHeight:'90vh',overflowY:'auto', pointerEvents:'auto'}} tabIndex={0}>
        <div className="card-header">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserPlus className="text-green-600" />
            Agregar PJ
          </h2>
        </div>
        <div className="card-body">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              ref={inputRef}
              className="form-input with-icon"
              placeholder="Nombre del PJ"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && onAdd()}
              autoFocus
            />
          </div>
        </div>
        <div className="card-footer flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onAdd}
            className="btn btn-success flex items-center gap-2"
          >
            <FaUserPlus className="w-4 h-4" />
            Agregar PJ
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AgregarPjModal;
