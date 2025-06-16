import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaUser } from 'react-icons/fa';
import AccountForm from './components/AccountForm';
import AccountList from './components/AccountList';
import MedalDetails from './components/MedalDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import ConfirmModal from './components/ConfirmModal';
import SuccessNotification from './components/SuccessNotification';
import TimeSettings from './components/TimeSettings';
import DataManager from './components/DataManager';
import UserManager from './components/UserManager';
import HistoryViewer from './components/HistoryViewer';
import LoginForm from './components/LoginForm';
import SuperUserManager from './components/SuperUserManager';
import ValidationMessage from './components/ValidationMessage';
import PjDetailsModal from './components/PjDetailsModal';
import { formatNumber, formatCompactNumber } from './utils/formatters';
import './index.css';


function App() {
  // Estados principales
  const [cuentas, setCuentas] = useState([]);
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: '', correo: '', cantidadPjs: '' });
  const [nuevoPj, setNuevoPj] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [horaReinicio, setHoraReinicio] = useState('22:00');
  const [mostrarResumen, setMostrarResumen] = useState(true);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [mostrarAgregarPJ, setMostrarAgregarPJ] = useState(false);
  const [mostrarDetallesMedallas, setMostrarDetallesMedallas] = useState(false);
    const [mostrarSoloCorreos, setMostrarSoloCorreos] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, message: '', onConfirm: null });
  const [successNotification, setSuccessNotification] = useState({ isOpen: false, message: '' });
  const [usuarioActual, setUsuarioActual] = useState('');
  const [pestañaActiva, setPestañaActiva] = useState('inicio');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [mostrarSuperUser, setMostrarSuperUser] = useState(false);

  // Función auxiliar
  const hoy = new Date().toLocaleDateString();

  const guardarHistorialDiario = useCallback(() => {
    if (!usuarioActual || cuentas.length === 0) return;
    const historial = JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`)) || {};
    const ingresosDia = cuentas.filter(c => c.ultimoIngreso === hoy).length;
    const medallasGanadas = cuentas.reduce((total, cuenta) => 
      total + cuenta.pejotas.reduce((sum, pj) => sum + (parseInt(pj.medallas) || 0), 0), 0
    );
    historial[hoy] = {
      fecha: hoy,
      ingresosDia,
      medallasGanadas,
      totalCuentas: cuentas.length,
      totalPjs: cuentas.reduce((total, cuenta) => total + cuenta.pejotas.length, 0),
      cuentas: cuentas.map(cuenta => ({
        nombre: cuenta.nombre,
        correo: cuenta.correo,
        ingresado: cuenta.ultimoIngreso === hoy,
        pejotas: cuenta.pejotas
      }))
    };
    localStorage.setItem(`historial-diario-${usuarioActual}`, JSON.stringify(historial));
  }, [usuarioActual, cuentas, hoy]);

  // Efecto: Mantener sesión activa
  useEffect(() => {
    const sesionActiva = localStorage.getItem('sesion-activa');
    if (sesionActiva) {
      const usuario = JSON.parse(sesionActiva);
      setUsuarioLogueado(usuario);
      setUsuarioActual(usuario.usuario);
    }
  }, []);

  // Efecto: Actualizar usuario logueado si se modifica en el SuperUserManager
  useEffect(() => {
    const interval = setInterval(() => {
      const sesionActiva = localStorage.getItem('sesion-activa');
      if (sesionActiva && usuarioLogueado) {
        const usuarioActualizado = JSON.parse(sesionActiva);
        if (JSON.stringify(usuarioActualizado) !== JSON.stringify(usuarioLogueado)) {
          setUsuarioLogueado(usuarioActualizado);
          if (usuarioActualizado.usuario !== usuarioActual) {
            setUsuarioActual(usuarioActualizado.usuario);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [usuarioLogueado, usuarioActual]);

  // Efecto: Cargar cuentas y hora de reinicio
  useEffect(() => {
    if (!usuarioLogueado || !usuarioActual) return;
    let guardadas = [];
    try {
      const cuentasRaw = localStorage.getItem(`cuentas-${usuarioActual}`);
      guardadas = cuentasRaw ? JSON.parse(cuentasRaw) : [];
    } catch (e) {
      guardadas = [];
    }
    // Reinicio diario: limpiar ultimoIngreso si corresponde
    const ultimaFechaReinicio = localStorage.getItem(`ultimaFechaReinicio-${usuarioActual}`) || '';
    const ahoraCET = new Date(new Date().toLocaleString('en-US', { timeZone: 'CET' }));
    const hoyCET = ahoraCET.toLocaleDateString();
    if (ultimaFechaReinicio === hoyCET && guardadas.length > 0) {
      const necesitaReinicio = guardadas.some(c => c.ultimoIngreso !== null);
      if (necesitaReinicio) {
        guardadas = guardadas.map(c => ({ ...c, ultimoIngreso: null }));
        localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(guardadas));
      }
    }
    setCuentas(Array.isArray(guardadas) ? guardadas : []);
    setHoraReinicio(localStorage.getItem(`horaReinicio-${usuarioActual}`) || '22:00');
  }, [usuarioActual, usuarioLogueado]);

  // Efecto: Guardar cuentas y actualizar historial
  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(cuentas));
      guardarHistorialDiario();
    }
  }, [cuentas, usuarioActual, guardarHistorialDiario]);

  // Efecto: Guardar hora de reinicio
  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem(`horaReinicio-${usuarioActual}`, horaReinicio);
    }
  }, [horaReinicio, usuarioActual]);

  
  // Efecto: Reinicio automático a la hora CET
  useEffect(() => {
    if (!usuarioActual) return;
    const ahora = new Date();
    const ahoraCET = new Date(ahora.toLocaleString('en-US', { timeZone: 'CET' }));
    const hoyCET = ahoraCET.toLocaleDateString();
    const ultimaFechaReinicio = localStorage.getItem(`ultimaFechaReinicio-${usuarioActual}`) || '';
    const [hora, minuto] = horaReinicio.split(':').map(Number);
    const reinicioHoyCET = new Date(ahoraCET);
    reinicioHoyCET.setHours(hora, minuto, 0, 0);
    if (ahoraCET >= reinicioHoyCET) {
      if (ultimaFechaReinicio !== hoyCET) {
        setCuentas(prev => {
          const reiniciadas = prev.map(c => ({ ...c, ultimoIngreso: null }));
          localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(reiniciadas));
          return reiniciadas;
        });
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, hoyCET);
      }
    } else {
      if (ultimaFechaReinicio !== hoyCET) {
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, '');
      }
    }
    const timer = setInterval(() => {
      const ahora = new Date();
      const ahoraCET = new Date(ahora.toLocaleString('en-US', { timeZone: 'CET' }));
      const hoyCET = ahoraCET.toLocaleDateString();
      const [hora, minuto] = horaReinicio.split(':').map(Number);
      const reinicioHoyCET = new Date(ahoraCET);
      reinicioHoyCET.setHours(hora, minuto, 0, 0);
      const ultimaFechaReinicio = localStorage.getItem(`ultimaFechaReinicio-${usuarioActual}`) || '';
      if (ahoraCET >= reinicioHoyCET && ultimaFechaReinicio !== hoyCET) {
        setCuentas(prev => {
          const reiniciadas = prev.map(c => ({ ...c, ultimoIngreso: null }));
          localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(reiniciadas));
          return reiniciadas;
        });
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, hoyCET);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [horaReinicio, usuarioActual]);

  const handleLogin = (usuario) => {
    setUsuarioLogueado(usuario);
    setUsuarioActual(usuario.usuario);
    localStorage.setItem('sesion-activa', JSON.stringify(usuario));
  };

  const handleLogout = () => {
    setModalConfirm({
      isOpen: true,
      message: '¿Estás seguro de que deseas cerrar sesión?',
      onConfirm: () => {
        setUsuarioLogueado(null);
        setUsuarioActual('');
        setCuentas([]);
        setMostrarDetalles(null);
        setFormVisible(false);
        setMostrarAgregarPJ(false);
        localStorage.removeItem('sesion-activa');
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const cambiarUsuario = (nuevoUsuario) => {
    setUsuarioActual(nuevoUsuario);
    setCuentas([]);
    setMostrarDetalles(null);
    setFormVisible(false);
    setMostrarAgregarPJ(false);
  };

  const calcularTiempoHastaReinicio = () => {
    const ahora = new Date();
    const [hora, minuto] = horaReinicio.split(':').map(Number);
    let proximoReinicio = new Date();
    proximoReinicio.setHours(hora, minuto, 0, 0);
    if (proximoReinicio <= ahora) {
      proximoReinicio.setDate(proximoReinicio.getDate() + 1);
    }
    const diferencia = proximoReinicio - ahora;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    return { horas, minutos };
  };

  // Handlers de cuentas y PJs
  const agregarCuenta = () => {
    // Las validaciones ahora se manejan en AccountForm
    const correo = nuevaCuenta.correo.trim();
    const cantidad = parseInt(nuevaCuenta.cantidadPjs || 0);
    
    const pejotas = Array.from({ length: cantidad }, (_, i) => ({
      nombre: `PJ${i + 1}`,
      medallas: 0,
      notas: ''
    }));
    
    const cuenta = {
      ...nuevaCuenta,
      correo,
      id: Date.now(),
      ingresado: false,
      ultimoIngreso: null,
      historial: [],
      pejotas
    };
    
    setCuentas([...cuentas, cuenta]);
    setFormVisible(false);
    setNuevaCuenta({ nombre: '', correo: '', cantidadPjs: '' });
    setSuccessNotification({
      isOpen: true,
      message: `✅ Cuenta "${nuevaCuenta.nombre}" creada exitosamente${cantidad > 0 ? ` con ${cantidad} PJ(s)` : ''}.`
    });
  };

  const agregarPJACuenta = () => {
    if (!nuevoPj.trim() || cuentaActiva === null) {
      setModalConfirm({
        isOpen: true,
        message: 'Por favor ingresa un nombre para el PJ.',
        onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
      });
      return;
    }
    setCuentas(prev =>
      prev.map(c =>
        c.id === cuentaActiva
          ? { ...c, pejotas: [...c.pejotas, { nombre: nuevoPj.trim(), medallas: 0, notas: '' }] }
          : c
      )
    );
    setNuevoPj('');
    setMostrarAgregarPJ(false);
    setSuccessNotification({
      isOpen: true,
      message: 'PJ agregado exitosamente.'
    });
  };

  const alternarIngreso = (id) => {
    const now = new Date();
    const fecha = now.toLocaleDateString();
    const hora = now.toLocaleTimeString();
    const fechaHora = `${fecha} ${hora}`;
    setCuentas(prev =>
      prev.map(c => {
        if (c.id === id && c.ultimoIngreso !== fecha) {
          return {
            ...c,
            ingresado: true,
            ultimoIngreso: fecha,
            historial: [...c.historial, fechaHora]
          };
        }
        return c;
      })
    );
  };

  const editarPj = (cuentaId, index, campo, valor) => {
    setCuentas(prev =>
      prev.map(c => {
        if (c.id === cuentaId) {
          const nuevosPjs = [...c.pejotas];
          nuevosPjs[index][campo] = campo === 'medallas' ? parseInt(valor || 0) : valor;
          return { ...c, pejotas: nuevosPjs };
        }
        return c;
      })
    );
  };

  const eliminarCuenta = (id) => {
    const cuenta = cuentas.find(c => c.id === id);
    if (!cuenta) return;
    setModalConfirm({
      isOpen: true,
      message: `¿Estás seguro de que deseas eliminar la cuenta "${cuenta.nombre}"?`,
      onConfirm: () => {
        setCuentas(prev => prev.filter(c => c.id !== id));
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const eliminarPj = (cuentaId, index) => {
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta || !cuenta.pejotas[index]) return;
    const pj = cuenta.pejotas[index];
    setModalConfirm({
      isOpen: true,
      message: `¿Estás seguro de que deseas eliminar el PJ "${pj.nombre}"?`,
      onConfirm: () => {
        setCuentas(prev =>
          prev.map(c => {
            if (c.id === cuentaId) {
              const nuevosPjs = [...c.pejotas];
              nuevosPjs.splice(index, 1);
              return { ...c, pejotas: nuevosPjs };
            }
            return c;
          })
        );
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Cálculos derivados
  const cuentasFiltradas = cuentas.filter(c => c.nombre.toLowerCase().includes(filtro.toLowerCase()));
  const cuentasPorCorreo = cuentasFiltradas.reduce((acc, c) => {
    const key = c.correo || 'Sin correo';
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});
  const faltantesHoy = cuentas.filter(c => c.ultimoIngreso !== hoy).length;
  const totalPjs = cuentas.reduce((a, c) => a + c.pejotas.length, 0);
  const totalMedallas = cuentas.reduce(
    (a, c) => a + c.pejotas.reduce((m, pj) => m + (pj.medallas || 0), 0),
    0
  );
  const tiempoRestante = calcularTiempoHastaReinicio();

  if (!usuarioLogueado) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        filtro={filtro} 
        setFiltro={setFiltro}
        pestañaActiva={pestañaActiva}
        setPestañaActiva={setPestañaActiva}
        usuarioLogueado={usuarioLogueado}
        onLogout={handleLogout}
        onOpenSuperUser={() => setMostrarSuperUser(true)}
      />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {pestañaActiva === 'usuarios' && (
            <UserManager 
              usuarioActual={usuarioActual}
              setUsuarioActual={setUsuarioActual}
              onUsuarioChange={cambiarUsuario}
            />
          )}
          {pestañaActiva === 'historial' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <HistoryViewer usuarioActual={usuarioActual} />
            </div>
          )}
          {pestañaActiva === 'datos' && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <DataManager 
                cuentas={cuentas}
                setCuentas={setCuentas}
                horaReinicio={horaReinicio}
                setHoraReinicio={setHoraReinicio}
                setModalConfirm={setModalConfirm}
              />
            </div>
          )}
          {pestañaActiva === 'inicio' && (
            <div className="space-y-6 fade-in">
            {mostrarResumen && (
              <div className="card">
                <div className="card-body">
                  <div className="stats-grid">
                    <div className="stat-card stat-danger">
                      <div className="stat-value">{formatNumber(faltantesHoy)}</div>
                      <div className="stat-label">Cuentas por ingresar</div>
                    </div>
                    <div className="stat-card stat-primary">
                      <div className="stat-value">{formatCompactNumber(totalPjs)}</div>
                      <div className="stat-label">Total PJs</div>
                    </div>
                    <div className="stat-card stat-warning">
                      <div className="stat-value">{formatCompactNumber(totalMedallas)}</div>
                      <div className="stat-label">Total Medallas</div>
                    </div>
                    <div className="stat-card stat-success">
                      <div className="stat-value">{tiempoRestante.horas}h {tiempoRestante.minutos}m</div>
                      <div className="stat-label">Tiempo restante</div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setMostrarDetallesMedallas(true)}
                      className="btn btn-secondary text-sm"
                    >
                      🏆 Ver Top Medallas
                    </button>
                    <div className="flex items-center gap-4">
                      <TimeSettings horaReinicio={horaReinicio} setHoraReinicio={setHoraReinicio} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Gestión de Cuentas</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFormVisible(true)}
                      className="btn btn-success flex items-center gap-2"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      Nueva Cuenta
                    </button>
                    <button
                      onClick={() => setMostrarSoloCorreos(!mostrarSoloCorreos)}
                      className={`btn ${mostrarSoloCorreos ? 'btn-primary' : 'btn-secondary'} flex items-center gap-2`}
                    >
                      {mostrarSoloCorreos ? '📧 Mostrar Cuentas' : '📧 Solo Correos'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
            {formVisible && (
            <AccountForm
              nuevaCuenta={nuevaCuenta}
              setNuevaCuenta={setNuevaCuenta}
              agregarCuenta={agregarCuenta}
              cancelar={() => setFormVisible(false)}
              cuentas={cuentas}
            />
            )}
            {mostrarAgregarPJ && (
              <div className="modal-overlay">
                <div className="modal-content max-w-md">
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
                        className="form-input with-icon"
                        placeholder="Nombre del PJ"
                        value={nuevoPj}
                        onChange={e => setNuevoPj(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && agregarPJACuenta()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="card-footer flex justify-end gap-3">
                    <button
                      onClick={() => setMostrarAgregarPJ(false)}
                      className="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={agregarPJACuenta}
                      className="btn btn-success flex items-center gap-2"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      Agregar PJ
                    </button>
                  </div>
                </div>
              </div>
            )}
            <AccountList
                  cuentasPorCorreo={cuentasPorCorreo}
                  hoy={hoy}
                  mostrarDetalles={mostrarDetalles}
                  setMostrarDetalles={setMostrarDetalles}
                  alternarIngreso={alternarIngreso}
                  setCuentaActiva={setCuentaActiva}
                  setMostrarAgregarPJ={setMostrarAgregarPJ}
                  eliminarCuenta={eliminarCuenta}
                  eliminarPj={eliminarPj}
                  editarPj={editarPj}
                  mostrarSoloCorreos={mostrarSoloCorreos}
                />
              </div>
            </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <ConfirmModal
        isOpen={modalConfirm.isOpen}
        message={modalConfirm.message}
        onConfirm={modalConfirm.onConfirm}
        onCancel={() => setModalConfirm({ isOpen: false, message: '', onConfirm: null })}
      />
      <SuccessNotification
        isOpen={successNotification.isOpen}
        message={successNotification.message}
        onClose={() => setSuccessNotification({ isOpen: false, message: '' })}
      />
      {mostrarDetallesMedallas && (
        <MedalDetails 
          cuentas={cuentas}
          onClose={() => setMostrarDetallesMedallas(false)}
        />
      )}
      {mostrarSuperUser && (
        <SuperUserManager 
          usuarioLogueado={usuarioLogueado}
          onClose={() => setMostrarSuperUser(false)}
        />
      )}
      {mostrarDetalles && (
        <PjDetailsModal 
          cuenta={cuentas.find(c => c.id === mostrarDetalles)}
          onClose={() => setMostrarDetalles(null)}
          editarPj={editarPj}
          eliminarPj={eliminarPj}
          setCuentaActiva={setCuentaActiva}
          setMostrarAgregarPJ={setMostrarAgregarPJ}
        />
      )}
    </div>
  );
}

export default App;
