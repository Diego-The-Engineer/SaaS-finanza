const URL_API = '/api/transacciones';
const URL_CONCEPTOS = '/api/conceptos';
let catalogo = [], filtroActual = '', graficoIng = null, graficoEgr = null;

document.addEventListener('DOMContentLoaded', async () => {
    await cargarConceptos();
    cargarMovimientos();
});

document.getElementById('id_tipo').addEventListener('change', actualizarMenuConceptos);

async function cargarConceptos() {
    const res = await fetch(URL_CONCEPTOS);
    catalogo = await res.json();
}

function actualizarMenuConceptos() {
    const tipo = document.getElementById('id_tipo').value;
    const select = document.getElementById('id_concepto');
    select.innerHTML = '<option value="">Selecciona concepto...</option>';
    catalogo.filter(c => c.tipo === tipo).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id; opt.textContent = `${c.categoria_padre} - ${c.nombre}`;
        select.appendChild(opt);
    });
}

function filtrarTipo(tipo) { filtroActual = tipo; cargarMovimientos(); }

async function cargarMovimientos() {
    const mes = document.getElementById('filtro-mes').value;
    let url = `${URL_API}?${filtroActual ? 'tipo='+filtroActual : ''}&${mes ? 'mes='+mes : ''}`;
    const res = await fetch(url);
    const movs = await res.json();
    renderizarLista(movs);
    actualizarGraficas(movs);
}

function renderizarLista(movs) {
    const lista = document.getElementById('lista-movimientos');
    lista.innerHTML = '';
    movs.forEach(m => {
        const cat = catalogo.find(c => c.id === m.id_concepto);
        const li = document.createElement('li');
        li.className = m.id_tipo === 'Ingreso' ? 'es-ingreso' : 'es-egreso';
        li.innerHTML = `<div><strong>${m.id_tipo} - ${cat ? cat.nombre : '...'}</strong><br><small>${new Date(m.fecha).toLocaleDateString()} | ${m.notas}</small></div>
                        <div><span>$${m.monto.toFixed(2)}</span><button onclick="eliminar(${m.id})">X</button></div>`;
        lista.appendChild(li);
    });
}

function actualizarGraficas(movs) {
    dibujarGrafica('graficoIngresos', movs.filter(m => m.id_tipo === 'Ingreso'), (ins) => graficoIng = ins, graficoIng);
    dibujarGrafica('graficoEgresos', movs.filter(m => m.id_tipo === 'Egreso'), (ins) => graficoEgr = ins, graficoEgr);
}

function dibujarGrafica(id, data, setter, inst) {
    const tot = {};
    data.forEach(m => { const c = catalogo.find(x => x.id === m.id_concepto); const cat = c ? c.categoria_padre : 'Otros'; tot[cat] = (tot[cat] || 0) + m.monto; });
    if (inst) inst.destroy();
    setter(new Chart(document.getElementById(id), { type: 'doughnut', data: { labels: Object.keys(tot), datasets: [{ data: Object.values(tot), backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336'] }] }, options: { plugins: { legend: { labels: { color: 'white' } } } } }));
}

async function eliminar(id) { await fetch(`${URL_API}/${id}`, { method: 'DELETE' }); cargarMovimientos(); }

document.getElementById('form-movimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(URL_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_tipo: document.getElementById('id_tipo').value, id_concepto: parseInt(document.getElementById('id_concepto').value), monto: parseFloat(document.getElementById('monto').value), notas: document.getElementById('notas').value }) });
    e.target.reset(); cargarMovimientos();
});
