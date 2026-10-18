import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/conceptos';

const KEY = ['conceptos'];

export function useConceptos() {
  return useQuery({ queryKey: KEY, queryFn: api.getConceptos, staleTime: 5 * 60 * 1000 });
}

export function useConceptoMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: KEY });

  return {
    crear: useMutation({ mutationFn: api.createConcepto, onSuccess }),
    actualizar: useMutation({ mutationFn: ({ id, data }) => api.updateConcepto(id, data), onSuccess }),
    eliminar: useMutation({ mutationFn: api.deleteConcepto, onSuccess }),
  };
}
