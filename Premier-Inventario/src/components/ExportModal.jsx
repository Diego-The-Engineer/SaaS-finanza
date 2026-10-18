import { useState } from 'react';
import Modal from './Modal';

const hoy = () => new Date().toLocaleDateString('en-CA');

const OPCIONES_TIPO = [
  { valor: '', etiqueta: 'Ingresos y egresos' },
  { valor: 'Ingreso', etiqueta: 'Solo ingresos' },
  { valor: 'Egreso', etiqueta: 'Solo egresos' },
];

const OPCIONES_PERIODO = [
  { valor: 'todo', etiqueta: 'Todos los registros' },
  { valor: 'dia', etiqueta: 'Un día' },
  { valor: 'mes', etiqueta: 'Un mes' },
  { valor: 'anio', etiqueta: 'Un año' },
];

export default function ExportModal({ onExportar, onCancelar, exportando }) {
  const [tipo, setTipo] = useState('');
  const [periodo, setPeriodo] = useState('todo');
  const [dia, setDia] = useState(hoy);
  const [mes, setMes] = useState(() => hoy().slice(0, 7));
  const [anio, setAnio] = useState(() => new Date().getFullYear());

  const incompleto =
    (periodo === 'dia' && !dia) || (periodo === 'mes' && !mes) || (periodo === 'anio' && !anio);

  return (
    <Modal style={{ color: '#333' }}>
      <h3>Exportar a Excel</h3>

      <fieldset className="export-opciones">
        <legend>Tipo de movimiento</legend>
        {OPCIONES_TIPO.map((o) => (
          <label key={o.valor}>
            <input type="radio" name="export-tipo" checked={tipo === o.valor} onChange={() => setTipo(o.valor)} />
            {o.etiqueta}
          </label>
        ))}
      </fieldset>

      <fieldset className="export-opciones">
        <legend>Periodo</legend>
        {OPCIONES_PERIODO.map((o) => (
          <label key={o.valor}>
            <input type="radio" name="export-periodo" checked={periodo === o.valor} onChange={() => setPeriodo(o.valor)} />
            {o.etiqueta}
          </label>
        ))}
      </fieldset>

      {periodo === 'dia' && (
        <div className="form-group">
          <label>Día</label>
          <input type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
        </div>
      )}
      {periodo === 'mes' && (
        <div className="form-group">
          <label>Mes</label>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
        </div>
      )}
      {periodo === 'anio' && (
        <div className="form-group">
          <label>Año</label>
          <input type="number" min="2000" max="2100" value={anio} onChange={(e) => setAnio(e.target.value)} />
        </div>
      )}

      <div className="concept-actions">
        <button
          type="button"
          className="btn-action btn-add"
          disabled={exportando || incompleto}
          onClick={() => onExportar({ tipo, periodo, dia, mes, anio })}
        >
          {exportando ? 'Generando...' : 'Descargar Excel'}
        </button>
        <button type="button" className="btn-action btn-delete" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}