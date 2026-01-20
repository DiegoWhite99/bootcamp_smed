// progreso.js
(function () {
  // lee param ?case= o ?id=
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get('case') || params.get('id') || null;

  const caseText = document.getElementById('caseText');
  const progressFill = document.getElementById('progress-fill');
  const stepNodes = Array.from(document.querySelectorAll('.step'));
  const refreshBtn = document.getElementById('refreshBtn');

  if (!caseId) {
    caseText.innerText = 'No se recibió número de caso en la URL.';
    setProgressByIndex(0);
    return;
  }

  caseText.innerHTML = 'Número de caso: <strong>' + caseId + '</strong>';

  // mapea estados a índices
  const mapEstadoIndex = {
    recepcion: 0,
    reparacion: 1,
    entrega: 2
  };

  // intenta leer el caso en localStorage
  function leerCaso() {
    const casos = JSON.parse(localStorage.getItem('casos') || '[]');
    return casos.find(c => c.id === caseId) || null;
  }

  // fija el estado visual por índice (0..2)
  function setProgressByIndex(index) {
    const total = stepNodes.length - 1;
    const pct = (index / Math.max(total, 1)) * 100;
    progressFill.style.width = pct + '%';

    // actualizar clases
    stepNodes.forEach((node, i) => {
      node.classList.remove('active', 'completed');
      if (i < index) node.classList.add('completed');
      if (i === index) node.classList.add('active');
      if (i > index) { /* nada */ }
    });
  }

  // intenta inicializar con el caso (si existe)
  function init() {
    const caso = leerCaso();
    let idx = 0;
    if (caso && caso.estado) {
      const estado = ('' + caso.estado).toLowerCase();
      idx = mapEstadoIndex[estado] !== undefined ? mapEstadoIndex[estado] : 0;
    } else {
      // caso no encontrado en localStorage: asumimos Recepción
      idx = 0;
    }
    setProgressByIndex(idx);
  }

  // refrescar
  refreshBtn.addEventListener('click', function () {
    init();
  });

  // initialize
  init();
})();
