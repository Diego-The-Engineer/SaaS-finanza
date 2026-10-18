export default function Pagination({ pagina, totalPaginas, hayMas, onCambiar }) {
  return (
    <div className="paginacion">
      <button type="button" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}>
        ◀ Anterior
      </button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button type="button" onClick={() => onCambiar(pagina + 1)} disabled={!hayMas}>
        Siguiente ▶
      </button>
    </div>
  );
}
