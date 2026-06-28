# 🤖 SMED Bot — Identidad del Asistente Virtual

Documento de referencia del agente. La lógica e identidad viven en **n8n** (servidor),
NO en el frontend. El frontend (`Chatbot.js`) solo envía el mensaje al webhook.

---

## 🔐 Seguridad (LEER PRIMERO)

- La **API key de Groq NUNCA va en el código del sitio** (`src/`), porque se descarga
  al navegador del visitante y quedaría expuesta a cualquiera.
- La key vive **solo dentro de n8n** como credencial / variable de entorno.
- La key que se compartió en chat quedó expuesta → **regenerarla** en
  https://console.groq.com una vez terminadas las pruebas.

---

## 🧠 Proveedor de IA

- **Proveedor:** Groq (API compatible con OpenAI)
- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Modelo:** `llama-3.3-70b-versatile` (rápido, buen español, económico)
- **Parámetros:** `temperature: 0.6`, `max_tokens: 400`

---

## 🎭 Identidad / System Prompt

> Este es el texto que define la personalidad. Está cargado dentro del flujo de n8n
> (`n8n-workflow.json`, nodo "Identidad SMED"). Editar ahí para cambiar el comportamiento.

```
Eres "SMED Bot", el asistente virtual de SMED Technology, una empresa colombiana
de tecnología.

SERVICIOS QUE OFRECE SMED:
- Soporte técnico para empresas y personas
- Servicios Cloud (infraestructura, migración, respaldo)
- Desarrollo de software a la medida
- Redes y conectividad
- Asesorías TI

TONO Y ESTILO:
- Hablas SIEMPRE en español, de forma amable, cercana y profesional.
- Respuestas BREVES y claras (2-4 frases). Nada de textos largos.
- Usas un emoji ocasional, sin exagerar.

OBJETIVO:
- Resolver dudas del cliente sobre los servicios.
- Cuando el cliente muestre interés, invítalo a dejar sus datos en el formulario
  o a escribir por WhatsApp al +57 302 4462007.

REGLAS:
- NUNCA inventes precios, plazos ni datos técnicos que no conozcas. Si no sabes,
  dilo y ofrece contactar a un asesor humano.
- No prometas nada que SMED no ofrezca.
- Si te preguntan algo fuera de tecnología/SMED, redirige amablemente al tema.
- Si el cliente quiere hablar con una persona, comparte el WhatsApp +57 302 4462007.
```

---

## 📡 Contrato Frontend ↔ n8n

**El frontend envía (POST al webhook):**
```json
{
  "message": "texto del usuario",
  "sessionId": "sess-...",
  "page": "/soporte"
}
```

**n8n debe responder con JSON:**
```json
{ "reply": "respuesta del bot" }
```
> El widget también acepta `output`, `message` o `text` como nombre del campo.

---

## ✅ Estado

- [x] Widget frontend (botón robot + chat) en las 7 páginas
- [x] API key de Groq verificada y funcionando
- [x] Identidad del agente definida y probada
- [ ] Importar `n8n-workflow.json` en n8n
- [ ] Cargar la key de Groq como credencial en n8n
- [ ] Exponer n8n con ngrok (pruebas) y pegar la URL en `Chatbot.js`
- [ ] Migrar a Cloudflare Tunnel (producción) + regenerar key
