import React, { useState } from 'react';
import { 
  FaTimes, 
  FaUserNinja, 
  FaMedal, 
  FaStickyNote, 
  FaChevronDown, 
  FaChevronUp,
  FaFire,
  FaCalendarAlt,
  FaPlus
} from 'react-icons/fa';
import { formatNumber, formatCompactNumber } from '../utils/formatters';

function PjDetailsModal({ 
  cuenta, 
  onClose, 
  editarPj, 
  eliminarPj, 
  setCuentaActiva, 
  setMostrarAgregarPJ 
}) {
  const [mostrarTodosPjs, setMostrarTodosPjs] = useState(false);
  const [pjNotasAbiertas, setPjNotasAbiertas] = useState({});

  // Calcular días consecutivos (misma lógica que en AccountCard)
  const calcularDiasConsecutivos = () => {
    if (!cuenta.historial || cuenta.historial.length === 0) return 0;
    
    let diasConsecutivos = 0;
    const historialOrdenado = [...cuenta.historial].sort((a, b) => new Date(b) - new Date(a));
    
    let fechaAnterior = null;
    for (const entrada of historialOrdenado) {
      const fechaHistorial = new Date(entrada.split(' ')[0]);
      
      if (fechaAnterior === null) {
        diasConsecutivos = 1;
        fechaAnterior = fechaHistorial;
      } else {
        const fechaEsperada = new Date(fechaAnterior);
        fechaEsperada.setDate(fechaEsperada.getDate() - 1);
        
        if (fechaHistorial.toDateString() === fechaEsperada.toDateString()) {
          diasConsecutivos++;
          fechaAnterior = fechaHistorial;
        } else {
          break;
        }
      }
    }
    
    return diasConsecutivos;
  };

  const diasConsecutivos = calcularDiasConsecutivos();

  const toggleNotasPj = (index) => {
    setPjNotasAbiertas(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleAgregarPj = () => {
    setCuentaActiva(cuenta.id);
    setMostrarAgregarPJ(true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="card-header flex items-center justify-between sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
              <FaUserNinja className="text-orange-600 text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{cuenta.nombre}</h2>
              <p className="text-base text-gray-600">{cuenta.correo || 'Sin correo'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            aria-label="Cerrar"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="card-body p-6">
          {/* Información de historial compacta */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCalendarAlt className="text-gray-600 text-lg" />
              <span className="text-base font-semibold text-gray-700">
                Historial: {formatNumber(cuenta.historial.length)} ingresos
              </span>
            </div>
            <div className="flex items-center gap-3">
              <FaFire className="text-red-500 text-lg" />
              <span className="text-base font-bold text-red-600">
                {formatNumber(diasConsecutivos)} días consecutivos
              </span>
            </div>
          </div>
          
          {/* Header de PJs */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <FaUserNinja className="text-orange-600 text-xl" />
              <strong className="text-xl text-gray-800">
                Personajes ({formatNumber(cuenta.pejotas.length)})
              </strong>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAgregarPj}
                className="btn btn-success flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Agregar PJ
              </button>
              {cuenta.pejotas.length > 6 && (
                <button
                  onClick={() => setMostrarTodosPjs(!mostrarTodosPjs)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
                >
                  {mostrarTodosPjs ? (
                    <>
                      Ver menos <FaChevronUp className="text-sm" />
                    </>
                  ) : (
                    <>
                      Ver más <FaChevronDown className="text-sm" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Grid de PJs mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {(mostrarTodosPjs ? cuenta.pejotas : cuenta.pejotas.slice(0, 8)).map((pj, i) => (
              <div key={i} className="relative border border-gray-200 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 min-h-[280px] flex flex-col">
                {/* Header del PJ con botón eliminar */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-4 border-b border-gray-100 relative flex-shrink-0">
                  <button
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 z-10 p-2 rounded-full transition-colors duration-200"
                    onClick={() => eliminarPj(cuenta.id, i)}
                    title="Eliminar PJ"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                  
                  {/* Nombre del PJ */}
                  <div className="flex items-center gap-3 pr-10">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                      <FaUserNinja className="text-blue-600 text-lg" />
                    </div>
                    <input
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 text-base font-semibold bg-white"
                      value={pj.nombre}
                      onChange={e => editarPj(cuenta.id, i, 'nombre', e.target.value)}
                      placeholder="Nombre del PJ"
                    />
                  </div>
                </div>
                
                {/* Contenido del PJ */}
                <div className="p-4 space-y-4 flex-grow">
                  {/* Medallas */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full flex-shrink-0">
                        <FaMedal className="text-yellow-600 text-lg" />
                      </div>
                      <label className="text-base font-semibold text-gray-700">Medallas</label>
                    </div>
                    <input
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg font-bold bg-yellow-50"
                      type="number"
                      min="0"
                      value={pj.medallas}
                      onChange={e => editarPj(cuenta.id, i, 'medallas', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  {/* Notas desplegables */}
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full flex-shrink-0">
                        <FaStickyNote className="text-green-600 text-lg" />
                      </div>
                      <button
                        onClick={() => toggleNotasPj(i)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none hover:border-green-500 hover:bg-green-50 bg-white flex items-center justify-between min-w-0 text-base transition-colors duration-200"
                      >
                        <span className="truncate font-semibold">
                          Notas {pj.notas.trim() ? '📝' : ''}
                        </span>
                        {pjNotasAbiertas[i] ? 
                          <FaChevronUp className="text-sm flex-shrink-0 text-green-600" /> : 
                          <FaChevronDown className="text-sm flex-shrink-0 text-green-600" />
                        }
                      </button>
                    </div>
                    
                    {/* Área de notas desplegable */}
                    {pjNotasAbiertas[i] && (
                      <div className="fade-in">
                        <textarea
                          className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-green-50"
                          rows="4"
                          value={pj.notas}
                          onChange={e => editarPj(cuenta.id, i, 'notas', e.target.value)}
                          placeholder="Escribe notas sobre este PJ..."
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cuenta.pejotas.length === 0 && (
            <div className="text-center py-12">
              <FaUserNinja className="text-6xl text-gray-300 mx-auto mb-6" />
              <p className="text-xl text-gray-500 mb-6">No hay PJs en esta cuenta</p>
              <button
                onClick={handleAgregarPj}
                className="btn btn-primary flex items-center gap-2 mx-auto text-lg px-6 py-3"
              >
                <FaPlus className="w-5 h-5" />
                Agregar primer PJ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PjDetailsModal;