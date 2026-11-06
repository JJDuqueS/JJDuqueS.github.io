---
title: This site
summary: A portfolio with static pages on a CDN and a small API designed for a 2014 laptop with 2 GB of RAM.
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
role: Architecture, implementation and operations.
result: A fast static site, with the reasoning behind each decision published on the About page.
---

### Problem

A portfolio can describe what an engineer knows, but it rarely shows it. I wanted a site that demonstrates how I work, without paying for heavy infrastructure.

### Solution

The pages are built with Next.js and React, exported as static files and published to GitHub Pages, and only after the checks in CI pass. The home page draws the real path of each visit, timed by the browser. A small FastAPI service for the contact form runs on a laptop at home, published with Tailscale Funnel so no ports are open on my network, and n8n emails me each message. The laptop never compiles anything. [The About page](/about/) covers the trade-offs.
