// Función para obtener el día personalizado basado en la hora de reinicio
const obtenerDiaPersonalizado = (horaReinicio, fecha = new Date()) => {
  const [hora, minuto] = horaReinicio.split(':').map(Number);
  const fechaActual = new Date(fecha);
  const horaReinicioHoy = new Date(fechaActual);
  horaReinicioHoy.setHours(hora, minuto, 0, 0);
  
  // Si aún no ha llegado la hora de reinicio, el día personalizado es el día anterior
  if (fechaActual < horaReinicioHoy) {
    const diaAnterior = new Date(fechaActual);
    diaAnterior.setDate(diaAnterior.getDate() - 1);
    return diaAnterior.toISOString().split('T')[0];
  }
  
  return fechaActual.toISOString().split('T')[0];
};

// Función alternarIngreso modificada
const alternarIngreso = async (id) => {
  if (!id || isNaN(parseInt(id))) {
    console.error('ID de cuenta no válido:', id);
    return;
  }
  
  const now = new Date();
  const diaPersonalizado = obtenerDiaPersonalizado(horaReinicio, now);
  const cuenta = cuentas.find(c => c.id === id);
  
  if (!cuenta) return;
  
  // Verificar si ya marcó ingreso en este día personalizado
  if (cuenta.ultimoIngreso === diaPersonalizado) {
    setMensajeError(`Ya marcaste ingreso hoy. Próximo reinicio a las ${horaReinicio}`);
    setTimeout(() => setMensajeError(''), 3000);
    return;
  }
  
  // Actualizar estado local PRIMERO
  setCuentas(prev =>
    prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ingresado: true,
          ultimoIngreso: diaPersonalizado,
          historial: [...c.historial, `${diaPersonalizado} ${now.toLocaleTimeString()}`]
        };
      }
      return c;
    })
  );
  
  // Actualizar base de datos
  try {
    await Promise.all([
      cuentaService.actualizar(id, {
        ingresado: true,
        ultimo_ingreso: diaPersonalizado
      }),
      historialService.crear({
        cuenta_id: id,
        fecha_ingreso: now.toISOString()
      })
    ]);
    
    setSuccessNotification({
      isOpen: true,
      message: `✅ Ingreso registrado para ${cuenta.nombre}`
    });
    
  } catch (error) {
    console.error('Error actualizando base de datos:', error);
    // Revertir cambio local si falla
    setCuentas(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ingresado: false,
            ultimoIngreso: null,
            historial: c.historial.slice(0, -1)
          };
        }
        return c;
      })
    );
  }
};

// Cálculo de faltantes usando día personalizado
const diaPersonalizadoActual = obtenerDiaPersonalizado(horaReinicio);
const faltantesHoy = cuentas.filter(c => c.ultimoIngreso !== diaPersonalizadoActual).length;