# 🗑️ Cómo limpiar todos los usuarios

## Método 1: Consola del navegador (RECOMENDADO)

1. **Abre tu aplicación** en el navegador (http://localhost:5173)
2. **Abre las herramientas de desarrollador** presionando `F12`
3. **Ve a la pestaña "Console"**
4. **Copia y pega este código** y presiona Enter:

```javascript
// Limpiar todos los datos de usuarios
console.log('🗑️ Limpiando datos...');
const keys = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key === 'usuarios-auth' || key === 'sesion-activa' || key === 'usuarios' || key.startsWith('cuentas-') || key.startsWith('historial-diario-') || key.startsWith('horaReinicio-') || key.startsWith('ultimaFechaReinicio-'))) {
        keys.push(key);
    }
}
keys.forEach(key => localStorage.removeItem(key));
console.log(`✅ Eliminados ${keys.length} elementos:`, keys);
console.log('🎯 Recarga la página y crea el primer usuario (será Super Usuario automáticamente)');
```

5. **Recarga la página** (F5 o Ctrl+R)
6. **Crea tu primer usuario** - será automáticamente Super Usuario

## Método 2: Archivo HTML

1. Abre el archivo `clear-users.html` en tu navegador
2. Haz clic en "ELIMINAR TODOS LOS DATOS"
3. Confirma las advertencias
4. Ve a tu aplicación y crea el primer usuario

## ¿Qué se elimina?

- ✅ Todos los usuarios registrados
- ✅ Todas las cuentas de todos los usuarios  
- ✅ Todo el historial diario
- ✅ Configuraciones de hora de reinicio
- ✅ Sesiones activas
- ✅ Fechas de último reinicio

## Después de limpiar

El **primer usuario** que registres será automáticamente **Super Usuario** y tendrá acceso al panel de gestión de usuarios con el botón rojo "Super Usuario" en el header.

## Verificar que se limpió

Ejecuta en la consola:
```javascript
console.log('Usuarios:', localStorage.getItem('usuarios-auth'));
console.log('Sesión:', localStorage.getItem('sesion-activa'));
```

Debería mostrar `null` para ambos.