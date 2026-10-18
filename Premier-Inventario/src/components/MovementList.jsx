import MovementItem from './MovementItem';

export default function MovementList({ movimientos, nombreConcepto, nombreSucursal, onEditar, onEliminar }) {
  if (movimientos.length === 0) {
    return <p className="mov-vacio">No se encontraron movimientos registrados.</p>;
  }

  return (
    <ul id="lista-movimientos" className="mov-list">
      {movimientos.map((m) => (
        <MovementItem
          key={m.id}
          movimiento={m}
          concepto={nombreConcepto(m.id_concepto)}
          sucursal={nombreSucursal(m.id_sucursal)}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      ))}
    </ul>
  );
}
