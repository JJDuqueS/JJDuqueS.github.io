# 0002. Static frontend on GitHub Pages, API on the laptop

Date: 2026-11-04
Status: Accepted (exposure replaced by 0004)

Supersedes the hosting part of the original plan, where Caddy on the laptop served both the static pages and the API. ADR 0001 (Astro with React islands) still stands.

## Context
The laptop at home is a single point of failure: when the power or the internet goes out, everything it serves goes with it. Most of the site is static HTML, which does not need a server of its own. The budget is as close to zero as possible, and there is no domain yet. The API (`/api/health` and `/api/contact`) is not built yet.

## Decision
Publish the static frontend on GitHub Pages, deployed from GitHub Actions only after lint, build and tests pass. When the API exists, run it on the laptop and expose it through Cloudflare Tunnel on its own hostname.

## Trade-offs
- Pro: the pages stay up when the laptop or the home connection is down. Only the API goes with it.
- Pro: costs nothing, and publishing lives in the same CI that already checks the code.
- Pro: a static site moves to another host (Cloudflare Pages, Caddy on the laptop) by changing the deploy step, not the code.
- Con: the API lives on another origin, so it needs CORS for the site's origin.
- Con: GitHub Pages cannot set custom HTTP headers (for example a Content-Security-Policy). Only a `<meta>` CSP is possible.
- Con: the site depends on GitHub for hosting as well as for code and CI.
- Con: the story is no longer "the whole site runs on a laptop". The About page has to say exactly which part does.

## Consequences
- The repository is renamed to `JJDuqueS.github.io`, so the site is served at the root (`https://jjduques.github.io`) and `base` stays unset. With a custom domain later, a `CNAME` file goes in `frontend/public/` and `site` changes to that domain.
- Caddy on the laptop only fronts the API.

## Alternatives considered
- Everything on the laptop: the original plan. A power or internet outage takes the whole portfolio offline, often right when a recruiter opens it.
- Cloudflare Pages: also free, with preview deployments and custom headers. It needs a separate account and makes most sense once the domain is on Cloudflare. It stays the first option if GitHub Pages falls short.
- Keeping the repository name `portfolio`: the site would be served under `/portfolio`, and every internal link would need the base path.
