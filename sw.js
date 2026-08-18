// Service worker mínimo: solo lo necesario para que el sitio sea instalable como PWA
// y siga respondiendo algo si el alumno pierde conexión un momento. No cachea la API
// del backend (otro origen, datos siempre dinámicos) — cae fuera del filtro same-origin.

const CACHE_NAME = 'cedam-v1';
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/estilos.css',
    '/js/api.js',
    '/js/script.js',
    '/js/pwa.js',
    '/img/logos/solologo.jpeg',
    '/img/logos/icon-192.png',
    '/img/logos/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .catch((err) => console.error('No se pudo precachear el app shell:', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nombres) =>
            Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    event.respondWith(
        fetch(request)
            .then((respuesta) => {
                const copia = respuesta.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copia));
                return respuesta;
            })
            .catch(() => caches.match(request))
    );
});
