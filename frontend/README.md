# Frontend

Next.js (App Router), React, TypeScript, Tailwind CSS and Motion, exported as a static site to `out/` and published to GitHub Pages by CI. See `docs/adr/0002` and `docs/adr/0003`.

```bash
npm ci
npm run dev      # http://localhost:3000
npm run lint     # route types, type check and ESLint
npm run build    # static export in out/
npm test         # unit tests and checks on the exported site (run the build first)
```

Pages exist in English (`app/(en)`) and Spanish (`app/(es)/es`), rendering the shared components in `components/pages/`. Interface strings are in `lib/i18n.ts`; Spanish content sits next to the English as `*.es.md` and `*.es.json`. Change both languages together (ADR 0005).

Content lives in `content/`: case studies in `content/projects/*.md`, work history in `content/experience.json` (from the Backend CV only) and the stack in `content/stack.json`. The résumé is `public/cv/juan-duque-backend-cv.pdf`, published without the phone number.
