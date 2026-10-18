export const PAGE_SIZE = 10;

export const TIPOS = ['Ingreso', 'Egreso'];

export const SUCURSALES = [
  { id: 1, nombre: 'SUC. CENTRO' },
  { id: 2, nombre: 'SUC. PT RIO GRANDE' },
  { id: 3, nombre: 'SUC. JUQUILA 1' },
  { id: 4, nombre: 'SUC. JUQUILA 2' },
  { id: 5, nombre: 'SUC. PUERTO ESCONDIDO' },
  { id: 6, nombre: 'SUC. POCHUTLA' },
  { id: 7, nombre: 'SUC. PT SANTA MARIA' },
  { id: 8, nombre: 'SUC. SANTA ROSA' },
  { id: 9, nombre: 'SUC. XOXOCOTLAN' },
  { id: 10, nombre: 'SUC. PT OCTAVA NORTE' },
  { id: 11, nombre: 'SUC. PT MACROPLAZA' },
  { id: 12, nombre: 'SUC. PT BAHIAS DE HUATULCO' },
  { id: 13, nombre: 'SUC. RIO GRANDE' },
];

export const MESES = [
  { valor: '01', nombre: 'Enero' },
  { valor: '02', nombre: 'Febrero' },
  { valor: '03', nombre: 'Marzo' },
  { valor: '04', nombre: 'Abril' },
  { valor: '05', nombre: 'Mayo' },
  { valor: '06', nombre: 'Junio' },
  { valor: '07', nombre: 'Julio' },
  { valor: '08', nombre: 'Agosto' },
  { valor: '09', nombre: 'Septiembre' },
  { valor: '10', nombre: 'Octubre' },
  { valor: '11', nombre: 'Noviembre' },
  { valor: '12', nombre: 'Diciembre' },
];

const sucursalPorId = new Map(SUCURSALES.map((s) => [s.id, s.nombre]));
export const nombreSucursal = (id) => sucursalPorId.get(id) ?? 'Sin sucursal';
