import { useState } from 'react';
export function useFiltrosMovimientos() {
  const [filtros, setFiltros] = useState({ tipo: '', mes: '', pagina: 1 });
  const [busqueda, setBusqueda] = useState('');
  const cambiarFiltro = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor, pagina: 1 }));

  const irAPagina = (pagina) =>
    setFiltros((prev) => ({ ...prev, pagina: Math.max(pagina, 1) }));

  return { filtros, busqueda, setBusqueda, cambiarFiltro, irAPagina };
}
