import React, { useState } from 'react';
import { FaUserPlus, FaSignInAlt, FaChartLine, FaShieldAlt, FaCloud } from 'react-icons/fa';
import AuthModal from './AuthModal';

const LandingPage = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: <FaChartLine className="w-8 h-8 text-blue-600" />,
      title: "Seguimiento Completo",
      description: "Gestiona todas tus cuentas de juego y personajes en un solo lugar"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-green-600" />,
      title: "Datos Seguros",
      description: "Tus datos están protegidos con autenticación y respaldo en la nube"
    },
    {
      icon: <FaCloud className="w-8 h-8 text-purple-600" />,
      title: "Sincronización",
      description: "Accede a tus datos desde cualquier dispositivo con sincronización automática"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-6">
            Gestor de Cuentas
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La herramienta definitiva para gestionar tus cuentas de juego, hacer seguimiento de personajes y medallas de forma organizada y segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-lg w-full sm:w-auto"
            >
              <FaUserPlus className="w-5 h-5" />
              Comenzar Ahora
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 sm:py-4 sm:px-8 rounded-lg text-base sm:text-lg flex items-center gap-3 transition-all duration-200 border border-gray-300 shadow-lg w-full sm:w-auto"
            >
              <FaSignInAlt className="w-5 h-5" />
              Iniciar Sesión
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
            ¿Por qué elegir nuestro gestor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Características principales:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Gestión de múltiples cuentas de juego
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Seguimiento de personajes y medallas
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Historial detallado de actividades
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Reinicio automático diario
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Estadísticas y reportes
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Seguridad y respaldo:</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Autenticación segura
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Respaldo automático en la nube
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Sincronización entre dispositivos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Datos encriptados y seguros
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Acceso desde cualquier lugar
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={onLogin}
      />
    </div>
  );
};

export default LandingPage;
