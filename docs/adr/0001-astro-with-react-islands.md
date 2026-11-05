# 0001. Astro with React islands for the frontend

Date: 2026-10-31
Status: Superseded by 0003

## Context
The site is mostly static content served by Caddy from a laptop with a Celeron N2830 and 2 GB of RAM. There is no Node process in production and nothing is compiled on the server. Each page needs prerendered HTML and its own Open Graph metadata, so links look right when shared on LinkedIn. Project content lives in versioned Markdown or JSON files, and a Spanish version may come later.

## Decision
Build the frontend with Astro as a static site, and use React only for the parts that need interactivity, such as the contact form.

## Trade-offs
- Pro: pages ship as plain HTML, with JavaScript only where an island needs it.
- Pro: prerendering, Markdown content and per-language routes come built in.
- Pro: React stays in use, which matches my main stack.
- Con: it adds a framework and its conventions on top of React.
- Con: most of the site is written as Astro components, not React.

## Alternatives considered
- Vite + React with prerender: pure React, but prerendering, metadata and content handling would need extra setup, and every page would tend to ship more JavaScript.
