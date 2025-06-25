import React, { useState } from 'react';
import { FaChartLine, FaShieldAlt, FaCloud, FaGoogle, FaTimes } from 'react-icons/fa';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const LandingPage = ({ onLogin }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithGoogle } = useGoogleAuth();

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

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (error) {
      console.error('Error con Google Auth:', error);
      setError('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10 flex-1 flex flex-col justify-center relative z-10">
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-2xl">
              <FaChartLine className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gestor de Cuentas
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            La herramienta definitiva para gestionar tus cuentas de juego, hacer seguimiento de personajes y medallas de forma organizada y segura.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
          >
            Empieza Ya
          </button>
          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h3>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-8">
                Inicia sesión con tu cuenta de Google para acceder a todas las funcionalidades
              </p>
              
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaGoogle className="w-6 h-6 text-red-500" />
                {loading ? 'Conectando...' : 'Continuar con Google'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;