// ══════════════════════════════════════
// PWA — botón "Instalar app" (header + instalar.html) y registro del service worker.
// Se carga en todas las páginas; no depende de admin.js (esas páginas no siempre lo cargan).
// ══════════════════════════════════════

let eventoInstalacionDiferido = null;

function esIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function appYaInstalada() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function crearModalInstrucciones() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-instrucciones-instalar';
    overlay.innerHTML = `
        <div class="modal">
            <button type="button" class="modal-cerrar" id="cerrar-instrucciones-instalar">&times;</button>
            <h3>Instalar la app</h3>
            <p id="texto-instrucciones-instalar"></p>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('visible');
    });
    document.getElementById('cerrar-instrucciones-instalar').addEventListener('click', () => {
        overlay.classList.remove('visible');
    });
    return overlay;
}

function mostrarInstruccionesManual() {
    let overlay = document.getElementById('modal-instrucciones-instalar');
    if (!overlay) overlay = crearModalInstrucciones();
    document.getElementById('texto-instrucciones-instalar').textContent = esIOS()
        ? 'Toca el botón Compartir (el cuadro con la flecha hacia arriba) en la parte inferior de Safari y elige "Agregar a pantalla de inicio".'
        : 'Abre el menú de tu navegador (los tres puntos) y busca la opción "Agregar a pantalla de inicio" o "Instalar app".';
    overlay.classList.add('visible');
}

function crearBotonEnHeader() {
    if (document.getElementById('btn-instalar-app-header')) {
        return document.getElementById('btn-instalar-app-header');
    }
    const referencia = document.querySelector('header .btn-header');
    if (!referencia || !referencia.parentNode) return null;

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.id = 'btn-instalar-app-header';
    boton.className = 'btn-header btn-instalar-app';
    boton.style.display = 'none';
    boton.innerHTML = '<i class="fa-solid fa-download"></i> Instalar app';
    referencia.parentNode.insertBefore(boton, referencia);
    return boton;
}

document.addEventListener('DOMContentLoaded', () => {
    if (appYaInstalada()) return;

    const botones = [crearBotonEnHeader(), document.getElementById('btn-instalar-pwa')].filter(Boolean);
    if (botones.length === 0) return;

    async function alHacerClic() {
        if (!eventoInstalacionDiferido) {
            mostrarInstruccionesManual();
            return;
        }
        eventoInstalacionDiferido.prompt();
        await eventoInstalacionDiferido.userChoice;
        eventoInstalacionDiferido = null;
        botones.forEach((b) => { b.style.display = 'none'; });
    }
    botones.forEach((b) => b.addEventListener('click', alHacerClic));

    if (esIOS()) {
        // Safari en iOS no dispara beforeinstallprompt: mostramos el botón siempre
        // y el clic lleva directo a las instrucciones manuales.
        botones.forEach((b) => { b.style.display = ''; });
        return;
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        eventoInstalacionDiferido = e;
        botones.forEach((b) => { b.style.display = ''; });
    });

    window.addEventListener('appinstalled', () => {
        eventoInstalacionDiferido = null;
        botones.forEach((b) => { b.style.display = 'none'; });
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.error('Error al registrar el service worker:', err);
        });
    });
}
