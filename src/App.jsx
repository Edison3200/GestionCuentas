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
import WeekCalendar from './components/WeekCalendar';
import WeekCalendarCompact from './components/WeekCalendarCompact';
import AboutPage from './components/AboutPage';
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
  const [busquedaPendiente, setBusquedaPendiente] = useState('');
  const [historial, setHistorial] = useState(() => {
    if (!usuarioActual) return {};
    try {
      return JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`)) || {};
    } catch {
      return {};
    }
  });

  // Mapeo de nombre a emoji simple (hombre, mujer, gato, perro)
  const iconMap = {
    man: '👨',
    woman: '👩',
    cat: '🐱',
    dog: '🐶',
  };

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
      let usuario = JSON.parse(sesionActiva);
      // Si el icono es un nombre, mostrar el emoji
      if (usuario.icono && typeof usuario.icono === 'string') {
        usuario = { ...usuario, icono: iconMap[usuario.icono] || usuario.icono };
      }
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

  // Detectar zona horaria local del usuario
  const zonaHorariaLocal = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
    const ahoraLocal = new Date(new Date().toLocaleString('en-US', { timeZone: zonaHorariaLocal }));
    const hoyLocal = ahoraLocal.toLocaleDateString();
    if (ultimaFechaReinicio === hoyLocal && guardadas.length > 0) {
      const necesitaReinicio = guardadas.some(c => c.ultimoIngreso !== null);
      if (necesitaReinicio) {
        guardadas = guardadas.map(c => ({ ...c, ultimoIngreso: null }));
        localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(guardadas));
      }
    }
    setCuentas(Array.isArray(guardadas) ? guardadas : []);
    setHoraReinicio(localStorage.getItem(`horaReinicio-${usuarioActual}`) || '22:00');
  }, [usuarioActual, usuarioLogueado, zonaHorariaLocal]);

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

  
  // Efecto: Reinicio automático a la hora local
  useEffect(() => {
    if (!usuarioActual) return;
    const ahora = new Date();
    const ahoraLocal = new Date(ahora.toLocaleString('en-US', { timeZone: zonaHorariaLocal }));
    const hoyLocal = ahoraLocal.toLocaleDateString();
    const ultimaFechaReinicio = localStorage.getItem(`ultimaFechaReinicio-${usuarioActual}`) || '';
    const [hora, minuto] = horaReinicio.split(':').map(Number);
    const reinicioHoyLocal = new Date(ahoraLocal);
    reinicioHoyLocal.setHours(hora, minuto, 0, 0);
    if (ahoraLocal >= reinicioHoyLocal) {
      if (ultimaFechaReinicio !== hoyLocal) {
        setCuentas(prev => {
          const reiniciadas = prev.map(c => ({ ...c, ultimoIngreso: null }));
          localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(reiniciadas));
          return reiniciadas;
        });
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, hoyLocal);
      }
    } else {
      if (ultimaFechaReinicio !== hoyLocal) {
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, '');
      }
    }
    const timer = setInterval(() => {
      const ahora = new Date();
      const ahoraLocal = new Date(ahora.toLocaleString('en-US', { timeZone: zonaHorariaLocal }));
      const hoyLocal = ahoraLocal.toLocaleDateString();
      const [hora, minuto] = horaReinicio.split(':').map(Number);
      const reinicioHoyLocal = new Date(ahoraLocal);
      reinicioHoyLocal.setHours(hora, minuto, 0, 0);
      const ultimaFechaReinicio = localStorage.getItem(`ultimaFechaReinicio-${usuarioActual}`) || '';
      if (ahoraLocal >= reinicioHoyLocal && ultimaFechaReinicio !== hoyLocal) {
        setCuentas(prev => {
          const reiniciadas = prev.map(c => ({ ...c, ultimoIngreso: null }));
          localStorage.setItem(`cuentas-${usuarioActual}`, JSON.stringify(reiniciadas));
          return reiniciadas;
        });
        localStorage.setItem(`ultimaFechaReinicio-${usuarioActual}`, hoyLocal);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [horaReinicio, usuarioActual, zonaHorariaLocal]);

  const handleLogin = (usuario) => {
    let user = { ...usuario };
    // Si el icono es un nombre, buscar el emoji
    if (user.icono && typeof user.icono === 'string') {
      user.icono = iconMap[user.icono] || user.icono;
    }
    setUsuarioLogueado(user);
    setUsuarioActual(user.usuario);
    // Guardar solo el string del nombre del icono (no el emoji) en localStorage
    const usuarioParaGuardar = { ...usuario, icono: Object.keys(iconMap).find(key => iconMap[key] === user.icono) || user.icono };
    localStorage.setItem('sesion-activa', JSON.stringify(usuarioParaGuardar));
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

  // Estado reactivo para el tiempo restante
  const [tiempoRestante, setTiempoRestante] = useState(calcularTiempoHastaReinicio());

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante(calcularTiempoHastaReinicio());
    }, 1000);
    return () => clearInterval(timer);
  }, [horaReinicio]);

  // Eliminar todas las cuentas asociadas a un correo
  const eliminarCuentasPorCorreo = (correo) => {
    setModalConfirm({
      isOpen: true,
      message: `¿Seguro que deseas eliminar todas las cuentas asociadas al correo "${correo}"?`,
      onConfirm: () => {
        setCuentas(prev => prev.filter(c => c.correo !== correo));
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Handlers de cuentas y PJs
  const agregarCuenta = () => {
    // Las validaciones ahora se manejan en AccountForm
    const correo = nuevaCuenta.correo.trim();
    const cantidad = parseInt(nuevaCuenta.cantidadPjs || 0);
    
    const pejotas = Array.from({ length: cantidad }, (_, i) => ({
      nombre: `PJ${i + 1}`,
      medallas: 0,
      notas: '',
      wones: ''
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
    setFiltro(''); // Limpiar filtro para mostrar todas las cuentas
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
          ? { ...c, pejotas: [...c.pejotas, { nombre: nuevoPj.trim(), medallas: 0, notas: '', wones: '' }] }
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
          if (campo === 'medallas') {
            nuevosPjs[index][campo] = parseInt(valor || 0);
          } else if (campo === 'wones') {
            nuevosPjs[index][campo] = valor.replace(/\D/g, ''); // solo números
          } else {
            nuevosPjs[index][campo] = valor;
          }
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

  // --- BÚSQUEDA DE PJ Y MODAL DIRECTO ---
  const [modalBusquedaPJ, setModalBusquedaPJ] = useState(null); // {cuenta, pj}
  const [mensajeBusquedaPJ, setMensajeBusquedaPJ] = useState('');

  // Cambiar el input del buscador para usar busquedaPendiente
  // En el Header:
  // <Header filtro={busquedaPendiente} setFiltro={setBusquedaPendiente} ... />

  // Solo buscar cuando el usuario presione Enter
  React.useEffect(() => {
    setFiltro(''); // Limpiar filtro reactivo
  }, []);

  React.useEffect(() => {
    // Cuando cambia filtro, limpiar modal de búsqueda
    setModalBusquedaPJ(null);
    setMensajeBusquedaPJ('');
  }, [filtro]);

  // Buscar por nombre de cuenta, nombre de PJ o notas
  const buscarPj = React.useCallback(() => {
    if (busquedaPendiente.trim().length === 0) {
      setModalBusquedaPJ(null);
      setMensajeBusquedaPJ('');
      return;
    }
    const coincidencias = [];
    cuentas.forEach(cuenta => {
      // Buscar por nombre de cuenta
      if (cuenta.nombre.toLowerCase().includes(busquedaPendiente.toLowerCase())) {
        coincidencias.push({ cuenta, pj: null, idx: null, tipo: 'cuenta' });
      }
      // Buscar por nombre o notas de PJ
      cuenta.pejotas.forEach((pj, idx) => {
        if (
          pj.nombre.toLowerCase().includes(busquedaPendiente.toLowerCase()) ||
          (pj.notas && pj.notas.toLowerCase().includes(busquedaPendiente.toLowerCase()))
        ) {
          coincidencias.push({ cuenta, pj, idx, tipo: 'pj' });
        }
      });
    });
    if (coincidencias.length === 1) {
      setModalBusquedaPJ(coincidencias[0]);
      setMensajeBusquedaPJ('');
    } else if (coincidencias.length > 1) {
      setModalBusquedaPJ(null);
      setMensajeBusquedaPJ(`Hay ${coincidencias.length} coincidencias para "${busquedaPendiente}". Especifica más.`);
    } else {
      setModalBusquedaPJ(null);
      setMensajeBusquedaPJ(`No se encontró ningún PJ, cuenta o nota que coincida con "${busquedaPendiente}".`);
    }
  }, [busquedaPendiente, cuentas]);

  // Ocultar mensaje de búsqueda después de 2.5 segundos
  useEffect(() => {
    if (mensajeBusquedaPJ) {
      const timer = setTimeout(() => setMensajeBusquedaPJ(''), 2500);
      return () => clearTimeout(timer);
    }
  }, [mensajeBusquedaPJ]);

  // Cálculos derivados
  const cuentasFiltradas = cuentas.filter(c => {
    const filtroLower = filtro.toLowerCase();
    // Coincidencia por nombre de cuenta
    if (c.nombre.toLowerCase().includes(filtroLower)) return true;
    // Coincidencia por notas de algún PJ
    if (c.pejotas && c.pejotas.some(pj => (pj.notas || '').toLowerCase().includes(filtroLower))) return true;
    // Coincidencia por nombre de algún PJ
    if (c.pejotas && c.pejotas.some(pj => (pj.nombre || '').toLowerCase().includes(filtroLower))) return true;
    return false;
  });
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

  if (!usuarioLogueado) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        filtro={busquedaPendiente} 
        setFiltro={setBusquedaPendiente}
        pestañaActiva={pestañaActiva}
        setPestañaActiva={setPestañaActiva}
        usuarioLogueado={usuarioLogueado}
        onLogout={handleLogout}
        onOpenSuperUser={() => setMostrarSuperUser(true)}
        onBuscarPj={buscarPj}
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
          <ResumenStats
          faltantesHoy={faltantesHoy}
          totalPjs={totalPjs}
          totalMedallas={totalMedallas}
          tiempoRestante={tiempoRestante}
          setMostrarDetallesMedallas={setMostrarDetallesMedallas}
          horaReinicio={horaReinicio}
          setHoraReinicio={setHoraReinicio}
          usuarioActual={usuarioActual}
          cuentas={cuentas}
          />
          )}
          
          <div className="card">
          <div className="card-header">
            <div className="flex items-center w-full">
              <div className="flex-none">
                <h2 className="text-xl font-bold text-gray-800">Gestión de Cuentas</h2>
              </div>
              <div className="flex-1 flex justify-center">
                <WeekCalendarCompact
                  historial={JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`) || '{}')}
                  totalCuentas={cuentas.length}
                />
              </div>
              <div className="flex gap-3 flex-none overflow-x-auto pb-2 mobile-btn-row">
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
                <button
                  onClick={() => {
                    setModalConfirm({
                      isOpen: true,
                      message: '¿Seguro que deseas poner en 0 todas las medallas de todos los PJs?',
                      onConfirm: () => {
                        setCuentas(prev => prev.map(c => ({
                          ...c,
                          pejotas: c.pejotas.map(pj => ({ ...pj, medallas: 0 }))
                        })));
                        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
                      }
                    });
                  }}
                  className="btn btn-warning flex items-center gap-2"
                >
                  🧹 Limpiar Medallas
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
          eliminarCuentasPorCorreo={eliminarCuentasPorCorreo}
          />
          </div>
          </div>
          </div>
          )}
          {pestañaActiva === 'info' && (
          <div className="fade-in">
          <AboutPage />
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-center max-w-7xl w-full mx-4">
            <MedalDetails 
              cuentas={cuentas}
              onClose={() => setMostrarDetallesMedallas(false)}
            />
            <WeekCalendar 
              historial={JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`) || '{}')}
              totalCuentas={cuentas.length}
            />
          </div>
        </div>
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
      {modalBusquedaPJ && (
        <PjDetailsModal
          cuenta={modalBusquedaPJ.cuenta}
          onClose={() => setModalBusquedaPJ(null)}
          editarPj={editarPj}
          eliminarPj={eliminarPj}
          setCuentaActiva={setCuentaActiva}
          setMostrarAgregarPJ={setMostrarAgregarPJ}
          pjIndex={modalBusquedaPJ.idx}
        />
      )}
      {mensajeBusquedaPJ && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded shadow-lg animate-fadeIn">
          {mensajeBusquedaPJ}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar las stats con toggle abreviado/completo
function ResumenStats({ faltantesHoy, totalPjs, totalMedallas, tiempoRestante, setMostrarDetallesMedallas, horaReinicio, setHoraReinicio, usuarioActual, cuentas }) {
  const [showFull, setShowFull] = React.useState({ pjs: false, medallas: false });
  const [showCongrats, setShowCongrats] = React.useState(false);
  const [editandoHora, setEditandoHora] = React.useState(false);
  const [anchorReinicio, setAnchorReinicio] = React.useState(null);

  // Cerrar el editor de hora al hacer clic fuera
  React.useEffect(() => {
    if (!editandoHora) return;
    function handleClick(e) {
      const pop = document.querySelector('.time-settings-pop');
      if (pop && !pop.contains(e.target) && !anchorReinicio?.contains?.(e.target)) {
        setEditandoHora(false);
        setAnchorReinicio(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [editandoHora, anchorReinicio]);

  const prevFaltantes = React.useRef(faltantesHoy);
  React.useEffect(() => {
    if (prevFaltantes.current > 0 && faltantesHoy === 0) {
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 3000);
    }
    prevFaltantes.current = faltantesHoy;
  }, [faltantesHoy]);
  return (
    <div className="card">
      <div className="card-body">
        {/* Mensaje de alerta flotante tipo toast */}
        {showCongrats && (
          <div style={{
            position: 'fixed',
            top: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '320px',
            background: 'linear-gradient(90deg, #fbbf24 0%, #22c55e 100%)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '1.2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '1.2rem 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
            animation: 'fadeIn 0.5s',
          }}>
            <span className="fire-effect" role="img" aria-label="fuego" style={{fontSize:'2rem'}}>🔥</span>
            <span style={{display:'inline-block', minWidth:'180px'}}>¡Felicidades! Has completado los ingresos de hoy</span>
            <span className="fire-effect" role="img" aria-label="fuego" style={{fontSize:'2rem'}}>🔥</span>
          </div>
        )}
        {/* Mensaje especial si todas las cuentas han sido ingresadas */}
        <div className="stats-grid gap-2 md:gap-4">
          <div className={`stat-card stat-danger${faltantesHoy > 0 ? ' alert-aura' : ''}`}
            style={{margin: 0}}>
            <div className="stat-value">{formatNumber(faltantesHoy)}</div>
            <div className="stat-label">Cuentas por ingresar</div>
          </div>
          <div className="stat-card stat-primary cursor-pointer" onClick={() => setShowFull(s => ({ ...s, pjs: !s.pjs }))} title="Click para alternar formato"
            style={{margin: 0}}>
            <div className="stat-value">
              {showFull.pjs ? formatNumber(totalPjs) : formatCompactNumber(totalPjs)}
            </div>
            <div className="stat-label">Total PJs</div>
          </div>
          <div className="stat-card stat-warning flex flex-col items-center justify-center relative"
            style={{margin: 0}}>
            <button
              className="btn btn-secondary btn-xs absolute right-2 top-2 z-10"
              style={{fontSize:'0.85em', padding:'0.2em 0.7em'}}
              onClick={() => setMostrarDetallesMedallas(true)}
              title="Ver Top Medallas"
            >
              🏆 Top
            </button>
            <div className="stat-value flex items-center gap-2">
              {showFull.medallas ? formatNumber(totalMedallas) : formatCompactNumber(totalMedallas)}
            </div>
            <div className="stat-label">Total Medallas</div>
          </div>
          <div className="stat-card stat-success flex flex-col items-center justify-center relative"
            style={{margin: 0}}>
            <button
              ref={el => setAnchorReinicio(el)}
              className="btn btn-secondary btn-xs absolute right-2 top-2 z-10"
              style={{fontSize:'0.85em', padding:'0.2em 0.7em'}}
              onClick={() => setEditandoHora(e => !e)}
            >
              Reinicio
            </button>
            <div className="stat-value">
              {tiempoRestante.horas}h {tiempoRestante.minutos}m
            </div>
            <div className="stat-label flex items-center gap-2">
              Tiempo restante Misión Diaria
            </div>
            {editandoHora && (
              <span className="time-settings-pop absolute right-2 top-10 z-20">
                <TimeSettings horaReinicio={horaReinicio} setHoraReinicio={setHoraReinicio} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
