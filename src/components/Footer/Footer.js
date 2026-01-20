// permite mostrar la barra de navegacion
export default class Footer extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch("../components/Footer/Footer.html");
    const html = await resp.text();
    this.innerHTML = html;
  }
}

customElements.define("footer-page", Footer);


