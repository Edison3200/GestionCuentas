import React, { useState, useEffect } from 'react';
import { FaUser, FaPlus, FaTrash, FaCalendar } from 'react-icons/fa';

function UserManager({ usuarioActual, setUsuarioActual, onUsuarioChange }) {
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios')) || [];
    setUsuarios(usuariosGuardados);
    
    if (!usuarioActual && usuariosGuardados.length > 0) {
      setUsuarioActual(usuariosGuardados[0]);
    }
  }, [usuarioActual, setUsuarioActual]);

  const crearUsuario = () => {
    if (!nuevoUsuario.trim()) return;
    
    const usuarioExiste = usuarios.find(u => u.toLowerCase() === nuevoUsuario.trim().toLowerCase());
    if (usuarioExiste) {
      alert('Ya existe un usuario con ese nombre');
      return;
    }

    const nuevosUsuarios = [...usuarios, nuevoUsuario.trim()];
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
    
    setUsuarioActual(nuevoUsuario.trim());
    setNuevoUsuario('');
    setMostrarFormulario(false);
    onUsuarioChange(nuevoUsuario.trim());
  };

  const eliminarUsuario = (usuario) => {
    if (usuarios.length === 1) {
      alert('No puedes eliminar el último usuario');
      return;
    }
    
    if (confirm(`¿Eliminar usuario "${usuario}"? Se perderán todos sus datos.`)) {
      const nuevosUsuarios = usuarios.filter(u => u !== usuario);
      setUsuarios(nuevosUsuarios);
      localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
      
      // Eliminar datos del usuario
      localStorage.removeItem(`cuentas-${usuario}`);
      localStorage.removeItem(`historial-diario-${usuario}`);
      
      if (usuarioActual === usuario) {
        const nuevoUsuarioActual = nuevosUsuarios[0];
        setUsuarioActual(nuevoUsuarioActual);
        onUsuarioChange(nuevoUsuarioActual);
      }
    }
  };

  const cambiarUsuario = (usuario) => {
    setUsuarioActual(usuario);
    onUsuarioChange(usuario);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaUser className="text-blue-500" />
          Usuario Actual: {usuarioActual || 'Sin usuario'}
        </h3>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-2 text-sm"
        >
          <FaPlus /> Nuevo Usuario
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoUsuario}
              onChange={(e) => setNuevoUsuario(e.target.value)}
              placeholder="Nombre del usuario"
              className="form-input flex-grow"
              onKeyPress={(e) => e.key === 'Enter' && crearUsuario()}
            />
            <button
              onClick={crearUsuario}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Crear
            </button>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {usuarios.map(usuario => (
          <div
            key={usuario}
            className={`p-3 rounded border cursor-pointer transition-all ${
              usuario === usuarioActual
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => cambiarUsuario(usuario)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{usuario}</span>
              {usuarios.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    eliminarUsuario(usuario);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserManager;
