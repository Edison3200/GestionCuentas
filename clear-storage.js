// Script para limpiar todos los datos de usuarios de Cuentas Tracker
// Ejecutar en la consola del navegador (F12 -> Console)

console.log('🗑️ Iniciando limpieza de datos de Cuentas Tracker...');

// Función para limpiar todos los datos
function clearAllUserData() {
    const keysToRemove = [];
    
    // Buscar todas las claves relacionadas con la aplicación
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
            key === 'usuarios-auth' ||
            key === 'sesion-activa' ||
            key === 'usuarios' ||
            key.startsWith('cuentas-') ||
            key.startsWith('historial-diario-') ||
            key.startsWith('horaReinicio-') ||
            key.startsWith('ultimaFechaReinicio-')
        )) {
            keysToRemove.push(key);
        }
    }
    
    console.log(`📋 Elementos encontrados para eliminar (${keysToRemove.length}):`, keysToRemove);
    
    // Eliminar todas las claves encontradas
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`❌ Eliminado: ${key}`);
    });
    
    console.log('✅ ¡Limpieza completada!');
    console.log('🎯 Ahora puedes recargar la página y crear el primer usuario que será Super Usuario automáticamente.');
    
    return {
        eliminados: keysToRemove.length,
        elementos: keysToRemove
    };
}

// Ejecutar la limpieza
const resultado = clearAllUserData();

// Mostrar resumen
console.log(`
🎉 RESUMEN DE LIMPIEZA:
- Elementos eliminados: ${resultado.eliminados}
- El próximo usuario registrado será Super Usuario automáticamente
- Recarga la página para empezar desde cero

Para verificar que todo se limpió correctamente, ejecuta:
console.log('Usuarios restantes:', localStorage.getItem('usuarios-auth'));
`);