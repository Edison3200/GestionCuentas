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
  const { loading: supabaseLoading, error: supabaseError, ensureUser } = useSupabase();
  const { googleUser, loading: googleLoading } = useGoogleAuth();
  
  const [cuentas, setCuentas] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [horaReinicio, setHoraReinicio] = useState(() => {
    return localStorage.getItem(`hora-reinicio-${usuarioActual}`) || '22:00';
  });
  const [pestañaActiva, setPestañaActiva] = useState('inicio');
  const [mensajeError, setMensajeError] = useState('');
  const [successNotification, setSuccessNotification] = useState({ isOpen: false, message: '' });
  const [temaOscuro, setTemaOscuro] = useState(() => {
    return localStorage.getItem('tema-oscuro') === 'true';
  });

  const iconMap = {
    cat: <FaCat className="w-7 h-7 text-yellow-600" />,
    dog: <FaDog className="w-7 h-7 text-orange-700" />,
    astronaut: <FaUserAstronaut className="w-7 h-7 text-blue-700" />,
    ninja: <FaUserNinja className="w-7 h-7 text-gray-700" />,
    secret: <FaUserSecret className="w-7 h-7 text-purple-700" />,
  };

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
  const faltantesHoy = cuentas.filter(c => c.ultimoIngreso !== diaPersonalizadoActual).length;

  const cambiarHoraReinicio = (nuevaHora) => {
    setHoraReinicio(nuevaHora);
    setSuccessNotification({
      isOpen: true,
      message: `⏰ Hora de reinicio actualizada a ${nuevaHora}`
    });
  };

  useEffect(() => {
    if (usuarioActual && horaReinicio) {
      localStorage.setItem(`hora-reinicio-${usuarioActual}`, horaReinicio);
    }
  }, [horaReinicio, usuarioActual]);

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

  useEffect(() => {
    if (temaOscuro) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [temaOscuro]);

  if (supabaseLoading || googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (supabaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error: {supabaseError}</p>
        </div>
      </div>
    );
  }

  if (!usuarioLogueado) {
    return <LandingPage />;
  }

  return (
    <div className={`min-h-screen ${temaOscuro ? 'dark' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Header 
          usuarioLogueado={usuarioLogueado}
          pestañaActiva={pestañaActiva}
          setPestañaActiva={setPestañaActiva}
          temaOscuro={temaOscuro}
          setTemaOscuro={setTemaOscuro}
        />
        
        {mensajeError && (
          <ValidationMessage 
            message={mensajeError} 
            type="error" 
            onClose={() => setMensajeError('')}
          />
        )}
        
        <main className="container mx-auto px-4 py-8">
          {pestañaActiva === 'inicio' && (
            <div>
              <AccountList 
                cuentas={cuentas}
                faltantesHoy={faltantesHoy}
              />
            </div>
          )}
          
          {pestañaActiva === 'configuracion' && (
            <TimeSettings 
              horaReinicio={horaReinicio}
              onHoraChange={cambiarHoraReinicio}
              diaPersonalizadoActual={diaPersonalizadoActual}
            />
          )}
        </main>
        
        <Footer />
        
        {successNotification.isOpen && (
          <SuccessNotification 
            message={successNotification.message}
            onClose={() => setSuccessNotification({ isOpen: false, message: '' })}
          />
        )}
      </div>
    </div>
  );
}

export default App;