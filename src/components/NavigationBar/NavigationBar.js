// permite mostrar la barra de navegacion
export default class NavigationBar extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch(
      "/src/components/NavigationBar/NavigationBar.html?v=1.5.0"
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

  }
}

customElements.define("nav-bar", NavigationBar);
