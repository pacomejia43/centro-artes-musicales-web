// ══════════════════════════════════════
// PANEL ADMIN — helpers compartidos por admin.html y admin-*.html
// Se carga después de js/api.js (usa apiFetch, obtenerUsuario, etc.)
// ══════════════════════════════════════

const INSTRUMENTOS = {
    PIANO: 'Piano',
    GUITARRA_ACUSTICA: 'Guitarra acústica',
    GUITARRA_ELECTRICA: 'Guitarra eléctrica',
    BAJO_ELECTRICO: 'Bajo eléctrico',
    VIOLIN: 'Violín',
    BATERIA: 'Batería',
    CANTO: 'Canto',
    COMPOSICION_MUSICAL: 'Composición musical',
    ARREGLO: 'Arreglo',
    LECTURA_ESCRITURA_PARTITURAS: 'Lectura y escritura de partituras'
};

const METODOS_PAGO = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta',
    STRIPE: 'Stripe',
    OTRO: 'Otro'
};

function escapeHtml(texto) {
    if (texto === null || texto === undefined) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "2026-08-08" (o con hora) -> "08/agosto/2026" */
function formatearFechaCorta(fechaIso) {
    if (!fechaIso) return '—';
    const d = new Date(fechaIso.length > 10 ? fechaIso : fechaIso + 'T00:00:00');
    return String(d.getDate()).padStart(2, '0') + '/' + MESES[d.getMonth()] + '/' + d.getFullYear();
}

/** "2026-08-08T16:00:00" -> "08/agosto/2026, 4:00 p.m." */
function formatearFecha(fechaHoraIso) {
    if (!fechaHoraIso) return '—';
    const d = new Date(fechaHoraIso);
    const hora = d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
    return formatearFechaCorta(fechaHoraIso) + ', ' + hora;
}

/** "2026-08" (YearMonth) -> "agosto-2026" */
function formatearPeriodo(periodoIso) {
    if (!periodoIso) return '—';
    const [anio, mes] = periodoIso.split('-').map(Number);
    return MESES[mes - 1] + '-' + anio;
}

function badgeEstado(valor) {
    return `<span class="estado-badge estado-${valor}">${valor}</span>`;
}

function badgeActivo(activo) {
    return activo
        ? '<span class="estado-badge estado-ACTIVO">Activo</span>'
        : '<span class="estado-badge estado-INACTIVO">Inactivo</span>';
}

/** Muestra un mensaje de error/éxito en el contenedor con ese id (debe tener clase base "auth-mensaje"). */
function mostrarMensaje(contenedorId, texto, tipo) {
    const caja = document.getElementById(contenedorId);
    if (!caja) return;
    caja.textContent = texto;
    caja.className = 'auth-mensaje visible ' + tipo;
    caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/** Arma un query string a partir de un objeto, omitiendo valores vacíos/null/undefined. */
function construirQueryString(params) {
    const partes = [];
    Object.keys(params).forEach(key => {
        const valor = params[key];
        if (valor === null || valor === undefined || valor === '') return;
        partes.push(encodeURIComponent(key) + '=' + encodeURIComponent(valor));
    });
    return partes.length ? '?' + partes.join('&') : '';
}

/** Dibuja controles de paginación (Anterior / Página X de Y / Siguiente) para una Page<T> de Spring. */
function renderPaginacion(contenedor, pagina, onCambiarPagina) {
    if (!contenedor) return;
    if (!pagina || pagina.totalPages <= 1) {
        contenedor.innerHTML = '';
        return;
    }
    contenedor.innerHTML = `
        <button type="button" class="btn-chico secundario" id="pag-anterior" ${pagina.first ? 'disabled' : ''}>« Anterior</button>
        <span>Página ${pagina.number + 1} de ${pagina.totalPages} · ${pagina.totalElements} resultado${pagina.totalElements === 1 ? '' : 's'}</span>
        <button type="button" class="btn-chico secundario" id="pag-siguiente" ${pagina.last ? 'disabled' : ''}>Siguiente »</button>
    `;
    const btnAnterior = document.getElementById('pag-anterior');
    const btnSiguiente = document.getElementById('pag-siguiente');
    if (btnAnterior) btnAnterior.addEventListener('click', () => onCambiarPagina(pagina.number - 1));
    if (btnSiguiente) btnSiguiente.addEventListener('click', () => onCambiarPagina(pagina.number + 1));
}

/** Llena un <select> con los alumnos activos, ordenados por nombre. Devuelve el arreglo de alumnos. */
async function poblarSelectAlumnos(selectEl, valorSeleccionado, textoPlaceholder) {
    // Sin "sort=nombre,asc": el backend no soporta ordenar alumnos por nombre (500,
    // "nombre" no es propiedad directa de la entidad Alumno). Se ordena en el cliente.
    const pagina = await apiFetch('/admin/alumnos?activo=true&size=200');
    pagina.content.sort((a, b) => a.nombre.localeCompare(b.nombre));
    selectEl.innerHTML = `<option value="">${textoPlaceholder || 'Selecciona un alumno…'}</option>` + pagina.content.map(a =>
        `<option value="${a.id}">${escapeHtml(a.nombre)} — ${escapeHtml(a.email)}</option>`
    ).join('');
    if (valorSeleccionado) selectEl.value = valorSeleccionado;
    return pagina.content;
}

/** Llena un <select> con los profesores activos, ordenados por nombre. Devuelve el arreglo de profesores. */
async function poblarSelectProfesores(selectEl, valorSeleccionado, textoPlaceholder) {
    const pagina = await apiFetch('/admin/profesores?activo=true&size=200&sort=nombreCompleto,asc');
    selectEl.innerHTML = `<option value="">${textoPlaceholder || 'Selecciona un profesor…'}</option>` + pagina.content.map(p =>
        `<option value="${p.id}">${escapeHtml(p.nombreCompleto)}</option>`
    ).join('');
    if (valorSeleccionado) selectEl.value = valorSeleccionado;
    return pagina.content;
}

function abrirModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('visible');
}

function cerrarModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('visible');
}

// Cerrar cualquier modal al hacer clic en el overlay (fuera de la tarjeta) o con Escape.
document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('visible');
    }
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.visible').forEach(overlay => overlay.classList.remove('visible'));
    }
});

function debounce(fn, ms) {
    let temporizador;
    return (...args) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => fn(...args), ms);
    };
}

// ══════════════════════════════════════
// ENCABEZADO ADMIN — nombre + cerrar sesión (igual patrón en las 5 páginas admin)
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const nombreEl = document.getElementById('panel-nombre');
    if (nombreEl) {
        const usuario = obtenerUsuario();
        nombreEl.textContent = 'Hola, ' + ((usuario && usuario.nombre) ? usuario.nombre.split(' ')[0] : 'Admin');
    }
    const btnSalir = document.getElementById('btn-salir');
    if (btnSalir) btnSalir.addEventListener('click', cerrarSesion);
});
