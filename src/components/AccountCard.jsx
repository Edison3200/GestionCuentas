import React, { useState } from 'react';
import { 
  FaCheckCircle, 
  FaPlus, 
  FaTimes, 
  FaChevronDown, 
  FaChevronUp, 
  FaUserNinja,
  FaMedal,
  FaStickyNote,
  FaFire,
  FaCalendarAlt
} from 'react-icons/fa';
import { formatNumber, formatCompactNumber, formatMedallas } from '../utils/formatters';

function AccountCard({
  cuenta,
  hoy,
  mostrarDetalles,
  setMostrarDetalles,
  alternarIngreso,
  setCuentaActiva,
  setMostrarAgregarPJ,
  eliminarCuenta,
  eliminarPj,
  editarPj,
  mostrarSoloCorreos
}) {
  
  const displayName = mostrarSoloCorreos 
    ? (cuenta.correo || 'Sin correo')
    : cuenta.nombre;

  // Calcular días consecutivos basado en historial global
  const calcularDiasConsecutivos = () => {
    try {
      const historialGlobal = JSON.parse(localStorage.getItem(`historial-diario-${cuenta.nombre?.split('@')[0] || 'usuario'}`) || '{}');
      const fechas = Object.keys(historialGlobal).sort().reverse(); // Más reciente primero
      
      if (fechas.length === 0) return 0;
      
      let diasConsecutivos = 0;
      const hoy = new Date().toISOString().split('T')[0];
      
      // Verificar si ingresó hoy
      if (cuenta.ultimoIngreso === hoy) {
        diasConsecutivos = 1;
        
        // Contar días consecutivos hacia atrás
        for (let i = 1; i < fechas.length; i++) {
          const fechaActual = new Date(fechas[i-1]);
          const fechaAnterior = new Date(fechas[i]);
          const diferenciaDias = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
          
          if (diferenciaDias === 1) {
            diasConsecutivos++;
          } else {
            break;
          }
        }
      }
      
      return diasConsecutivos;
    } catch (error) {
      console.error('Error calculando racha:', error);
      return 0;
    }
  };

  const diasConsecutivos = calcularDiasConsecutivos();

  
  
  return (
    <div
      className={`p-4 rounded-xl shadow-lg bg-white border relative transition-all duration-200 ${
        cuenta.ultimoIngreso !== hoy ? 'animate-pulse border-red-300 bg-red-50' : 'border-green-300 bg-green-50'
      }`}
    >
      {/* Header con icono de guerrero y nombre */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
            <FaUserNinja className="text-orange-600 text-sm" />
          </div>
          <span className="font-semibold text-sm text-gray-800 truncate">
            {displayName}
          </span>
        </div>
        <button
          className={`p-2 rounded-full text-white transition-all duration-200 ${
            cuenta.ultimoIngreso === hoy ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
          }`}
          onClick={() => alternarIngreso(cuenta.id)}
          title={cuenta.ultimoIngreso === hoy ? 'Ya ingresado hoy' : 'Marcar ingreso'}
        >
          <FaCheckCircle />
        </button>
      </div>

      {/* Estadísticas compactas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-1.5 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-blue-600 text-xs font-bold">
            <FaUserNinja className="text-xs" />
            <span>{formatNumber(cuenta.pejotas.length)}</span>
          </div>
          <div className="text-xs text-gray-600">PJs</div>
        </div>
        <div className="text-center p-1.5 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-yellow-600 text-xs font-bold">
            <span>{formatMedallas(cuenta.pejotas.reduce((total, pj) => total + (parseInt(pj.medallas) || 0), 0))}</span>
          </div>
          <div className="text-xs text-gray-600">Medallas</div>
        </div>
        <div className="text-center p-1.5 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 text-red-600 text-xs font-bold">
            <FaFire className="text-xs" />
            <span>{formatNumber(diasConsecutivos)}</span>
          </div>
          <div className="text-xs text-gray-600">Días</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-2">
        <button
          className="btn btn-primary text-xs flex items-center gap-1"
          onClick={() => setMostrarDetalles(cuenta.id)}
        >
          <FaChevronDown className="text-xs" />
          Detalles
        </button>

                <button
          className="btn btn-danger text-xs"
          onClick={() => eliminarCuenta(cuenta.id)}
          title="Eliminar cuenta"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>

          </div>
  );
}

export default AccountCard;
