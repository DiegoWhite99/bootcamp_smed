// permite mostrar la barra de navegacion
export default class NavigationBar extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch(
      "/src/components/NavigationBar/NavigationBar.html"
    );
    const html = await resp.text();
    this.innerHTML = html;

    // Detectar si se pidió modo login
    const esPaginaLogin = this.hasAttribute("login");
    const esPaginaTienda = this.hasAttribute("buscar");

    // Contenedor dentro del HTML cargado
    const Contenedor = this.querySelector("#BotonesSesion");

    // Ocultar el botón "Inicio" si estamos en la página de login
    if (esPaginaLogin || esPaginaTienda) {
      const ContenedorBotonInicio = this.querySelector(
        "#ContenedorBotonInicio"
      );
      if (ContenedorBotonInicio) ContenedorBotonInicio.style.display = "none";
    }

    if (esPaginaLogin && Contenedor) {
      Contenedor.innerHTML = `
        <div class="nav-button">
          <button class="btn white-btn" id="loginbtn" onclick="login()">Ingresar</button>
          <button class="btn" id="registerbtn" onclick="register()">Registrarse</button>
        </div>
        <div class="nav-menu-btn">
          <i class="bx bx-menu" onclick="MyMenuFuction()"></i>
        </div>
      `;
    }

    if (esPaginaTienda) {
      const BuscarContenedor = this.querySelector("#Buscar");
      BuscarContenedor.innerHTML = `
          <div class="nav-search">
            <input type="text" class="form-control me-2" placeholder="Buscar productos">
            <button class="search-button">
              <i class="fas fa-search"></i>
            </button> 
          </div>`;
    }

    // Boton de menu desplegable
    const botonHamburgesa = document.getElementById("botonHamburgesa");
    const navMenu = document.getElementById("navMenu");

    // Toggle del menú y animación del botón
    botonHamburgesa.addEventListener("click", () => {
      navMenu.classList.toggle("show");
      botonHamburgesa.classList.toggle("active");
    });

    // Cerrar el menú al hacer clic en cualquier enlace
    const links = navMenu.querySelectorAll(".link");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
        botonHamburgesa.classList.remove("active");
      });
    });

    const submenuToggle = navMenu.querySelector(".submenu-toggle");
    const submenuParent = navMenu.querySelector(".has-submenu");
    const sublinks = navMenu.querySelectorAll(".sublink");

    if (submenuToggle && submenuParent) {
      submenuToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        submenuParent.classList.toggle("submenu-open");
        const isExpanded = submenuParent.classList.contains("submenu-open");
        submenuToggle.setAttribute("aria-expanded", String(isExpanded));
      });
    }

    sublinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
        botonHamburgesa.classList.remove("active");
        if (submenuParent && submenuToggle) {
          submenuParent.classList.remove("submenu-open");
          submenuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    // ── Language toggle ──
    const langToggle = this.querySelector("#langToggle");
    const langLabel = this.querySelector("#langLabel");

    const navKeys = {
      about:   this.querySelector('a[href="/src/pages/AboutUs.html"].link'),
      services: this.querySelector('a[href="/src/pages/Services.html"].link'),
      dev:     this.querySelector('a[href="/src/pages/Desarrollo.html"]'),
      networks: this.querySelector('a[href="/src/pages/Redes.html"].sublink:first-of-type'),
      cloud:   this.querySelector('a[href="/src/pages/Cloud.html"]'),
      support: this.querySelector('a[href="/src/pages/Soporte.html"]'),
      advisory: this.querySelector('a[href="/src/pages/Asesorias.html"]'),
    };

    const applyNavLang = (lang) => {
      if (!window.SMED_I18N) return;
      const t = window.SMED_I18N.translations[lang];
      if (!t) return;
      if (navKeys.about)    navKeys.about.textContent    = t['nav.about'];
      if (navKeys.services) navKeys.services.textContent = t['nav.services'];
      if (navKeys.dev)      navKeys.dev.textContent      = t['nav.sub.dev'];
      if (navKeys.cloud)    navKeys.cloud.textContent    = t['nav.sub.cloud'];
      if (navKeys.support)  navKeys.support.textContent  = t['nav.sub.support'];
      if (navKeys.advisory) navKeys.advisory.textContent = t['nav.sub.advisory'];
      const redesLink = this.querySelector('a[href="/src/pages/Redes.html"].sublink');
      if (redesLink) redesLink.textContent = t['nav.sub.networks'];
      if (langLabel) langLabel.textContent = lang === 'es' ? 'EN' : 'ES';
    };

    const savedLang = localStorage.getItem('smed-lang') || 'es';
    applyNavLang(savedLang);

    if (langToggle) {
      langToggle.addEventListener('click', () => {
        const current = localStorage.getItem('smed-lang') || 'es';
        const next = current === 'es' ? 'en' : 'es';
        if (window.SMED_I18N) window.SMED_I18N.applyLang(next);
        applyNavLang(next);
      });
    }

    document.addEventListener('smed:langchange', (e) => applyNavLang(e.detail.lang));

    // ── Theme toggle ──
    const themeToggle = this.querySelector("#themeToggle");
    const themeIcon = this.querySelector("#themeIcon");

    const applyTheme = (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("smed-theme", theme);
      if (themeIcon) {
        themeIcon.className = theme === "light" ? "bx bx-sun" : "bx bx-moon";
      }
    };

    // Aplicar tema guardado
    const savedTheme = localStorage.getItem("smed-theme") || "dark";
    applyTheme(savedTheme);

    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        applyTheme(current === "light" ? "dark" : "light");
      });
    }

    // ── Guirnalda de banderitas del mundo 🎏 ──
    this.buildBunting();

    // ── Balón pateable ⚽ ──
    this.buildBall();

    // ── Banner de campaña mundialista 📣 (solo donde se pida con el atributo "campaign") ──
    if (this.hasAttribute("campaign")) this.buildCampaignBanner();
  }

  buildCampaignBanner() {
    // Evitar duplicados si hubiera más de una nav-bar
    if (document.querySelector(".nav-campaign")) return;

    const banner = document.createElement("div");
    banner.className = "nav-campaign";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Campaña Mundial 2026");
    banner.innerHTML = `
      <p class="nav-campaign-text">
        🇨🇴 Este Mundial, tu empresa también juega en <b>primera</b> — lleva tu tecnología al siguiente nivel
      </p>
      <a href="/asesorias" class="nav-campaign-cta">Agenda tu asesoría ⚽</a>
      <button class="nav-campaign-close" type="button" aria-label="Cerrar">&times;</button>
    `;

    this.appendChild(banner);

    // Animación de entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add("show"));
    });

    // Cerrar (solo para esta vista; al recargar vuelve a salir)
    banner.querySelector(".nav-campaign-close").addEventListener("click", () => {
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 550);
    });
  }

  buildBall() {
    const navbar = this.querySelector(".navbar-smed");
    if (!navbar) return;

    const ball = document.createElement("span");
    ball.className = "nav-ball";
    ball.textContent = "⚽";
    ball.setAttribute("aria-hidden", "true");
    navbar.appendChild(ball);
  }

  buildBunting() {
    const navbar = this.querySelector(".navbar-smed");
    if (!navbar) return;

    // Banderas (aproximadas con degradados) de selecciones mundialistas
    const flags = {
      Colombia:   "linear-gradient(180deg,#fcd116 0 50%,#003893 50% 75%,#ce1126 75%)",
      Argentina:  "linear-gradient(180deg,#75aadb 0 33%,#fff 33% 66%,#75aadb 66%)",
      Brasil:     "radial-gradient(circle,#ffdf00 32%,#009b3a 33%)",
      Alemania:   "linear-gradient(180deg,#000 0 33%,#dd0000 33% 66%,#ffce00 66%)",
      Francia:    "linear-gradient(90deg,#0055a4 0 33%,#fff 33% 66%,#ef4135 66%)",
      España:     "linear-gradient(180deg,#aa151b 0 25%,#f1bf00 25% 75%,#aa151b 75%)",
      Italia:     "linear-gradient(90deg,#009246 0 33%,#fff 33% 66%,#ce2b37 66%)",
      Holanda:    "linear-gradient(180deg,#ae1c28 0 33%,#fff 33% 66%,#21468b 66%)",
      Portugal:   "linear-gradient(90deg,#006600 0 40%,#ff0000 40%)",
      Mexico:     "linear-gradient(90deg,#006847 0 33%,#fff 33% 66%,#ce1126 66%)",
      Belgica:    "linear-gradient(90deg,#000 0 33%,#fdda24 33% 66%,#ef3340 66%)",
      Uruguay:    "linear-gradient(180deg,#fff 0 25%,#0038a8 25% 38%,#fff 38% 62%,#0038a8 62% 75%,#fff 75%)",
    };

    const names = Object.keys(flags);
    const bunting = document.createElement("div");
    bunting.className = "nav-bunting";
    bunting.setAttribute("aria-hidden", "true");

    // Una banderita cada ~46px de ancho de pantalla
    const count = Math.max(8, Math.floor(window.innerWidth / 46));
    for (let i = 0; i < count; i++) {
      const name = names[i % names.length];
      const flag = document.createElement("span");
      flag.className = "nav-flag";
      flag.title = name;
      flag.style.background = flags[name];
      flag.style.animationDelay = `${(i % 6) * 0.15}s`;
      bunting.appendChild(flag);
    }

    navbar.appendChild(bunting);
  }
}

customElements.define("nav-bar", NavigationBar);
