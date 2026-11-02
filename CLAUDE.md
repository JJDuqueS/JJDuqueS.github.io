# Contexto: portafolio personal de Juan

Actualiza este archivo cuando se cierre una decisión pendiente.

## Quién soy
Software Engineer con enfoque backend. Stack principal: Python (FastAPI) y React. Experiencia cloud en AWS y Azure. Busco roles remotos internacionales.

## Qué estamos construyendo
Un portafolio personal en inglés (español opcional), estático y rápido, autoalojado en un laptop ASUS X200MA en mi casa: Celeron N2830 (x86_64), 2 GB de RAM, HDD de 500 GB, Ubuntu. La infraestructura del propio sitio es un caso de estudio central: la página About explica las decisiones de arquitectura con sus pros y contras.

## Arquitectura decidida
- Frontend estático con Astro e islas de React (ADR 0001), con rutas prerenderizadas y metadatos Open Graph por página.
- Contenido de proyectos en archivos versionados (Markdown/JSON), compilado en el build. No hay tabla `projects` ni `GET /api/projects`.
- API FastAPI (un solo worker) con `GET /api/health` (incluye uptime, carga y RAM, sin datos sensibles) y `POST /api/contact`.
- SQLite dedicado al portafolio, solo para mensajes de contacto. Directorio montado en Docker (modo WAL), migraciones, `busy_timeout`, backups con `.backup` o `VACUUM INTO`.
- Caddy sirve los estáticos y reenvía `/api/*` a FastAPI.
- Publicación con Cloudflare Tunnel y dominio propio; no se abren puertos en el router.
- CI/CD: GitHub Actions ejecuta lint, tests y build, publica imágenes `linux/amd64` en GHCR, y el servidor las descarga. Nunca se compila en el servidor.
- Docker Compose para desarrollo y producción.
- Monitor de disponibilidad externo.

## Páginas
- Home: presentación, título "Software Engineer" con subtítulo de especialización, stack y contacto.
- Projects: casos de estudio (problema, solución, stack, mi rol, resultado). Proyectos: Sunward (app React Native/Expo de posición del sol con sensores) y el propio portafolio; un tercero por definir. Sin enlaces a repositorios por ahora.
- About: la infraestructura del sitio, sus decisiones y trade-offs, alimentada por los ADRs del repositorio.

## Formulario de contacto
Validación con Pydantic, rate limiting, honeypot, guardar primero y notificar después (n8n o SMTP, pendiente), errores sin detalles internos, retención limitada.

## Fuera de alcance del MVP
Demos en vivo, versión en español, modo oscuro, analítica, panel de edición, SSR y bases de datos servidor.

## Decisiones pendientes
- Tercer proyecto destacado: pb-backend o el pipeline de envío de CV en n8n.
- Notificación de contacto: SMTP directo desde FastAPI o n8n.
- Dominio: nombre y extensión (`.dev` o `.com`), con DNS en Cloudflare.
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
