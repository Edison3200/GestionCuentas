import React from 'react';
import { FaTimes, FaMedal } from 'react-icons/fa';
import { formatNumber, formatCompactNumber } from '../utils/formatters';

function MedalDetails({ cuentas, onClose }) {
  const cuentasConMedallas = cuentas
    .map(cuenta => ({
      ...cuenta,
      totalMedallas: cuenta.pejotas.reduce((sum, pj) => sum + parseInt(pj.medallas || 0), 0)
    }))
    .filter(cuenta => cuenta.totalMedallas > 0)
    .sort((a, b) => b.totalMedallas - a.totalMedallas);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaMedal className="text-yellow-500" />
            Top Medallas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {cuentasConMedallas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cuentasConMedallas.map((cuenta, index) => (
              <div 
                key={cuenta.id}
                className={`p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400' :
                  index === 1 ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-400' :
                  index === 2 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400' :
                  'bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {index < 3 && (
                      <span className={`text-2xl ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-500' :
                        'text-orange-500'
                      }`}>
                        <FaMedal />
                      </span>
                    )}
                    <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm truncate">{cuenta.nombre}</h3>
                    <p className="text-xs text-gray-600 truncate">
                      {cuenta.correo && cuenta.correo.length > 20
                        ? cuenta.correo.slice(0, 8) + '...' + cuenta.correo.slice(-8)
                        : (cuenta.correo || 'Sin correo')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-blue-600">{formatCompactNumber(cuenta.totalMedallas)}</p>
                    <p className="text-xs text-gray-500">medallas</p>
                  </div>
                </div>
                
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2 text-gray-700">PJs con medallas:</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cuenta.pejotas
                      .filter(pj => parseInt(pj.medallas || 0) > 0)
                      .sort((a, b) => parseInt(b.medallas || 0) - parseInt(a.medallas || 0))
                      .map((pj, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-50 p-1.5 rounded text-xs">
                          <span className="truncate flex-grow mr-2 min-w-0">{pj.nombre}</span>
                          <span className="font-medium text-blue-600 flex items-center gap-1 flex-shrink-0">
                            {formatCompactNumber(pj.medallas)} <FaMedal className="text-xs text-yellow-500" />
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No hay medallas aún</p>
            <p className="text-gray-400">¡Comienza a agregar medallas a tus PJs!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MedalDetails;
