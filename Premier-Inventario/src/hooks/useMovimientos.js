import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/transacciones';

const KEY = ['transacciones'];

export function useMovimientos(filtros) {
  return useQuery({
    queryKey: [...KEY, 'lista', filtros],
    queryFn: () => api.getTransacciones(filtros),
    placeholderData: keepPreviousData, 
  });
}

export function useTotalMovimientos({ tipo, mes, q }) {
  return useQuery({
    queryKey: [...KEY, 'count', { tipo, mes, q }],
    queryFn: () => api.getTotalTransacciones({ tipo, mes, q }),
    select: (data) => data.total,
    placeholderData: keepPreviousData,
  });
}

export function useMovimientoMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });

  return {
    crear: useMutation({ mutationFn: api.createTransaccion, onSuccess }),
    actualizar: useMutation({ mutationFn: ({ id, data }) => api.updateTransaccion(id, data), onSuccess }),
    eliminar: useMutation({ mutationFn: api.deleteTransaccion, onSuccess }),
  };
}

export function useResumen({ mes }) {
  return useQuery({
    queryKey: [...KEY, 'resumen', { mes }],
    queryFn: () => api.getResumen({ mes }),
    placeholderData: keepPreviousData,
  });
}