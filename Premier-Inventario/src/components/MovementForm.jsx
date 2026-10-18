import { useState } from 'react';
import ConceptActions from './ConceptActions';
import SelectBuscable from './SelectBuscable';
import { OPCIONES_SUCURSAL, TIPOS } from '../constants';
import CampoMonto from './CampoMonto';
const hoy = () => new Date().toLocaleDateString('en-CA');

const estadoInicial = () => ({
  sucursalId: '',
  tipo: '',
  conceptoId: '',
  monto: '',
  fecha: hoy(),
  notas: '',
});

export default function MovementForm({ conceptos, onSubmit, guardando }) {
  const [form, setForm] = useState(estadoInicial);

  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  const cambiarTipo = (e) => setForm((prev) => ({ ...prev, tipo: e.target.value, conceptoId: '' }));

  const conceptosDelTipo = conceptos.filter((c) => c.tipo === form.tipo);
  const opcionesConcepto = conceptosDelTipo.map((c) => ({ value: c.id, label: c.nombre }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sucursalId || !form.conceptoId) {
      alert('Selecciona la sucursal y el concepto.');
      return;
    }
    const ok = await onSubmit({
      id_tipo: form.tipo,
      id_concepto: parseInt(form.conceptoId, 10),
      id_sucursal: parseInt(form.sucursalId, 10),
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      notas: form.notas,
    });
    if (ok) setForm((prev) => ({ ...prev, monto: '', notas: '' }));
  };

  return (
    <div className="card">
      <h2>Registrar Movimiento</h2>
      <form id="form-movimiento" onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label htmlFor="id_sucursal">Sucursal</label>
          <SelectBuscable
            id="id_sucursal"
            opciones={OPCIONES_SUCURSAL}
            value={form.sucursalId}
            onChange={(id) => setForm((prev) => ({ ...prev, sucursalId: id }))}
            placeholder="Buscar sucursal..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="id_tipo">Tipo</label>
          <select id="id_tipo" value={form.tipo} onChange={cambiarTipo} required>
            <option value="">Selecciona tipo...</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="id_concepto">Concepto</label>
          <SelectBuscable
            id="id_concepto"
            opciones={opcionesConcepto}
            value={form.conceptoId}
            onChange={(id) => setForm((prev) => ({ ...prev, conceptoId: id }))}
            placeholder={form.tipo ? 'Buscar concepto...' : 'Primero selecciona el Tipo...'}
            disabled={!form.tipo}
          />

          <ConceptActions
            conceptoId={form.conceptoId}
            conceptos={conceptos}
            onEliminado={() => setForm((prev) => ({ ...prev, conceptoId: '' }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="monto">Monto ($)</label>
          <CampoMonto
            id="monto"
            value={form.monto}
            onChange={(valor) => setForm((prev) => ({ ...prev, monto: valor }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha">Fecha de Operación</label>
          <input type="date" id="fecha" value={form.fecha} onChange={cambiar('fecha')} required />
        </div>

        <div className="form-group">
          <label htmlFor="notas">Notas</label>
          <textarea id="notas" rows="3" value={form.notas} onChange={cambiar('notas')} />
        </div>

        <button type="submit" disabled={guardando}>Guardar Registro</button>
      </form>
    </div>
  );
}