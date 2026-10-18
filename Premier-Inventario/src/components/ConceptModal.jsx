import { useState } from 'react';
import Modal from './Modal';
import { TIPOS } from '../constants';


export default function ConceptModal({ titulo, inicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => ({
    nombre: inicial?.nombre ?? '',
    tipo: inicial?.tipo ?? 'Ingreso',
    categoria_padre: inicial?.categoria_padre ?? '',
  }));
  const cambiar = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  return (
    <Modal>
      <h3>{titulo}</h3>
      <div className="form-group">
        <label>Nombre del Concepto:</label>
        <input type="text" value={form.nombre} onChange={cambiar('nombre')} />
      </div>
      <div className="form-group">
        <label>Tipo:</label>
        <select value={form.tipo} onChange={cambiar('tipo')}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Categoría Padre:</label>
        <input type="text" value={form.categoria_padre} onChange={cambiar('categoria_padre')} />
      </div>
      <div className="concept-actions">
        <button type="button" className="btn-action btn-add" disabled={guardando} onClick={() => onGuardar(form)}>
          Guardar
        </button>
        <button type="button" className="btn-action btn-delete" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
