/* =========================================================================
 *  Asistente virtual SMED — widget de chat conectado a n8n
 *
 *  webhookUrl: Cloudflare Quick Tunnel hacia el n8n autoalojado (192.168.1.20:5678).
 *  Corre como servicio systemd "cloudflared-n8n" en el servidor; si ese servicio
 *  se reinicia, Cloudflare asigna una URL *.trycloudflare.com nueva y hay que
 *  actualizarla aquí. Migrar a un named tunnel con dominio propio cuando se
 *  pueda mover smedtech.com.co a los nameservers de Cloudflare.
 * ========================================================================= */
const CHATBOT_CONFIG = {
  webhookUrl: "https://genre-confirmed-packaging-respond.trycloudflare.com/webhook/smed-chat",
  quickReplies: [
    { label: "💻 Web / Software", text: "Quiero una página web o un software a la medida" },
    { label: "🤖 Automatización e IA", text: "Me interesa automatización o agentes de IA para mi negocio" },
    { label: "🛠️ Soporte técnico", text: "Necesito soporte técnico / mantenimiento" },
    { label: "🌐 Redes e infraestructura", text: "Necesito ayuda con redes e infraestructura" },
  ],
  errorMsg:
    "Ups, no pude conectarme en este momento. 🙏 Escríbenos directo por WhatsApp al " +
    "+57 302 4462007 o a contacto@smedtech.com.co y te atendemos enseguida.",
};

