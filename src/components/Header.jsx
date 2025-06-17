import React from 'react';
import { FaSearch, FaHistory, FaDatabase, FaUser, FaHome, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';

function Header({ 
  filtro, 
  setFiltro, 
  pestañaActiva, 
  setPestañaActiva,
  usuarioLogueado,
  onLogout,
  onOpenSuperUser
}) {
  const pestañas = [
    { id: 'inicio', nombre: 'Inicio', icono: <FaHome /> },
    { id: 'historial', nombre: 'Historial', icono: <FaHistory /> },
    { id: 'datos', nombre: 'Gestión de Datos', icono: <FaDatabase /> },
    { id: 'usuarios', nombre: 'Usuarios', icono: <FaUser /> },
    { id: 'info', nombre: 'Información', icono: <FaInfoCircle /> }
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">
              Gestor de Cuentas
            </h1>
            {usuarioLogueado && (
              <div className="flex items-center gap-4">
                {usuarioLogueado.esSuperUsuario && (
                  <button
                    onClick={onOpenSuperUser}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg transition-colors duration-200"
                    title="Panel de Super Usuario"
                  >
                    <FaShieldAlt />
                    <span className="hidden sm:inline">Super Usuario</span>
                  </button>
                )}
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-2xl">{usuarioLogueado.avatar}</span>
                  <span className="text-sm font-medium text-blue-800">{usuarioLogueado.usuario}</span>
                  <button
                    onClick={onLogout}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative flex-grow md:max-w-md mb-4 md:mb-0 md:mx-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              placeholder="Buscar cuenta..."
              className="form-input w-full pl-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            {pestañas.map(pestaña => (
              <button
                key={pestaña.id}
                onClick={() => setPestañaActiva(pestaña.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 border-b-2 text-sm font-medium whitespace-nowrap
                  ${pestañaActiva === pestaña.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  transition-colors duration-200
                `}
              >
                {pestaña.icono}
                {pestaña.nombre}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
