// ══════════════════════════════════════
// MENÚ RESPONSIVE
// ══════════════════════════════════════

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");
const menuIcon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");

    if (nav.classList.contains("active")) {
        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-xmark");
    } else {
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    }
});

// Cerrar menú al seleccionar una opción
const enlacesMenu = document.querySelectorAll("nav a");
enlacesMenu.forEach(enlace => {
    enlace.addEventListener("click", () => {
        nav.classList.remove("active");
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    });
});

// Subir la página al inicio al cargar
window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});


// ══════════════════════════════════════
// SUBMENÚ HERRAMIENTAS
// CAMBIO 4: se abre/cierra con clic, NO con hover
// ══════════════════════════════════════

const navHerramientas   = document.querySelector('.nav-herramientas');
const herramientasLink  = document.querySelector('.nav-herramientas-link');

if (herramientasLink) {
    herramientasLink.addEventListener('click', function (e) {
        e.preventDefault();
        // Toggle clase .open en el <li>
        navHerramientas.classList.toggle('open');
    });
}

// Cerrar el submenú si el usuario hace clic en cualquier otro lugar
document.addEventListener('click', function (e) {
    if (navHerramientas && !navHerramientas.contains(e.target)) {
        navHerramientas.classList.remove('open');
    }
});

// Cerrar el submenú también al seleccionar "Metrónomo"
// (ya cubierto por el listener de enlacesMenu arriba,
//  pero lo añadimos explícito para claridad)
const submenuLinks = document.querySelectorAll('.submenu-herramientas a');
submenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        navHerramientas.classList.remove('open');
    });
});


// ══════════════════════════════════════
// METRÓNOMO (index.html - péndulo)
// CAMBIO 1: botón stop no es rojo,
//           solo cambia el ícono a cuadrado ■
// ══════════════════════════════════════

(function () {
  let bpm = 100, beats = 4, currentBeat = 0;
  let playing = false, timerId = null, swingDir = 1;
  let audioCtx = null;

  // Estos elementos solo existen en index.html si dejaste la sección
  // del metrónomo de péndulo. Si la eliminaste, los getElementById
  // devuelven null y el bloque no hace nada.
  const slider    = document.getElementById('bpmSlider');
  const bpmVal    = document.getElementById('bpmValue');
  const tempoName = document.getElementById('tempoName');
  const playBtn   = document.getElementById('playBtn');
  const playIcon  = document.getElementById('playIcon');
  const playLabel = document.getElementById('playLabel');
  const tapBtn    = document.getElementById('tapBtn');
  const dotsWrap  = document.getElementById('metroDots');
  const rod       = document.getElementById('metro-rod');
  const beatBtns  = document.querySelectorAll('.beat-btn');

  // Si no están los elementos, no ejecutar nada
  if (!slider || !playBtn) return;

  function getCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function playClick(accent) {
    const ctx = getCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = accent ? 1100 : 800;
    gain.gain.setValueAtTime(accent ? 0.55 : 0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + .08);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + .08);
  }

  const tempos = [
    [30,59,'Larghissimo'],[60,65,'Largo'],[66,75,'Adagio'],
    [76,107,'Andante'],[108,119,'Moderato'],[120,155,'Allegro'],
    [156,175,'Vivace'],[176,200,'Presto'],[201,240,'Prestissimo']
  ];
  function getTempoName(b) { return (tempos.find(([lo,hi])=>b>=lo&&b<=hi)||[,,'?'])[2]; }

  function updateSliderFill() {
    slider.style.setProperty('--fill', ((bpm-30)/(240-30)*100)+'%');
  }
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i=0; i<beats; i++) {
      const d = document.createElement('div');
      d.className = 'metro-dot' + (i===0?' accent':'');
      dotsWrap.appendChild(d);
    }
  }
  function tick() {
    playClick(currentBeat===0);
    dotsWrap.querySelectorAll('.metro-dot').forEach((d,i)=>d.classList.toggle('active',i===currentBeat));
    rod.style.setProperty('--beat-dur', (60/bpm)+'s');
    rod.classList.remove('swing-left','swing-right');
    void rod.offsetWidth;
    rod.classList.add(swingDir>0?'swing-right':'swing-left');
    swingDir *= -1;
    currentBeat = (currentBeat+1) % beats;
  }
  function start() {
    playing=true; currentBeat=0; swingDir=1;
    buildDots(); tick();
    timerId = setInterval(tick, (60/bpm)*1000);
    playBtn.classList.add('playing');
    // CAMBIO 1: ícono cuadrado ■ (no rojo, solo forma diferente)
    playIcon.setAttribute('points','2,2 14,2 14,14 2,14');
    playLabel.textContent = 'Detener';
  }
  function stop() {
    playing=false; clearInterval(timerId);
    rod.classList.remove('swing-left','swing-right');
    dotsWrap.querySelectorAll('.metro-dot').forEach(d=>d.classList.remove('active'));
    playBtn.classList.remove('playing');
    // Restaurar triángulo ▶
    playIcon.setAttribute('points','3,1 14,8 3,15');
    playLabel.textContent = 'Iniciar';
  }

  let tapTimes = [];
  tapBtn.addEventListener('click', ()=>{
    const now = Date.now(); tapTimes.push(now);
    if (tapTimes.length > 1) {
      const r = tapTimes.slice(-6);
      const avg = r.slice(1).map((t,i)=>t-r[i]).reduce((a,b)=>a+b,0)/(r.length-1);
      bpm = Math.round(Math.min(240,Math.max(30,60000/avg)));
      slider.value=bpm; bpmVal.textContent=bpm;
      tempoName.textContent=getTempoName(bpm); updateSliderFill();
      if(playing){stop();start();}
    }
    if(tapTimes.length>8) tapTimes=tapTimes.slice(-6);
  });

  slider.addEventListener('input', ()=>{
    bpm=parseInt(slider.value,10); bpmVal.textContent=bpm;
    tempoName.textContent=getTempoName(bpm); updateSliderFill();
    if(playing){stop();start();}
  });
  playBtn.addEventListener('click', ()=>playing?stop():start());
  beatBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      beatBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      beats=parseInt(btn.dataset.beats,10);
      buildDots(); if(playing){stop();start();}
    });
  });

  buildDots();
  updateSliderFill();
  tempoName.textContent = getTempoName(bpm);
})();