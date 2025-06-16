import React, { useState } from 'react';
import { FaUser, FaLock, FaUserPlus, FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function LoginForm({ onLogin }) {
  const [isRegistro, setIsRegistro] = useState(false);
  const [isRecuperacion, setIsRecuperacion] = useState(false);
  const [formData, setFormData] = useState({
    usuario: '',
    contraseña: '',
    confirmarContraseña: '',
    avatar: '',
    preguntaSeguridad: '',
    respuestaSeguridad: ''
  });
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false, message: '', success: false });
  const avatares = [
    '👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻',
    '😎', '🤓', '😊', '🦸', '🦸‍♀️', '🧙'
  ];

  // Utilidad para limpiar el formulario
  const resetForm = () => setFormData({
    usuario: '',
    contraseña: '',
    confirmarContraseña: '',
    avatar: '',
    preguntaSeguridad: '',
    respuestaSeguridad: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.usuario.trim() || !formData.contraseña.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (isRegistro) {
      if (formData.contraseña !== formData.confirmarContraseña) {
        setError('Las contraseñas no coinciden');
        return;
      }
      if (!formData.preguntaSeguridad.trim() || !formData.respuestaSeguridad.trim()) {
        setError('Debes ingresar pregunta y respuesta de seguridad');
        return;
      }
      const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
      if (usuarios.some(u => u.usuario.toLowerCase() === formData.usuario.toLowerCase())) {
        setError('Este usuario ya existe');
        return;
      }
      const nuevoUsuario = {
        usuario: formData.usuario,
        contraseña: formData.contraseña,
        avatar: formData.avatar || '👤',
        preguntaSeguridad: formData.preguntaSeguridad,
        respuestaSeguridad: formData.respuestaSeguridad,
        esSuperUsuario: usuarios.length === 0 // El primer usuario es super usuario
      };
      usuarios.push(nuevoUsuario);
      localStorage.setItem('usuarios-auth', JSON.stringify(usuarios));
      setModal({ open: true, message: '¡Registro exitoso! Ahora puedes iniciar sesión.', success: true });
      setIsRegistro(false);
      resetForm();
    } else {
      const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
      const usuario = usuarios.find(
        u => u.usuario === formData.usuario && u.contraseña === formData.contraseña
      );
      if (!usuario) {
        setError('Usuario o contraseña incorrectos');
        return;
      }
      onLogin(usuario);
    }
  };

  // Recuperación de contraseña
  const handleRecuperar = () => {
    setError('');
    if (!formData.usuario.trim() || !formData.preguntaSeguridad.trim() || !formData.respuestaSeguridad.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
    const usuario = usuarios.find(u => u.usuario === formData.usuario);
    if (!usuario) {
      setError('Usuario no encontrado');
      return;
    }
    if (
      usuario.preguntaSeguridad !== formData.preguntaSeguridad ||
      usuario.respuestaSeguridad !== formData.respuestaSeguridad
    ) {
      setError('Pregunta o respuesta incorrecta');
      return;
    }
    setModal({
      open: true,
      message: `Tu contraseña es: ${usuario.contraseña}`,
      success: true
    });
    setIsRecuperacion(false);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-blue-100 relative">
        <div className="flex flex-col items-center">
          <div className="text-5xl mb-2">{formData.avatar || '👤'}</div>
          <h2 className="text-center text-3xl font-extrabold text-blue-800">
            {isRegistro ? 'Crear cuenta' : isRecuperacion ? 'Recuperar contraseña' : 'Iniciar sesión'}
          </h2>
        </div>
        {/* Formulario principal */}
        {!isRecuperacion && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4">
              <div>
                <label htmlFor="usuario" className="sr-only">Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-blue-300" />
                  </div>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    autoComplete="username"
                    required
                    className="block w-full px-3 py-2 pl-10 border border-blue-200 placeholder-blue-300 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm bg-blue-50"
                    placeholder="Usuario"
                    value={formData.usuario}
                    onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contraseña" className="sr-only">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-blue-300" />
                  </div>
                  <input
                    id="contraseña"
                    name="contraseña"
                    type="password"
                    autoComplete={isRegistro ? 'new-password' : 'current-password'}
                    required
                    className="block w-full px-3 py-2 pl-10 border border-blue-200 placeholder-blue-300 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm bg-blue-50"
                    placeholder="Contraseña"
                    value={formData.contraseña}
                    onChange={e => setFormData({ ...formData, contraseña: e.target.value })}
                  />
                </div>
              </div>
              {isRegistro && (
                <>
                  <div>
                    <label htmlFor="confirmarContraseña" className="sr-only">Confirmar Contraseña</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-blue-300" />
                      </div>
                      <input
                        id="confirmarContraseña"
                        name="confirmarContraseña"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="block w-full px-3 py-2 pl-10 border border-blue-200 placeholder-blue-300 text-blue-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm bg-blue-50"
                        placeholder="Confirmar contraseña"
                        value={formData.confirmarContraseña}
                        onChange={e => setFormData({ ...formData, confirmarContraseña: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">Selecciona un avatar</label>
                    <div className="grid grid-cols-6 gap-2">
                      {avatares.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`text-2xl p-2 rounded-lg border-2 transition-all duration-150 ${formData.avatar === avatar ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' : 'bg-blue-50 border-transparent hover:border-blue-200'}`}
                          onClick={() => setFormData({ ...formData, avatar })}
                          aria-label={`Avatar ${avatar}`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Pregunta de seguridad</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="Ej: ¿Nombre de tu mascota?"
                      value={formData.preguntaSeguridad}
                      onChange={e => setFormData({ ...formData, preguntaSeguridad: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">Respuesta de seguridad</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="Respuesta"
                      value={formData.respuestaSeguridad}
                      onChange={e => setFormData({ ...formData, respuestaSeguridad: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center flex items-center justify-center gap-2"><FaTimesCircle /> {error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow"
              >
                {isRegistro ? 'Registrarse' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        )}
        {/* Recuperación de contraseña */}
        {isRecuperacion && (
          <form className="space-y-5 mt-8" onSubmit={e => { e.preventDefault(); handleRecuperar(); }} autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Usuario</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={formData.usuario}
                onChange={e => setFormData({ ...formData, usuario: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Pregunta de seguridad</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={formData.preguntaSeguridad}
                onChange={e => setFormData({ ...formData, preguntaSeguridad: e.target.value })}
                placeholder="Ej: ¿Nombre de tu mascota?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">Respuesta de seguridad</label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                value={formData.respuestaSeguridad}
                onChange={e => setFormData({ ...formData, respuestaSeguridad: e.target.value })}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm flex items-center gap-2"><FaTimesCircle /> {error}</div>
            )}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => { setIsRecuperacion(false); setError(''); resetForm(); }}
                className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg bg-blue-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow"
              >
                Recuperar
              </button>
            </div>
          </form>
        )}
        {/* Cambios de modo */}
        <div className="text-center mt-6 flex flex-col gap-2">
          {!isRecuperacion && (
            <button
              type="button"
              onClick={() => {
                setIsRegistro(!isRegistro);
                setError('');
                resetForm();
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsRecuperacion(!isRecuperacion);
              setIsRegistro(false);
              setError('');
              resetForm();
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isRecuperacion ? 'Volver al inicio de sesión' : '¿Olvidaste tu contraseña?'}
          </button>
        </div>
        {/* Modal de confirmación */}
        {modal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-sm w-full flex flex-col items-center gap-4 border border-blue-200">
              <div className={`text-4xl ${modal.success ? 'text-green-500' : 'text-red-500'}`}>{modal.success ? <FaCheckCircle /> : <FaTimesCircle />}</div>
              <div className="text-center text-lg font-semibold text-blue-800">{modal.message}</div>
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                onClick={() => setModal({ open: false, message: '', success: false })}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginForm;
