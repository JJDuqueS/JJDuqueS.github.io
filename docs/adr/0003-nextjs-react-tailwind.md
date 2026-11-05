# 0003. Next.js, React and Tailwind for the frontend

Date: 2026-11-05
Status: Accepted

Supersedes 0001 (Astro with React islands). ADR 0002 still stands: the frontend is static and published to GitHub Pages.

## Context
The portfolio is part of my CV. The first version, in Astro, worked and was fast, but it showed almost no React, and its visual design was too plain to hold a visitor's attention. React and Next.js are what most of the roles I apply to ask for. The site has to stay static, cost nothing and keep a per-page Open Graph preview for LinkedIn.

## Decision
Build the frontend with Next.js (App Router) and React, styled with Tailwind CSS and animated with Motion. Publish it as a static export (`output: 'export'`) to GitHub Pages.

## Trade-offs
- Pro: the whole site is React and TypeScript, the stack the roles I apply to ask for.
- Pro: Motion and the React ecosystem make an interactive, animated site straightforward.
- Pro: a static export runs on Vercel unchanged, so moving there later means connecting the repository and nothing more.
- Con: every page ships the React runtime, so pages carry more JavaScript than the Astro version did.
- Con: a static export gives up Next.js server features: image optimization, route handlers, middleware and incremental regeneration.
- Con: more dependencies to keep up to date.

## Alternatives considered
- Keep Astro and add more design: fast and light, but React stays a small part of the code.
- Vite + React: pure React, but prerendering, per-page metadata and routing would be built by hand.
- Next.js on Vercel from the start: all features, but it moves hosting before any feature needs it. It stays the next step when one does.
