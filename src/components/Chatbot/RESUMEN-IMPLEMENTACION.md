# 📋 SMED Bot — Resumen de implementación (2026-06-28)

Asistente virtual (chatbot) de captación de leads para la web de SMED Technology,
con backend de IA en n8n + Groq y envío de correos. Construido en la rama `SME_BETA`.

---

## 🎯 Qué se construyó

Un **segundo botón flotante** (robot azul 🤖) encima del de WhatsApp, presente en las
7 páginas del sitio. Al abrirlo:

1. **Formulario inicial (gate)** dentro del chat con campos en cajas:
   - Nombre, WhatsApp o correo, y "¿En qué te ayudamos?" (opcional).
   - Checkbox **"Acepto los Términos y la Política de Tratamiento de Datos"** (link a `/habeas-data`).
   - Botón **"Iniciar conversación"** (deshabilitado hasta llenar datos + aceptar).
2. Al enviar el formulario → el **lead se manda automáticamente a los 4 correos del equipo**
   y se abre el chat.
3. El **agente** saluda por su nombre y conversa de forma **consultiva**: hace varias
   preguntas para entender el proyecto y **solo deriva a WhatsApp** cuando el cliente pide
   cotización/precio o ya hay suficiente detalle.
4. **Inactividad de 30 s** → alerta "¿Sigues ahí?" que ofrece enviar el **resumen de la
   charla** al correo del cliente (con campo editable de correo).
5. Al cerrar, si conversó y dejó correo, también ofrece el resumen (una sola vez).

---

## 🧩 Arquitectura

```
Navegador (widget)  ──POST──►  Webhook n8n (192.168.1.20:5678/webhook/smed-chat)
                                   │
                                   ├─ action:"lead"    → Email a Equipo (4 correos)
                                   ├─ action:"summary" → Email Resumen al Cliente
                                   └─ (chat normal)    → Groq (Llama 3.3 70B) → respuesta
```

- **IA:** Groq, modelo `llama-3.3-70b-versatile` (gratis, rápido, español). La API key vive
  SOLO en n8n (server-side), nunca en el frontend.
- **Memoria:** el frontend envía el historial (`history`, últimos 12 turnos) para que el bot
  no se repita y mantenga contexto.
- **Correos:** SMTP Hostinger (`smtp.hostinger.com:465`), remitente `contacto@smedtech.com.co`.
  Destinatarios del lead: operaciones, gerencia, contacto y admonempresarial @smedtech.com.co.

---

## 📁 Archivos

| Archivo | Qué es |
|---------|--------|
| `src/components/Chatbot/Chatbot.html/.css/.js` | Widget (formulario + chat + animaciones) |
| `src/components/Chatbot/n8n-workflow.json` | Flujo de n8n importable (sin secretos) |
| `src/components/Chatbot/AGENTE-SMED.md` | Identidad / system prompt del agente |
| `src/components/BaseComponents.js` | Registra el componente `<chatbot-container>` |
| `src/pages/*.html` (7) | Se añadió `<chatbot-container>` + CSS del chat |
| `src/pages/HabeasData.html` + `src/styles/HabeasData.css` | Página legal de Tratamiento de Datos (Ley 1581/2012) |
| `.htaccess` / `router.php` | Ruta limpia `/habeas-data` |

> El flujo de n8n ya está **desplegado y activo** en el servidor (id `CWj5mGUbbctoPkci`).

---

## ⏳ Pendiente

- **Exponer n8n al público** (ngrok para pruebas → Cloudflare Tunnel para producción) y pegar
  la URL en `webhookUrl` dentro de `Chatbot.js`. Hoy apunta a la IP privada `192.168.1.20`,
  que solo funciona dentro de la red local.
- **Regenerar credenciales** usadas en el desarrollo (Groq, API key de n8n, contraseña SMTP).

## 💡 Idea futura relacionada
Calculadora de presupuestos interna (subdominio con login) para apoyar las cotizaciones que
hoy se derivan a WhatsApp.