export default class Chatbot extends HTMLElement {
  async connectedCallback() {
    const resp = await fetch("/src/components/Chatbot/Chatbot.html?v=1.5.0");
    this.innerHTML = await resp.text();

    this.container  = this.querySelector("#chatbot-container");
    this.window     = this.querySelector("[data-chat-window]");
    this.messagesEl = this.querySelector("[data-chat-messages]");
    this.form       = this.querySelector("[data-chat-form]");
    this.input      = this.querySelector("[data-chat-text]");
    this.toggleBtn  = this.querySelector("[data-chat-toggle]");
    this.closeBtn   = this.querySelector("[data-chat-close]");

    // Elementos del formulario (gate)
    this.gate         = this.querySelector("[data-chat-gate]");
    this.gateNombre   = this.querySelector("[data-gate-nombre]");
    this.gateContacto = this.querySelector("[data-gate-contacto]");
    this.gateSolicitud= this.querySelector("[data-gate-solicitud]");
    this.gateTerms    = this.querySelector("[data-gate-terms]");
    this.gateSubmit   = this.querySelector("[data-gate-submit]");

    // Horario de atención (9:00 am - 7:00 pm, hora Colombia)
    this.statusEl   = this.querySelector("[data-chat-status]");
    this.offhoursEl = this.querySelector("[data-chat-offhours]");

    this.sessionId = this.#getSessionId();
    this.history = [];          // memoria de la conversación: [{role, content}]
    this.lead = null;           // datos capturados en el formulario
    this.summaryOffered = false;
    this.inactivityMs = 30000;  // 30 s sin interacción -> alerta "¿sigues ahí?"
    this.inactivityTimer = null;

    this.toggleBtn.addEventListener("click", () => this.#toggle());
    this.closeBtn.addEventListener("click", () => this.#handleClose());

    // Habilitar el botón solo si nombre + contacto + términos están listos
    [this.gateNombre, this.gateContacto].forEach((el) =>
      el.addEventListener("input", () => this.#validateGate())
    );
    this.gateTerms.addEventListener("change", () => this.#validateGate());
    this.gate.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#submitGate();
    });

    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#handleSend();
    });

    // Cualquier escritura reinicia el contador de inactividad
    this.input.addEventListener("input", () => this.#resetInactivity());

    this.#updateHoursUI();
  }

  // 9:00 am - 7:00 pm, hora Colombia (America/Bogota), sin importar la zona del visitante
  #isBusinessHours() {
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date())
    );
    return hour >= 9 && hour < 19;
  }

  #updateHoursUI() {
    const open = this.#isBusinessHours();
    this.statusEl.classList.toggle("is-offline", !open);
    this.statusEl.lastChild.textContent = open ? " En línea" : " Fuera de horario";
    this.offhoursEl.hidden = open || !!this.lead;
  }

  // --- Inactividad: si pasan 30 s sin interacción, ofrecer el resumen ---
  #resetInactivity() {
    clearTimeout(this.inactivityTimer);
    if (this.window.hidden || !this.lead || this.summaryOffered) return;
    this.inactivityTimer = setTimeout(() => {
      if (!this.summaryOffered && this.history.length > 0) {
        this.summaryOffered = true;
        this.#renderSummaryPrompt(true);
      }
    }, this.inactivityMs);
  }

  #toggle() {
    this.window.hidden ? this.#open() : this.#close();
  }
  #open() {
    this.window.hidden = false;
    this.container.classList.add("is-open");
    this.#updateHoursUI();
    (this.lead ? this.input : this.gateNombre)?.focus();
  }
  #close() {
    clearTimeout(this.inactivityTimer);
    this.window.hidden = true;
    this.container.classList.remove("is-open");
  }

  // Al cerrar: si ya conversó y dejó un correo, ofrecer (una vez) el resumen
  #handleClose() {
    if (
      this.lead?.email &&
      this.history.length > 0 &&
      !this.summaryOffered
    ) {
      this.summaryOffered = true;
      this.#renderSummaryPrompt();
      return; // no cerramos todavía; el cliente responde la alerta
    }
    this.#close();
  }

  #validateGate() {
    const ok =
      this.gateNombre.value.trim() &&
      this.gateContacto.value.trim() &&
      this.gateTerms.checked;
    this.gateSubmit.disabled = !ok;
  }

  // Envía el lead del formulario a n8n y abre el chat
  async #submitGate() {
    const nombre = this.gateNombre.value.trim();
    const contacto = this.gateContacto.value.trim();
    const solicitud = this.gateSolicitud.value.trim();
    const emailMatch = contacto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

    this.lead = {
      nombre,
      contacto,
      solicitud: solicitud || "(por definir en el chat)",
      email: emailMatch ? emailMatch[0] : "",
      acepta: true,
    };

    this.gateSubmit.disabled = true;
    this.gateSubmit.innerHTML = 'Entrando…';

    // Enviar el lead al equipo (no bloquea la apertura del chat)
    fetch(CHATBOT_CONFIG.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify({ action: "lead", lead: this.lead, page: window.location.pathname }),
    }).catch((err) => console.error("[Chatbot] Error enviando lead:", err));

    // Mostrar el chat
    this.gate.hidden = true;
    this.messagesEl.hidden = false;
    this.form.hidden = false;
    this.input.focus();

    if (this.#isBusinessHours()) {
      this.#addMessage(
        `¡Hola ${nombre}! 👋 Gracias por tus datos. ¿En qué te puedo ayudar hoy?`,
        "bot"
      );
    } else {
      this.#addMessage(
        `¡Hola ${nombre}! 👋 Ya tenemos tus datos. Estamos fuera de horario (9:00 am – 7:00 pm), ` +
          `pero un asesor te contactará apenas abramos. Si es urgente, escríbenos por WhatsApp al ` +
          `+57 302 4462007.`,
        "bot"
      );
    }

    // Si escribió una solicitud, la enviamos como primer mensaje al agente
    // (solo si estamos en horario: fuera de horario el webhook está desactivado)
    if (solicitud && this.#isBusinessHours()) {
      this.#handleSend(solicitud);
    } else if (this.#isBusinessHours()) {
      this.#renderQuickReplies();
    }
    this.#resetInactivity();
  }

  #renderQuickReplies() {
    const wrap = document.createElement("div");
    wrap.className = "chatbot-quickreplies";
    CHATBOT_CONFIG.quickReplies.forEach(({ label, text }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chatbot-chip";
      btn.textContent = label;
      btn.addEventListener("click", () => {
        wrap.remove();
        this.#handleSend(text);
      });
      wrap.appendChild(btn);
    });
    this.messagesEl.appendChild(wrap);
    this.#scrollToBottom();
  }

  async #handleSend(presetText) {
    const text = (presetText ?? this.input.value).trim();
    if (!text) return;

    this.querySelector(".chatbot-quickreplies")?.remove();
    this.querySelector(".chatbot-summary-prompt")?.remove(); // si reactiva, quita la alerta
    clearTimeout(this.inactivityTimer);
    this.#addMessage(text, "user");
    if (!presetText) this.input.value = "";
    const typing = this.#showTyping();

    try {
      const res = await fetch(CHATBOT_CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          message: text,
          sessionId: this.sessionId,
          page: window.location.pathname,
          lead: this.lead,
          history: this.history.slice(-12),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json().catch(() => ({}));
      const reply =
        data.reply || data.output || data.message || data.text ||
        (typeof data === "string" ? data : null) ||
        CHATBOT_CONFIG.errorMsg;

      typing.remove();
      this.#addMessage(reply, "bot");
      this.history.push({ role: "user", content: text });
      this.history.push({ role: "assistant", content: reply });
    } catch (err) {
      console.error("[Chatbot] Error:", err);
      typing.remove();
      this.#addMessage(CHATBOT_CONFIG.errorMsg, "bot");
    } finally {
      this.#resetInactivity();
    }
  }

  // Alerta "¿sigues ahí?" (por inactividad o al cerrar): ofrece el resumen al correo
  #renderSummaryPrompt(byInactivity = false) {
    const wrap = document.createElement("div");
    wrap.className = "chatbot-summary-prompt";
    const intro = byInactivity
      ? "👋 ¿Sigues ahí? Si quieres, te enviamos el <b>resumen de la charla</b> a tu correo:"
      : "Antes de irte, ¿quieres el <b>resumen de la charla</b> en tu correo?";
    wrap.innerHTML = `<p><i class="bx bx-envelope"></i> ${intro}</p>`;

    const field = document.createElement("div");
    field.className = "chatbot-summary-field";
    const emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "tucorreo@ejemplo.com";
    emailInput.value = this.lead?.email || "";
    field.appendChild(emailInput);
    wrap.appendChild(field);

    const actions = document.createElement("div");
    actions.className = "chatbot-summary-actions";

    const yes = document.createElement("button");
    yes.type = "button";
    yes.className = "chatbot-chip chatbot-chip--solid";
    yes.textContent = "✅ Enviar resumen";
    yes.addEventListener("click", () => this.#sendSummary(wrap, emailInput.value.trim()));

    const no = document.createElement("button");
    no.type = "button";
    no.className = "chatbot-chip";
    no.textContent = "No, gracias";
    no.addEventListener("click", () => wrap.remove());

    actions.append(yes, no);
    wrap.appendChild(actions);
    this.messagesEl.appendChild(wrap);
    this.#scrollToBottom();
  }

  async #sendSummary(promptEl, email) {
    const valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email || "");
    if (!valid) {
      let warn = promptEl.querySelector(".chatbot-summary-warn");
      if (!warn) {
        warn = document.createElement("p");
        warn.className = "chatbot-summary-warn";
        promptEl.querySelector(".chatbot-summary-field").after(warn);
      }
      warn.textContent = "Escribe un correo válido 🙏";
      return;
    }
    promptEl.querySelector(".chatbot-summary-actions").innerHTML =
      '<span class="chatbot-sending">Enviando…</span>';

    // resumen = toda la charla en texto + datos del cliente
    const charla = this.history
      .map((m) => (m.role === "user" ? "Cliente: " : "SMED Bot: ") + m.content)
      .join("\n");
    const lead = { ...this.lead, email, solicitud: charla || this.lead?.solicitud };

    try {
      const res = await fetch(CHATBOT_CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ action: "summary", lead }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      promptEl.remove();
      this.#addMessage(`📧 ¡Listo! Te enviamos el resumen a ${email}.`, "bot");
    } catch (err) {
      console.error("[Chatbot] Error resumen:", err);
      promptEl.remove();
      this.#addMessage("No pude enviar el resumen ahora, pero un asesor ya tiene tus datos. 🙏", "bot");
    }
  }

  #addMessage(text, who) {
    const el = document.createElement("div");
    el.className = `chatbot-msg ${who}`;
    el.innerHTML = this.#linkify(text);
    this.messagesEl.appendChild(el);
    this.#scrollToBottom();
  }

  #linkify(raw) {
    let s = String(raw).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = s.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s = s.replace(/(^|[\s(])((https?:\/\/)[^\s<)]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    s = s.replace(/(\+?57[\s-]?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}/g, (m) => {
      let digits = m.replace(/\D/g, "");
      if (!digits.startsWith("57")) digits = "57" + digits;
      return `<a href="https://wa.me/${digits}" target="_blank" rel="noopener noreferrer">${m}</a>`;
    });
    s = s.replace(/(^|[\s(<])([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '$1<a href="mailto:$2">$2</a>');
    return s;
  }

  #showTyping() {
    const el = document.createElement("div");
    el.className = "chatbot-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    this.messagesEl.appendChild(el);
    this.#scrollToBottom();
    return el;
  }
  #scrollToBottom() { this.messagesEl.scrollTop = this.messagesEl.scrollHeight; }

  #getSessionId() {
    let id = sessionStorage.getItem("smed-chat-session");
    if (!id) {
      id = "sess-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem("smed-chat-session", id);
    }
    return id;
  }
}

customElements.define("chatbot-container", Chatbot);
