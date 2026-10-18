import { useCallback, useMemo, useState } from 'react';
import { PAGE_SIZE, nombreSucursal } from '../constants';
import { useConceptos } from '../hooks/useConceptos';
import { useFiltrosMovimientos } from '../hooks/useFiltrosMovimientos';
import { formatMonto } from '../utils/movimientos';
import MovementForm from '../components/MovementForm';
import ChartsPanel from '../components/ChartsPanel';
import MovementsPanel from '../components/MovementsPanel';
import EditMovementModal from '../components/EditMovementModal';
import { useExportarExcel } from '../hooks/useExportarExcel';
import ExportModal from '../components/ExportModal';
import { useMovimientos, useMovimientoMutations, useResumen, useTotalMovimientos } from '../hooks/useMovimientos';
import { useAuth } from '../auth/AuthContext';

const LISTA_VACIA = [];

export default function Dashboard() {

  const { filtros, busqueda, setBusqueda, cambiarFiltro, irAPagina } = useFiltrosMovimientos();
  const { cerrarSesion } = useAuth();
  const [movEditando, setMovEditando] = useState(null);
  const [mostrarExportar, setMostrarExportar] = useState(false);
  const { data: movimientos = LISTA_VACIA } = useMovimientos({ ...filtros, pageSize: PAGE_SIZE });
  const { data: resumen = LISTA_VACIA } = useResumen(filtros);
  const { data: total = 0 } = useTotalMovimientos(filtros);
  const { crear, actualizar, eliminar } = useMovimientoMutations();
  const { data: conceptos = LISTA_VACIA } = useConceptos();
  const nombreConcepto = useCallback(
    (id) => conceptos.find((c) => c.id === id)?.nombre ?? `Concepto #${id}`,
    [conceptos]
  );
  const { exportando, exportar } = useExportarExcel(nombreConcepto);
  

  const totalPaginas = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const guardarMovimiento = async (payload) => {
    try {
      await crear.mutateAsync(payload);
      return true;
    } catch (e) {
      alert(`Error: ${e.message}`);
      return false;
    }
  };

  const actualizarMovimiento = (data) =>
    actualizar.mutate(
      { id: movEditando.id, data },
      {
        onSuccess: () => setMovEditando(null),
        onError: (e) => alert(`Error al actualizar: ${e.message}`),
      }
    );

    const eliminarMovimiento = (mov) => {
    const detalle = `${nombreConcepto(mov.id_concepto)} por ${formatMonto(mov.monto)}`;
    if (!window.confirm(`¿Eliminar este movimiento?\n${detalle}`)) return;

    eliminar.mutate(mov.id, {
            onSuccess: () => {

            if (movimientos.length === 1 && filtros.pagina > 1) irAPagina(filtros.pagina - 1);
            },
            onError: (e) => alert(`Error al eliminar: ${e.message}`),
        });
    };

  return (
    <div className="container">
      <div className="barra-superior">
        <h1>Pre<strong>mier</strong> - Sistema de inventario</h1>
        <button type="button" className="btn-salir" onClick={cerrarSesion}>Cerrar sesión</button>
      </div>

      <MovementForm conceptos={conceptos} onSubmit={guardarMovimiento} guardando={crear.isPending} />

      <ChartsPanel resumen={resumen} nombreConcepto={nombreConcepto} />

      <MovementsPanel
        movimientos={movimientos}
        filtros={filtros}
        busqueda={busqueda}
        totalPaginas={totalPaginas}
        hayMas={movimientos.length === PAGE_SIZE}
        nombreConcepto={nombreConcepto}
        nombreSucursal={nombreSucursal}
        onFiltroChange={cambiarFiltro}
        onBusquedaChange={setBusqueda}
        onPaginaChange={irAPagina}
        onEditar={setMovEditando}
        onEliminar={eliminarMovimiento}
        onExportar={() => setMostrarExportar(true)}
      />

      {movEditando && (
        <EditMovementModal
          key={movEditando.id}
          movimiento={movEditando}
          guardando={actualizar.isPending}
          onGuardar={actualizarMovimiento}
          onCancelar={() => setMovEditando(null)}
        />
      )}
      {mostrarExportar && (
        <ExportModal
            exportando={exportando}
            onCancelar={() => setMostrarExportar(false)}
            onExportar={async (opciones) => {
            if (await exportar(opciones)) setMostrarExportar(false);
            }}
        />
    )}
    </div>
  );
}
