import { useState } from 'react';
import { formatMonto, soloFecha } from '../utils/movimientos';
import {Trash, SquarePen} from 'lucide-react'
export default function MovementItem({ movimiento, concepto, sucursal, onEditar, onEliminar }) {
  const [notaVisible, setNotaVisible] = useState(false);
  const tieneNota = Boolean(movimiento.notas?.trim());
  const esIngreso = movimiento.id_tipo === 'Ingreso';

  return (
    <li className="mov-item">
      <div className="mov-row">
        <div className="mov-info">
          <span className="mov-fecha">{soloFecha(movimiento.fecha)}</span>
          <span className="mov-sucursal">{sucursal}</span>
          <strong className="mov-concepto">{concepto}</strong>
        </div>

        <div className="mov-acciones">
          <span className={`mov-monto ${esIngreso ? 'mov-monto--ingreso' : 'mov-monto--egreso'}`}>
            {formatMonto(movimiento.monto)}
          </span>

          {tieneNota && (
            <button
              type="button"
              className={`mov-btn mov-btn--nota ${notaVisible ? 'activo' : ''}`}
              onClick={() => setNotaVisible((v) => !v)}
            >
              {notaVisible ? '▲ Ocultar' : '▼ Ver más'}
            </button>
          )}

          <button type="button" className="mov-btn mov-btn--editar" onClick={() => onEditar(movimiento)}>
            <SquarePen />
          </button>
          <button type="button" className="mov-btn mov-btn--eliminar" onClick={() => onEliminar(movimiento)}>
            <Trash />
          </button>
        </div>
      </div>

      {tieneNota && notaVisible && (
        <div className="mov-nota">
          <strong>Nota: </strong>{movimiento.notas}
        </div>
      )}
    </li>
  );
}
