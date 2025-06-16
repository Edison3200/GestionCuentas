import React from 'react';
import { FaClock } from 'react-icons/fa';

function TimeSettings({ horaReinicio, setHoraReinicio }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
        <FaClock className="text-blue-600 text-xs" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-700">Reinicio:</span>
        <input
          id="hora-reinicio"
          type="time"
          value={horaReinicio}
          onChange={(e) => setHoraReinicio(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
          title={`Reinicio automático diario a las ${horaReinicio}`}
        />
      </div>
    </div>
  );
}

export default TimeSettings;
