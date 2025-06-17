import React from 'react';

const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function WeekCalendar({ historial, totalCuentas }) {
  // historial: objeto { fecha: { ingresosDia, ... } }
  // totalCuentas: número total de cuentas
  const dias = getLastNDays(7);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center">
      <div className="font-bold text-lg mb-2 text-blue-700">Semana actual</div>
      <div className="flex gap-2">
        {dias.map((fecha, idx) => {
          const fechaStr = fecha.toLocaleDateString();
          const diaNombre = diasSemana[fecha.getDay()];
          const info = historial && historial[fechaStr];
          const completado = info && info.ingresosDia >= totalCuentas && totalCuentas > 0;
          return (
            <div
              key={fechaStr}
              className={`flex flex-col items-center px-2 py-1 rounded-lg border ${completado ? 'bg-green-100 border-green-400' : 'bg-gray-50 border-gray-200'}`}
              style={{ minWidth: 60 }}
            >
              <span className="text-xs font-semibold text-gray-500">{diaNombre.slice(0,3)}</span>
              <span className="text-base font-bold text-gray-800">{fecha.getDate()}</span>
              <span className="text-xs text-gray-400">{fecha.toLocaleDateString().slice(3,5)}/{fecha.getFullYear().toString().slice(-2)}</span>
              {completado ? (
                <span className="text-green-600 text-lg font-bold" title="Racha completada">🔥</span>
              ) : (
                <span className="text-gray-400 text-xs">{info ? `${info.ingresosDia}/${totalCuentas}` : `0/${totalCuentas}`}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekCalendar;
