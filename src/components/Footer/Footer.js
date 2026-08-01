// permite mostrar el pie de pagina
export default class Footer extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch("/src/components/Footer/Footer.html?v=1.5.0");
    const html = await resp.text();
    this.innerHTML = html;
  }
}

customElements.define("footer-page", Footer);


