import React, { useState } from 'react';
import { FaUserPlus, FaSignInAlt, FaChartLine, FaShieldAlt, FaCloud } from 'react-icons/fa';

function LoginForm({ onLogin }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ usuario: '', contraseña: '' });
  const [error, setError] = useState('');
  const [registerData, setRegisterData] = useState({ usuario: '', contraseña: '', pregunta: '', respuesta: '', icono: '' });
  const [registerError, setRegisterError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUser, setForgotUser] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotPregunta, setForgotPregunta] = useState('');

  // Opciones de icono/avatar: hombre, mujer, gato, perro
  const iconOptions = [
    { name: 'man', icon: '👨' },
    { name: 'woman', icon: '👩' },
    { name: 'cat', icon: '🐱' },
    { name: 'dog', icon: '🐶' },
  ];

  const features = [
    {
      icon: <FaChartLine className="w-8 h-8 text-blue-600" />,
      title: "Seguimiento Completo",
      description: "Gestiona todas tus cuentas de juego y personajes en un solo lugar"
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-green-600" />,
      title: "Datos Seguros",
      description: "Tus datos están protegidos y respaldados localmente"
    },
    {
      icon: <FaCloud className="w-8 h-8 text-purple-600" />,
      title: "Sincronización",
      description: "Accede a tus datos desde cualquier dispositivo (próximamente)"
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.usuario.trim() || !formData.contraseña.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
    const usuario = usuarios.find(
      u => u.usuario === formData.usuario && u.contraseña === formData.contraseña
    );
    if (!usuario) {
      setError('Usuario o contraseña incorrectos');
      return;
    }
    onLogin(usuario);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerData.usuario.trim() || !registerData.contraseña.trim() || !registerData.pregunta.trim() || !registerData.respuesta.trim() || !registerData.icono) {
      setRegisterError('Todos los campos son obligatorios');
      return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
    if (usuarios.find(u => u.usuario === registerData.usuario)) {
      setRegisterError('El usuario ya existe');
      return;
    }
    // Guardar solo el nombre del icono (no el emoji)
    usuarios.push({ ...registerData, icono: registerData.icono });
    localStorage.setItem('usuarios-auth', JSON.stringify(usuarios));
    setShowForm('login'); // Redirige al login tras registrar
    setRegisterData({ usuario: '', contraseña: '', pregunta: '', respuesta: '', icono: '' });
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setForgotMsg('');
    if (forgotStep === 1) {
      const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
      const usuario = usuarios.find(u => u.usuario === forgotUser);
      if (!usuario) {
        setForgotMsg('Usuario no encontrado');
        return;
      }
      setForgotPregunta(usuario.pregunta);
      setForgotStep(2);
    } else if (forgotStep === 2) {
      const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
      const usuario = usuarios.find(u => u.usuario === forgotUser);
      if (usuario && usuario.respuesta === forgotAnswer) {
        setForgotMsg('Tu contraseña es: ' + usuario.contraseña);
      } else {
        setForgotMsg('Respuesta incorrecta');
      }
    }
  };

  // Guardar usuario en localStorage al escribir
  React.useEffect(() => {
    if (formData.usuario) {
      localStorage.setItem('landing-usuario', formData.usuario);
    }
  }, [formData.usuario]);

  // Al cargar, recuperar usuario si existe
  React.useEffect(() => {
    const lastUser = localStorage.getItem('landing-usuario');
    if (lastUser) {
      setFormData(f => ({ ...f, usuario: lastUser }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center py-12 px-4">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">Gestor de Cuentas</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La herramienta definitiva para gestionar tus cuentas de juego, hacer seguimiento de personajes y medallas de forma organizada y segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => setShowForm('login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaSignInAlt className="w-5 h-5" />
              Iniciar Sesión
            </button>
            <button
              onClick={() => setShowForm('register')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg flex items-center gap-3 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <FaUserPlus className="w-5 h-5" />
              Registrarse
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        {showForm === 'login' && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full flex flex-col items-center gap-4 border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Iniciar sesión</h2>
              <form className="w-full space-y-4" onSubmit={handleSubmit} autoComplete="off">
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Usuario"
                  value={formData.usuario}
                  onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                />
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Contraseña"
                  value={formData.contraseña}
                  onChange={e => setFormData({ ...formData, contraseña: e.target.value })}
                />
                {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                <div className="w-full text-right mb-1">
                  <button
                    type="button"
                    className="text-blue-600 hover:underline text-sm font-medium"
                    onClick={() => setShowForgot(true)}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
                >
                  Ingresar
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold shadow"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
        {showForm === 'register' && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full flex flex-col items-center gap-4 border border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Registro de usuario</h2>
              <form className="w-full space-y-4" onSubmit={handleRegister} autoComplete="off">
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Usuario"
                  value={registerData.usuario}
                  onChange={e => setRegisterData({ ...registerData, usuario: e.target.value })}
                />
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Contraseña"
                  value={registerData.contraseña}
                  onChange={e => setRegisterData({ ...registerData, contraseña: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta de recuperación</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Ej: ¿Nombre de tu primera mascota?"
                    value={registerData.pregunta}
                    onChange={e => setRegisterData({ ...registerData, pregunta: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    placeholder="Respuesta secreta"
                    value={registerData.respuesta}
                    onChange={e => setRegisterData({ ...registerData, respuesta: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elige un ícono/avatar</label>
                  <div className="flex gap-2 justify-center">
                    {iconOptions.map((icon, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={`p-2 rounded-full border-2 ${registerData.icono === icon.name ? 'border-green-600' : 'border-transparent'} bg-green-100 hover:bg-green-200`}
                        onClick={() => setRegisterData({ ...registerData, icono: icon.name })}
                        aria-label={icon.name}
                      >
                        <span style={{fontSize:'2rem'}}>{icon.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {registerError && <div className="text-red-500 text-sm text-center">{registerError}</div>}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow"
                >
                  Crear cuenta
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold shadow"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
        {showForgot && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full flex flex-col items-center gap-4 border border-yellow-200">
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">Recuperar contraseña</h2>
              <form className="w-full space-y-4" onSubmit={handleForgot} autoComplete="off">
                {forgotStep === 1 && (
                  <>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-yellow-200 rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Usuario"
                      value={forgotUser}
                      onChange={e => setForgotUser(e.target.value)}
                    />
                  </>
                )}
                {forgotStep === 2 && (
                  <>
                    <div className="text-gray-700 text-sm mb-2">{forgotPregunta}</div>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-yellow-200 rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                      placeholder="Respuesta secreta"
                      value={forgotAnswer}
                      onChange={e => setForgotAnswer(e.target.value)}
                    />
                  </>
                )}
                {forgotMsg && <div className="text-yellow-700 text-sm text-center">{forgotMsg}</div>}
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 font-semibold shadow"
                >
                  {forgotStep === 1 ? 'Siguiente' : 'Recuperar'}
                </button>
                <button
                  type="button"
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold shadow"
                  onClick={() => { setShowForgot(false); setForgotStep(1); setForgotUser(''); setForgotAnswer(''); setForgotMsg(''); }}
                >
                  Cancelar
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
