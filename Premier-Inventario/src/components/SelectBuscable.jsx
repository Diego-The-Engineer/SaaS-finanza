import Select from 'react-select';

export default function SelectBuscable({ id, opciones, value, onChange, placeholder = 'Buscar...', disabled = false }) {
  const seleccionada = opciones.find((o) => String(o.value) === String(value)) ?? null;

  return (
    <Select
      inputId={id}
      options={opciones}
      value={seleccionada}
      onChange={(opcion) => onChange(opcion ? String(opcion.value) : '')}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable
      noOptionsMessage={() => 'Sin resultados'}
      menuPortalTarget={document.body}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 2000 }) }}
    />
  );
}