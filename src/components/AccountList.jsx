import React from 'react';
import AccountCard from './AccountCard';
import { formatNumber, formatCompactNumber } from '../utils/formatters';

const coloresDisponibles = [
  'bg-pastel-blue',
  'bg-pastel-green',
  'bg-pastel-yellow',
  'bg-pastel-pink',
  'bg-pastel-purple',
];

function AccountList({
  cuentasPorCorreo,
  hoy,
  mostrarDetalles,
  setMostrarDetalles,
  alternarIngreso,
  setCuentaActiva,
  setMostrarAgregarPJ,
  eliminarCuenta,
  eliminarPj,
  editarPj,
  mostrarSoloCorreos
}) {
  return (
    <>
      {Object.entries(cuentasPorCorreo).map(([correo, grupo], idx) => (
        <div
          key={correo}
          className={`mb-6 p-4 rounded ${coloresDisponibles[idx % coloresDisponibles.length]} shadow-md`}
        >
          <h2 className="text-lg font-bold mb-4 truncate flex justify-between items-center">
            <span>Correo: {correo}</span>
            {mostrarSoloCorreos && (
              <span className="text-xs text-gray-600">
                {formatNumber(grupo.length)} {grupo.length === 1 ? 'cuenta' : 'cuentas'} | 
                {' '}{formatCompactNumber(grupo.reduce((total, cuenta) => total + cuenta.pejotas.length, 0))} PJs | 
                {' '}{formatCompactNumber(grupo.reduce((total, cuenta) => 
                  total + cuenta.pejotas.reduce((sum, pj) => sum + (parseInt(pj.medallas) || 0), 0), 0
                ))} 🏅
              </span>
            )}
          </h2>
          {!mostrarSoloCorreos && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {grupo.map(cuenta => (
                <AccountCard
                  key={cuenta.id}
                  cuenta={cuenta}
                  hoy={hoy}
                  mostrarDetalles={mostrarDetalles}
                  setMostrarDetalles={setMostrarDetalles}
                  alternarIngreso={alternarIngreso}
                  setCuentaActiva={setCuentaActiva}
                  setMostrarAgregarPJ={setMostrarAgregarPJ}
                  eliminarCuenta={eliminarCuenta}
                  eliminarPj={eliminarPj}
                  editarPj={editarPj}
                  mostrarSoloCorreos={mostrarSoloCorreos}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default AccountList;
