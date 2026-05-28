# ColSwap — Marketing Site

Bilingual (es-CO / en) static marketing site for **ColSwap**, a Colombian non-custodial OTC platform for COP ↔ virtual asset conversions. Operates under Paytrium Digital Holding.

## Stack

- **Astro 4.x** — static site generator with islands architecture
- **React 18 + TypeScript** — interactive quote widget (single island)
- **Tailwind CSS v4** — CSS-first design tokens
- **Content Collections** — Zod-validated markdown for blog, FAQs, legal
- **Vitest + @testing-library/react** — unit and component tests
- **GitHub Actions** — CI + GH Pages deploy
- **Cloudflare Pages** — migration target (workflow pre-staged, disabled)

## Development

```bash
# Requires Node 20.11+
nvm use            # or install the version in .nvmrc
npm install
npm run dev        # http://localhost:4321/ColSwap-TEST/
```

## Scripts

| Script              | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start dev server                |
| `npm run build`     | Static build to `dist/`         |
| `npm run preview`   | Preview the production build    |
| `npm run typecheck` | `astro check` + `tsc --noEmit`  |
| `npm run lint`      | ESLint + Prettier (check)       |
| `npm run lint:fix`  | ESLint --fix + Prettier --write |
| `npm test`          | Run Vitest in watch mode        |
| `npm test -- --run` | Run Vitest once                 |

## Architecture

```
colswap.tech (this repo)              app.colswap.tech (future)
- Astro static build                   - Real auth + dashboard
- Bilingual es/en                      - Quote API
- Quote widget (mocked rates today)    - KYC/KYB workflow
                                       - Paytrium ops portal
       └─── CTAs only ──────────────────────┘
```

The marketing site emits CTAs to `https://app.colswap.tech/...` for login, signup, and "Continuar" from the quote widget. No authentication or user state lives in this repo.

## Project Structure

See `docs/superpowers/specs/2026-05-28-colswap-base-design.md` for the complete spec.

| Path              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `src/pages/`      | Astro pages (Spanish at root, English under `/en/`)             |
| `src/layouts/`    | BaseLayout (head/meta) and PageLayout (header + footer wrapper) |
| `src/components/` | Reusable Astro and React components                             |
| `src/content/`    | Markdown collections: `blog/`, `faqs/`, `legal/` (per locale)   |
| `src/i18n/`       | UI strings (`es.json`, `en.json`), `t()` helper, route map      |
| `src/lib/quote/`  | Quote engine: types, mock rates, `getQuote()`, formatters       |
| `src/lib/seo/`    | SEO meta helpers                                                |
| `src/styles/`     | `tokens.css` (single source of truth) + `globals.css`           |
| `tests/`          | Vitest test files                                               |

## Adding content

### Blog post

Create `src/content/blog/{es|en}/{slug}.md` with frontmatter:

```yaml
---
title: 'Post title'
urlSlug: 'kebab-case-slug'
publishDate: 2026-05-28
summary: '20-300 char summary'
tags: ['regulación']
author: 'Equipo ColSwap'
locale: 'es'
---
```

### FAQ

Create `src/content/faqs/{es|en}/{slug}.md`:

```yaml
---
question: '¿Pregunta?'
category: 'general' # general | compliance | fees | process | security
order: 5
locale: 'es'
---
Answer body in markdown.
```

### Legal document

Edit existing `src/content/legal/{es|en}/{slug}.md` files. URL slugs are constrained by the schema — adding a new one requires updating `src/content/config.ts`.

## i18n

- UI strings live in `src/i18n/es.json` and `src/i18n/en.json` and must have identical key sets (enforced by `tests/i18n-completeness.test.ts`).
- Use `t('key.path', locale)` in Astro/React.
- The `route-map.json` powers the language switcher.

## Deploy

- **Today:** every push to `main` builds and deploys to `https://sickdancemoves.github.io/ColSwap-TEST/` via `.github/workflows/deploy.yml`.
- **Tomorrow:** when migrating to Cloudflare Pages, set Cloudflare secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`), enable `.github/workflows/deploy-cloudflare.yml` (add a `push` trigger), update `site` and remove `base` in `astro.config.mjs`, and point DNS.

## Future evolution

Two seams are pre-built:

1. **Quote source** — `src/lib/quote/get-quote.ts` swaps from mock to real API with no component changes.
2. **Deploy target** — static `dist/` output is host-agnostic. Migration is changing the workflow target.

## References

- Spec: `docs/superpowers/specs/2026-05-28-colswap-base-design.md`
- Plan: `docs/superpowers/plans/2026-05-28-colswap-base-implementation.md`
- Business brief: held by Paytrium (WIP, internal)
