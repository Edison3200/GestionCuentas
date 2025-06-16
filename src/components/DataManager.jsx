import React, { useState } from 'react';
import { FaDownload, FaUpload, FaSave, FaCloud } from 'react-icons/fa';

function DataManager({ cuentas, setCuentas, horaReinicio, setHoraReinicio, setModalConfirm }) {
  const [showManager, setShowManager] = useState(false);

  // Exportar datos
  const exportarDatos = () => {
    const datos = {
      cuentas,
      horaReinicio,
      fechaExportacion: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuentas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Importar datos
  const importarDatos = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target.result);
        if (datos.cuentas && Array.isArray(datos.cuentas)) {
          setCuentas(datos.cuentas);
          if (datos.horaReinicio) {
            setHoraReinicio(datos.horaReinicio);
          }
          // Usar modal personalizado en lugar de alert
          setModalConfirm({
            isOpen: true,
            message: 'Datos importados exitosamente',
            onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
          });
        } else {
          setModalConfirm({
            isOpen: true,
            message: 'Archivo de respaldo inválido',
            onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
          });
        }
      } catch (error) {
        setModalConfirm({
          isOpen: true,
          message: 'Error al leer el archivo de respaldo',
          onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Guardar backup automático
  const guardarBackupAutomatico = () => {
    const datos = {
      cuentas,
      horaReinicio,
      fechaGuardado: new Date().toISOString()
    };
    
    // Guardar en localStorage con timestamp
    const backups = JSON.parse(localStorage.getItem('backups-automaticos')) || [];
    backups.push(datos);
    
    // Mantener solo los últimos 7 backups
    if (backups.length > 7) {
      backups.shift();
    }
    
    localStorage.setItem('backups-automaticos', JSON.stringify(backups));
    setModalConfirm({
      isOpen: true,
      message: 'Backup automático guardado exitosamente',
      onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
    });
  };

  // Restaurar backup automático
  const restaurarBackupAutomatico = () => {
    const backups = JSON.parse(localStorage.getItem('backups-automaticos')) || [];
    if (backups.length === 0) {
      setModalConfirm({
        isOpen: true,
        message: 'No hay backups automáticos disponibles',
        onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
      });
      return;
    }
    
    const ultimoBackup = backups[backups.length - 1];
    setCuentas(ultimoBackup.cuentas);
    setHoraReinicio(ultimoBackup.horaReinicio);
    setModalConfirm({
      isOpen: true,
      message: `Datos restaurados desde: ${new Date(ultimoBackup.fechaGuardado).toLocaleString()}`,
      onConfirm: () => setModalConfirm({ isOpen: false, message: '', onConfirm: null })
    });
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowManager(!showManager)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
      >
        <FaCloud /> Gestión de Datos
      </button>

      {showManager && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCloud className="text-purple-600" />
            Gestión de Datos y Respaldos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Respaldo Manual</h4>
              <button
                onClick={exportarDatos}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center transition-colors"
              >
                <FaDownload /> Exportar Datos
              </button>
              
              <label className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center cursor-pointer transition-colors">
                <FaUpload /> Importar Datos
                <input
                  type="file"
                  accept=".json"
                  onChange={importarDatos}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Respaldo Automático</h4>
              <button
                onClick={guardarBackupAutomatico}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center transition-colors"
              >
                <FaSave /> Guardar Backup
              </button>
              
              <button
                onClick={restaurarBackupAutomatico}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 justify-center transition-colors"
              >
                <FaUpload /> Restaurar Último Backup
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
            <p><strong>Nota:</strong> Los datos se guardan automáticamente en tu navegador. 
            Usa "Exportar Datos" para crear un respaldo que puedas guardar en tu computadora o nube.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataManager;
