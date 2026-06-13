(() => {
  const css = `
    #smed-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #02060f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      cursor: none;
    }

    /* ── barras cinemáticas ── */
    .sl-bar-top,
    .sl-bar-bottom {
      position: absolute;
      left: 0; right: 0;
      height: 80px;
      background: #000;
      z-index: 2;
      transition: height 0.7s cubic-bezier(0.76,0,0.24,1);
    }
    .sl-bar-top    { top: 0; }
    .sl-bar-bottom { bottom: 0; }
    #smed-loader.sl-open .sl-bar-top    { height: 0; }
    #smed-loader.sl-open .sl-bar-bottom { height: 0; }

    /* ── fondo mundialista (estadio + tricolor) ── */
    .sl-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 50% 35%, rgba(252,209,22,0.10) 0%, transparent 55%),
        radial-gradient(ellipse at 50% 80%, rgba(0,56,147,0.18) 0%, transparent 60%),
        #02060f;
      opacity: 0;
      transition: opacity 0.8s ease;
    }
    #smed-loader.sl-open .sl-bg { opacity: 1; }

    /* cinta tricolor superior e inferior */
    .sl-flag {
      position: absolute;
      left: 0; right: 0;
      height: 3px;
      background: repeating-linear-gradient(90deg,
        #fcd116 0, #fcd116 70px,
        #003893 70px, #003893 140px,
        #ce1126 140px, #ce1126 210px);
      animation: slFlagSlide 18s linear infinite;
      z-index: 3;
      opacity: 0;
      transition: opacity 0.6s ease 0.4s;
    }
    .sl-flag--top { top: 0; }
    .sl-flag--bottom { bottom: 0; }
    #smed-loader.sl-open .sl-flag { opacity: 1; }
    @keyframes slFlagSlide {
      0%   { background-position: 0 0; }
      100% { background-position: -210px 0; }
    }

    /* ── contenido central ── */
    .sl-center {
      position: relative;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      opacity: 0;
      transform: scale(0.92);
      transition: opacity 0.6s ease 0.6s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s;
    }
    #smed-loader.sl-open .sl-center {
      opacity: 1;
      transform: scale(1);
    }

    /* logo SMED con glow */
    .sl-logo {
      width: 78px;
      height: 78px;
      object-fit: contain;
      display: block;
      margin-bottom: 6px;
      animation: slLogoGlow 2.5s ease-in-out infinite;
    }
    @keyframes slLogoGlow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(252,209,22,0.4)); }
      50%       { filter: drop-shadow(0 0 26px rgba(252,209,22,0.85)); }
    }

    /* balón rebotando */
    .sl-ball-wrap {
      position: relative;
      height: 80px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-bottom: 18px;
    }
    .sl-ball {
      font-size: 44px;
      line-height: 1;
      filter: drop-shadow(0 6px 10px rgba(0,0,0,0.5));
      animation: slBallBounce 1.1s cubic-bezier(0.5,0,0.5,1) infinite,
                 slBallSpin 1.1s linear infinite;
    }
    @keyframes slBallBounce {
      0%, 100% { transform: translateY(-52px); }
      50%      { transform: translateY(0); }
    }
    @keyframes slBallSpin {
      to { transform: rotate(360deg); }
    }
    /* sombra del balón en el "suelo" */
    .sl-ball-shadow {
      position: absolute;
      bottom: 0;
      width: 54px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, transparent 70%);
      animation: slShadow 1.1s cubic-bezier(0.5,0,0.5,1) infinite;
    }
    @keyframes slShadow {
      0%, 100% { transform: scale(0.5); opacity: 0.3; }
      50%      { transform: scale(1);   opacity: 0.7; }
    }

    /* línea divisoria tricolor */
    .sl-divider {
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #fcd116, #003893, #ce1126, transparent);
      margin-bottom: 20px;
      transition: width 0.8s cubic-bezier(0.22,1,0.36,1) 1.1s;
    }
    #smed-loader.sl-open .sl-divider { width: 220px; }

    /* nombre SMED */
    .sl-brand {
      font-family: 'Orbitron', monospace;
      font-size: clamp(2rem, 6vw, 3.2rem);
      font-weight: 700;
      letter-spacing: 10px;
      color: #ffffff;
      text-transform: uppercase;
      overflow: hidden;
      white-space: nowrap;
      max-width: 0;
      transition: max-width 0.7s cubic-bezier(0.22,1,0.36,1) 0.9s;
    }
    #smed-loader.sl-open .sl-brand { max-width: 500px; }

    /* subtítulo Technology */
    .sl-sub {
      font-family: 'Orbitron', monospace;
      font-size: clamp(0.6rem, 1.5vw, 0.78rem);
      letter-spacing: 8px;
      color: #fcd116;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.6s ease 1.4s, transform 0.6s ease 1.4s;
      margin-bottom: 26px;
    }
    #smed-loader.sl-open .sl-sub { opacity: 1; transform: translateY(0); }

    /* tagline mundialista */
    .sl-tagline {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(0.75rem, 1.6vw, 0.9rem);
      letter-spacing: 3px;
      color: rgba(245,245,245,0.6);
      text-transform: uppercase;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.6s ease 1.7s;
    }
    #smed-loader.sl-open .sl-tagline { opacity: 1; }
    .sl-tagline b { color: #fcd116; }

    /* barra de progreso tricolor */
    .sl-progress-wrap {
      position: absolute;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 220px;
      z-index: 4;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.5s ease 1s;
    }
    #smed-loader.sl-open .sl-progress-wrap { opacity: 1; }

    .sl-progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255,255,255,0.08);
      border-radius: 4px;
      overflow: hidden;
    }
    .sl-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #fcd116, #003893, #ce1126);
      width: 0%;
      transition: width 2.4s cubic-bezier(0.4,0,0.2,1) 1s;
    }
    #smed-loader.sl-open .sl-progress-fill { width: 90%; }
    #smed-loader.sl-done  .sl-progress-fill { width: 100%; transition-duration: 0.3s; }

    .sl-progress-label {
      font-family: 'Orbitron', monospace;
      font-size: 0.55rem;
      letter-spacing: 2px;
      color: rgba(252,209,22,0.7);
      text-transform: uppercase;
      animation: slBlink 1.4s ease-in-out infinite;
    }
    @keyframes slBlink {
      0%, 100% { opacity: 0.4; }
      50%       { opacity: 1; }
    }

    /* esquinas decorativas */
    .sl-corner {
      position: absolute;
      width: 24px; height: 24px;
      border-color: rgba(252,209,22,0.35);
      border-style: solid;
      z-index: 4;
      opacity: 0;
      transition: opacity 0.5s ease 0.8s;
    }
    #smed-loader.sl-open .sl-corner { opacity: 1; }
    .sl-corner--tl { top: 20px; left: 20px; border-width: 1.5px 0 0 1.5px; }
    .sl-corner--tr { top: 20px; right: 20px; border-width: 1.5px 1.5px 0 0; }
    .sl-corner--bl { bottom: 20px; left: 20px; border-width: 0 0 1.5px 1.5px; }
    .sl-corner--br { bottom: 20px; right: 20px; border-width: 0 1.5px 1.5px 0; }

    /* confeti del loader */
    .sl-confetti {
      position: absolute;
      top: -12px;
      width: 10px;
      height: 14px;
      z-index: 5;
      opacity: 0;
    }
    #smed-loader.sl-celebrate .sl-confetti {
      animation: slConfettiFall 2.6s linear forwards;
    }
    @keyframes slConfettiFall {
      0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
      100% { transform: translateY(105vh) rotate(720deg); opacity: 1; }
    }

    /* salida */
    #smed-loader.sl-exit {
      opacity: 0;
      transform: scale(1.03);
      transition: opacity 0.65s cubic-bezier(0.4,0,0.2,1),
                  transform 0.65s cubic-bezier(0.4,0,0.2,1),
                  visibility 0.65s;
      visibility: hidden;
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Generar confeti tricolor distribuido
  const colors = ['#fcd116', '#003893', '#ce1126', '#ffffff'];
  let confettiHTML = '';
  for (let i = 0; i < 40; i++) {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const color = colors[i % colors.length];
    const dur = 2 + Math.random() * 1.2;
    confettiHTML += `<span class="sl-confetti" style="left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${dur}s;"></span>`;
  }

  const loader = document.createElement('div');
  loader.id = 'smed-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = `
    <div class="sl-bar-top"></div>
    <div class="sl-bar-bottom"></div>
    <div class="sl-bg"></div>
    <div class="sl-flag sl-flag--top"></div>
    <div class="sl-flag sl-flag--bottom"></div>

    <span class="sl-corner sl-corner--tl"></span>
    <span class="sl-corner sl-corner--tr"></span>
    <span class="sl-corner sl-corner--bl"></span>
    <span class="sl-corner sl-corner--br"></span>

    ${confettiHTML}

    <div class="sl-center">
      <img src="/src/assets/images/SmedOfficial.webp" class="sl-logo" alt="SMED Technology" />
      <div class="sl-ball-wrap">
        <span class="sl-ball">⚽</span>
        <span class="sl-ball-shadow"></span>
      </div>
      <div class="sl-divider"></div>
      <p class="sl-brand">SMED</p>
      <p class="sl-sub">Technology</p>
      <p class="sl-tagline">¡Rumbo al <b>Mundial</b> 2026! 🇨🇴</p>
    </div>

    <div class="sl-progress-wrap">
      <div class="sl-progress-bar">
        <div class="sl-progress-fill"></div>
      </div>
      <span class="sl-progress-label">Calentando motores…</span>
    </div>
  `;

  const inject = () => {
    document.body.prepend(loader);
    // Trigger animations after 1 frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => loader.classList.add('sl-open'));
    });
  };

  if (document.body) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }

  const MIN_MS = 3800;
  const start  = Date.now();

  const hide = () => {
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, MIN_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('sl-done');
      // ¡Gol! Lluvia de confeti antes de salir
      loader.classList.add('sl-celebrate');
      setTimeout(() => {
        loader.classList.add('sl-exit');
        setTimeout(() => loader.remove(), 700);
      }, 1100);
    }, delay);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
})();
