# Contexto: portafolio personal de Juan

Actualiza este archivo cuando se cierre una decisión pendiente.

## Quién soy
Software Engineer con enfoque backend. Stack principal: Python y Node.js en backend; React, Vue y TypeScript en frontend; PostgreSQL; Docker y AWS (S3, SQS). Sin experiencia en Azure: no mencionarlo. Más de 4 años como Full Stack Developer (backend-focused) en Unitti (2021–2026, remoto). Inglés C1. Basado en Colombia (UTC−5). Abierto a cualquier rol remoto.

## Qué estamos construyendo
Un portafolio personal en inglés (español opcional), estático y rápido. Esquema híbrido (ADR 0002 y 0004): el frontend se publica en GitHub Pages y la API corre en un laptop ASUS X200MA en mi casa, usado como homelab: Celeron N2830 (x86_64), 2 GB de RAM, HDD de 500 GB, Ubuntu. La infraestructura del propio sitio es un caso de estudio central: la página About explica las decisiones de arquitectura con sus pros y contras.

## Arquitectura decidida
- Frontend con Next.js (App Router), React, TypeScript, Tailwind CSS y Motion (ADR 0003, reemplaza al 0001), exportado como sitio estático (`output: 'export'`, `trailingSlash: true`) con metadatos Open Graph por página. Nada de funciones de servidor de Next.js (route handlers, middleware, optimización de imágenes): el export estático no las soporta. Si algún día hacen falta, se migra a Vercel (ADR 0003).
- Contenido en `frontend/content/` (proyectos en Markdown con frontmatter validado con Zod, experiencia en JSON), leído en el build. No hay tabla `projects` ni `GET /api/projects`.
- API FastAPI en `api/` (Python 3.13, un solo worker, sin ORM) con `GET /api/health` (uptime, carga y RAM, sin datos sensibles) y `POST /api/contact`. Detalles en `api/README.md`.
- SQLite dedicado al portafolio, solo para mensajes de contacto. Directorio montado en Docker (modo WAL), migraciones SQL numeradas con `PRAGMA user_version`, `busy_timeout`, backups con `VACUUM INTO`.
- Frontend en GitHub Pages (ADR 0002): el repo se renombra a `JJDuqueS.github.io` para servir en la raíz (`https://jjduques.github.io`), sin `base`. Con dominio propio: `CNAME` en `frontend/public/` y cambiar `SITE_URL` en `frontend/lib/site.ts`.
- Enlaces internos siempre absolutos desde la raíz (`/about`); funcionan porque no hay `base`.
- API en el laptop expuesta con Tailscale Funnel (ADR 0004) en `https://<máquina>.<tailnet>.ts.net`: Tailscale corre en el host, Funnel termina HTTPS y reenvía a `127.0.0.1:8080`, donde Docker publica la API. Sin Caddy y sin Cloudflare Tunnel mientras no haya dominio. No se abren puertos en el router. CORS solo para el origen del sitio.
- CI/CD: GitHub Actions ejecuta lint, tests y build; solo si pasan, el job `deploy` publica `frontend/out` en GitHub Pages (solo desde `main`). Para la API: ruff y pytest en cada push; desde `main`, imagen `linux/amd64` en `ghcr.io/jjduques/portfolio-api` que el laptop descarga (`deploy/update.sh`). Nunca se compila en el servidor.
- Docker Compose en `deploy/` para el laptop; guía de instalación paso a paso en `deploy/README.md`.
- Monitor de disponibilidad externo.

## Páginas
- Home: hero "flujo en vivo" (diagrama animado del recorrido real de la visita: tú → CDN → API → SQLite, con tiempos medidos por la Navigation Timing API y detalle de cada nodo), experiencia, stack, trabajo seleccionado y contacto.
- Projects: listado y una página por caso de estudio (`/projects/<slug>/`) con problema, solución, stack, mi rol y resultado. Proyectos: Sunward (app React Native/Expo de posición del sol con sensores) y el propio portafolio; por ahora solo estos dos. Sin enlaces a repositorios por ahora.
- About: la infraestructura del sitio, sus decisiones y trade-offs, alimentada por los ADRs del repositorio.

