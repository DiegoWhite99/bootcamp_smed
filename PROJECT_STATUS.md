# Estado actual del proyecto SMED Technology

Fecha de revisión: 2026-02-20

## Resumen ejecutivo
- El proyecto tiene una **base frontend sólida** con múltiples páginas HTML, componentes reutilizables y activos multimedia organizados.
- Existe una **integración funcional de formulario de contacto** en `backend/form` usando PHP y manejo asíncrono desde frontend.
- La migración a backend Node.js para la versión 1.1.0 está **planeada**, pero **bloqueada temporalmente por falta de VPS/infraestructura**.

## Decisión actual del equipo (v1.1.0)
- Por el momento, el proyecto se mantiene **tal como está** en producción local (HTML/CSS/JS + PHP para contacto).
- El backend en Node.js/Express se deja en **estado pendiente** hasta contar con VPS.
- Se prioriza estabilidad visual/funcional y correcciones de rutas antes de la migración de arquitectura.

## Avances visibles
1. **Arquitectura de interfaz**
   - Páginas principales implementadas (`Services`, `Experiences`, `Store`, `AboutUs`, `login`).
   - Componentes reutilizables para navegación, formulario y footer.
2. **Experiencia visual**
   - Uso amplio de recursos gráficos, video, iconografía y animaciones (`Particles`, carruseles, secciones temáticas).
3. **Canal de contacto**
   - Flujo de envío con `fetch` desde frontend.
   - Validación y respuesta JSON en backend PHP.
   - Fallback a log local cuando no hay SMTP disponible.

## Hallazgos de revisión (riesgos actuales)
1. **Referencias rotas en rutas estáticas**
   - Se detectaron 7 referencias inválidas (assets o páginas no encontradas), incluyendo:
     - `../assets/images/Elevecr.webp`
     - `../pages/Support.html`
     - `../assets/video/experiencia4.mov`
     - rutas `./servicios.html`, `./tienda.html`, `./experiencias.html`
     - `../JS/tienda.js`
2. **Inconsistencia de documentación técnica**
   - README menciona Node.js/Express/MySQL como stack objetivo, mientras el repositorio actual opera principalmente con frontend estático + PHP de contacto.
3. **Ausencia de automatización de calidad**
   - No se observan scripts de test/lint/build ni configuración de CI.

## Plan recomendado por fases
### Fase 0 (ahora, sin VPS)
- Corregir enlaces/rutas rotas.
- Ajustar README para reflejar estado real y objetivo futuro.
- Mantener operativo el formulario PHP con configuración SMTP cuando aplique.

### Fase 1 (cuando haya VPS)
- Crear backend Node.js/Express base (healthcheck, configuración por `.env`, CORS, logs).
- Migrar endpoint de contacto de PHP a API Node.
- Definir despliegue y reverse proxy (Nginx) para frontend + API.

### Fase 2 (estabilización)
- Añadir lint/test mínimos y pipeline CI.
- Observabilidad básica (logs, errores de API, uptime).
- Versionado formal de release 1.1.0.

## Conclusión
El proyecto va **bien encaminado en diseño y estructura visual**. La decisión correcta hoy es mantener el estado actual y preparar la base técnica para migrar a Node.js cuando el VPS esté disponible.
