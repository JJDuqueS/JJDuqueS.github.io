# Contexto: portafolio personal de Juan

Actualiza este archivo cuando se cierre una decisión pendiente.

## Quién soy
Software Engineer con enfoque backend. Stack principal: Python y Node.js en backend; React, Vue y TypeScript en frontend; PostgreSQL; Docker y AWS (S3, SQS). Sin experiencia en Azure: no mencionarlo. Más de 4 años como Full Stack Developer (backend-focused) en Unitti (2021–2026, remoto). Inglés C1. Basado en Colombia (UTC−5). Abierto a cualquier rol remoto.

## Qué estamos construyendo
Un portafolio personal en inglés (español opcional), estático y rápido. Esquema híbrido (ADR 0002): el frontend se publica en GitHub Pages y la API corre en un laptop ASUS X200MA en mi casa: Celeron N2830 (x86_64), 2 GB de RAM, HDD de 500 GB, Ubuntu. La infraestructura del propio sitio es un caso de estudio central: la página About explica las decisiones de arquitectura con sus pros y contras.

## Arquitectura decidida
- Frontend estático con Astro e islas de React (ADR 0001), con rutas prerenderizadas y metadatos Open Graph por página.
- Contenido de proyectos en archivos versionados (Markdown/JSON), compilado en el build. No hay tabla `projects` ni `GET /api/projects`.
- API FastAPI (un solo worker) con `GET /api/health` (incluye uptime, carga y RAM, sin datos sensibles) y `POST /api/contact`.
- SQLite dedicado al portafolio, solo para mensajes de contacto. Directorio montado en Docker (modo WAL), migraciones, `busy_timeout`, backups con `.backup` o `VACUUM INTO`.
- Frontend en GitHub Pages (ADR 0002): el repo se renombra a `JJDuqueS.github.io` para servir en la raíz (`https://jjduques.github.io`), sin `base`. Con dominio propio: `CNAME` en `frontend/public/` y cambiar `site`.
- Enlaces internos siempre absolutos desde la raíz (`/about`); funcionan porque no hay `base`.
- API en el laptop detrás de Caddy, expuesta con Cloudflare Tunnel en su propio hostname; necesita CORS para el origen del sitio. No se abren puertos en el router.
- CI/CD: GitHub Actions ejecuta lint, tests y build; solo si pasan, el job `deploy` publica `frontend/dist` en GitHub Pages (solo desde `main`). Para la API: imágenes `linux/amd64` en GHCR que el servidor descarga. Nunca se compila en el servidor.
- Docker Compose para desarrollo y producción.
- Monitor de disponibilidad externo.

## Páginas
- Home: presentación, título "Software Engineer" con subtítulo de especialización, stack y contacto.
- Projects: casos de estudio (problema, solución, stack, mi rol, resultado). Proyectos: Sunward (app React Native/Expo de posición del sol con sensores) y el propio portafolio; por ahora solo estos dos. Sin enlaces a repositorios por ahora.
- About: la infraestructura del sitio, sus decisiones y trade-offs, alimentada por los ADRs del repositorio.

## Estilo visual
Editorial sobrio en tema oscuro, con la paleta del banner de LinkedIn: fondo `#030B0A` y un solo acento, el verde `#00E68C`. La tipografía manda y hay mucho aire; nada de rejillas de neón ni brillos. Sin fuentes web.

## Contacto en Home
LinkedIn, correo y CV Backend en inglés (PDF en `frontend/public/cv/juan-duque-backend-cv.pdf`, publicado sin teléfono; el enlace solo aparece si el archivo existe). Foto en `frontend/src/assets/portrait.jpg` (cuadrada; .png/.webp también sirven); el hero la muestra solo si existe.

El título del sitio manda: Juan actualiza LinkedIn para que diga lo mismo.

## Experiencia
Vive en `frontend/src/content/experience.json` y sale del CV Backend. No inventar empresas, cargos ni fechas: si el CV no lo dice, no va.

## Formulario de contacto
Validación con Pydantic, rate limiting, honeypot, guardar primero y notificar después (n8n o SMTP, pendiente), errores sin detalles internos, retención limitada.

## Fuera de alcance del MVP
Demos en vivo, versión en español, selector de tema claro/oscuro, analítica, panel de edición, SSR y bases de datos servidor.

## Decisiones pendientes
- Notificación de contacto: SMTP directo desde FastAPI o n8n.
- Dominio: nombre y extensión (`.dev` o `.com`), con DNS en Cloudflare. No bloquea el MVP: el sitio funciona en `jjduques.github.io`.
- Servicios que corren hoy en el servidor.

## Independencia del proyecto
El portafolio es independiente de cualquier otro servicio que corra en el mismo laptop.
- El portafolio trae lo suyo: instalación, Compose, secretos, backups y restauración.
- Al dimensionar, cuenta la RAM que ya usan los demás servicios del laptop y el daemon de Docker, que el presupuesto de 150–200 MB no incluye.
- La API pública no debe alcanzar los demás servicios del laptop ni la LAN.
- Los detalles privados del servidor van en `CLAUDE.local.md`, fuera de git.

## Cómo quiero trabajar
- Responde en español; el contenido del sitio va en inglés.
- Prioriza soluciones ligeras que quepan en 2 GB de RAM.
- Documenta cada decisión importante como ADR en `docs/adr/`.
- Si una propuesta contradice una decisión tomada, dilo explícitamente antes de cambiarla.
