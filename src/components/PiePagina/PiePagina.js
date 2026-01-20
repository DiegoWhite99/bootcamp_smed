// permite mostrar la barra de navegacion
export default class PiePagina extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch("../components/PiePagina/PiePagina.html");
    const html = await resp.text();
    this.innerHTML = html;
  }
}

customElements.define("footer-page", PiePagina);


