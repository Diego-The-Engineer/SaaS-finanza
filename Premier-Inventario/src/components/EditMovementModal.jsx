import { useState } from 'react';
import Modal from './Modal';
import { SUCURSALES } from '../constants';
import CampoMonto from './CampoMonto';
export default function EditMovementModal({ movimiento, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => ({
    sucursalId: movimiento.id_sucursal ?? '',
    fecha: movimiento.fecha ? movimiento.fecha.split('T')[0] : '',
    monto: movimiento.monto ?? '',
    notas: movimiento.notas ?? '',
  }));
  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const guardar = () =>
  onGuardar({
    id_tipo: movimiento.id_tipo,
    fecha: form.fecha,
    id_sucursal: parseInt(form.sucursalId, 10),
    id_concepto: movimiento.id_concepto,
    monto: parseFloat(form.monto),
    notas: form.notas,
  });

  return (
    <Modal style={{ color: '#333' }}>
      <h3>Editar Movimiento</h3>

      <div className="form-group">
        <label htmlFor="edit-sucursal">Sucursal</label>
        <select id="edit-sucursal" value={form.sucursalId} onChange={cambiar('sucursalId')}>
          <option value="">Selecciona sucursal...</option>
          {SUCURSALES.map((s) => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Monto ($)</label>
        <CampoMonto
          value={form.monto}
          onChange={(valor) => setForm((prev) => ({ ...prev, monto: valor }))}
        />
      </div>

      <div className="form-group">
        <label>Fecha</label>
        <input type="date" value={form.fecha} onChange={cambiar('fecha')} />
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea rows="2" value={form.notas} onChange={cambiar('notas')} />
      </div>

      <div className="concept-actions">
        <button
          type="button"
          className="btn-action btn-update"
          disabled={guardando || !form.sucursalId}
          onClick={guardar}
        >
          Guardar Cambios
        </button>
        <button type="button" className="btn-action btn-delete" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}