# Frontend

Static site built with Astro and React islands (see [ADR 0001](../docs/adr/0001-astro-with-react-islands.md)). Requires Node 22.23.4 or newer.

```sh
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serves dist/ locally
npm run lint     # astro check and ESLint
npm test         # checks the built site, so run the build first
```
