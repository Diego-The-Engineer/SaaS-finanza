import MovementFilters from './MovementFilters';
import MovementList from './MovementList';
import Pagination from './Pagination';
import '../styles/movimientos.css';

export default function MovementsPanel({
  movimientos,
  filtros,
  busqueda,
  totalPaginas,
  hayMas,
  nombreConcepto,
  nombreSucursal,
  onFiltroChange,
  onBusquedaChange,
  onPaginaChange,
  onEditar,
  onEliminar,
  onExportar,
}) {
  return (
    <div className="card">
      <div className="mov-header">
        <h2>Últimos Movimientos</h2>
        <button type="button" className="btn-action btn-add mov-export" onClick={onExportar}>
          Exportar a Excel
        </button>
      </div>

      <MovementFilters
        busqueda={busqueda}
        mes={filtros.mes}
        tipo={filtros.tipo}
        onBusquedaChange={onBusquedaChange}
        onMesChange={(valor) => onFiltroChange('mes', valor)}
        onTipoChange={(valor) => onFiltroChange('tipo', valor)}
      />

      <MovementList
        movimientos={movimientos}
        nombreConcepto={nombreConcepto}
        nombreSucursal={nombreSucursal}
        onEditar={onEditar}
        onEliminar={onEliminar}
      />

      <Pagination
        pagina={filtros.pagina}
        totalPaginas={totalPaginas}
        hayMas={hayMas}
        onCambiar={onPaginaChange}
      />
    </div>
  );
}
