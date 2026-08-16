// permite mostrar el formulario
export default class Form extends HTMLElement {
    async connectedCallback() {
        // Cargar el HTML
        const resp = await fetch("/src/components/Form/Form.html?v=1.5.1");
        const html = await resp.text();
        this.innerHTML = html;
    }
}

customElements.define("form-contact", Form);