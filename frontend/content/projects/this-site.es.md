---
title: Este sitio
summary: Un portafolio con páginas estáticas en una CDN y una pequeña API diseñada para un laptop de 2014 con 2 GB de RAM.
order: 2
stack:
  - Next.js
  - React
  - TypeScript
  - Tailwind CSS
  - Motion
  - FastAPI
  - SQLite
  - Docker
  - Tailscale Funnel
  - n8n
  - GitHub Actions
  - GitHub Pages
role: Arquitectura, implementación y operación.
result: Un sitio estático y rápido, con el razonamiento detrás de cada decisión publicado en la página Acerca de.
---

### Problema

Un portafolio puede describir lo que sabe un ingeniero, pero rara vez lo demuestra. Quería un sitio que mostrara cómo trabajo, sin pagar por infraestructura pesada.

### Solución

Las páginas están hechas con Next.js y React, exportadas como archivos estáticos y publicadas en GitHub Pages, solo después de que pasan los chequeos del CI. La página de inicio dibuja el recorrido real de cada visita, medido por el navegador. Un pequeño servicio FastAPI para el formulario de contacto corre en un laptop en mi casa, publicado con Tailscale Funnel para no abrir puertos en mi red, y n8n me envía cada mensaje por correo. El laptop nunca compila nada. El sitio también está en inglés, y cada versión está escrita, no traducida por máquina. [La página Acerca de](/es/about/) explica los pros y contras.
