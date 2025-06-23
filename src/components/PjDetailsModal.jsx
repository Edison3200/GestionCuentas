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
  FaPlus,
  FaCheckCircle
} from 'react-icons/fa';
import { formatNumber, formatCompactNumber } from '../utils/formatters';
import Modal from './Modal';
import PortalModal from './PortalModal';

function PjDetailsModal({ 
  cuenta, 
  cuentas, // nuevo prop
  onClose, 
  editarPj, 
  eliminarPj, 
  setCuentaActiva, 
  setMostrarAgregarPJ, 
  pjIndex, // <- nuevo prop opcional
  onGuardado // <- nuevo prop opcional
}) {
  // Buscar la cuenta actualizada por id
  const cuentaActual = cuentas ? cuentas.find(c => c.id === cuenta.id) || cuenta : cuenta;
  const hoy = new Date().toLocaleDateString();
  const [mostrarTodosPjs, setMostrarTodosPjs] = useState(false);
  const [pjNotasAbiertas, setPjNotasAbiertas] = useState({});
  const [modalPj, setModalPj] = useState(null); // índice del PJ a mostrar en modal
  const [pjEdit, setPjEdit] = useState({}); // edición local de PJ
  const [confirmarEliminar, setConfirmarEliminar] = useState(null); // índice del PJ a eliminar
  // Estado local para forzar re-render tras marcar ingreso
  const [ingresadoLocal, setIngresadoLocal] = useState(cuenta.ultimoIngreso === hoy);

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

  const handleOpenModal = (pj, idx) => {
    setPjEdit({ ...pj, idx });
    setModalPj(idx);
  };

  const handleChange = (campo, valor) => {
    if (campo === 'wones' && !/^[0-9]*$/.test(valor)) return; // solo números
    if (campo === 'medallas') {
      // Limitar a 200 millones
      let num = valor.replace(/\D/g, '');
      if (num.length > 1 && num.startsWith('0')) num = num.replace(/^0+/, '');
      let n = parseInt(num || '0', 10);
      if (n > 200000000) n = 200000000;
      setPjEdit(prev => ({ ...prev, [campo]: n }));
      return;
    }
    setPjEdit(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSave = () => {
    if (modalPj !== null) {
      editarPj(cuenta.id, modalPj, 'nombre', pjEdit.nombre);
      editarPj(cuenta.id, modalPj, 'medallas', pjEdit.medallas);
      editarPj(cuenta.id, modalPj, 'notas', pjEdit.notas);
      editarPj(cuenta.id, modalPj, 'wones', pjEdit.wones || '');
      if (typeof pjIndex === 'number' && onGuardado) {
        onGuardado(); // Notifica guardado si es búsqueda
      }
    }
    setModalPj(null);
  };

  React.useEffect(() => {
    if (typeof pjIndex === 'number') {
      // Si se pasa un índice de PJ, abrir directamente el modal de ese PJ
      setModalPj(pjIndex);
      setPjEdit({ ...cuenta.pejotas[pjIndex], idx: pjIndex });
    }
  }, [pjIndex, cuenta]);

  // Detectar si es modo búsqueda (solo un PJ)
  const esBusqueda = typeof pjIndex === 'number';

  return (
    <PortalModal>
      <div>
        {/* ...todo el contenido actual del modal... */}
        <div className="modal-overlay flex items-center justify-center min-h-screen bg-black bg-opacity-40 z-[2147483647] p-1 sm:p-4">
          <div className="modal-content max-w-[1800px] w-full mx-0 sm:mx-8 max-h-[98vh] min-h-[80vh] overflow-y-auto p-1 sm:p-8 rounded-2xl shadow-2xl bg-white relative">
            {/* Header */}
            <div className="card-header flex flex-col sm:flex-row items-center justify-between sticky top-0 bg-white z-10 border-b px-2 sm:px-0 py-2 sm:py-4 gap-2 sm:gap-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full">
                  <FaUserNinja className="text-orange-600 text-lg sm:text-xl" />
                </div>
                <div className="truncate">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{cuentaActual.nombre}</h2>
                  <p className="text-xs sm:text-base text-gray-600 truncate">{cuentaActual.correo || 'Sin correo'}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 absolute top-2 right-2 sm:static sm:top-auto sm:right-auto"
                aria-label="Cerrar"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="card-body p-2 sm:p-6">
              {/* Información de historial compacta */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaCalendarAlt className="text-gray-600 text-base sm:text-lg" />
                  <span className="text-sm sm:text-base font-semibold text-gray-700">
                    Historial: {formatNumber(cuentaActual.historial.length)} ingresos
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaFire className="text-red-500 text-base sm:text-lg" />
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    {formatNumber(diasConsecutivos)} días consecutivos
                  </span>
                </div>
                {/* Botón de ingreso SOLO si la ventana es por búsqueda de cuenta (pjIndex no es número) */}
                {typeof pjIndex !== 'number' && (
                  <button
                    className={`ml-4 p-2 rounded-full text-white transition-all duration-200 ${cuentaActual.ultimoIngreso === hoy ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                    onClick={() => window.alternarIngreso && window.alternarIngreso(cuenta.id)}
                    title={cuentaActual.ultimoIngreso === hoy ? 'Ya ingresado hoy' : 'Marcar ingreso'}
                    disabled={cuentaActual.ultimoIngreso === hoy}
                  >
                    <FaCheckCircle />
                  </button>
                )}
              </div>
              
              {/* Header de PJs */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FaUserNinja className="text-orange-600 text-lg sm:text-xl" />
                  <strong className="text-lg sm:text-xl text-gray-800">
                    Personajes ({formatNumber(cuentaActual.pejotas.length)})
                  </strong>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleAgregarPj}
                    className="btn btn-success flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <FaPlus className="w-4 h-4" />
                    Agregar PJ
                  </button>
                </div>
              </div>
              
              {/* Grid de PJs SOLO si no es búsqueda */}
              {!esBusqueda && (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 sm:gap-6">
                  {(mostrarTodosPjs ? cuentaActual.pejotas : cuentaActual.pejotas.slice(0, 8)).map((pj, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl bg-white shadow-md flex flex-col items-center py-6 sm:py-8 px-2 sm:px-4 w-full max-w-xs mx-auto relative">
                      <div className="w-full text-base font-semibold text-gray-800 mb-2 text-center truncate">
                        {pj.nombre}
                      </div>
                      <button
                        className="btn btn-primary text-xs px-4 py-1 w-full"
                        onClick={() => handleOpenModal(pj, i)}
                      >
                        Detalles
                      </button>
                      <button
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white rounded-full p-2 shadow"
                        onClick={() => setConfirmarEliminar(i)}
                        title="Eliminar PJ"
                        style={{lineHeight: 1}}
                      >
                        <FaTimes className="text-base" />
                      </button>
                      {confirmarEliminar === i && (
                        <div className="absolute top-10 right-2 bg-white border border-red-300 rounded shadow p-3 z-50 flex flex-col items-center animate-fadeIn">
                          <div className="text-sm text-gray-700 mb-2">¿Eliminar este PJ?</div>
                          <div className="flex gap-2">
                            <button className="btn btn-danger btn-xs" onClick={() => { eliminarPj(cuenta.id, i); setConfirmarEliminar(null); }}>Sí</button>
                            <button className="btn btn-secondary btn-xs" onClick={() => setConfirmarEliminar(null)}>No</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {cuentaActual.pejotas.length > 6 && !esBusqueda && (
                <div className="flex justify-center mt-4 sm:mt-6">
                  <button
                    onClick={() => setMostrarTodosPjs(!mostrarTodosPjs)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center gap-2 transition-colors"
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
                </div>
              )}

              {cuentaActual.pejotas.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <FaUserNinja className="text-5xl sm:text-6xl text-gray-300 mx-auto mb-4 sm:mb-6" />
                  <p className="text-lg sm:text-xl text-gray-500 mb-4 sm:mb-6">No hay PJs en esta cuenta</p>
                  <button
                    onClick={handleAgregarPj}
                    className="btn btn-primary flex items-center gap-2 mx-auto text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3"
                  >
                    <FaPlus className="w-5 h-5" />
                    Agregar primer PJ
                  </button>
                </div>
              )}
            </div>
            {/* Modal de detalles y edición de PJ */}
            <Modal isOpen={modalPj !== null || esBusqueda} onClose={() => { setModalPj(null); if (onClose) onClose(); }}>
              {(modalPj !== null || esBusqueda) && (
                <>
                  {/* Nuevo recuadro superior para cuenta y correo */}
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-2 p-2 sm:p-3 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-serif">
                    <div className="truncate max-w-full"><b>Cuenta:</b> <span className="font-bold text-gray-800">{cuentaActual.nombre}</span></div>
                    <div className="truncate max-w-full"><b>Correo:</b> <span className="font-mono text-blue-700">{cuentaActual.correo || 'Sin correo'}</span></div>
                  </div>
                  <form className="space-y-3 sm:space-y-4 w-full max-w-xs mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-200 font-serif">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <span className="text-xl sm:text-2xl text-orange-500"><FaUserNinja /></span>
                      <label className="block text-sm sm:text-base font-bold text-gray-800">Nombre PJ</label>
                    </div>
                    <input
                      className="border border-blue-300 rounded px-2 sm:px-3 py-2 w-full text-base font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={pjEdit.nombre || ''}
                      onChange={e => handleChange('nombre', e.target.value)}
                      placeholder="Nombre del PJ"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2 sm:mt-4 mb-1 sm:mb-2">
                      <span className="text-lg sm:text-xl text-yellow-500"><FaMedal /></span>
                      <label className="block text-sm sm:text-base font-bold text-gray-800">Medallas</label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="border border-yellow-300 rounded px-2 sm:px-3 py-2 w-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      value={pjEdit.medallas || ''}
                      onChange={e => handleChange('medallas', e.target.value)}
                      placeholder="Medallas"
                    />
                    <div className="flex items-center gap-2 mt-2 sm:mt-4 mb-1 sm:mb-2">
                      <span className="text-lg sm:text-xl text-green-600 font-bold">₩</span>
                      <label className="block text-sm sm:text-base font-bold text-gray-800">Wones</label>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="border border-green-300 rounded px-2 sm:px-3 py-2 w-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={pjEdit.wones || ''}
                      onChange={e => handleChange('wones', e.target.value)}
                      placeholder="Solo números"
                    />
                    {/* Notas */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-4 mb-1 sm:mb-2">
                      <span className="text-lg sm:text-xl text-blue-500"><FaStickyNote /></span>
                      <label className="block text-sm sm:text-base font-bold text-gray-800">Notas</label>
                    </div>
                    <div className="relative">
                      <textarea
                        className="border border-blue-200 rounded px-2 sm:px-3 py-2 w-full text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[90px] font-mono pr-10"
                        value={pjEdit.notas || ''}
                        onChange={e => handleChange('notas', e.target.value)}
                        placeholder={"• Escribe una idea y presiona Enter\n• Otra idea\n- O usa guiones para listas"}
                        style={{whiteSpace: 'pre-wrap', listStyle: 'disc inside'}}
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-blue-400 hover:text-blue-600 text-lg"
                        title="Insertar viñeta"
                        tabIndex={-1}
                        onClick={e => {
                          e.preventDefault();
                          const textarea = e.target.closest('div').querySelector('textarea');
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const value = textarea.value;
                            const nueva = value.slice(0, start) + '• ' + value.slice(end);
                            handleChange('notas', nueva);
                            setTimeout(() => {
                              textarea.focus();
                              textarea.selectionStart = textarea.selectionEnd = start + 2;
                            }, 0);
                          }
                        }}
                      >•</button>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-2 sm:mt-4">
                      <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => { setModalPj(null); if (onClose) onClose(); }}>
                        Cancelar
                      </button>
                      <button type="button" className="btn btn-success w-full sm:w-auto" onClick={handleSave}>
                        Guardar
                      </button>
                    </div>
                  </form>
                </>
              )}
            </Modal>
          </div>
        </div>
      </div>
    </PortalModal>
  );
}

export default PjDetailsModal;