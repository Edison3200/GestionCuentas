// Script para limpiar el registro de reinicio manualmente
// Ejecutar en la consola del navegador

// Obtener el usuario actual
const sesionActiva = localStorage.getItem('sesion-activa');
if (sesionActiva) {
  const usuario = JSON.parse(sesionActiva);
  const usuarioActual = usuario.usuario;
  
  // Limpiar el registro de reinicio
  localStorage.removeItem(`ultimoReinicio-${usuarioActual}`);
  console.log('✅ Registro de reinicio limpiado para:', usuarioActual);
  console.log('Ahora puedes probar el reinicio con una nueva hora');
} else {
  console.log('❌ No hay sesión activa');
}