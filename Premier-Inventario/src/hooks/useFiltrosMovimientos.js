import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce'; 

export function useFiltrosMovimientos() {
  const [filtros, setFiltros] = useState({ tipo: '', mes: '', q: '', pagina: 1 }); 
  const [busqueda, setBusqueda] = useState('');
  const busquedaDebounced = useDebounce(busqueda, 350); 

  useEffect(() => {
    setFiltros((prev) =>
      prev.q === busquedaDebounced ? prev : { ...prev, q: busquedaDebounced, pagina: 1 }
    );
  }, [busquedaDebounced]);

  const cambiarFiltro = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor, pagina: 1 }));

  const irAPagina = (pagina) =>
    setFiltros((prev) => ({ ...prev, pagina: Math.max(pagina, 1) }));

  return { filtros, busqueda, setBusqueda, cambiarFiltro, irAPagina };
}
