import '../styles/campoMonto.css';

const PASO = 10;

export default function CampoMonto({ id, value, onChange, ...props }) {
  const mover = (delta) => {
    const actual = parseFloat(value) || 0;
    const nuevo = Math.max(0, Math.round((actual + delta) * 100) / 100);
    onChange(String(nuevo));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); mover(PASO); }
    if (e.key === 'ArrowDown') { e.preventDefault(); mover(-PASO); }
  };

  return (
    <div className="campo-monto">
      <button type="button" aria-label={`Restar ${PASO}`} onClick={() => mover(-PASO)}>−</button>
      <input
        type="number"
        id={id}
        step="any"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        {...props}
      />
      <button type="button" aria-label={`Sumar ${PASO}`} onClick={() => mover(PASO)}>+</button>
    </div>
  );
}