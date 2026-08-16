# SMED Technology

Sitio web corporativo de SMED Technology: desarrollo de software, soporte técnico, redes e infraestructura, y servicios cloud. `smedtech.com.co`, alojado en Hostinger.

## Stack actual

- **Frontend:** HTML/CSS/JS estático (sin build step), Web Components nativos (`customElements`) para navbar, footer, formulario de contacto, botón de WhatsApp y chatbot.
- **Backend de contacto:** PHP (`backend/form`), guarda leads en MySQL (`contactos.sql`) y envía correo vía SMTP. `config.php` con credenciales vive solo en el servidor (gitignored).
- **Chatbot (SMED Bot):** widget conectado a un flujo de **n8n autoalojado** que usa **Groq** (`llama-3.3-70b-versatile`) para responder y envía leads/resúmenes por correo (SMTP Hostinger). Ver `src/components/Chatbot/AGENTE-SMED.md` y `n8n-workflow.json`. n8n se expone a internet vía **Cloudflare Tunnel**; el chat solo atiende de 9:00 am a 7:00 pm (hora Colombia) porque el servidor activa/desactiva el workflow por cron a esas horas.
- **Blog:** vive en el subdominio `blog.smedtech.com.co` (frontend en Hostinger, generación de contenido con un pipeline propio on-premem separado). No es una subcarpeta de este repo — se enlaza como link externo.
- **URLs limpias:** `.htaccess` (producción/Apache-LiteSpeed) y `router.php` (equivalente para desarrollo local con el servidor integrado de PHP) mapean rutas como `/nosotros`, `/servicios`, `/habeas-data`, etc. a los archivos reales en `src/pages`.

## Estructura del proyecto

```
src/
  components/     Web Components reutilizables (NavigationBar, Footer, Chatbot, WhatsApp, Form)
  pages/          Páginas del sitio (Nosotros, Servicios, Desarrollo, Redes, Cloud, Soporte, Asesorías, Habeas Data, login)
  scripts/        Loader de entrada, i18n (ES/EN), utilidades
  styles/         CSS por página/sección
  assets/         Imágenes, iconos, video
backend/
  form/           Endpoint PHP de contacto (MySQL + SMTP)
```

## Desarrollo local

```
php -S localhost:3000 router.php
```

Luego abre `http://localhost:3000` (redirige a `/nosotros`). `router.php` imita las reglas del `.htaccess` para que las URLs limpias funcionen igual que en Hostinger sin Apache.

## Despliegue

El repo se despliega en Hostinger vía integración Git de hPanel (pull manual de `main` desde el panel — botón "Implementar"). Después de cada deploy conviene purgar el caché del CDN de Hostinger (hcdn), que cachea assets estáticos hasta por una semana y puede servir versiones viejas de archivos recién actualizados.

## Autores

- Diego Fernando Castelblanco Jiménez ([Email](mailto:diegofer.cas.99@gmail.com))
- Juan Sebastián Ospina Chávez ([Email](mailto:ospinajuan0409@gmail.com))
- Cristian Rocancio Villamil ([Email](mailto:crisstive2001@gmail.com))

## Colaboradores

- Sergio Alejandro Garzón Franco ([Email](mailto:sergiofranco2102@gmail.com))
- Lainer Gonzalez Pacheco ([Email](mailto:lainergonzalez97@gmail.com))

## Ubicación

Bogotá D.C.

## Redes Sociales

- [Instagram - SMED Technology](https://www.instagram.com/smed_technology/)

---

## Registro de cambios

### v1.5.1 — 2026-08-16

**Fix:** SMED Bot (chatbot web) no respondía en producción, mostrando el mensaje de fallback ("no pude conectarme, escríbenos por WhatsApp") en vez de conversar.

- **Causa:** el chatbot se conecta a n8n a través de un Cloudflare Quick Tunnel (URL pública gratuita y temporal). El servicio `cloudflared-n8n` en el servidor se reinició y Cloudflare le asignó una URL nueva; el frontend seguía apuntando a la URL anterior, ya inactiva.
- **Diagnóstico:** se confirmó por SSH al servidor que n8n nunca dejó de funcionar (`localhost:5678` respondía 200 en todo momento) — el fallo era solo de conectividad externa del túnel.
- **Solución:** se actualizó `webhookUrl` en `src/components/Chatbot/Chatbot.js` con la URL vigente y se verificó extremo a extremo (webhook `/webhook/smed-chat` respondiendo 200).
- **Cache-busting:** se incrementó la versión (`?v=1.5.1`) en todos los assets y fetch internos de componentes/páginas, y en el número de versión del footer, para evitar que el CDN de Hostinger (hcdn) siguiera sirviendo el archivo `Chatbot.js` desactualizado desde caché.
- **Riesgo conocido:** la URL del Quick Tunnel es efímera por diseño y volverá a cambiar ante cualquier reinicio futuro del servicio o del servidor. Queda pendiente migrar a un *named tunnel* con dominio propio (`n8n.smedtech.com.co`) para eliminar esta clase de falla de forma definitiva.
