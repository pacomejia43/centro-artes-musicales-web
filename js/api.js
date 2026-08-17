// ══════════════════════════════════════
// CLIENTE DE API — sesión y llamadas al backend
// ══════════════════════════════════════

const API_BASE_URL = 'https://centro-artes-musicales-backend-production.up.railway.app/api';

const TOKEN_KEY = 'cam_token';
const USUARIO_KEY = 'cam_usuario';

function guardarSesion(token, usuario) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

function obtenerToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function obtenerUsuario() {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? JSON.parse(raw) : null;
}

function estaAutenticado() {
    return !!obtenerToken();
}

function cerrarSesion() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    window.location.href = 'login.html';
}

/** Redirige a login si no hay sesión. Llamar al inicio de páginas protegidas como mi-cuenta.html. */
function protegerPagina() {
    if (!estaAutenticado()) {
        window.location.href = 'login.html';
    }
}

/** Redirige a login (sin sesión) o a mi-cuenta (sesión sin rol ADMIN). Llamar al inicio de admin*.html. */
function protegerPaginaAdmin() {
    if (!estaAutenticado()) {
        window.location.href = 'login.html';
        return;
    }
    const usuario = obtenerUsuario();
    if (!usuario || usuario.role !== 'ADMIN') {
        window.location.href = 'mi-cuenta.html';
    }
}

/**
 * Envuelve fetch(): agrega el token si existe, parsea JSON, y convierte respuestas de error
 * del backend (formato ApiError: message + detalles) en un Error con mensaje legible.
 */
async function apiFetch(path, options = {}) {
    const headers = Object.assign({}, options.headers);
    const token = obtenerToken();
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(API_BASE_URL + path, Object.assign({}, options, { headers }));

    // Un 401 solo significa "sesión expirada" si veníamos con token. Sin token (login/registro
    // fallidos), el 401 es un rechazo normal de credenciales y debe mostrar el mensaje del backend.
    if (response.status === 401 && token) {
        cerrarSesion();
        throw new Error('Tu sesión expiró, inicia sesión de nuevo.');
    }

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const mensaje = (data && data.message) ? data.message : 'Ocurrió un error inesperado.';
        const detalles = (data && Array.isArray(data.detalles)) ? data.detalles.join(' ') : '';
        throw new Error(detalles ? mensaje + ' — ' + detalles : mensaje);
    }

    return data;
}

// ══════════════════════════════════════
// LINK DE SESIÓN EN EL NAV (Iniciar sesión / Mi cuenta)
// Igual que el resto del sitio: si el elemento no existe en esta página, no hace nada.
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    const enlace = navAuth.querySelector('a');
    if (!enlace) return;

    if (estaAutenticado()) {
        const usuario = obtenerUsuario();
        if (usuario && usuario.role === 'ADMIN') {
            enlace.textContent = 'Panel Admin';
            enlace.href = 'admin.html';
        } else {
            enlace.textContent = (usuario && usuario.nombre) ? usuario.nombre.split(' ')[0] : 'Mi cuenta';
            enlace.href = 'mi-cuenta.html';
        }
    } else {
        enlace.textContent = 'Iniciar sesión';
        enlace.href = 'login.html';
    }
});
