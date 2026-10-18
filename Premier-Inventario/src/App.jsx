import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './style.css';

const API_URL = 'https://saas-finanza.onrender.com';

export default function Dashboard() {
    const SUCURSALES_DISPONIBLES = [
        { id: 1, nombre: "SUC. CENTRO" },
        { id: 2, nombre: "SUC. PT RIO GRANDE" },
        { id: 3, nombre: "SUC. JUQUILA 1" },
        { id: 4, nombre: "SUC. JUQUILA 2" },
        { id: 5, nombre: "SUC. PUERTO ESCONDIDO" },
        { id: 6, nombre: "SUC. POCHUTLA" },
        { id: 7, nombre: "SUC. PT SANTA MARIA" },
        { id: 8, nombre: "SUC. SANTA ROSA" },
        { id: 9, nombre: "SUC. XOXOCOTLAN" },
        { id: 10, nombre: "SUC. PT OCTAVA NORTE" },
        { id: 11, nombre: "SUC. PT MACROPLAZA" },
        { id: 12, nombre: "SUC. PT BAHIAS DE HUATULCO" },
        { id: 13, nombre: "SUC. RIO GRANDE" }
    ];

    const [sucursalId, setSucursalId] = useState('');
    const [tipo, setTipo] = useState('');
    const [concepto, setConcepto] = useState('');
    const [monto, setMonto] = useState('');
    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
    const [notas, setNotas] = useState('');

    const [pagina, setPagina] = useState(1);
    const page = 5;
    const [conceptosLista, setConceptosLista] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [filtroMes, setFiltroMes] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [notasVisibles, setNotasVisibles] = useState({});

    const [modalAgregarAbierto, setModalAgregarAbierto] = useState(false);
    const [modalActualizarAbierto, setModalActualizarAbierto] = useState(false);
    const [formConcepto, setFormConcepto] = useState({
        nombre: '',
        tipo: 'Ingreso',
        categoria_padre: ''
    });

    const chartIngresosRef = useRef(null);
    const chartEgresosRef = useRef(null);
    const chartIngresosInstance = useRef(null);
    const chartEgresosInstance = useRef(null);

    const toggleNota = (id) => {
        setNotasVisibles((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const cargarConceptos = async () => {
        try {
            const res = await fetch(`${API_URL}/conceptos`);
            if (res.ok) {
                const data = await res.json();
                setConceptosLista(data);
            }
        } catch (error) {
            console.error("Error al cargar conceptos:", error);
        }
    };

    const cargarMovimientos = async () => {
        try {
            const params = new URLSearchParams();
            if (filtroTipo) params.append('tipo', filtroTipo);
            if (filtroMes) params.append('mes', parseInt(filtroMes, 10));
            if(busqueda) params.append('q', busqueda);
            params.append('limit', page)
            params.append('offset', (pagina - 1) * page)
            const res = await fetch(`${API_URL}/transacciones?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setMovimientos(data);
                setBusqueda('');
            }
        } catch (error) {
            console.error("Error al cargar movimientos:", error);
        }
    };

    const handleBusquedaChange = (e) => {
      setBusqueda(e.target.value)
    }

    const numero = movimientos.length

    useEffect(() => {
        cargarConceptos();
    }, []);

    useEffect(() => {
        cargarMovimientos();
    }, [filtroMes, filtroTipo, pagina]);

    useEffect(() => {
        if (!chartIngresosRef.current || !chartEgresosRef.current) return;

        if (chartIngresosInstance.current) chartIngresosInstance.current.destroy();
        if (chartEgresosInstance.current) chartEgresosInstance.current.destroy();

        const mapaConceptos = {};
        conceptosLista.forEach(c => { mapaConceptos[c.id] = c.nombre; });

        const ingresosAgrupados = {};
        const egresosAgrupados = {};

        movimientos.forEach(m => {
            const nombreConcepto = mapaConceptos[m.id_concepto] || `Concepto #${m.id_concepto}`;
            if (m.id_tipo === 'Ingreso') {
                ingresosAgrupados[nombreConcepto] = (ingresosAgrupados[nombreConcepto] || 0) + m.monto;
            } else if (m.id_tipo === 'Egreso') {
                egresosAgrupados[nombreConcepto] = (egresosAgrupados[nombreConcepto] || 0) + m.monto;
            }
        });

        chartIngresosInstance.current = new Chart(chartIngresosRef.current, {
            type: 'doughnut',
            data: {
                labels: Object.keys(ingresosAgrupados),
                datasets: [{
                    data: Object.values(ingresosAgrupados),
                    backgroundColor: ['#4caf50', '#2196f3', '#00bcd4', '#8bc34a', '#ffc107']
                }]
            }
        });

        chartEgresosInstance.current = new Chart(chartEgresosRef.current, {
            type: 'doughnut',
            data: {
                labels: Object.keys(egresosAgrupados),
                datasets: [{
                    data: Object.values(egresosAgrupados),
                    backgroundColor: ['#f44336', '#ff9800', '#e91e63', '#9c27b0', '#795548']
                }]
            }
        });
    }, [movimientos, conceptosLista]);

    const handleGuardarMovimiento = async (e) => {
        e.preventDefault();
        const payload = {
            id_tipo: tipo,
            id_concepto: parseInt(concepto, 10),
            id_sucursal: parseInt(sucursalId, 10),
            monto: parseFloat(monto),
            notas: notas
        };

        try {
            const res = await fetch(`${API_URL}/transacciones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setMonto('');
                setNotas('');
                cargarMovimientos();
            } else {
                const err = await res.json();
                alert(`Error: ${err.detail || 'No se pudo guardar'}`);
            }
        } catch (error) {
            console.error("Error al guardar movimiento:", error);
        }
    };

    const handleCrearConcepto = async () => {
        const res = await fetch(`${API_URL}/conceptos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formConcepto)
        });
        if (res.ok) {
            setModalAgregarAbierto(false);
            setFormConcepto({ nombre: '', tipo: 'Ingreso', categoria_padre: '' });
            cargarConceptos();
        }
    };

    const abrirModalEditar = () => {
        if (!concepto) return alert("Selecciona primero un concepto para editarlo.");
        const obj = conceptosLista.find(c => c.id === parseInt(concepto, 10));
        if (obj) {
            setFormConcepto({
                nombre: obj.nombre,
                tipo: obj.tipo,
                categoria_padre: obj.categoria_padre || ''
            });
        }
        setModalActualizarAbierto(true);
    };

    const handleActualizarConcepto = async () => {
        const res = await fetch(`${API_URL}/conceptos/${concepto}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formConcepto)
        });
        if (res.ok) {
            setModalActualizarAbierto(false);
            cargarConceptos();
        }
    };

    const handleEliminarConcepto = async () => {
        if (!concepto) return alert("Selecciona un concepto para eliminar.");
        if (window.confirm("¿Estás seguro de eliminar este concepto?")) {
            const res = await fetch(`${API_URL}/conceptos/${concepto}`, { method: 'DELETE' });
            if (res.ok) {
                setConcepto('');
                cargarConceptos();
            }
        }
    };

    const obtenerNombreConcepto = (id) => {
        const c = conceptosLista.find(item => item.id === id);
        return c ? c.nombre : `Concepto #${id}`;
    };

    const obtenerNombreSucursal = (id) => {
        const s = SUCURSALES_DISPONIBLES.find(item => item.id === id);
        return s ? s.nombre : 'Sin sucursal';
    };

    const movimientosFiltrados = movimientos.filter(mov => {
        const buscar = busqueda.toLowerCase().replace(/\s+/g, '');
        if (!buscar) return true;

        const conceptoObj = conceptosLista.find(c => c.id === mov.id_concepto);
        const nombreConcepto = conceptoObj ? conceptoObj.nombre.toLowerCase().replace(/\s+/g, '') : '';
        
        const nombreSucursal = obtenerNombreSucursal(mov.id_sucursal).toLowerCase().replace(/\s+/g, '');
        const notasMovimientos = (mov.notas || '').toLowerCase().replace(/\s+/g, '');
        return (
          nombreConcepto.includes(buscar) ||
          nombreSucursal.includes(buscar) || 
          notasMovimientos.includes(buscar)
        )
    });

    const handleExportarCSV = () => {
        const encabezados = ["ID", "Fecha", "Sucursal", "Tipo", "Concepto", "Monto", "Notas"];
        const filas = movimientosFiltrados.map(m => [
            m.id,
            m.fecha ? m.fecha.split('T')[0] : '',
            `"${obtenerNombreSucursal(m.id_sucursal)}"`,
            m.id_tipo,
            `"${obtenerNombreConcepto(m.id_concepto)}"`,
            m.monto,
            `"${(m.notas || '').replace(/"/g, '""')}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [encabezados.join(","), ...filas.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "reporte_finanzas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container">
            <h1>Pre<bold>mier</bold> - Sistema de inventario</h1>

            <div className="card">
                <h2>Registrar Movimiento</h2>
                <form id="form-movimiento" onSubmit={handleGuardarMovimiento}>
                    <div className="form-group">
                        <label htmlFor="id_sucursal">Sucursal</label>
                        <select id="id_sucursal" value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} required>
                            <option value="">Selecciona sucursal...</option>
                            {SUCURSALES_DISPONIBLES.map((suc) => (
                                <option key={suc.id} value={suc.id}>{suc.nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_tipo">Tipo</label>
                        <select id="id_tipo" value={tipo} onChange={(e) => { setTipo(e.target.value); setConcepto(''); }} required>
                            <option value="">Selecciona tipo...</option>
                            <option value="Ingreso">Ingreso</option>
                            <option value="Egreso">Egreso</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="id_concepto">Concepto</label>
                        <select id="id_concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} required disabled={!tipo}>
                            <option value="">{tipo ? "Selecciona un concepto..." : "Primero selecciona el Tipo..."}</option>
                            {conceptosLista.filter(c => c.tipo === tipo).map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>

                        <div className="concept-actions">
                            <button type="button" className="btn-action btn-add" onClick={() => setModalAgregarAbierto(true)}> + Agregar Concepto </button>
                            <button type="button" className="btn-action btn-update" onClick={abrirModalEditar}> &gt; Editar Concepto </button>
                            <button type="button" className="btn-action btn-delete" onClick={handleEliminarConcepto}> - Eliminar Concepto </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="monto">Monto ($)</label>
                        <input type="number" id="monto" step="10" min={0} value={monto} onChange={(e) => setMonto(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fecha">Fecha de Operación</label>
                        <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notas">Notas</label>
                        <textarea id="notas" rows="3" value={notas} onChange={(e) => setNotas(e.target.value)} />
                    </div>

                    <button type="submit">Guardar Registro</button>
                </form>
            </div>

            <div className="card">
                <h2>Gráficas de Rendimiento</h2>
                <div className="flex-charts">
                    <div className="chart-container">
                        <h3>Ingresos por Categoría</h3>
                        <canvas id="graficoIngresos" ref={chartIngresosRef}></canvas>
                    </div>
                    <div className="chart-container">
                        <h3>Egresos por Categoría</h3>
                        <canvas id="graficoEgresos" ref={chartEgresosRef}></canvas>
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Últimos Movimientos</h2>
                    <button type="button" onClick={handleExportarCSV} className="btn-action btn-add" style={{ width: 'auto', padding: '10px 18px' }}>
                        Exportar a CSV
                    </button>
                </div>

                <div className="filters">
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                        <input type="text" placeholder="Buscar por concepto, nota o sucursal..." value={busqueda} onChange={handleBusquedaChange}/>
                    </div>

                    <label htmlFor="filtro-mes">Filtrar por Mes</label>
                    <select id="filtro-mes" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                        <option value="">Todos los meses</option>
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                    </select>
                    
                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={() => setFiltroTipo('')}>Todos</button>
                        <button type="button" onClick={() => setFiltroTipo('Ingreso')}>Ingresos</button>
                        <button type="button" onClick={() => setFiltroTipo('Egreso')}>Egresos</button>
                    </div>
                </div>

                <ul id="lista-movimientos" style={{ padding: 0 }}>
                    {movimientosFiltrados.length === 0 ? (
                        <li style={{ color: '#888', textAlign: 'center', padding: '20px 0', listStyle: 'none' }}>
                            No se encontraron movimientos registrados.
                        </li>
                    ) : (
                        movimientosFiltrados.map((mov) => (
                            <li 
                                key={mov.id} 
                                style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'stretch',
                                    padding: '14px 18px', 
                                    marginBottom: '10px',
                                    backgroundColor: '#262626',
                                    borderRadius: '8px',
                                    border: '1px solid #363636',
                                    listStyle: 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '15px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', textAlign: 'left' }}>
                                        <span style={{ backgroundColor: '#1a1a1a', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#bbb', fontFamily: 'monospace' }}>
                                            {mov.fecha ? mov.fecha.split('T')[0] : ''}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#999', backgroundColor: '#333', padding: '3px 8px', borderRadius: '4px' }}>
                                            {obtenerNombreSucursal(mov.id_sucursal)}
                                        </span>
                                        <strong style={{ fontSize: '1rem', color: '#fff' }}>
                                            {obtenerNombreConcepto(mov.id_concepto)}
                                        </strong>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: mov.id_tipo === 'Ingreso' ? '#4caf50' : '#ff5252', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            {"\$" + Number(mov.monto).toFixed(2)}
                                        </span>

                                        {mov.notas && mov.notas.trim() !== '' && (
                                            <button 
                                                type="button"
                                                onClick={() => toggleNota(mov.id)}
                                                style={{
                                                    backgroundColor: notasVisibles[mov.id] ? '#444' : 'transparent',
                                                    border: '1px solid #555',
                                                    color: '#ddd',
                                                    padding: '4px 10px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    width: 'auto',
                                                    margin: 0
                                                }}
                                            >
                                                {notasVisibles[mov.id] ? '▲ Ocultar' : '▼ Ver más'}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {mov.notas && notasVisibles[mov.id] && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        paddingTop: '10px', 
                                        borderTop: '1px dashed #444', 
                                        color: '#ccc', 
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        lineHeight: '1.4'
                                    }}>
                                        <strong style={{ color: '#888' }}>Nota: </strong> {mov.notas}
                                    </div>
                                )}
                            </li>
                        ))
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
    <button 
        type="button" 
        onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
        disabled={pagina === 1}
        style={{ padding: '8px 15px', width: 'auto' }}
    >
        ◀ Anterior
    </button>
    
    <span style={{ color: '#aaa' }}>Página {pagina} de {numero}</span>

    <button 
        type="button" 
        onClick={() => setPagina(prev => prev + 1)}
        disabled={movimientos.length < page}
        style={{ padding: '8px 15px', width: 'auto' }}
    >
        Siguiente ▶
    </button>
</div>
                </ul>
            </div>
            
            {modalAgregarAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h3>Agregar Nuevo Concepto</h3>
                        <div className="form-group">
                            <label>Nombre del Concepto:</label>
                            <input type="text" value={formConcepto.nombre} onChange={(e) => setFormConcepto({...formConcepto, nombre: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Tipo:</label>
                            <select value={formConcepto.tipo} onChange={(e) => setFormConcepto({...formConcepto, tipo: e.target.value})}>
                                <option value="Ingreso">Ingreso</option>
                                <option value="Egreso">Egreso</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Categoría Padre:</label>
                            <input type="text" value={formConcepto.categoria_padre} onChange={(e) => setFormConcepto({...formConcepto, categoria_padre: e.target.value})} />
                        </div>
                        <div className="concept-actions">
                            <button type="button" className="btn-action btn-add" onClick={handleCrearConcepto}>Guardar</button>
                            <button type="button" className="btn-action btn-delete" onClick={() => setModalAgregarAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalActualizarAbierto && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <h3>Editar Concepto</h3>
                        <div className="form-group">
                            <label>Nuevo nombre del Concepto:</label>
                            <input type="text" value={formConcepto.nombre} onChange={(e) => setFormConcepto({...formConcepto, nombre: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Tipo:</label>
                            <select value={formConcepto.tipo} onChange={(e) => setFormConcepto({...formConcepto, tipo: e.target.value})}>
                                <option value="Ingreso">Ingreso</option>
                                <option value="Egreso">Egreso</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Categoría Padre:</label>
                            <input type="text" value={formConcepto.categoria_padre} onChange={(e) => setFormConcepto({...formConcepto, categoria_padre: e.target.value})} />
                        </div>
                        <div className="concept-actions">
                            <button type="button" className="btn-action btn-add" onClick={handleActualizarConcepto}>Guardar</button>
                            <button type="button" className="btn-action btn-delete" onClick={() => setModalActualizarAbierto(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}