(() => {
  const css = `
    #smed-loader {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #000;
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

    /* ── fondo con partículas de luz ── */
    .sl-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 50% 50%, rgba(13,202,240,0.06) 0%, transparent 65%),
        #02060f;
      opacity: 0;
      transition: opacity 0.8s ease;
    }
    #smed-loader.sl-open .sl-bg { opacity: 1; }

    /* scanline que barre de arriba abajo */
    .sl-scanline {
      position: absolute;
      left: 0; right: 0;
      top: -4px;
      height: 3px;
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(13,202,240,0.15) 20%,
        rgba(13,202,240,0.9) 50%,
        rgba(13,202,240,0.15) 80%,
        transparent 100%
      );
      box-shadow: 0 0 24px 4px rgba(13,202,240,0.4);
      z-index: 3;
      animation: slScanline 1.1s cubic-bezier(0.4,0,0.6,1) forwards;
      animation-delay: 0.1s;
      opacity: 0;
    }

    @keyframes slScanline {
      0%   { top: 0%; opacity: 0; }
      5%   { opacity: 1; }
      95%  { opacity: 1; }
      100% { top: 100%; opacity: 0; }
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

    /* logo con glow */
    .sl-logo-wrap {
      position: relative;
      margin-bottom: 28px;
    }

    .sl-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 0 0px rgba(13,202,240,0));
      animation: slLogoGlow 2.5s ease-in-out infinite;
      animation-delay: 1.2s;
    }

    @keyframes slLogoGlow {
      0%, 100% { filter: drop-shadow(0 0 8px rgba(13,202,240,0.35)); }
      50%       { filter: drop-shadow(0 0 28px rgba(13,202,240,0.75)); }
    }

    /* anillo orbitando el logo */
    .sl-orbit {
      position: absolute;
      inset: -18px;
      border-radius: 50%;
      border: 1px solid rgba(13,202,240,0.2);
      animation: slOrbitSpin 3s linear infinite;
    }
    .sl-orbit::after {
      content: '';
      position: absolute;
      top: -3px; left: 50%;
      transform: translateX(-50%);
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #0dcaf0;
      box-shadow: 0 0 10px rgba(13,202,240,0.8);
    }
    @keyframes slOrbitSpin { to { transform: rotate(360deg); } }

    /* línea divisoria */
    .sl-divider {
      width: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(13,202,240,0.6), transparent);
      margin-bottom: 20px;
      transition: width 0.8s cubic-bezier(0.22,1,0.36,1) 1.1s;
    }
    #smed-loader.sl-open .sl-divider { width: 200px; }

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
      color: #0dcaf0;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.6s ease 1.4s, transform 0.6s ease 1.4s;
      margin-bottom: 32px;
    }
    #smed-loader.sl-open .sl-sub { opacity: 1; transform: translateY(0); }

    /* tagline */
    .sl-tagline {
      font-family: 'Poppins', sans-serif;
      font-size: clamp(0.7rem, 1.5vw, 0.82rem);
      letter-spacing: 2px;
      color: rgba(245,245,245,0.35);
      text-transform: uppercase;
      opacity: 0;
      transition: opacity 0.6s ease 1.7s;
    }
    #smed-loader.sl-open .sl-tagline { opacity: 1; }

    /* barra de progreso */
    .sl-progress-wrap {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
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
      height: 1px;
      background: rgba(13,202,240,0.1);
      border-radius: 1px;
      overflow: hidden;
    }
    .sl-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #0077b6, #0dcaf0);
      width: 0%;
      transition: width 1.2s cubic-bezier(0.4,0,0.2,1) 1s;
    }
    #smed-loader.sl-open .sl-progress-fill { width: 90%; }
    #smed-loader.sl-done  .sl-progress-fill { width: 100%; transition-duration: 0.3s; }

    .sl-progress-label {
      font-family: 'Orbitron', monospace;
      font-size: 0.5rem;
      letter-spacing: 2px;
      color: rgba(13,202,240,0.45);
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
      border-color: rgba(13,202,240,0.25);
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

  const loader = document.createElement('div');
  loader.id = 'smed-loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML = `
    <div class="sl-bar-top"></div>
    <div class="sl-bar-bottom"></div>
    <div class="sl-bg"></div>
    <div class="sl-scanline"></div>

    <span class="sl-corner sl-corner--tl"></span>
    <span class="sl-corner sl-corner--tr"></span>
    <span class="sl-corner sl-corner--bl"></span>
    <span class="sl-corner sl-corner--br"></span>

    <div class="sl-center">
      <div class="sl-logo-wrap">
        <div class="sl-orbit"></div>
        <img src="/src/assets/icons/MainIcon.webp" class="sl-logo" alt="" />
      </div>
      <div class="sl-divider"></div>
      <p class="sl-brand">SMED</p>
      <p class="sl-sub">Technology</p>
      <p class="sl-tagline">Forjamos el futuro</p>
    </div>

    <div class="sl-progress-wrap">
      <div class="sl-progress-bar">
        <div class="sl-progress-fill"></div>
      </div>
      <span class="sl-progress-label">Cargando sistema…</span>
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

  const MIN_MS = 2200;
  const start  = Date.now();

  const hide = () => {
    const elapsed = Date.now() - start;
    const delay   = Math.max(0, MIN_MS - elapsed);
    setTimeout(() => {
      loader.classList.add('sl-done');
      setTimeout(() => {
        loader.classList.add('sl-exit');
        setTimeout(() => loader.remove(), 700);
      }, 350);
    }, delay);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
})();
