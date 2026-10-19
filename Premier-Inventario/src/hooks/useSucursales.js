import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/sucursales';

const KEY = ['sucursales'];

export function useSucursales() {
  return useQuery({ queryKey: KEY, queryFn: api.getSucursales, staleTime: 5 * 60 * 1000 });
}

export function useSucursalMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });

  return {
    crear: useMutation({ mutationFn: api.createSucursal, onSuccess }),
    actualizar: useMutation({ mutationFn: ({ id, data }) => api.updateSucursal(id, data), onSuccess }),
    eliminar: useMutation({ mutationFn: api.deleteSucursal, onSuccess }),
  };
}
