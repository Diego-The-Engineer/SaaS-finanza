import { useState } from 'react';
import ConceptActions from './ConceptActions';
import SelectBuscable from './SelectBuscable';
import SucursalActions from './SucursalActions';
import { TIPOS } from '../constants';

const hoy = () => new Date().toLocaleDateString('en-CA');

const estadoInicial = () => ({
  sucursalId: '',
  tipo: '',
  conceptoId: '',
  monto: '',
  fecha: hoy(),
  notas: '',
});

export default function MovementForm({ conceptos, sucursales, onSubmit, guardando }) {
  const [form, setForm] = useState(estadoInicial);

  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  const cambiarTipo = (e) => setForm((prev) => ({ ...prev, tipo: e.target.value, conceptoId: '' }));

  const conceptosDelTipo = conceptos.filter((c) => c.tipo === form.tipo);
  const opcionesConcepto = conceptosDelTipo.map((c) => ({ value: c.id, label: c.nombre }));
  const opcionesSucursal = sucursales?.map((s) => ({ value: s.id_sucursal, label: s.nombre })) || [];

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
            opciones={opcionesSucursal}
            value={form.sucursalId}
            onChange={(id) => setForm((prev) => ({ ...prev, sucursalId: id }))}
            placeholder="Buscar sucursal..."
          />
          <SucursalActions 
            sucursales={sucursales}
            sucursalId={form.sucursalId} 
            onCreada={(nuevaId) => setForm((prev) => ({ ...prev, sucursalId: nuevaId }))}
            onEliminada={() => setForm((prev) => ({ ...prev, sucursalId: '' }))}
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
          <input type="number" id="monto" step="10" min={0} value={form.monto} onChange={cambiar('monto')} required />
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