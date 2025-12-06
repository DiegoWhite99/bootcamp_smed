// permite mostrar la barra de navegacion
export default class BarraNavegacion extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch("../html/Componentes/BarraNavegacion.html");
    const html = await resp.text();
    this.innerHTML = html;

    // Detectar si se pidió modo login
    const esPaginaLogin = this.hasAttribute("login");
    const esPaginaTienda = this.hasAttribute("buscar");

    // Contenedor dentro del HTML cargado
    const Contenedor = this.querySelector("#BotonesSesion");

    // Ocultar el botón "Inicio" si estamos en la página de login
    if (esPaginaLogin || esPaginaTienda) {
      const ContenedorBotonInicio = this.querySelector("#ContenedorBotonInicio");
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
  }
}

customElements.define("nav-bar", BarraNavegacion);


