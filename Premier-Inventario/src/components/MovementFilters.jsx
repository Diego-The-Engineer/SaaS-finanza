import { MESES } from '../constants';

const FILTROS_TIPO = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'Ingreso', etiqueta: 'Ingresos' },
  { valor: 'Egreso', etiqueta: 'Egresos' },
];

export default function MovementFilters({ busqueda, mes, tipo, onBusquedaChange, onMesChange, onTipoChange }) {
  return (
    <div className="filters">
      <div className="form-group filtros-busqueda">
        <input
          type="text"
          placeholder="Buscar por concepto, nota o sucursal..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
        />
      </div>

      <label htmlFor="filtro-mes">Filtrar por Mes</label>
      <select id="filtro-mes" value={mes} onChange={(e) => onMesChange(e.target.value)}>
        <option value="">Todos los meses</option>
        {MESES.map((m) => (
          <option key={m.valor} value={m.valor}>{m.nombre}</option>
        ))}
      </select>

      <div className="filtros-botones">
        {FILTROS_TIPO.map((f) => (
          <button key={f.valor} type="button" aria-pressed={tipo === f.valor} onClick={() => onTipoChange(f.valor)}>
            {f.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
