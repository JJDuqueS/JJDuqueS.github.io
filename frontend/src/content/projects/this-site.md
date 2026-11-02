---
title: This site
summary: A self-hosted portfolio built to fit on a 2014 laptop with 2 GB of RAM.
order: 2
stack:
  - Astro
  - React
  - FastAPI
  - SQLite
  - Caddy
  - Docker
  - Cloudflare Tunnel
  - GitHub Actions
role: Architecture, implementation and operations.
result: A fast static site, with the reasoning behind each decision published on the About page.
---

### Problem

A portfolio can describe what an engineer knows, but it rarely shows it. I wanted a site that demonstrates how I work, without paying for heavy infrastructure.

### Solution

The site is prerendered and served as static files, with a small API for the contact form. Everything is built in CI and only runs on the server, which never compiles anything. Traffic reaches it through a tunnel, so no ports are open on my home network. [The About page](/about) covers the trade-offs.
