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

// Formato especial para medallas: 1k, 1kk, 2.5kk, etc.
export const formatMedallas = (number) => {
  if (number === null || number === undefined || number === '') return '0';
  const num = parseInt(number) || 0;
  if (num >= 1000000000) {
    // Mostrar como 1kkk, 2.5kkk, etc. para mil millones o más
    let val = (num / 1000000000);
    if (val % 1 === 0) return val + 'kkk';
    return val.toFixed(1).replace('.0', '') + 'kkk';
  } else if (num >= 1000000) {
    // Mostrar como 1kk, 2.5kk, etc. para millones
    let val = (num / 1000000);
    if (val % 1 === 0) return val + 'kk';
    return val.toFixed(1).replace('.0', '') + 'kk';
  } else if (num >= 1000) {
    // Mostrar como 1k, 2.5k, etc. para miles
    let val = (num / 1000);
    if (val % 1 === 0) return val + 'k';
    return val.toFixed(1).replace('.0', '') + 'k';
  }
  return num.toString();
};