## Estilo visual
Tema oscuro con la paleta del banner de LinkedIn: fondo `#030B0A` y un solo acento, el verde `#00E68C` (tokens en `frontend/app/globals.css`). Más enganche visual que la versión editorial: el diagrama animado del hero es el momento memorable, y el resto acompaña sin competir con él. Un solo momento de animación orquestado al cargar; el resto del movimiento responde a acciones del visitante. Respetar `prefers-reduced-motion`. Tipografías Bricolage Grotesque (títulos) e Instrument Sans (texto), autoalojadas con Fontsource. Iconos del stack de Simple Icons, monocromáticos, como archivos SVG estáticos en `frontend/public/icons` generados con `npm run icons` (sin JavaScript); lo que no tiene marca (AWS, SQL Server, REST APIs) va solo como texto. Favicon: monograma de dos J superpuestas (`frontend/app/icon.svg`).

## Contacto en Home
LinkedIn (se abre en una pestaña nueva), formulario de contacto y CV Backend en inglés (PDF en `frontend/public/cv/juan-duque-backend-cv.pdf`, publicado sin teléfono; el enlace solo aparece si el archivo existe). Foto en `frontend/public/portrait.jpg` (cuadrada; idealmente ≥ 700 px de lado, porque el hero la muestra hasta 336 px); el hero la muestra solo si existe.

El título del sitio manda: Juan actualiza LinkedIn para que diga lo mismo.

Nombre: el hero muestra el nombre completo, "Juan José Duque S."; en el resto del sitio (encabezado, títulos, Open Graph, `alt`) va "Juan Duque", que es su preferencia.

## Experiencia
Vive en `frontend/content/experience.json` y sale del CV Backend. No inventar empresas, cargos ni fechas: si el CV no lo dice, no va.

## Formulario de contacto
- El botón "Email me" del hero abre el formulario en un diálogo; también está en la sección Contact (`frontend/components/contact-form.tsx`).
- Envía `POST` JSON a `${NEXT_PUBLIC_API_URL}/api/contact`. CI toma la URL de la variable de repositorio `API_URL` (por ejemplo `https://<máquina>.<tailnet>.ts.net`, sin `/` final). Mientras esté vacía, el formulario se ve pero está deshabilitado y ofrece el correo.
- Contrato que debe cumplir la API: cuerpo `{ name, email, message, website }`. `website` es el honeypot: si viene con algo, responder 2xx y descartar. Límites: name ≤ 100, email ≤ 254, message 10–5000. Respuestas: 2xx enviado, 422 datos inválidos, 429 rate limit, 5xx error. CORS para `https://jjduques.github.io`.
- En la API: validación con Pydantic, rate limiting en memoria (por IP si llega `X-Forwarded-For`, si no un límite compartido), guardar primero y notificar después vía webhook de n8n con reintentos, errores sin detalles internos, retención de 180 días.

## Fuera de alcance del MVP
Demos en vivo, versión en español, selector de tema claro/oscuro, analítica, panel de edición, SSR y bases de datos servidor.

## Decisiones pendientes
- Dominio: nombre y extensión (`.dev` o `.com`), con DNS en Cloudflare. No bloquea el MVP: el sitio funciona en `jjduques.github.io` y la API en `ts.net`. Con dominio, la API pasa a Cloudflare Tunnel (ADR 0004).
- Servicios que corren hoy en el servidor.

## Independencia del proyecto
El portafolio es independiente de cualquier otro servicio que corra en el mismo laptop.
- El portafolio trae lo suyo: instalación, Compose, secretos, backups y restauración.
- Al dimensionar, cuenta la RAM que ya usan los demás servicios del laptop y el daemon de Docker, que el presupuesto de 150–200 MB no incluye.
- La API pública no debe alcanzar los demás servicios del laptop ni la LAN. Única excepción (ADR 0004): llama al webhook de n8n en el mismo laptop, con un secreto compartido.
- Los detalles privados del servidor van en `CLAUDE.local.md`, fuera de git.

## Cómo quiero trabajar
- Responde en español; el contenido del sitio va en inglés.
- Prioriza soluciones ligeras que quepan en 2 GB de RAM.
- Documenta cada decisión importante como ADR en `docs/adr/`.
- Si una propuesta contradice una decisión tomada, dilo explícitamente antes de cambiarla.
