import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaUsers, FaTimes, FaSave } from 'react-icons/fa';
import ValidationMessage from './ValidationMessage';

function AccountForm({ nuevaCuenta, setNuevaCuenta, agregarCuenta, cancelar, cuentas }) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Obtener correos únicos existentes
  const correosExistentes = Array.from(new Set(cuentas.map(c => c.correo).filter(email => email.trim() !== '')));

  // Función de validación (solo se ejecuta al enviar)
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!nuevaCuenta.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (nuevaCuenta.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (cuentas.some(c => c.nombre.toLowerCase() === nuevaCuenta.nombre.trim().toLowerCase())) {
      newErrors.nombre = 'Ya existe una cuenta con este nombre';
    }

    // Validar correo solo si hay contenido
    if (nuevaCuenta.correo.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevaCuenta.correo.trim())) {
        newErrors.correo = 'Formato de correo inválido';
      }
    }

    // Validar cantidad de PJs solo si hay contenido
    if (nuevaCuenta.cantidadPjs !== '') {
      const cantidad = parseInt(nuevaCuenta.cantidadPjs);
      if (isNaN(cantidad) || cantidad < 0) {
        newErrors.cantidadPjs = 'Debe ser un número mayor o igual a 0';
      } else if (cantidad > 50) {
        newErrors.cantidadPjs = 'Máximo 50 PJs por cuenta';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    // Validar formulario
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // Si hay errores, no enviar
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    // Simular delay para mejor UX
    setTimeout(() => {
      agregarCuenta();
      setIsSubmitting(false);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && nuevaCuenta.nombre.trim()) {
      handleSubmit(e);
    }
  };

  // Limpiar errores cuando el usuario corrige
  const handleInputChange = (field, value) => {
    setNuevaCuenta({ ...nuevaCuenta, [field]: value });
    
    // Solo limpiar errores después del primer intento de envío
    if (hasAttemptedSubmit && errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isFormValid = nuevaCuenta.nombre.trim() !== '';

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-form">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Nueva Cuenta
          </h2>
          <button
            onClick={cancelar}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Cerrar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4">
          {/* Campo Nombre */}
          <div className="form-field">
            <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de la cuenta *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                id="nombre"
                type="text"
                className={`form-input with-icon ${errors.nombre ? 'error' : ''}`}
                placeholder="Ej: Cuenta Principal"
                value={nuevaCuenta.nombre}
                onChange={e => handleInputChange('nombre', e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
              />
            </div>
            <div className="form-info"></div>
            {errors.nombre && <ValidationMessage type="error" message={errors.nombre} />}
          </div>

          {/* Campo Correo */}
          <div className="form-field">
            <label htmlFor="correo" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo electrónico
              <span className="text-gray-500 font-normal ml-1">(opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="correo"
                type="email"
                className={`form-input with-icon ${errors.correo ? 'error' : ''}`}
                placeholder="ejemplo@correo.com"
                value={nuevaCuenta.correo}
                onChange={e => handleInputChange('correo', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="form-info">
              {correosExistentes.length > 0 && (
                <p className="text-xs text-gray-500">
                  {correosExistentes.length} correo(s) guardado(s)
                </p>
              )}
            </div>
            {errors.correo && <ValidationMessage type="error" message={errors.correo} />}
          </div>

          {/* Campo Cantidad PJs */}
          <div className="form-field">
            <label htmlFor="cantidadPjs" className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad inicial de PJs
              <span className="text-gray-500 font-normal ml-1">(opcional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUsers className="text-gray-400" />
              </div>
              <input
                id="cantidadPjs"
                type="number"
                min="0"
                max="50"
                className={`form-input with-icon ${errors.cantidadPjs ? 'error' : ''}`}
                placeholder="0"
                value={nuevaCuenta.cantidadPjs}
                onChange={e => handleInputChange('cantidadPjs', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="form-info"></div>
            {errors.cantidadPjs && <ValidationMessage type="error" message={errors.cantidadPjs} />}
          </div>
        </form>

        <div className="card-footer flex justify-end gap-3">
          <button
            type="button"
            onClick={cancelar}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave />
                Crear Cuenta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountForm;
