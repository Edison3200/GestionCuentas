import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaUserPlus, FaUser, FaCat, FaDog, FaUserAstronaut, FaUserNinja, FaUserSecret, FaCog, FaTimes } from 'react-icons/fa';
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
import LandingPage from './components/LandingPage';
import SuperUserManager from './components/SuperUserManager';
import ValidationMessage from './components/ValidationMessage';
import PjDetailsModal from './components/PjDetailsModal';
import WeekCalendar from './components/WeekCalendar';
import WeekCalendarCompact from './components/WeekCalendarCompact';
import AboutPage from './components/AboutPage';
import AgregarPjModal from './components/AgregarPjModal';
import { formatNumber, formatCompactNumber, formatMedallas } from './utils/formatters';
import { useSupabase } from './hooks/useSupabase';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { signOut, supabase } from './lib/supabaseClient';
import { cuentaService, personajeService, historialService, configService } from './services/supabaseService';
import './index.css';


function App() {
  // Hook de Supabase
  const { loading: supabaseLoading, error: supabaseError, ensureUser } = useSupabase();
  
  // Hook de Google Auth
  const { googleUser, loading: googleLoading } = useGoogleAuth();
  
  // Refrescar sesión automáticamente si está cerca de expirar
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          const now = new Date();
          const timeUntilExpiry = expiresAt.getTime() - now.getTime();
          
          // Refrescar si expira en menos de 5 minutos
          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (error) {
        console.log('Session refresh check:', error.message);
      }
    };
    
    refreshSession();
    const interval = setInterval(refreshSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
  // Estados principales
  const [cuentas, setCuentas] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [nuevaCuenta, setNuevaCuenta] = useState({ nombre: '', correo: '', cantidadPjs: '' });
  const [nuevoPj, setNuevoPj] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [usuarioActual, setUsuarioActual] = useState('');
  const [horaReinicio, setHoraReinicio] = useState('22:00');
  const [mostrarResumen, setMostrarResumen] = useState(true);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [cuentaActiva, setCuentaActiva] = useState(null);
  const [mostrarAgregarPJ, setMostrarAgregarPJ] = useState(false);
  const [mostrarDetallesMedallas, setMostrarDetallesMedallas] = useState(false);
    const [mostrarSoloCorreos, setMostrarSoloCorreos] = useState(false);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, message: '', onConfirm: null });
  const [successNotification, setSuccessNotification] = useState({ isOpen: false, message: '' });
  const [pestañaActiva, setPestañaActiva] = useState('inicio');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [mostrarSuperUser, setMostrarSuperUser] = useState(false);
  const [busquedaPendiente, setBusquedaPendiente] = useState('');
  const [modoSeguimiento, setModoSeguimiento] = useState(() => {
    return localStorage.getItem('modo-seguimiento') === 'true';
  });
  const [historial, setHistorial] = useState(() => {
    if (!usuarioActual) return {};
    try {
      return JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`)) || {};
    } catch {
      return {};
    }
  });

  // Mapeo de nombre a ícono React
  const iconMap = {
    cat: <FaCat className="w-7 h-7 text-yellow-600" />,
    dog: <FaDog className="w-7 h-7 text-orange-700" />,
    astronaut: <FaUserAstronaut className="w-7 h-7 text-blue-700" />,
    ninja: <FaUserNinja className="w-7 h-7 text-gray-700" />,
    secret: <FaUserSecret className="w-7 h-7 text-purple-700" />,
  };

  // Estados adicionales
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('tema-oscuro') === 'true';
  });

  // Aplicar clase dark al body
  useEffect(() => {
    if (temaOscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaOscuro]);

  // Función auxiliar - fecha actual
  const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
  
  // Función para calcular el día personalizado basado en la hora de reinicio
  const obtenerDiaPersonalizado = (fecha = new Date()) => {
    const [hora, minuto] = horaReinicio.split(':').map(Number);
    const fechaActual = new Date(fecha);
    const horaReinicioHoy = new Date(fechaActual);
    horaReinicioHoy.setHours(hora, minuto, 0, 0);
    
    if (fechaActual < horaReinicioHoy) {
      const diaAnterior = new Date(fechaActual);
      diaAnterior.setDate(diaAnterior.getDate() - 1);
      return diaAnterior.toISOString().split('T')[0];
    }
    
    return fechaActual.toISOString().split('T')[0];
  };
  
  const diaPersonalizadoActual = obtenerDiaPersonalizado();
  
  const esHoraDeReinicio = useCallback(() => {
    const ahora = new Date();
    const [hora, minuto] = horaReinicio.split(':').map(Number);
    const reinicioHoy = new Date();
    reinicioHoy.setHours(hora, minuto, 0, 0);
    return ahora >= reinicioHoy;
  }, [horaReinicio]);

  const guardarHistorialDiario = useCallback(() => {
    if (!usuarioActual || cuentas.length === 0) return;
    
    try {
      const historial = JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`)) || {};
      const ingresosDia = cuentas.filter(c => c.ultimoIngreso === diaPersonalizadoActual).length;
      const medallasGanadas = cuentas.reduce((total, cuenta) => 
        total + (cuenta.pejotas?.reduce((sum, pj) => sum + (parseInt(pj.medallas) || 0), 0) || 0), 0
      );
      
      historial[diaPersonalizadoActual] = {
        fecha: diaPersonalizadoActual,
        ingresosDia,
        medallasGanadas,
        totalCuentas: cuentas.length,
        totalPjs: cuentas.reduce((total, cuenta) => total + (cuenta.pejotas?.length || 0), 0),
        cuentas: cuentas.map(cuenta => ({
          nombre: cuenta.nombre,
          correo: cuenta.correo,
          ingresado: cuenta.ultimoIngreso === diaPersonalizadoActual,
          pejotas: cuenta.pejotas || []
        }))
      };
      
      localStorage.setItem(`historial-diario-${usuarioActual}`, JSON.stringify(historial));
      console.log('Historial guardado para:', diaPersonalizadoActual, historial[diaPersonalizadoActual]);
    } catch (error) {
      console.error('Error guardando historial:', error);
    }
  }, [usuarioActual, cuentas, diaPersonalizadoActual]);

  // Efecto: Mantener sesión activa y cargar hora de reinicio
  useEffect(() => {
    const sesionActiva = localStorage.getItem('sesion-activa');
    if (sesionActiva) {
      let usuario = JSON.parse(sesionActiva);
      if (usuario.icono && typeof usuario.icono === 'string') {
        usuario = { ...usuario, icono: iconMap[usuario.icono] || '' };
      }
      setUsuarioLogueado(usuario);
      setUsuarioActual(usuario.usuario);
      
      const horaGuardada = localStorage.getItem(`hora-reinicio-${usuario.usuario}`);
      if (horaGuardada) {
        setHoraReinicio(horaGuardada);
      }
    }
  }, []);

  // Efecto: Actualizar usuario logueado si se modifica en el SuperUserManager
  useEffect(() => {
    const interval = setInterval(() => {
      const sesionActiva = localStorage.getItem('sesion-activa');
      if (sesionActiva && usuarioLogueado) {
        const usuarioActualizado = JSON.parse(sesionActiva);
        
        // Crear objetos limpios con solo propiedades serializables para comparación
        const cleanUsuarioActualizado = {
          usuario: usuarioActualizado.usuario,
          nombre: usuarioActualizado.nombre,
          email: usuarioActualizado.email
        };
        
        const cleanUsuarioLogueado = {
          usuario: usuarioLogueado.usuario,
          nombre: usuarioLogueado.nombre,
          email: usuarioLogueado.email
        };
        
        // Comparar los objetos limpios
        if (JSON.stringify(cleanUsuarioActualizado) !== JSON.stringify(cleanUsuarioLogueado)) {
          setUsuarioLogueado(usuarioActualizado);
          if (usuarioActualizado.usuario !== usuarioActual) {
            setUsuarioActual(usuarioActualizado.usuario);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [usuarioLogueado, usuarioActual]);

  // Efecto: Guardar hora de reinicio personalizada
  useEffect(() => {
    if (usuarioActual && horaReinicio) {
      localStorage.setItem(`hora-reinicio-${usuarioActual}`, horaReinicio);
      localStorage.removeItem(`ultimoReinicio-${usuarioActual}`);
    }
  }, [horaReinicio, usuarioActual]);

  const cambiarHoraReinicio = (nuevaHora) => {
    setHoraReinicio(nuevaHora);
    setSuccessNotification({
      isOpen: true,
      message: `⏰ Hora de reinicio actualizada a ${nuevaHora}`
    });
  };

  const zonaHorariaLocal = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Efecto: Cargar datos de Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!usuarioLogueado || isLoadingData) {
        setCuentas([]);
        return;
      }
      
      setIsLoadingData(true);
      
      try {
        // Asegurar que el usuario existe y obtener su ID
        const userId = await ensureUser();
        
        if (!userId) {
          setUsuarioLogueado(null);
          setUsuarioActual('');
          localStorage.removeItem('sesion-activa');
          alert('Usuario no registrado. Contacta al administrador.');
          return;
        }
        
        setUsuarioId(userId);
        
        // Si es ID temporal, mostrar vacío
        if (userId.startsWith('local_') || userId.startsWith('temp_')) {
          setCuentas([]);
          return;
        }
        
        // Cargar cuentas del usuario
        const { data: cuentasData, error } = await cuentaService.obtenerPorUsuario(userId);
        
        if (error) {
          console.error('Error cargando cuentas:', error);
          setCuentas([]);
          return;
        }
        
        // Filtrar y transformar datos
        const cuentasValidas = (cuentasData || [])
          .filter(cuenta => cuenta.usuario_id === userId && cuenta.nombre?.trim())
          .map(cuenta => ({
            id: cuenta.id,
            nombre: cuenta.nombre,
            correo: cuenta.correo || '',
            ultimoIngreso: cuenta.ultimo_ingreso,
            pejotas: cuenta.personajes?.filter(pj => pj.nombre?.trim()).map(pj => ({
              id: pj.id,
              nombre: pj.nombre,
              medallas: pj.medallas || 0,
              wones: pj.wones || '',
              notas: pj.notas || ''
            })) || [],
            historial: []
          }));
        
        setCuentas(cuentasValidas);
        
        // Cargar configuración
        const { data: config } = await configService.obtener(userId);
        if (config) {
          setHoraReinicio(config.hora_reinicio || '22:00');
          setModoSeguimiento(config.modo_seguimiento || false);
          setTemaOscuro(config.tema_oscuro || false);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setCuentas([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, [usuarioLogueado?.email]);

  // Efecto: Guardar configuraciones en base de datos
  useEffect(() => {
    if (usuarioActual && usuarioId && typeof usuarioId === 'string') {
      const guardarConfig = async () => {
        try {
          await configService.actualizar({
            usuario_id: usuarioId,
            hora_reinicio: horaReinicio,
            modo_seguimiento: modoSeguimiento,
            tema_oscuro: temaOscuro
          });
        } catch (error) {
          console.error('Error guardando configuración:', error);
        }
      };
      const timer = setTimeout(guardarConfig, 1000);
      return () => clearTimeout(timer);
    }
  }, [horaReinicio, modoSeguimiento, temaOscuro, usuarioActual, usuarioId]);

  
  // Estados de reinicio desactivados
  // const [reinicioEnProceso, setReinicioEnProceso] = useState(false);
  
  // Función de reinicio desactivada
  // const ejecutarReinicio = useCallback(() => {
  //   // Función comentada hasta solución definitiva
  // }, []);
  
  // Estados de reinicio desactivados
  // const [yaReinicioHoy, setYaReinicioHoy] = useState(false);
  
  // Efecto: Guardar historial cuando cambien las cuentas
  useEffect(() => {
    if (cuentas.length > 0) {
      guardarHistorialDiario();
    }
  }, [cuentas, guardarHistorialDiario]);
  
  // Reinicio automático desactivado para evitar bucles
  // El reinicio se hará manualmente desde la interfaz

  const handleLogin = (usuario) => {
    let user = { ...usuario };
    if (user.icono && typeof user.icono === 'string') {
      user.icono = iconMap[user.icono] || '';
    }
    setUsuarioLogueado(user);
    setUsuarioActual(user.usuario);
    localStorage.setItem('sesion-activa', JSON.stringify(usuario));
  };

  const handleLogout = () => {
    setModalConfirm({
      isOpen: true,
      message: '¿Estás seguro de que deseas cerrar sesión?',
      onConfirm: async () => {
        try {
          // Cerrar sesión de Google primero
          if (googleUser) {
            await signOut();
          }
          
          // Limpiar todos los estados
          setUsuarioLogueado(null);
          setUsuarioActual('');
          setUsuarioId(null);
          setCuentas([]);
          setMostrarDetalles(null);
          setFormVisible(false);
          setMostrarAgregarPJ(false);
          setIsLoadingData(false);
          
          // Limpiar localStorage
          localStorage.removeItem('sesion-activa');
          
          // Cerrar modal
          setModalConfirm({ isOpen: false, message: '', onConfirm: null });
          
          // Forzar recarga de la página para limpiar completamente
          window.location.reload();
        } catch (error) {
          console.error('Error al cerrar sesión:', error);
          // Forzar recarga incluso si hay error
          window.location.reload();
        }
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
        setCuentas(prev => prev.filter(c => {
          if (correo === 'Sin correo') {
            return c.correo && c.correo.trim() !== '';
          } else {
            return c.correo !== correo;
          }
        }));
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // Handlers de cuentas y PJs
  const agregarCuenta = async () => {
    if (!nuevaCuenta.nombre.trim()) {
      setMensajeError('El nombre de la cuenta es obligatorio');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    

    
    if (!usuarioId) {
      setMensajeError('Error: Usuario no identificado');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    
    // Verificar que el usuarioId sea válido y no temporal
    if (usuarioId.startsWith('local_') || usuarioId.startsWith('temp_')) {
      setMensajeError('Usuario no válido. Inicia sesión correctamente.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    
    try {
      const cantidadPjs = parseInt(nuevaCuenta.cantidadPjs) || 0;
      
      // Crear cuenta en Supabase
      const { data: cuentaData, error: cuentaError } = await cuentaService.crear({
        usuario_id: usuarioId,
        nombre: nuevaCuenta.nombre.trim(),
        correo: nuevaCuenta.correo.trim() || null,
        ingresado: false,
        ultimo_ingreso: null
      });
      
      if (cuentaError || !cuentaData || !cuentaData[0]) {
        console.error('Error creando cuenta:', cuentaError || 'No se recibieron datos');
        return;
      }
      
      // Crear personajes iniciales
      const personajes = [];
      for (let i = 0; i < cantidadPjs; i++) {
        const { data: pjData } = await personajeService.crear({
          cuenta_id: cuentaData[0].id,
          nombre: `PJ ${i + 1}`,
          medallas: 0,
          wones: '',
          notas: ''
        });
        if (pjData) personajes.push(pjData[0]);
      }
      
      // Actualizar estado local
      const nuevaCuentaLocal = {
        id: cuentaData[0].id,
        nombre: cuentaData[0].nombre,
        correo: cuentaData[0].correo || '',
        ultimoIngreso: cuentaData[0].ultimo_ingreso,
        pejotas: personajes.map(pj => ({
          id: pj.id,
          nombre: pj.nombre,
          medallas: pj.medallas,
          wones: pj.wones,
          notas: pj.notas
        })),
        historial: []
      };
      
      setCuentas(prev => [...prev, nuevaCuentaLocal]);
      setNuevaCuenta({ nombre: '', correo: '', cantidadPjs: '' });
      setFormVisible(false);
      
      setSuccessNotification({
        isOpen: true,
        message: `✅ Cuenta "${nuevaCuentaLocal.nombre}" creada exitosamente${cantidadPjs > 0 ? ` con ${cantidadPjs} PJ(s)` : ''}.`
      });
      
    } catch (error) {
      console.error('Error agregando cuenta:', error);
    }
  };

  const agregarPJACuenta = async () => {
    if (!nuevoPj.trim() || cuentaActiva === null) {
      return;
    }
    
    try {
      // Crear PJ en Supabase
      const { data: pjData, error } = await personajeService.crear({
        cuenta_id: cuentaActiva,
        nombre: nuevoPj.trim(),
        medallas: 0,
        wones: '',
        notas: ''
      });
      
      if (error || !pjData || !pjData[0]) {
        console.error('Error creando PJ:', error || 'No se recibieron datos');
        return;
      }
      
      // Actualizar estado local
      setCuentas(prev =>
        prev.map(c =>
          c.id === cuentaActiva
            ? { 
                ...c, 
                pejotas: [...c.pejotas, {
                  id: pjData[0].id,
                  nombre: pjData[0].nombre,
                  medallas: pjData[0].medallas,
                  wones: pjData[0].wones,
                  notas: pjData[0].notas
                }] 
              }
            : c
        )
      );
      
      setNuevoPj('');
      setMostrarAgregarPJ(false);
      setMostrarDetalles(cuentaActiva);
      setSuccessNotification({
        isOpen: true,
        message: 'PJ agregado exitosamente.'
      });
    } catch (error) {
      console.error('Error agregando PJ:', error);
    }
  };

  const alternarIngreso = async (id) => {
    // Verificar que id sea válido
    if (!id || isNaN(parseInt(id))) {
      console.error('ID de cuenta no válido:', id);
      return;
    }
    
    const now = new Date();
    const diaPersonalizado = obtenerDiaPersonalizado(now);
    const cuenta = cuentas.find(c => c.id === id);
    
    if (!cuenta) return;
    
    if (cuenta.ultimoIngreso === diaPersonalizado) {
      setMensajeError(`Ya marcaste ingreso hoy. Próximo reinicio a las ${horaReinicio}`);
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    
    // Actualizar estado local PRIMERO (respuesta inmediata)
    setCuentas(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ingresado: true,
            ultimoIngreso: diaPersonalizado,
            historial: [...c.historial, `${diaPersonalizado} ${now.toLocaleTimeString()}`]
          };
        }
        return c;
      })
    );
    
    // Actualizar base de datos en segundo plano
    try {
      await Promise.all([
        cuentaService.actualizar(id, {
          ingresado: true,
          ultimo_ingreso: diaPersonalizado
        }),
        historialService.crear({
          cuenta_id: id,
          fecha_ingreso: now.toISOString()
        })
      ]);
    } catch (error) {
      console.error('Error actualizando base de datos:', error);
      // Revertir cambio local si falla la base de datos
      setCuentas(prev =>
        prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              ingresado: false,
              ultimoIngreso: null,
              historial: c.historial.slice(0, -1)
            };
          }
          return c;
        })
      );
    }
  };

  // Exponer alternarIngreso en window SIEMPRE con el estado más reciente
  React.useEffect(() => {
    window.alternarIngreso = (id) => {
      setCuentas(prev => prev.map(c => {
        if (c.id === id && c.ultimoIngreso !== diaPersonalizadoActual) {
          const now = new Date();
          const fecha = now.toLocaleDateString();
          const hora = now.toLocaleTimeString();
          const fechaHora = `${fecha} ${hora}`;
          return {
            ...c,
            ingresado: true,
            ultimoIngreso: fecha,
            historial: [...c.historial, fechaHora]
          };
        }
        return c;
      }));
    };
    return () => {
      window.alternarIngreso = undefined;
    };
  }, [hoy]);

  const editarPj = async (cuentaId, index, campo, valor) => {
    try {
      // Verificar que cuentaId sea válido
      if (!cuentaId || isNaN(parseInt(cuentaId))) {
        console.error('ID de cuenta no válido:', cuentaId);
        return;
      }
      
      const cuenta = cuentas.find(c => c.id === cuentaId);
      if (!cuenta || !cuenta.pejotas || !cuenta.pejotas[index]) {
        console.error('Cuenta o personaje no encontrado');
        return;
      }
      
      const pj = cuenta.pejotas[index];
      let valorFinal = valor;
      
      if (campo === 'medallas') {
        valorFinal = parseInt(valor || 0);
      } else if (campo === 'wones') {
        valorFinal = valor.replace(/\D/g, ''); // solo números
      }
      
      // Actualizar en Supabase
      const { error } = await personajeService.actualizar(pj.id, {
        [campo]: valorFinal
      });
      
      if (error) {
        console.error('Error actualizando PJ:', error);
        return;
      }
      
      // Actualizar estado local
      setCuentas(prev =>
        prev.map(c => {
          if (c.id === cuentaId) {
            const nuevosPjs = [...c.pejotas];
            nuevosPjs[index][campo] = valorFinal;
            return { ...c, pejotas: nuevosPjs };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Error editando PJ:', error);
    }
  };

  const eliminarCuenta = (id) => {
    // Verificar que id sea válido
    if (!id || isNaN(parseInt(id))) {
      console.error('ID de cuenta no válido:', id);
      return;
    }
    
    const cuenta = cuentas.find(c => c.id === id);
    if (!cuenta) return;
    setModalConfirm({
      isOpen: true,
      message: `¿Estás seguro de que deseas eliminar la cuenta "${cuenta.nombre}"?`,
      onConfirm: async () => {
        try {
          const { error } = await cuentaService.eliminar(id);
          if (error) {
            console.error('Error eliminando cuenta:', error);
            return;
          }
          setCuentas(prev => prev.filter(c => c.id !== id));
        } catch (error) {
          console.error('Error eliminando cuenta:', error);
        }
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const eliminarPj = (cuentaId, index) => {
    // Verificar que cuentaId sea válido
    if (!cuentaId || isNaN(parseInt(cuentaId))) {
      console.error('ID de cuenta no válido:', cuentaId);
      return;
    }
    
    const cuenta = cuentas.find(c => c.id === cuentaId);
    if (!cuenta || !cuenta.pejotas || !cuenta.pejotas[index]) return;
    const pj = cuenta.pejotas[index];
    setModalConfirm({
      isOpen: true,
      message: `¿Estás seguro de que deseas eliminar el PJ "${pj.nombre}"?`,
      onConfirm: async () => {
        try {
          const { error } = await personajeService.eliminar(pj.id);
          if (error) {
            console.error('Error eliminando PJ:', error);
            return;
          }
          
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
        } catch (error) {
          console.error('Error eliminando PJ:', error);
        }
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  // --- BÚSQUEDA DE PJ Y MODAL DIRECTO ---
  const [modalBusquedaPJ, setModalBusquedaPJ] = useState(null); // {cuenta, pj}
  const [mensajeBusquedaPJ, setMensajeBusquedaPJ] = useState('');

  // Handler para mostrar notificación de guardado desde el modal de búsqueda
  const handleBusquedaPjGuardado = () => {
    setSuccessNotification({
      isOpen: true,
      message: '✅ Se ha guardado correctamente.'
    });
  };

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
    let exactaCuenta = null;
    let parcialCuenta = null;
    let coincidenciaPJ = null;
    cuentas.forEach(cuenta => {
      // Coincidencia exacta de cuenta
      if (cuenta.nombre.toLowerCase() === busquedaPendiente.toLowerCase()) {
        exactaCuenta = { cuenta, pj: null, idx: null, tipo: 'cuenta' };
      } else if (!parcialCuenta && cuenta.nombre.toLowerCase().includes(busquedaPendiente.toLowerCase())) {
        parcialCuenta = { cuenta, pj: null, idx: null, tipo: 'cuenta' };
      }
      // Buscar por nombre o notas de PJ
      cuenta.pejotas.forEach((pj, idx) => {
        if (!coincidenciaPJ && (pj.nombre.toLowerCase().includes(busquedaPendiente.toLowerCase()) || (pj.notas && pj.notas.toLowerCase().includes(busquedaPendiente.toLowerCase())))) {
          coincidenciaPJ = { cuenta, pj, idx, tipo: 'pj' };
        }
      });
    });
    if (exactaCuenta) {
      setModalBusquedaPJ(exactaCuenta);
      setMensajeBusquedaPJ('');
    } else if (parcialCuenta) {
      setModalBusquedaPJ(parcialCuenta);
      setMensajeBusquedaPJ('');
    } else if (coincidenciaPJ) {
      setModalBusquedaPJ(coincidenciaPJ);
      setMensajeBusquedaPJ('');
    } else {
      setModalBusquedaPJ(null);
      setMensajeBusquedaPJ('Aún no existen cuentas o correos que coincidan con tu búsqueda.');
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
  const faltantesHoy = cuentas.filter(c => c.ultimoIngreso !== diaPersonalizadoActual).length;
  const totalPjs = cuentas.reduce((a, c) => a + (c.pejotas?.length || 0), 0);
  const totalMedallas = cuentas.reduce(
    (a, c) => a + (c.pejotas ? c.pejotas.reduce((m, pj) => m + (pj?.medallas || 0), 0) : 0),
    0
  );
  const totalWones = cuentas.reduce(
    (a, c) => a + (c.pejotas ? c.pejotas.reduce((w, pj) => w + (parseInt(pj?.wones) || 0), 0) : 0),
    0
  );

  // Pantalla de carga
  if (supabaseLoading || googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario de Google, crear sesión local
  if (googleUser && !usuarioLogueado && googleUser.email) {
    const googleUserData = {
      usuario: googleUser.email.split('@')[0] || 'usuario',
      nombre: googleUser.user_metadata?.name || googleUser.user_metadata?.full_name || 'Usuario de Google',
      email: googleUser.email,
      icono: 'user'
    };
    handleLogin(googleUserData);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p>Iniciando sesión con Google...</p>
        </div>
      </div>
    );
  }

  if (!usuarioLogueado) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${temaOscuro ? 'bg-gray-900' : 'bg-gradient-to-br from-amber-50 to-orange-50'}`}>
      <Header 
        filtro={busquedaPendiente} 
        setFiltro={setBusquedaPendiente}
        pestañaActiva={pestañaActiva}
        setPestañaActiva={setPestañaActiva}
        usuarioLogueado={usuarioLogueado}
        onLogout={handleLogout}
        onOpenSuperUser={() => setMostrarSuperUser(true)}
        onBuscarPj={buscarPj}
        temaOscuro={temaOscuro}
        setTemaOscuro={setTemaOscuro}
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
          totalWones={totalWones}
          tiempoRestante={tiempoRestante}
          setMostrarDetallesMedallas={setMostrarDetallesMedallas}
          horaReinicio={horaReinicio}
          setHoraReinicio={setHoraReinicio}
          usuarioActual={usuarioActual}
          cuentas={cuentas}
          modoSeguimiento={modoSeguimiento}
          setCuentas={setCuentas}
          setModalConfirm={setModalConfirm}
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
            <AgregarPjModal
              isOpen={mostrarAgregarPJ}
              onClose={() => setMostrarAgregarPJ(false)}
              onAdd={agregarPJACuenta}
              value={nuevoPj}
              setValue={setNuevoPj}
              cuentas={cuentas}
              cuentaActiva={cuentaActiva}
            />
          )}
          <AccountList
          cuentasPorCorreo={cuentasPorCorreo}
          hoy={diaPersonalizadoActual}
          mostrarDetalles={mostrarDetalles}
          setMostrarDetalles={setMostrarDetalles}
          alternarIngreso={modoSeguimiento ? null : alternarIngreso}
          modoSeguimiento={modoSeguimiento}
          setCuentaActiva={setCuentaActiva}
          setMostrarAgregarPJ={setMostrarAgregarPJ}
          eliminarCuenta={eliminarCuenta}
          eliminarPj={eliminarPj}
          editarPj={editarPj}
          mostrarSoloCorreos={mostrarSoloCorreos}
          eliminarCuentasPorCorreo={eliminarCuentasPorCorreo}
          temaOscuro={temaOscuro}
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
      <Footer temaOscuro={temaOscuro} />
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
          cuentas={cuentas}
          hoy={diaPersonalizadoActual}
          alternarIngreso={modoSeguimiento ? null : alternarIngreso}
          modoSeguimiento={modoSeguimiento}
          onClose={() => setMostrarDetalles(null)}
          editarPj={editarPj}
          eliminarPj={eliminarPj}
          setCuentaActiva={setCuentaActiva}
          setMostrarAgregarPJ={setMostrarAgregarPJ}
          temaOscuro={temaOscuro}
        />
      )}
      {modalBusquedaPJ && (
        <PjDetailsModal
          cuenta={modalBusquedaPJ.cuenta}
          cuentas={cuentas}
          hoy={diaPersonalizadoActual}
          alternarIngreso={modoSeguimiento ? null : alternarIngreso}
          modoSeguimiento={modoSeguimiento}
          onClose={() => setModalBusquedaPJ(null)}
          editarPj={editarPj}
          eliminarPj={eliminarPj}
          setCuentaActiva={setCuentaActiva}
          setMostrarAgregarPJ={setMostrarAgregarPJ}
          pjIndex={modalBusquedaPJ.idx === undefined || modalBusquedaPJ.idx === null ? null : modalBusquedaPJ.idx}
          onGuardado={handleBusquedaPjGuardado}
          temaOscuro={temaOscuro}
        />
      )}
      {mensajeBusquedaPJ && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded shadow-lg animate-fadeIn ${
          temaOscuro 
            ? 'bg-yellow-900/90 border border-yellow-600 text-yellow-200'
            : 'bg-yellow-100 border border-yellow-400 text-yellow-800'
        }`}>
          {mensajeBusquedaPJ === 'Aún no existen cuentas o correos que coincidan con tu búsqueda.'
            ? 'No existen correos o cuentas.'
            : mensajeBusquedaPJ}
        </div>
      )}
      
      {mensajeError && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[10000] px-6 py-3 rounded shadow-lg animate-fadeIn ${
          temaOscuro 
            ? 'bg-red-900/90 border border-red-600 text-red-200'
            : 'bg-red-100 border border-red-400 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{mensajeError}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar las stats con toggle abreviado/completo
function ResumenStats({ faltantesHoy, totalPjs, totalMedallas, totalWones, tiempoRestante, setMostrarDetallesMedallas, horaReinicio, setHoraReinicio, usuarioActual, cuentas, modoSeguimiento, setCuentas, setModalConfirm }) {
  const [showFull, setShowFull] = React.useState({ pjs: false, medallas: false });
  const [showCongrats, setShowCongrats] = React.useState(false);
  const congratsTimeoutRef = React.useRef(); // <-- Nuevo ref para timeout
  const [editandoHora, setEditandoHora] = React.useState(false);
  const [anchorReinicio, setAnchorReinicio] = React.useState(null);
  const [mostrarConfigMedallas, setMostrarConfigMedallas] = React.useState(false);
  const [medallasConfig, setMedallasConfig] = React.useState(() => {
    try {
      const saved = localStorage.getItem(`medallas-config-${usuarioActual}`);
      return saved ? JSON.parse(saved) : { cantidad: 10, autoAumento: false };
    } catch {
      return { cantidad: 10, autoAumento: false };
    }
  });

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
    // Solo mostrar racha si ya existían cuentas antes
    if (prevFaltantes.current > 0 && faltantesHoy === 0 && cuentas.length > 0) {
      setShowCongrats(true);
      if (congratsTimeoutRef.current) clearTimeout(congratsTimeoutRef.current); // Limpiar timeout previo
      congratsTimeoutRef.current = setTimeout(() => {
        setShowCongrats(false);
        congratsTimeoutRef.current = null;
      }, 3000);
    }
    prevFaltantes.current = faltantesHoy;
    // Limpiar timeout al desmontar
    return () => {
      if (congratsTimeoutRef.current) clearTimeout(congratsTimeoutRef.current);
    };
  }, [faltantesHoy, cuentas.length]);
  return (
    <div className="card">
      <div className="card-body">
        {/* Mensaje de alerta flotante tipo toast */}
        {showCongrats && (
          <div style={{
            position: 'fixed', // Cambiado de absolute a fixed para que siga al usuario
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
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
            // Sin animación ni movimiento
          }}>
            <span className="fire-effect" role="img" aria-label="fuego" style={{fontSize:'2rem'}}>
              🔥
            </span>
            <span style={{display:'inline-block', minWidth:'180px'}}>¡Felicidades! Has completado los ingresos de hoy</span>
            <span className="fire-effect" role="img" aria-label="fuego" style={{fontSize:'2rem'}}>
              🔥
            </span>
          </div>
        )}
        {/* Mensaje especial si todas las cuentas han sido ingresadas */}
        <div className="stats-grid gap-2 md:gap-4">
          <div className={`stat-card stat-danger${faltantesHoy > 0 ? ' alert-aura' : ''}`}
            style={{margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div className="stat-value" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '2.5em'}}>
              {cuentas.length === 0 ? (
                <span className="text-gray-500 text-lg font-semibold">Aún no creas cuentas</span>
              ) : faltantesHoy > 0 ? (
                formatNumber(faltantesHoy)
              ) : (
                <span className="flex items-center gap-2 text-green-600" style={{justifyContent: 'center', width: '100%'}}>¡Estás al día! <span className="fire-effect" role="img" aria-label="fuego">🔥</span></span>
              )}
            </div>
            {cuentas.length > 0 && faltantesHoy > 0 && <div className="stat-label">Cuentas por ingresar</div>}
          </div>
          <div className="stat-card stat-primary cursor-pointer" onClick={() => setShowFull(s => ({ ...s, pjs: !s.pjs }))} title="Click para alternar formato"
            style={{margin: 0}}>
            <div className="stat-value">
              {showFull.pjs ? formatNumber(totalPjs) : formatMedallas(totalPjs)}
            </div>
            <div className="stat-label">Total PJs</div>
          </div>
          <div className="stat-card stat-warning flex flex-col items-center justify-center relative cursor-pointer"
            style={{margin: 0}}
            onClick={() => setShowFull(s => ({ ...s, medallas: !s.medallas }))
            }
            title="Click para alternar formato"
          >
            <div className="absolute right-2 top-2 z-10 flex gap-1">
              <button
                className="btn btn-secondary btn-xs"
                style={{fontSize:'0.85em', padding:'0.2em 0.7em'}}
                onClick={e => { e.stopPropagation(); setMostrarDetallesMedallas(true); }}
                title="Ver Top Medallas"
              >
                🏆 Top
              </button>
              <button
                className="btn btn-secondary btn-xs"
                style={{fontSize:'0.85em', padding:'0.2em 0.7em'}}
                onClick={e => { e.stopPropagation(); setMostrarConfigMedallas(true); }}
                title="Configurar Medallas"
              >
                <FaCog />
              </button>
            </div>
            <div className="stat-value flex items-center gap-2">
              {showFull.medallas ? formatNumber(totalMedallas) : formatMedallas(totalMedallas)}
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
                <TimeSettings horaReinicio={horaReinicio} onHoraChange={cambiarHoraReinicio} />
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de Configuración de Medallas */}
      {mostrarConfigMedallas && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[2147483647]" style={{zIndex:2147483647, pointerEvents:'auto'}}>
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full border border-blue-200" style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:2147483647,boxShadow:'0 8px 32px rgba(0,0,0,0.25)',maxHeight:'90vh',overflowY:'auto', pointerEvents:'auto'}} tabIndex={0}>
            <div className="card-header flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaCog className="text-blue-600" />
                Configuración de Medallas
              </h2>
              <button
                onClick={() => setMostrarConfigMedallas(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Cerrar"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="card-body space-y-4">
              <div className="form-field">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cantidad de medallas a aumentar *
                </label>
                <input
                  type="number"
                  min="1"
                  value={medallasConfig.cantidad}
                  onChange={e => {
                    const newConfig = {...medallasConfig, cantidad: parseInt(e.target.value) || 0};
                    setMedallasConfig(newConfig);
                    localStorage.setItem(`medallas-config-${usuarioActual}`, JSON.stringify(newConfig));
                  }}
                  className="form-input"
                  placeholder="Ej: 10"
                />
              </div>
              
              <div className="form-field">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoAumento"
                    checked={medallasConfig.autoAumento}
                    onChange={e => {
                    const newConfig = {...medallasConfig, autoAumento: e.target.checked};
                    setMedallasConfig(newConfig);
                    localStorage.setItem(`medallas-config-${usuarioActual}`, JSON.stringify(newConfig));
                  }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="autoAumento" className="text-sm font-semibold text-gray-700">
                    Aumentar automáticamente sin confirmación
                  </label>
                </div>
              </div>
            </div>
            
            <div className="card-footer flex flex-col gap-3">
              <button
                onClick={() => {
                  const accion = async () => {
                    // Actualizar estado local primero (para respuesta rápida)
                    setCuentas(prev => prev.map(c => ({
                      ...c,
                      pejotas: c.pejotas.map(pj => ({ 
                        ...pj, 
                        medallas: (pj.medallas || 0) + medallasConfig.cantidad 
                      }))
                    })));
                    setMostrarConfigMedallas(false);
                    
                    // Actualizar en base de datos en paralelo
                    const updates = [];
                    for (const cuenta of cuentas) {
                      for (const pj of cuenta.pejotas) {
                        updates.push(
                          personajeService.actualizar(pj.id, {
                            medallas: (pj.medallas || 0) + medallasConfig.cantidad
                          })
                        );
                      }
                    }
                    await Promise.all(updates);
                  };
                  
                  if (medallasConfig.autoAumento) {
                    accion();
                  } else {
                    setModalConfirm({
                      isOpen: true,
                      message: `¿Aumentar ${medallasConfig.cantidad} medallas a todos los PJs?`,
                      onConfirm: () => {
                        accion();
                        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
                      }
                    });
                    setMostrarConfigMedallas(false);
                  }
                }}
                className="btn btn-success w-full"
                disabled={!medallasConfig.cantidad || medallasConfig.cantidad <= 0}
              >
                ➕ Aumentar Medallas
              </button>
              
              <button
                onClick={() => {
                  const accion = async () => {
                    // Actualizar estado local primero (para respuesta rápida)
                    setCuentas(prev => prev.map(c => ({
                      ...c,
                      pejotas: c.pejotas.map(pj => ({ ...pj, medallas: 0 }))
                    })));
                    setMostrarConfigMedallas(false);
                    
                    // Actualizar en base de datos en paralelo
                    const updates = [];
                    for (const cuenta of cuentas) {
                      for (const pj of cuenta.pejotas) {
                        updates.push(
                          personajeService.actualizar(pj.id, {
                            medallas: 0
                          })
                        );
                      }
                    }
                    await Promise.all(updates);
                  };
                  
                  if (medallasConfig.autoAumento) {
                    accion();
                  } else {
                    setModalConfirm({
                      isOpen: true,
                      message: '¿Seguro que deseas poner en 0 todas las medallas de todos los PJs?',
                      onConfirm: () => {
                        accion();
                        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
                      }
                    });
                    setMostrarConfigMedallas(false);
                  }
                }}
                className="btn btn-warning w-full"
              >
                🧹 Limpiar Medallas
              </button>
              

            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default App;
