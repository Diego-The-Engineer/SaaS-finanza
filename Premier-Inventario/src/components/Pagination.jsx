import {ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight} from 'lucide-react'

export default function Pagination({ pagina, totalPaginas, hayMas, onCambiar }) {
  return (
    <div className="paginacion">
      <button type="button" onClick={() => onCambiar(1)} disabled={pagina === 1}>
        <ChevronsLeft />
      </button>
      <button type="button" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 1}>
        <ChevronLeft />
      </button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button type="button" onClick={() => onCambiar(pagina + 1)} disabled={!hayMas}>
        <ChevronRight />
      </button>
      <button type="button" onClick={() => onCambiar(totalPaginas)} disabled={!hayMas}>
        <ChevronsRight />
      </button>
    </div>
  );
}
