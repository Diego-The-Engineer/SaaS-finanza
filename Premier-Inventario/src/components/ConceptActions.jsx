import { useState } from 'react';
import { useConceptoMutations } from '../hooks/useConceptos';
import ConceptModal from './ConceptModal';

// Responsabilidad: CRUD de conceptos sobre el concepto seleccionado en el formulario.
export default function ConceptActions({ conceptoId, conceptos, onEliminado }) {
  const [modal, setModal] = useState(null); // null | 'crear' | 'editar'
  const { crear, actualizar, eliminar } = useConceptoMutations();

  const actual = conceptos.find((c) => c.id === Number(conceptoId));
  const cerrar = () => setModal(null);
  const avisarError = (e) => alert(`Error: ${e.message}`);

  const abrirEditar = () => {
    if (!actual) return alert('Selecciona primero un concepto para editarlo.');
    setModal('editar');
  };

  const eliminarActual = () => {
    if (!actual) return alert('Selecciona un concepto para eliminar.');
    if (!window.confirm('¿Estás seguro de eliminar este concepto?')) return;
    eliminar.mutate(actual.id, { onSuccess: onEliminado, onError: avisarError });
  };

  return (
    <>
      <div className="concept-actions">
        <button type="button" className="btn-action btn-add" onClick={() => setModal('crear')}> + Agregar Concepto </button>
        <button type="button" className="btn-action btn-update" onClick={abrirEditar}> &gt; Editar Concepto </button>
        <button type="button" className="btn-action btn-delete" onClick={eliminarActual}> - Eliminar Concepto </button>
      </div>

      {modal === 'crear' && (
        <ConceptModal
          titulo="Agregar Nuevo Concepto"
          guardando={crear.isPending}
          onCancelar={cerrar}
          onGuardar={(data) => crear.mutate(data, { onSuccess: cerrar, onError: avisarError })}
        />
      )}

      {modal === 'editar' && (
        <ConceptModal
          titulo="Editar Concepto"
          inicial={actual}
          guardando={actualizar.isPending}
          onCancelar={cerrar}
          onGuardar={(data) =>
            actualizar.mutate({ id: actual.id, data }, { onSuccess: cerrar, onError: avisarError })
          }
        />
      )}
    </>
  );
}
