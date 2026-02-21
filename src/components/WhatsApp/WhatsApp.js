export default class whatsApp extends HTMLElement {
  async connectedCallback() {
    // Cargar el HTML
    const resp = await fetch("../components/WhatsApp/WhatsApp.html");
    const html = await resp.text();
    this.innerHTML = html;
  }
}

customElements.define("whatsapp-container",whatsApp);
