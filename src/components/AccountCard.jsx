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
import { formatNumber, formatCompactNumber } from '../utils/formatters';

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

  // Calcular días consecutivos (sin reinicio automático)
  const calcularDiasConsecutivos = () => {
    if (!cuenta.historial || cuenta.historial.length === 0) return 0;
    
    let diasConsecutivos = 0;
    const fechaActual = new Date();
    
    // Ordenar historial por fecha (más reciente primero)
    const historialOrdenado = [...cuenta.historial].sort((a, b) => new Date(b) - new Date(a));
    
    // Contar días consecutivos desde la fecha más reciente
    let fechaAnterior = null;
    for (const entrada of historialOrdenado) {
      const fechaHistorial = new Date(entrada.split(' ')[0]);
      
      if (fechaAnterior === null) {
        // Primera fecha
        diasConsecutivos = 1;
        fechaAnterior = fechaHistorial;
      } else {
        // Verificar si es el día anterior
        const fechaEsperada = new Date(fechaAnterior);
        fechaEsperada.setDate(fechaEsperada.getDate() - 1);
        
        if (fechaHistorial.toDateString() === fechaEsperada.toDateString()) {
          diasConsecutivos++;
          fechaAnterior = fechaHistorial;
        } else {
          // Se rompió la racha, pero no reiniciamos
          break;
        }
      }
    }
    
    return diasConsecutivos;
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
            <span>{formatCompactNumber(cuenta.pejotas.reduce((total, pj) => total + (parseInt(pj.medallas) || 0), 0))}</span>
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
          className="btn btn-success text-xs flex items-center gap-1"
          onClick={() => {
            setCuentaActiva(cuenta.id);
            setMostrarAgregarPJ(true);
          }}
          title="Agregar PJ"
        >
          <FaPlus className="text-xs" />
          PJ
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
