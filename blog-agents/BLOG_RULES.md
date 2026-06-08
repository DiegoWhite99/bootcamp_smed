# Blog SMED Technology — Reglas y arquitectura

## Concepto
Blog automatizado que publica 1-2 artículos semanales sobre IA, redes, robótica,
computación y tecnología aeroespacial. El contenido lo genera un pipeline de agentes
corriendo en el PC servidor local (Ubuntu 24.04, 192.168.1.20).

---

## Stack

| Componente | Tecnología | Dónde corre |
|---|---|---|
| Orquestador | n8n (cron) | PC servidor local |
| Investigación | ArXiv API + Ollama | PC servidor local |
| Redacción | Ollama — qwen2.5:7b | PC servidor local |
| Publicación | FTP a Hostinger | PC servidor local |
| Blog frontend | HTML + JS + JSON | Hostinger (public_html) |

---

## Arquitectura de archivos en Hostinger

```
public_html/
└── src/
    ├── data/
    │   ├── posts-index.json        ← índice de todos los posts (lo genera el pipeline)
    │   └── posts/
    │       └── <slug>.json         ← un JSON por artículo
    ├── pages/
    │   ├── Blog.html               ← grid del blog (carga posts-index.json)
    │   └── BlogPost.html           ← plantilla individual (carga <slug>.json)
    └── styles/
        └── BlogPost.css
```

---

## Estructura del JSON de cada artículo

```json
{
  "slug":          "ia-y-desarrollo-2026",
  "title":         "Título del artículo",
  "excerpt":       "Resumen breve para el grid (~120 chars)",
  "category":      "ia",
  "categoryLabel": "IA & Desarrollo",
  "date":          "04 JUN 2026",
  "dateISO":       "2026-06-04",
  "author":        "SMED Technology",
  "image":         "/src/assets/images/SmedDev.webp",
  "content":       "<p>Párrafo 1...</p><p>Párrafo 2...</p>",
  "readTime":      5,
  "sources":       ["https://arxiv.org/abs/..."]
}
```

---

## Categorías válidas

| Valor (data-cat) | Label visible |
|---|---|
| `ia` | IA & Desarrollo |
| `redes` | Redes |
| `cloud` | Cloud |
| `ciberseguridad` | Ciberseguridad |
| `desarrollo` | Desarrollo |

---

## Rutas URL

| URL | Archivo servido |
|---|---|
| `/blog` | `src/pages/Blog.html` |
| `/blog/<slug>` | `src/pages/BlogPost.html` (lee `src/data/posts/<slug>.json`) |

---

## Reglas del pipeline

### Frecuencia
- Cron en n8n: **lunes y jueves** a las 8:00am
- Máximo 2 artículos por semana (respetar límites de APIs)

### Investigación
1. Intentar ArXiv API (categorías: cs.AI, cs.NI, cs.CR, cs.RO, eess.SP)
2. Si ArXiv falla → Ollama genera temas desde su conocimiento
3. Gemini 2.0 Flash (opcional) para enriquecer con noticias recientes

### Redacción (Ollama qwen2.5:7b)
- Extensión: 500–650 palabras
- Idioma: español claro y profesional
- Sin bullets ni listas — solo párrafos fluidos
- Mencionar Colombia o LATAM al menos una vez
- Sin inventar datos — solo información provista por el researcher

### Publicación
- n8n sube el JSON a Hostinger vía FTP
- Actualiza `posts-index.json` (más reciente primero)
- El frontend no necesita rebuild — lee el JSON automáticamente

---

## Scripts en el servidor (Ubuntu 192.168.1.20)

```
/home/smed/blog-agents/
├── venv/                  ← entorno virtual Python
├── config.py              ← credenciales (NO commitear a git)
├── researcher.py          ← agente investigador
├── writer.py              ← agente redactor
├── publisher.py           ← agente publicador (FTP)
├── orchestrator.py        ← coordinador principal
└── pipeline.log           ← log de ejecuciones
```

**Ejecutar manualmente:**
```bash
cd /home/smed/blog-agents && venv/bin/python orchestrator.py
```

---

## FTP Hostinger

| Campo | Valor |
|---|---|
| Host | 145.223.104.208 |
| Puerto | 21 |
| Usuario | u938972921 |
| Carpeta raíz | public_html |

---

## Estado (2026-06-04)

- [x] Scripts Python creados y en el servidor
- [x] Blog.html actualizado (carga dinámica desde JSON)
- [x] BlogPost.html creado (plantilla por slug)
- [x] .htaccess con rutas `/blog/<slug>`
- [ ] Primera ejecución exitosa del pipeline
- [ ] Workflow n8n configurado (cron)
- [ ] Subir Blog.html y BlogPost.html a Hostinger
