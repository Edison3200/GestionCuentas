import React, { useState, useEffect } from 'react';
import { FaCalendar, FaChartBar, FaEye } from 'react-icons/fa';

function HistoryViewer({ usuarioActual }) {
  const [historialDiario, setHistorialDiario] = useState({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [estadisticasMensuales, setEstadisticasMensuales] = useState({});

  useEffect(() => {
    if (usuarioActual) {
      const historial = JSON.parse(localStorage.getItem(`historial-diario-${usuarioActual}`)) || {};
      setHistorialDiario(historial);
      calcularEstadisticasMensuales(historial);
    }
  }, [usuarioActual]);

  const calcularEstadisticasMensuales = (historial) => {
    const estadisticas = {};
    
    Object.entries(historial).forEach(([fecha, datos]) => {
      const [dia, mes, año] = fecha.split('/');
      const mesAño = `${mes}/${año}`;
      
      if (!estadisticas[mesAño]) {
        estadisticas[mesAño] = {
          totalIngresos: 0,
          diasActivos: 0,
          cuentasUnicas: new Set(),
          totalMedallas: 0
        };
      }
      
      estadisticas[mesAño].totalIngresos += datos.ingresosDia || 0;
      estadisticas[mesAño].diasActivos += 1;
      estadisticas[mesAño].totalMedallas += datos.medallasGanadas || 0;
      
      if (datos.cuentas) {
        datos.cuentas.forEach(cuenta => {
          estadisticas[mesAño].cuentasUnicas.add(cuenta.nombre);
        });
      }
    });

    // Convertir Set a número
    Object.keys(estadisticas).forEach(mes => {
      estadisticas[mes].cuentasUnicas = estadisticas[mes].cuentasUnicas.size;
    });

    setEstadisticasMensuales(estadisticas);
  };

  const obtenerDatosDelDia = (fecha) => {
    return historialDiario[fecha] || null;
  };

  const formatearFecha = (fecha) => {
    const [dia, mes, año] = fecha.split('/');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dia} ${meses[parseInt(mes) - 1]} ${año}`;
  };

  const fechasDisponibles = Object.keys(historialDiario).sort((a, b) => {
    const [diaA, mesA, añoA] = a.split('/').map(Number);
    const [diaB, mesB, añoB] = b.split('/').map(Number);
    return new Date(añoB, mesB - 1, diaB) - new Date(añoA, mesA - 1, diaA);
  });

  const datosDelDia = fechaSeleccionada ? obtenerDatosDelDia(fechaSeleccionada) : null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setMostrarHistorial(!mostrarHistorial)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
      >
        <FaCalendar /> Historial y Estadísticas
      </button>

      {mostrarHistorial && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-indigo-600" />
            Historial de {usuarioActual}
          </h3>

          {/* Estadísticas Mensuales */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Estadísticas Mensuales</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(estadisticasMensuales)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([mes, stats]) => (
                  <div key={mes} className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border">
                    <h5 className="font-semibold text-indigo-800 mb-2">{mes}</h5>
                    <div className="space-y-1 text-sm">
                      <p><strong>Ingresos:</strong> {stats.totalIngresos}</p>
                      <p><strong>Días activos:</strong> {stats.diasActivos}</p>
                      <p><strong>Cuentas:</strong> {stats.cuentasUnicas}</p>
                      <p><strong>Medallas:</strong> {stats.totalMedallas}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Selector de Fecha */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-3">Ver Día Específico</h4>
            <select
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="form-input w-full md:w-auto"
            >
              <option value="">Seleccionar fecha...</option>
              {fechasDisponibles.map(fecha => (
                <option key={fecha} value={fecha}>
                  {formatearFecha(fecha)}
                </option>
              ))}
            </select>
          </div>

          {/* Datos del Día Seleccionado */}
          {datosDelDia && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <FaEye /> Datos del {formatearFecha(fechaSeleccionada)}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded shadow text-center">
                  <p className="text-sm text-gray-600">Ingresos del día</p>
                  <p className="text-2xl font-bold text-green-600">{datosDelDia.ingresosDia || 0}</p>
                </div>
                <div className="bg-white p-3 rounded shadow text-center">
                  <p className="text-sm text-gray-600">Cuentas activas</p>
                  <p className="text-2xl font-bold text-blue-600">{datosDelDia.cuentas?.length || 0}</p>
                </div>
                <div className="bg-white p-3 rounded shadow text-center">
                  <p className="text-sm text-gray-600">Medallas ganadas</p>
                  <p className="text-2xl font-bold text-yellow-600">{datosDelDia.medallasGanadas || 0}</p>
                </div>
              </div>

              {datosDelDia.cuentas && datosDelDia.cuentas.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Cuentas del día:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {datosDelDia.cuentas.map((cuenta, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm">
                        <p><strong>{cuenta.nombre}</strong></p>
                        <p className="text-gray-600">{cuenta.correo || 'Sin correo'}</p>
                        <p className="text-gray-600">PJs: {cuenta.pejotas?.length || 0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {fechasDisponibles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaCalendar className="text-4xl mx-auto mb-2 opacity-50" />
              <p>No hay historial disponible aún</p>
              <p className="text-sm">Los datos se guardarán automáticamente cada día</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryViewer;
