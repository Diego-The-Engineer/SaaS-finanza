import { useState } from 'react';
import Modal from './Modal';


export default function SucursalModal({ titulo, inicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => ({
    nombre: inicial?.nombre ?? '',
    ubicacion: inicial?.ubicacion ?? '',
  }));
  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  return (
    <Modal style={{ color: '#333' }}>
      <h3>{titulo}</h3>

      <div className="form-group">
        <label>Nombre de la sucursal:</label>
        <input type="text" value={form.nombre} onChange={cambiar('nombre')} autoFocus />
      </div>

      <div className="form-group">
        <label>Ubicación (opcional):</label>
        <input type="text" value={form.ubicacion} onChange={cambiar('ubicacion')} />
      </div>

      <div className="concept-actions">
        <button
          type="button"
          className="btn-action btn-add"
          disabled={guardando || !form.nombre.trim()}
          onClick={() => onGuardar({ nombre: form.nombre.trim(), ubicacion: form.ubicacion.trim() })}
        >
          Guardar
        </button>
        <button type="button" className="btn-action btn-delete" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
