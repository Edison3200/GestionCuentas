import React, { useState, useEffect } from 'react';
import { FaUser, FaTrash, FaEdit, FaCrown, FaEye, FaEyeSlash, FaSave, FaTimes, FaShieldAlt } from 'react-icons/fa';

function SuperUserManager({ usuarioLogueado, onClose }) {
  const [usuarios, setUsuarios] = useState([]);
  const [editandoUsuario, setEditandoUsuario] = useState(null);
  const [formEdit, setFormEdit] = useState({
    usuario: '',
    contraseña: '',
    avatar: '',
    preguntaSeguridad: '',
    respuestaSeguridad: ''
  });
  const [mostrarContraseñas, setMostrarContraseñas] = useState({});
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, message: '', onConfirm: null });

  const avatares = [
    '👤', '👨', '👩', '🧑', '👨‍💻', '👩‍💻',
    '😎', '🤓', '😊', '🦸', '🦸‍♀️', '🧙'
  ];

  useEffect(() => {
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios-auth')) || [];
    setUsuarios(usuariosGuardados);
  }, []);

  const toggleMostrarContraseña = (usuario) => {
    setMostrarContraseñas(prev => ({
      ...prev,
      [usuario]: !prev[usuario]
    }));
  };

  const iniciarEdicion = (usuario) => {
    setEditandoUsuario(usuario.usuario);
    setFormEdit({
      usuario: usuario.usuario,
      contraseña: usuario.contraseña,
      avatar: usuario.avatar,
      preguntaSeguridad: usuario.preguntaSeguridad,
      respuestaSeguridad: usuario.respuestaSeguridad
    });
  };

  const cancelarEdicion = () => {
    setEditandoUsuario(null);
    setFormEdit({
      usuario: '',
      contraseña: '',
      avatar: '',
      preguntaSeguridad: '',
      respuestaSeguridad: ''
    });
  };

  const guardarEdicion = () => {
    if (!formEdit.usuario.trim() || !formEdit.contraseña.trim()) {
      alert('Usuario y contraseña son obligatorios');
      return;
    }

    // Verificar si el nuevo nombre de usuario ya existe (excepto el actual)
    const usuarioExiste = usuarios.find(u => 
      u.usuario.toLowerCase() === formEdit.usuario.toLowerCase() && 
      u.usuario !== editandoUsuario
    );
    
    if (usuarioExiste) {
      alert('Ya existe un usuario con ese nombre');
      return;
    }

    const usuariosActualizados = usuarios.map(u => {
      if (u.usuario === editandoUsuario) {
        return {
          ...u,
          usuario: formEdit.usuario,
          contraseña: formEdit.contraseña,
          avatar: formEdit.avatar,
          preguntaSeguridad: formEdit.preguntaSeguridad,
          respuestaSeguridad: formEdit.respuestaSeguridad
        };
      }
      return u;
    });

    setUsuarios(usuariosActualizados);
    localStorage.setItem('usuarios-auth', JSON.stringify(usuariosActualizados));
    
    // Si se editó el usuario actual, actualizar la sesión
    if (editandoUsuario === usuarioLogueado.usuario) {
      const usuarioActualizado = usuariosActualizados.find(u => u.usuario === formEdit.usuario);
      localStorage.setItem('sesion-activa', JSON.stringify(usuarioActualizado));
    }

    cancelarEdicion();
  };

  const eliminarUsuario = (usuario) => {
    if (usuario.usuario === usuarioLogueado.usuario) {
      alert('No puedes eliminar tu propio usuario');
      return;
    }

    if (usuarios.length === 1) {
      alert('No puedes eliminar el último usuario');
      return;
    }

    setModalConfirm({
      isOpen: true,
      message: `¿Estás seguro de que deseas eliminar el usuario "${usuario.usuario}"? Se perderán todos sus datos permanentemente.`,
      onConfirm: () => {
        const usuariosActualizados = usuarios.filter(u => u.usuario !== usuario.usuario);
        setUsuarios(usuariosActualizados);
        localStorage.setItem('usuarios-auth', JSON.stringify(usuariosActualizados));
        
        // Eliminar todos los datos del usuario
        localStorage.removeItem(`cuentas-${usuario.usuario}`);
        localStorage.removeItem(`historial-diario-${usuario.usuario}`);
        localStorage.removeItem(`horaReinicio-${usuario.usuario}`);
        localStorage.removeItem(`ultimaFechaReinicio-${usuario.usuario}`);
        
        setModalConfirm({ isOpen: false, message: '', onConfirm: null });
      }
    });
  };

  const otorgarSuperUsuario = (usuario) => {
    const usuariosActualizados = usuarios.map(u => {
      if (u.usuario === usuario.usuario) {
        return { ...u, esSuperUsuario: true };
      }
      return u;
    });

    setUsuarios(usuariosActualizados);
    localStorage.setItem('usuarios-auth', JSON.stringify(usuariosActualizados));
  };

  const revocarSuperUsuario = (usuario) => {
    if (usuario.usuario === usuarioLogueado.usuario) {
      alert('No puedes revocar tus propios privilegios de super usuario');
      return;
    }

    const usuariosActualizados = usuarios.map(u => {
      if (u.usuario === usuario.usuario) {
        const { esSuperUsuario, ...usuarioSinPrivilegios } = u;
        return usuarioSinPrivilegios;
      }
      return u;
    });

    setUsuarios(usuariosActualizados);
    localStorage.setItem('usuarios-auth', JSON.stringify(usuariosActualizados));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaShieldAlt className="text-red-600" />
              Panel de Super Usuario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Gestiona todos los usuarios del sistema</p>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {usuarios.map(usuario => (
              <div key={usuario.usuario} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                {editandoUsuario === usuario.usuario ? (
                  // Modo edición
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{formEdit.avatar}</div>
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input
                          type="text"
                          value={formEdit.usuario}
                          onChange={(e) => setFormEdit({ ...formEdit, usuario: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <input
                        type="text"
                        value={formEdit.contraseña}
                        onChange={(e) => setFormEdit({ ...formEdit, contraseña: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                      <div className="grid grid-cols-6 gap-2">
                        {avatares.map((avatar, index) => (
                          <button
                            key={index}
                            type="button"
                            className={`text-2xl p-2 rounded-lg border-2 transition-all duration-150 ${
                              formEdit.avatar === avatar 
                                ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-400' 
                                : 'bg-white border-gray-200 hover:border-blue-200'
                            }`}
                            onClick={() => setFormEdit({ ...formEdit, avatar })}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta de seguridad</label>
                      <input
                        type="text"
                        value={formEdit.preguntaSeguridad}
                        onChange={(e) => setFormEdit({ ...formEdit, preguntaSeguridad: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta de seguridad</label>
                      <input
                        type="text"
                        value={formEdit.respuestaSeguridad}
                        onChange={(e) => setFormEdit({ ...formEdit, respuestaSeguridad: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={guardarEdicion}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FaSave /> Guardar
                      </button>
                      <button
                        onClick={cancelarEdicion}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FaTimes /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{usuario.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{usuario.usuario}</h3>
                          {usuario.esSuperUsuario && (
                            <FaCrown className="text-yellow-500" title="Super Usuario" />
                          )}
                          {usuario.usuario === usuarioLogueado.usuario && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Tú
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Contraseña:</span>
                          <span className="font-mono">
                            {mostrarContraseñas[usuario.usuario] ? usuario.contraseña : '••••••••'}
                          </span>
                          <button
                            onClick={() => toggleMostrarContraseña(usuario.usuario)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {mostrarContraseñas[usuario.usuario] ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Pregunta: {usuario.preguntaSeguridad}</div>
                          <div>Respuesta: {usuario.respuestaSeguridad}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!usuario.esSuperUsuario ? (
                        <button
                          onClick={() => otorgarSuperUsuario(usuario)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                          title="Otorgar privilegios de super usuario"
                        >
                          <FaCrown /> Super Usuario
                        </button>
                      ) : (
                        usuario.usuario !== usuarioLogueado.usuario && (
                          <button
                            onClick={() => revocarSuperUsuario(usuario)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                            title="Revocar privilegios de super usuario"
                          >
                            <FaTimes /> Revocar
                          </button>
                        )
                      )}
                      <button
                        onClick={() => iniciarEdicion(usuario)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <FaEdit /> Editar
                      </button>
                      {usuario.usuario !== usuarioLogueado.usuario && (
                        <button
                          onClick={() => eliminarUsuario(usuario)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                        >
                          <FaTrash /> Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {modalConfirm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmar acción</h3>
            <p className="text-gray-600 mb-6">{modalConfirm.message}</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setModalConfirm({ isOpen: false, message: '', onConfirm: null })}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={modalConfirm.onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperUserManager;