import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaHistory, FaDatabase, FaUser, FaHome, FaShieldAlt, FaInfoCircle, FaBars, FaEyeSlash } from 'react-icons/fa';

function Header({ 
  filtro, 
  setFiltro, 
  pestañaActiva, 
  setPestañaActiva,
  usuarioLogueado,
  onLogout,
  onOpenSuperUser,
  onBuscarPj // nuevo prop
}) {
  const [mostrarHeader, setMostrarHeader] = useState(true); // visible por defecto
  const [mostrarInputBusqueda, setMostrarInputBusqueda] = useState(false);
  const inputRef = useRef(null);
  const pestañas = [
    { id: 'inicio', nombre: 'Inicio', icono: <FaHome /> },
    { id: 'historial', nombre: 'Historial', icono: <FaHistory /> },
    { id: 'datos', nombre: 'Gestión de Datos', icono: <FaDatabase /> },
    { id: 'usuarios', nombre: 'Usuarios', icono: <FaUser /> },
    { id: 'info', nombre: 'Información', icono: <FaInfoCircle /> }
  ];

  // Mapeo local de nombre a emoji para mostrar correctamente el icono
  const iconMap = {
    man: '👨',
    woman: '👩',
    cat: '🐱',
    dog: '🐶',
  };

  useEffect(() => {
    setMostrarHeader(true); // Siempre visible al cargar o actualizar
  }, []);

  useEffect(() => {
    if (mostrarInputBusqueda && inputRef.current) {
      inputRef.current.focus();
    }
    function handleClickOutside(e) {
      if (inputRef.current && !inputRef.current.parentNode.contains(e.target)) {
        setMostrarInputBusqueda(false);
      }
    }
    if (mostrarInputBusqueda) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mostrarInputBusqueda]);

  return (
    <header className="bg-white shadow relative">
      {/* Botón de hamburguesa/ocultar solo si mostrarBotonHamburguesa es true */}
      <button
        className="absolute left-2 top-2 z-20 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow transition-colors"
        onClick={() => setMostrarHeader(v => !v)}
        title={mostrarHeader ? 'Ocultar menú' : 'Mostrar menú'}
      >
        {mostrarHeader ? <FaEyeSlash /> : <FaBars />}
      </button>
      {mostrarHeader && (
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
                    {usuarioLogueado.icono ? (
                      <span className="text-2xl">
                        {iconMap[usuarioLogueado.icono] || usuarioLogueado.icono}
                      </span>
                    ) : (
                      <FaUser className="text-2xl text-blue-400" />
                    )}
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
            <div className="relative flex-grow md:max-w-md mb-4 md:mb-0 md:mx-4 flex justify-end">
              {!mostrarInputBusqueda && (
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-700 px-3 py-2 rounded-full bg-blue-50 shadow"
                  onClick={() => setMostrarInputBusqueda(true)}
                  title="Buscar"
                >
                  <FaSearch size={20} />
                </button>
              )}
              {mostrarInputBusqueda && (
                <div className="relative w-full max-w-xs animate-fadeIn">
                  <input
                    ref={inputRef}
                    type="text"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && onBuscarPj) onBuscarPj();
                    }}
                    placeholder="Buscar cuenta, items o PJ"
                    className="form-input w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 pr-12"
                  />
                  {filtro.trim() && (
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700 px-2 py-1 rounded"
                      onClick={onBuscarPj}
                      title="Buscar"
                    >
                      <FaSearch />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Solo mostrar las pestañas si mostrarHeader está activo */}
          {mostrarHeader && (
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
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
