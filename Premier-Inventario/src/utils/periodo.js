const pad = (n) => String(n).padStart(2, '0');

export function rangoDePeriodo({ periodo, dia, mes, anio }) {
  if (periodo === 'dia' && dia) return { desde: dia, hasta: dia };
  if (periodo === 'mes' && mes) {
    const [a, m] = mes.split('-').map(Number); 
    return { desde: `${mes}-01`, hasta: `${mes}-${pad(new Date(a, m, 0).getDate())}` };
  }
  if (periodo === 'anio' && anio) return { desde: `${anio}-01-01`, hasta: `${anio}-12-31` };
  return {};
}

export function nombreArchivo({ tipo, periodo, dia, mes, anio }) {
  const parte = { dia, mes, anio }[periodo] ?? 'completo';
  const que = { Ingreso: 'ingresos', Egreso: 'egresos' }[tipo] ?? 'movimientos';
  return `${que}_${parte}.xlsx`; 
}