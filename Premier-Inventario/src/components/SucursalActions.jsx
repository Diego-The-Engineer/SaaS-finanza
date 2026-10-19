import { useState } from 'react';
import { useSucursalMutations } from '../hooks/useSucursales';
import SucursalModal from './SucursalModal';

// Responsabilidad: agregar, editar y eliminar sucursales desde el formulario de movimientos.
export default function SucursalActions({ sucursalId, sucursales, onCreada, onEliminada }) {
  const [modal, setModal] = useState(null); // null | 'crear' | 'editar'
  const { crear, actualizar, eliminar } = useSucursalMutations();

  const actual = sucursales.find((s) => s.id_sucursal === Number(sucursalId));
  const cerrar = () => setModal(null);
  const avisarError = (e) => alert(`Error: ${e.message}`);

  const abrirEditar = () => {
    if (!actual) return alert('Selecciona primero una sucursal para editarla.');
    setModal('editar');
  };

  const eliminarActual = () => {
    if (!actual) return alert('Selecciona una sucursal para eliminar.');
    if (!window.confirm(`¿Eliminar la sucursal "${actual.nombre}"?`)) return;
    eliminar.mutate(actual.id_sucursal, { onSuccess: onEliminada, onError: avisarError });
  };

  return (
    <>
      <div className="concept-actions">
        <button type="button" className="btn-action btn-add" onClick={() => setModal('crear')}> + Agregar Sucursal </button>
        <button type="button" className="btn-action btn-update" onClick={abrirEditar}> &gt; Editar Sucursal </button>
        <button type="button" className="btn-action btn-delete" onClick={eliminarActual}> - Eliminar Sucursal </button>
      </div>

      {modal === 'crear' && (
        <SucursalModal
          titulo="Agregar Nueva Sucursal"
          guardando={crear.isPending}
          onCancelar={cerrar}
          onGuardar={(data) =>
            crear.mutate(data, {
              onSuccess: (respuesta) => {
                cerrar();
                onCreada?.(String(respuesta.datos.id_sucursal)); // la deja seleccionada en el formulario
              },
              onError: avisarError,
            })
          }
        />
      )}

      {modal === 'editar' && (
        <SucursalModal
          titulo="Editar Sucursal"
          inicial={actual}
          guardando={actualizar.isPending}
          onCancelar={cerrar}
          onGuardar={(data) =>
            actualizar.mutate({ id: actual.id_sucursal, data }, { onSuccess: cerrar, onError: avisarError })
          }
        />
      )}
    </>
  );
}
