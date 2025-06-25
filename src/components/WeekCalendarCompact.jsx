import React, { useState } from 'react';

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getWeekDays(centerDate, offset, total = 3) {
  // Devuelve un array de fechas, centrado en centerDate+offset, con total días
  const days = [];
  const base = new Date(centerDate);
  base.setDate(base.getDate() + offset);
  const center = base.getDay();
  const start = center - Math.floor(total / 2);
  for (let i = 0; i < total; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - (center - (start + i)));
    days.push(d);
  }
  return days;
}

function WeekCalendarCompact({ historial, totalCuentas }) {
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const dias = getWeekDays(today, offset, 3);
  
  // Calcular racha actual
  const calcularRacha = () => {
    if (!historial || totalCuentas === 0) return 0;
    
    const fechas = Object.keys(historial)
      .filter(fecha => {
        const info = historial[fecha];
        return info && info.ingresosDia >= totalCuentas;
      })
      .sort((a, b) => new Date(b) - new Date(a)); // Más reciente primero
    
    if (fechas.length === 0) return 0;
    
    let racha = 1;
    for (let i = 1; i < fechas.length; i++) {
      const fechaActual = new Date(fechas[i-1]);
      const fechaAnterior = new Date(fechas[i]);
      const diferenciaDias = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);
      
      if (diferenciaDias === 1) {
        racha++;
      } else {
        break;
      }
    }
    
    return racha;
  };
  
  const rachaActual = calcularRacha();

  return (
    <div className="flex gap-2 items-center">
      {rachaActual > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg border border-red-300">
          <span className="text-red-600 text-sm font-bold">🔥</span>
          <span className="text-red-700 text-xs font-bold">{rachaActual}</span>
        </div>
      )}
      <button
        className="px-2 py-1 text-gray-500 hover:text-blue-600 text-lg font-bold"
        onClick={() => setOffset(o => o - 1)}
        title="Ver días anteriores"
        type="button"
      >
        ◀
      </button>
      {dias.map((fecha, idx) => {
        const fechaStr = fecha.toLocaleDateString();
        const diaNombre = diasSemana[fecha.getDay()];
        const info = historial && historial[fechaStr];
        const completado = info && info.ingresosDia >= totalCuentas && totalCuentas > 0;
        return (
          <div
            key={fechaStr}
            className={`flex flex-col items-center px-2 py-1 rounded-lg border text-center min-w-[60px] ${completado ? 'bg-green-100 border-green-400 fire-aura' : (info && info.ingresosDia < totalCuentas ? 'bg-gray-50 border-blue-200 pending-aura' : 'bg-gray-50 border-gray-200')}`}
          >
            <span className="text-xs font-semibold text-gray-500">{diaNombre}</span>
            <span className="text-base font-bold text-gray-800">{fecha.getDate()}</span>
            {completado ? (
              <span
                className="text-green-600 text-lg font-bold animate-bounce"
                title="Racha completada"
                style={{ display: 'inline-block', animation: 'wiggle 1s infinite' }}
              >🔥</span>
            ) : (
              <span className="text-gray-400 text-xs">{info ? `${info.ingresosDia}/${totalCuentas}` : `0/${totalCuentas}`}</span>
            )}
          </div>
        );
      })}
      <button
        className="px-2 py-1 text-gray-500 hover:text-blue-600 text-lg font-bold"
        onClick={() => setOffset(o => o + 1)}
        title="Ver días siguientes"
        type="button"
      >
        ▶
      </button>
    </div>
  );
}

export default WeekCalendarCompact;
