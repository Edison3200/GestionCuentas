import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Información de la Página</h2>
      <p className="mb-4 text-gray-700">
        <strong>¿Qué hace esta página?</strong><br/>
        Esta aplicación te permite gestionar cuentas y personajes (PJs), registrar ingresos diarios, llevar el control de medallas, notas y visualizar estadísticas de actividad y rachas. Es ideal para llevar el control de cuentas de juegos, equipos o cualquier sistema basado en cuentas y logros.
      </p>
      <p className="mb-4 text-gray-700">
        <strong>Buscador:</strong><br/>
        El buscador te permite filtrar cuentas por nombre, por nombre de PJ o por palabras clave en las notas de los PJs. Escribe cualquier palabra y verás solo las cuentas y personajes que coincidan.
      </p>
      <p className="mb-4 text-gray-700">
        <strong>Funcionalidades principales:</strong>
        <ul className="list-disc ml-6">
          <li>Gestión de cuentas y personajes (PJs).</li>
          <li>Ingreso diario y control de rachas.</li>
          <li>Visualización de medallas y notas por PJ.</li>
          <li>Calendario semanal con rachas y progreso diario.</li>
          <li>Buscador inteligente por nombre y notas.</li>
          <li>Soporte para dispositivos móviles y diferentes zonas horarias.</li>
        </ul>
      </p>
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Contacto</h3>
        <p className="text-gray-700">Edison Cabrera</p>
        <p className="text-gray-700">edisoncabrera3200@gmail.com</p>
      </div>
    </div>
  );
}
