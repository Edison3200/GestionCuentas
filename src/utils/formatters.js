// Función para formatear números con puntos como separadores de miles
export const formatNumber = (number) => {
  if (number === null || number === undefined || number === '') return '0';
  
  const num = parseInt(number) || 0;
  return num.toLocaleString('es-ES'); // Formato español con puntos para miles
};

// Función para formatear números grandes de forma compacta
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || number === '') return '0';
  
  const num = parseInt(number) || 0;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  
  return num.toString();
};