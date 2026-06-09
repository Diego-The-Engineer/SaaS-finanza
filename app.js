// 1. URL base única y centralizada
const API_BASE_URL = 'https://saas-finanza.onrender.com';

// 2. Definimos helper para no repetir código
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
    // Al cargar, obtenemos el catálogo y los movimientos
    catalogo = await api.get('/conceptos');
    await cargarMovimientos();
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

function filtrarTipo(tipo) { filtroActual = tipo; cargarMovimientos(); }

async function cargarMovimientos() {
    const mes = document.getElementById('filtro-mes').value;
    // Construcción dinámica de la URL
    let query = `?${filtroActual ? 'tipo='+filtroActual : ''}&${mes ? 'mes='+mes : ''}`;
    const movs = await api.get(`/transacciones${query}`);
    renderizarLista(movs);
    actualizarGraficas(movs);
}

// ... (El resto de tus funciones renderizarLista y dibujarGrafica se quedan igual)

async function eliminar(id) { 
    await api.delete(`/transacciones/${id}`); 
    cargarMovimientos(); 
}

document.getElementById('form-movimiento').addEventListener('submit', async (e) => {
    e.preventDefault();
    await api.post('/transacciones', { 
        id_tipo: document.getElementById('id_tipo').value, 
        id_concepto: parseInt(document.getElementById('id_concepto').value), 
        monto: parseFloat(document.getElementById('monto').value), 
        notas: document.getElementById('notas').value 
    });
    e.target.reset(); 
    cargarMovimientos();
});

async function verificarConexion() {
    console.log("Iniciando prueba de conexión con el backend...");
    try {
        // Probamos una ruta que sabemos que existe en tu main.py
        const response = await fetch(`${API_BASE_URL}/conceptos`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("¡Conexión exitosa! Datos recibidos:", data);
            alert("¡Backend conectado correctamente! Revisa la consola (F12) para ver los datos.");
            return true;
        } else {
            console.error("El backend respondió con error:", response.status);
            return false;
        }
    } catch (error) {
        console.error("Error crítico de conexión (¿CORS o red?):", error);
        return false;
    }
}

async function cargarConceptos() {
    try {
        // Usa la URL completa aquí, no la ruta relativa
        const response = await fetch(`${API_BASE}/api/conceptos`); 
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.json();
        catalogo = data; // Actualiza tu catálogo
        actualizarMenuConceptos(); // Refresca el dropdown
    } catch (error) {
        console.error("Error:", error);
    }
}

// Ejecútala al cargar la página
document.addEventListener('DOMContentLoaded', verificarConexion);
