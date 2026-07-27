const API_BASE_URL = 'https://saas-finanza.onrender.com';

const api = {
    get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`).then(res => res.json()),
    post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }),
    delete: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' })
};

let catalogo = [], filtroActual = '', graficoIng = null, graficoEgr = null;

document.addEventListener('DOMContentLoaded', async () => {
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        inputFecha.value = new Date().toISOString().split('T')[0];
    }
    const conexionExitosa = await verificarConexion();
    if (conexionExitosa) {
        catalogo = await api.get('/conceptos');
        await cargarMovimientos();
    } else {
        console.warn("La inicializacion se detuvo porque verificarConexion devolvio false.");
    }
});

async function verificarConexion() {
    try {
        const response = await fetch(`${API_BASE_URL}/conceptos`);
        if (!response.ok) {
            console.error("Servidor respondio con estatus:", response.status);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Fallo el fetch en verificarConexion:", error);
        return false;
    }
}

document.getElementById("btnAgregar").addEventListener("click", () => {
    const nombre = prompt("Nombre del nuevo concepto:");
    const tipo = document.getElementById("tipoInput").value; 
    const categoria = prompt("Categoría:");
    const id_concepto = Math.floor(Math.random() * 1000); 
    if (nombre && tipo && categoria) {
        crearConcepto({ id_concepto, nombre, tipo, categoria });
    }
});

document.getElementById("btnActualizar").addEventListener("click", () => {
    const selectConcepto = document.getElementById("selectConcepto"); 
    const idSeleccionado = selectConcepto.value;

    if (!idSeleccionado) {
        alert("Selecciona un concepto para actualizar.");
        return;
    }

    const nuevoNombre = prompt("Nuevo nombre para el concepto:");
    if (nuevoNombre) {
        actualizarConcepto(idSeleccionado, {
            id_concepto: parseInt(idSeleccionado),
            nombre: nuevoNombre,
            tipo: "ingreso", 
            categoria: "general"
        });
    }
});

document.getElementById("btnEliminar").addEventListener("click", async () => {
    const selectConcepto = document.getElementById("selectConcepto");
    const idSeleccionado = selectConcepto.value;

    if (!idSeleccionado) {
        alert("Selecciona un concepto para eliminar.");
        return;
    }

    if (confirm("¿Estás seguro de eliminar este concepto?")) {
        await eliminarConcepto(idSeleccionado);
        alert("Concepto eliminado");
    }
});

document.getElementById('id_tipo').addEventListener('change', actualizarMenuConceptos);

function actualizarMenuConceptos() {
    const tipo = document.getElementById('id_tipo').value;
    const select = document.getElementById('id_concepto');
    select.innerHTML = '<option value="">Selecciona concepto...</option>';

    catalogo.filter(c => c.tipo === tipo).forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.categoria_padre} - ${c.nombre}`;
        select.appendChild(opt);
    });
}

function filtrarTipo(tipo) {
    filtroActual = tipo;
    cargarMovimientos();
}

async function cargarMovimientos() {
    const filtroMes = document.getElementById('filtro-mes');
    const mes = filtroMes ? filtroMes.value : '';

    let query = `?${filtroActual ? 'tipo='+filtroActual : ''}&${mes ? 'mes='+mes : ''}`;
    const movs = await api.get(`/transacciones${query}`);

    renderizarLista(movs);
    actualizarGraficas(movs);
}

document.getElementById('form-movimiento')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await api.post('/transacciones', {
        id_tipo: document.getElementById('id_tipo').value,
        id_concepto: parseInt(document.getElementById('id_concepto').value),
        monto: parseFloat(document.getElementById('monto').value),
        notas: document.getElementById('notas').value,
        fecha: document.getElementById('fecha').value
    });
    e.target.reset();
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        inputFecha.value = new Date().toISOString().split('T')[0];
    }
    await cargarMovimientos();
});

async function eliminar(id) {
    await api.delete(`/transacciones/${id}`);
    await cargarMovimientos();
}

function renderizarLista(movs) {
    const lista = document.getElementById('lista-movimientos');
    if (!lista) return;

    lista.innerHTML = '';
    movs.forEach(m => {
        const cat = catalogo.find(c => c.id === m.id_concepto);
        const li = document.createElement('li');
        li.className = m.id_tipo === 'Ingreso' ? 'es-ingreso' : 'es-egreso';
        li.innerHTML = `
            <div>
                <strong>${m.id_tipo} - ${cat ? cat.nombre : '...'}</strong><br>
                <small>${new Date(m.fecha).toLocaleDateString()} | ${m.notas || ''}</small>
            </div>
            <div>
                <span>$${m.monto.toFixed(2)}</span>
                <button onclick="eliminar(${m.id})">X</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

function actualizarGraficas(movs) {
    if (typeof Chart === 'undefined') return;
    dibujarGrafica('graficoIngresos', movs.filter(m => m.id_tipo === 'Ingreso'), (ins) => graficoIng = ins, graficoIng);
    dibujarGrafica('graficoEgresos', movs.filter(m => m.id_tipo === 'Egreso'), (ins) => graficoEgr = ins, graficoEgr);
}

function dibujarGrafica(id, data, setter, inst) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const tot = {};
    data.forEach(m => {
        const c = catalogo.find(x => x.id === m.id_concepto);
        const cat = c ? c.categoria_padre : 'Otros';
        tot[cat] = (tot[cat] || 0) + m.monto;
    });

    if (inst) inst.destroy();

    setter(new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(tot),
            datasets: [{ data: Object.values(tot), backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336'] }]
        },
        options: { plugins: { legend: { labels: { color: 'white' } } } }
    }));
}
