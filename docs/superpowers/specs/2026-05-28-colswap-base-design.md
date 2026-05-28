# ColSwap — Marketing Site v1 Design

**Status:** Approved (2026-05-28)
**Author:** Diego Ampuero with Claude
**Repo:** `sickdancemoves/ColSwap-TEST`
**Deploy:** `https://sickdancemoves.github.io/ColSwap-TEST/` (today) → custom domain + alternate host later

---

## 1. Summary

A bilingual (es-CO default, en secondary) static marketing site for **ColSwap**, a Colombian non-custodial OTC platform that converts between Colombian pesos (COP) and virtual assets. The site is a marketing surface only — it does **not** hold accounts, custody funds, or perform authentication. Login/register CTAs link to a future separate subdomain (`app.colswap.tech`) where the real client portal + Paytrium ops backend ("the intranet") will live.

The build pipeline is **Astro** (static SSG) with a single **React TypeScript** island for the quote widget. Output is host-agnostic static HTML/CSS/JS, deployed to GitHub Pages today and ready to migrate to Cloudflare Pages or Vercel later with zero rewrite.

## 2. Business context

ColSwap operates as a non-custodial OTC platform in Colombia. It never holds funds; it coordinates each transaction in real time between a local fiat provider and a crypto liquidity provider, executing the exchange and delivering assets directly to the client's wallet. Registered with UIAF as a VASP. Target customers are Colombian businesses with recurring high-volume COP↔crypto needs (cross-border payments, fintechs, startups) plus B2C retail. KYC is automatic (online); KYB is manual (sales-led). Holding company: Paytrium Digital Holding.

Source: `COL - ColSwap Business Brief (WIP) (1).pdf` (May 2026, internal).

## 3. Goals & non-goals

### In scope (v1)

- 8 marketing pages × 2 locales (es-CO default, en secondary)
- Markdown-driven blog (collection) and legal documents (collection)
- Markdown-driven FAQs (collection)
- Interactive quote widget on the home page with mocked rates
- Sales contact information page (no form at v1)
- Login/Register **CTAs** that link to a future app subdomain
- GitHub Pages deploy via GitHub Actions
- Migration-ready architecture: portable static output, pre-staged Cloudflare Pages workflow
- i18n with build-time completeness checks
- Lighthouse-grade performance, accessibility, and SEO defaults

### Out of scope (v1, deferred)

- Authentication, login, register, KYC flows, account dashboard — these all live at the future `app.colswap.tech` subdomain
- Real-time quote API — widget is mocked; same function signature swaps to real API later
- Contact form backend — page shows email address only; Cloudflare Worker contact form added after migration
- Directional SEO landing pages (`/buy/usdt`, `/sell/btc`, etc.) — defer until rates API is live
- Custom domain — defer until brand is finalized
- E2E tests — defer until auth flows exist on the app subdomain
- Final brand identity — placeholder yellow + red palette until final identity arrives

## 4. Architecture

```
┌──────────────────────────────┐        ┌────────────────────────────────┐
│  colswap.tech (TBD)          │        │  app.colswap.tech (TBD)        │
│  Marketing site              │        │  Auth + dashboard + ops portal │
│  (THIS repo)                 │        │  (separate, future)            │
│                              │        │                                │
│  • Astro static build        │ ─CTAs→ │  • Out of scope for this spec  │
│  • Bilingual es/en           │        │  • Login / Register            │
│  • Quote widget (React       │        │  • KYC, KYB workflows          │
│    island, mocked rates)     │        │  • Request history             │
│  • Content collections       │        │  • Paytrium ops dashboard      │
│  • GH Pages today            │        │  • Quote API (server-side)     │
│  • CF Pages / Vercel ready   │        │                                │
└──────────────────────────────┘        └────────────────────────────────┘
```

The two systems communicate by **URL only** at v1. The marketing site emits `https://app.colswap.tech/...?from=COP&to=USDT&amount=1000` style intent-carrying links. The app subdomain receives, authenticates, and resumes the conversion flow. No shared cookies, no shared session, no CORS coupling.

## 5. Repo structure

```
ColSwap-TEST/
├── .github/
│   └── workflows/
│       ├── deploy.yml                # GH Pages — active
│       └── deploy-cloudflare.yml     # CF Pages — disabled, ready
├── docs/
│   └── superpowers/specs/
│       └── 2026-05-28-colswap-base-design.md   # this file
├── public/
│   ├── favicon.svg
│   ├── og/                            # social preview images
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── nav/Header.astro
│   │   ├── nav/Footer.astro
│   │   ├── nav/LanguageSwitcher.astro
│   │   ├── quote/QuoteWidget.tsx      # the only React island
│   │   ├── quote/QuoteResult.tsx
│   │   ├── cta/SalesContactCTA.astro
│   │   ├── trust/ComplianceBadges.astro
│   │   └── content/MarkdownPage.astro
│   ├── content/
│   │   ├── config.ts                  # zod schemas for all collections
│   │   ├── blog/
│   │   │   ├── es/*.md
│   │   │   └── en/*.md
│   │   ├── faqs/
│   │   │   ├── es/*.md
│   │   │   └── en/*.md
│   │   └── legal/
│   │       ├── es/*.md
│   │       └── en/*.md
│   ├── i18n/
│   │   ├── es.json                    # UI strings — Spanish
│   │   ├── en.json                    # UI strings — English
│   │   ├── route-map.json             # path equivalences across locales
│   │   └── t.ts                       # t(key, locale) helper with build-time validation
│   ├── layouts/
│   │   ├── BaseLayout.astro           # html, head, meta, OG, canonical, hreflang
│   │   └── PageLayout.astro           # BaseLayout + header + main + footer
│   ├── lib/
│   │   ├── quote/
│   │   │   ├── mock-rates.ts          # static rates + spread + jitter
│   │   │   ├── get-quote.ts           # the swap-in seam: real API later
│   │   │   └── formatters.ts          # locale-aware number / currency formatting
│   │   └── seo/
│   │       └── meta.ts                # OG, twitter, canonical helpers
│   ├── pages/
│   │   ├── index.astro                # ES home (quote widget hero)
│   │   ├── como-funciona.astro
│   │   ├── precios.astro
│   │   ├── empresas.astro
│   │   ├── cumplimiento.astro
│   │   ├── sobre-nosotros.astro
│   │   ├── contacto.astro
│   │   ├── preguntas-frecuentes.astro
│   │   ├── blog/index.astro
│   │   ├── blog/[slug].astro
│   │   ├── legal/[slug].astro
│   │   └── en/
│   │       ├── index.astro
│   │       ├── how-it-works.astro
│   │       ├── pricing.astro
│   │       ├── business.astro
│   │       ├── compliance.astro
│   │       ├── about.astro
│   │       ├── contact.astro
│   │       ├── faqs.astro
│   │       ├── blog/index.astro
│   │       ├── blog/[slug].astro
│   │       └── legal/[slug].astro
│   └── styles/
│       ├── tokens.css                 # design tokens (single source of truth)
│       └── globals.css                # base styles, resets
├── tests/
│   ├── quote.test.ts                  # get-quote / spread math
│   ├── formatters.test.ts             # locale formatting
│   ├── i18n-completeness.test.ts      # diff es.json / en.json
│   └── components/QuoteWidget.test.tsx
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

## 6. Pages inventory

### Marketing pages (8, × 2 locales = 16 routes)

| Spanish (default) | English | Purpose |
|---|---|---|
| `/` | `/en/` | Home: hero with quote widget + B2B sales CTA + trust signals (UIAF, KYC/KYB, AML) |
| `/como-funciona/` | `/en/how-it-works/` | OTC flow explainer (4 steps: request → quote → wire → settle) |
| `/precios/` | `/en/pricing/` | Spread structure, volume tiers, no hidden fees messaging |
| `/empresas/` | `/en/business/` | B2B-focused: KYB process, dedicated account managers, use cases |
| `/cumplimiento/` | `/en/compliance/` | UIAF registration, SARLAFT/SAGRILAFT, KYC/KYB, AML — the regulated-trust page |
| `/sobre-nosotros/` | `/en/about/` | Paytrium Digital Holding context, mission, team (placeholder copy v1) |
| `/contacto/` | `/en/contact/` | Email contact info, future Calendly link, address. No form at v1. |
| `/preguntas-frecuentes/` | `/en/faqs/` | FAQ accordion rendered from `src/content/faqs/{locale}/*.md` |

### Dynamic content routes

| Pattern | Locales | Source |
|---|---|---|
| `/blog/` + `/blog/[slug]/` | es default, `/en/blog/...` mirror | `src/content/blog/{locale}/*.md` |
| `/legal/[slug]/` | es default, `/en/legal/...` mirror | `src/content/legal/{locale}/*.md` |

Legal documents at v1: `terminos`, `privacidad`, `aml`, `cookies` (and their English equivalents `terms`, `privacy`, `aml`, `cookies`).

### CTAs (links only, no pages on this site)

| Element | Today | Future |
|---|---|---|
| "Iniciar sesión" / "Sign in" | `https://app.colswap.tech/login` (404 until subdomain exists) | Real login on app subdomain |
| "Crear cuenta" / "Sign up" | `https://app.colswap.tech/signup` | Real signup |
| "Continuar" (from quote widget) | `https://app.colswap.tech/request?from=...&to=...&amount=...` | Real request flow |
| "Hablar con ventas" | `mailto:ventas@colswap.tech?subject=...` | Form via CF Worker after migration |

## 7. Routing & i18n

- **Spanish is the default locale** and lives at the root (`/`, `/como-funciona/`, etc.) — no `/es/` prefix.
- **English lives under `/en/...`**.
- **Astro's built-in i18n config** is used (`i18n.defaultLocale = 'es'`, `i18n.locales = ['es', 'en']`, `i18n.routing.prefixDefaultLocale = false`).
- **Language switcher** in the header reads `src/i18n/route-map.json` to find the translated equivalent of the current path. Falls back to the locale's home if no mapping exists.
- **`<link rel="alternate" hreflang="...">`** tags are emitted in `BaseLayout.astro` for both locales of every page.
- **Default `lang` attribute** is set per page based on locale.

### UI strings (`src/i18n/{es,en}.json`)

Flat keyed JSON, e.g.:

```json
{
  "nav.home": "Inicio",
  "nav.howItWorks": "Cómo funciona",
  "cta.requestQuote": "Solicitar cotización",
  "cta.talkToSales": "Hablar con ventas",
  "quote.fromCurrency": "Desde",
  "quote.toCurrency": "Hacia",
  "quote.amount": "Cantidad",
  "quote.rate": "Tasa",
  "quote.spread": "Spread incluido",
  "quote.disclaimer": "Tasas indicativas. Cotización final al iniciar sesión."
}
```

The `t(key, locale)` helper in `src/i18n/t.ts` throws if a key is missing. A build-time check (`tests/i18n-completeness.test.ts`) diffs `es.json` and `en.json` keys and fails CI if they differ.

## 8. Content model

Astro **content collections** with Zod schemas. Defined in `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['es', 'en']);

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    summary: z.string().max(200),
    tags: z.array(z.string()).default([]),
    author: z.string().default('ColSwap'),
    heroImage: z.string().optional(),
    locale: localeEnum,
  }),
});

const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string(),
    category: z.enum(['general', 'compliance', 'fees', 'process', 'security']),
    order: z.number().int().nonnegative(),
    locale: localeEnum,
  }),
});

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    slug: z.enum(['terminos', 'privacidad', 'aml', 'cookies', 'terms', 'privacy']),
    lastUpdated: z.coerce.date(),
    version: z.string(),
    locale: localeEnum,
  }),
});

export const collections = { blog, faqs, legal };
```

The build fails fast if any markdown file is missing required frontmatter.

## 9. Quote widget contract

**File:** `src/components/quote/QuoteWidget.tsx`

The widget is loaded with `client:idle` (hydrated after the page becomes interactive) so it does not block the initial paint.

### Props

```ts
interface QuoteWidgetProps {
  locale: 'es' | 'en';
  pairs: QuotePair[];       // injected from a config file
  defaultPair?: PairId;
  appBaseUrl: string;        // for the "Continuar" CTA (env var)
}

type QuotePair = {
  id: 'COP-USDT' | 'USDT-COP' | 'COP-USDC' | 'USDC-COP';
  from: { code: 'COP' | 'USDT' | 'USDC'; label: string; decimals: number; min: number };
  to:   { code: 'COP' | 'USDT' | 'USDC'; label: string; decimals: number };
};
```

### Internal contract

```ts
// src/lib/quote/get-quote.ts
export interface QuoteRequest {
  pairId: PairId;
  amount: number;
  side: 'from' | 'to';   // user typed in the source or target box
}

export interface QuoteResponse {
  pairId: PairId;
  rate: number;                  // mid + spread embedded
  spreadBps: number;             // for display ("Spread incluido: 1.5%")
  fromAmount: number;
  toAmount: number;
  validUntil: string;            // ISO timestamp — 60s validity
  source: 'mock' | 'api';        // for the small badge
}

export async function getQuote(req: QuoteRequest): Promise<QuoteResponse>;
```

### Mock implementation (v1)

`src/lib/quote/mock-rates.ts` exports a static `MOCK_MID_RATES` map. `getQuote()` applies a 150 bps spread plus ±10 bps random jitter, returns a 60-second validity window. The `source: 'mock'` field drives a small "Tasas indicativas" badge in the UI.

### Future API swap

When the quote API lives on `app.colswap.tech/api/quote`, only `get-quote.ts` changes — it `fetch()`es the endpoint and returns the same shape with `source: 'api'`. **No component changes.**

### "Continuar" CTA

Builds a URL: `${appBaseUrl}/request?pair=${pairId}&amount=${amount}&side=${side}&q=${signedQuoteId}` and navigates.

At v1, `signedQuoteId` is omitted (mock quotes are not signed). When the real API exists, it will return a server-signed quote id that the app subdomain verifies before binding to the request.

## 10. Visual design tokens

All colors, type, spacing, and radii are declared once in `src/styles/tokens.css` as CSS custom properties on `:root`. Tailwind v4's CSS-first config reads them directly. Components reference Tailwind utility classes, never raw hex values.

### Palette (placeholder — final identity replaces this)

```css
:root {
  /* Brand — Colombian yellow */
  --col-yellow-500: #FFD100;    /* primary */
  --col-yellow-700: #D6A800;    /* hover, deeper surfaces */
  --col-yellow-100: #FFF7CC;    /* tints, callouts */

  /* Accent — Colombian red */
  --col-red-500: #C8102E;       /* emphasis, errors */
  --col-red-700: #8E0B20;       /* red hover */

  /* Neutrals */
  --col-ink-900: #0E0E10;       /* body text */
  --col-ink-600: #4A4A52;       /* secondary text */
  --col-ink-400: #8A8A92;       /* tertiary, disabled */
  --col-paper-50: #FAFAF7;      /* page bg — warm white */
  --col-paper-200: #E9E5DA;     /* dividers */
  --col-paper-900: #1A1A1C;     /* dark surfaces (footer) */

  /* Semantic */
  --col-success: #1B7F3B;
  --col-warning: var(--col-yellow-700);
  --col-danger: var(--col-red-500);

  /* Type */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Spacing — 4px base, modular */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* Radii — restrained */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 16px 32px rgba(0,0,0,0.08);
}
```

### Typography

- **Body / UI:** Inter (Variable, self-hosted via `@fontsource-variable/inter`)
- **Display:** Inter (same family at higher weights) at v1; a distinct display face may be introduced when final identity lands
- **Mono:** JetBrains Mono for any code or asset codes (e.g., wallet addresses)
- **Scale:** modular 1.250, base 16px → 12.8, 16, 20, 25, 31.25, 39.06, 48.83

### Iconography

- **Lucide** (`lucide-react` for the widget, `astro-icon` with `@iconify-json/lucide` for static Astro components)
- Stroke 1.5px default, 24px default size

## 11. Forms / contact strategy

**v1: no form.** The `/contacto/` page shows:

- A primary contact email: `ventas@colswap.tech` (placeholder address; needs to be created in Workspace before launch)
- A general/support email: `hola@colswap.tech` (placeholder)
- A planned Calendly link (commented out until the link exists)
- A note inviting B2B clients to reach out for KYB onboarding

**Future:** when the site migrates to Cloudflare Pages (or earlier if needed), a Cloudflare Worker function at `/api/contact` will accept POST submissions, validate (Turnstile), and forward to email + Slack. The form UI will be added to the contact page at that time.

## 12. Deploy & CI/CD

### GitHub Pages workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --run
      - run: npm run build
        env:
          PUBLIC_APP_BASE_URL: https://app.colswap.tech
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Cloudflare Pages workflow (`.github/workflows/deploy-cloudflare.yml`)

Shipped in the repo but with `on: workflow_dispatch:` only (no push trigger) so it does not run until manually enabled. Documented in README as the migration path.

### Astro config (`astro.config.mjs`)

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sickdancemoves.github.io',
  base: '/ColSwap-TEST',
  trailingSlash: 'always',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwind()] },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
```

When custom domain + CF Pages migration happens, `site` becomes `https://colswap.tech` and `base` is removed.

### Quality gates (must pass before merge)

- `npm run lint` — ESLint + Prettier check
- `npm run typecheck` — `astro check` + `tsc --noEmit`
- `npm test -- --run` — Vitest suite
- `npm run build` — production build must succeed
- Lighthouse CI on PR (advisory at first, blocking after baseline established)

## 13. Testing & quality

| Layer | Tool | Coverage target |
|---|---|---|
| Unit | Vitest | `src/lib/quote/*` (math, edges), `src/lib/seo/*`, `src/i18n/t.ts` |
| Component | Vitest + React Testing Library | `QuoteWidget` (direction switching, amount validation, locale formatting) |
| i18n completeness | Vitest assertion | `es.json` keys ≡ `en.json` keys |
| Content schema | Astro build | Zod schemas reject malformed frontmatter at build time |
| Links | `astro-broken-links-checker` or similar | All internal links resolve on built `dist/` |
| Performance | Lighthouse CI | Performance ≥ 90, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95 |
| E2E | (deferred) | Add Playwright once auth flows land on the app subdomain |

## 14. Future evolution & migration seams

The design has two deliberate seams that make future migration trivial:

### Seam 1 — quote source

```ts
// today
const quote = await getQuote(req);   // hits mock-rates.ts

// later
const quote = await getQuote(req);   // hits app.colswap.tech/api/quote
```

Component code, props, and JSX are unchanged. Only the body of `get-quote.ts` swaps. The `source: 'mock' | 'api'` field drives a visible badge change without code changes.

### Seam 2 — deploy target

```
GH Pages workflow (active) → static dist/ → GH Pages
                                   │
                                   ↓
CF Pages workflow (disabled) → static dist/ → Cloudflare Pages
                                   │
                                   ↓ (when ready)
Astro adapter @astrojs/cloudflare → SSR routes possible
```

The static `dist/` output is host-agnostic. Migration is: enable the CF workflow, point DNS, disable the GH workflow. Hours, not weeks.

### Adding real auth later

When `app.colswap.tech` exists, the marketing site changes only:

1. `PUBLIC_APP_BASE_URL` env var stays the same (`https://app.colswap.tech`)
2. CTAs that today 404 will resolve
3. Quote widget "Continuar" carries the same querystring, now consumed by the real app

No marketing-site code touches.

### Adding contact form later

1. Add a Cloudflare Pages Function at `functions/api/contact.ts`
2. Add a `<ContactForm />` Astro/React component on `/contacto/` page
3. Wire form submission to `POST /api/contact`
4. Done — no architectural changes

### Adding directional landing pages later

When live rates exist:

1. Add `src/data/assets.ts` config (one entry per asset)
2. Add `src/pages/comprar/[asset].astro` + `vender/[asset].astro` with `getStaticPaths()` reading the config
3. SEO copy generated from a template + per-asset overrides
4. Sitemap automatically picks them up

## 15. Open placeholders to resolve before launch

| Item | Owner | Notes |
|---|---|---|
| Final brand identity (logo, colors, type) | Diego / brand partner | Yellow + red placeholder valid until then |
| Custom domain choice (`colswap.tech` / `colswap.co` / other) | Diego | Brief leaves blank |
| Real contact emails (`ventas@`, `hola@`) | Paytrium IT | Need before any "real" launch |
| Compliance copy (UIAF, SARLAFT, AML disclosures) | Paytrium compliance team | Markdown, easy to edit |
| Initial blog posts | TBD | Site ships with 0 posts and an empty index gracefully |
| Sales Calendly link | Sales | Placeholder until then |
| English translations of all UI strings | Diego / translator | es.json complete; en.json may start partial with `t()` throwing fail-fast for missing keys |

## 16. Decisions log (Q&A trail)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Auth UI placement | Marketing CTAs only → real auth at future `app.colswap.tech` (fly-pay.io pattern) | Keeps GH Pages site pure-static; lets intranet evolve independently; no CORS coupling |
| 2 | Languages | Bilingual es-CO (default) + en, path-prefix routing | B2B pipeline includes USD-cross-border clients; Spanish primary because Colombian market |
| 3 | Conversion CTA | Quote widget hero (mocked) + B2B "Hablar con ventas" CTA | Dual funnel matches B2C + B2B target; widget validates the UX before real API |
| 4 | Visual identity | Placeholder: 2 yellow shades + red accents (Colombian flag) | No brand book yet; placeholder distinguishes ColSwap from blue/green fintech default |
| 5 | Build pipeline | Astro + React island | "As pro as possible" + portable to any host; islands keep marketing site at 0 JS |
| 6 | Quote widget framework | React + TypeScript | Largest ecosystem, most familiar; ~40KB hydration overhead acceptable for one island |
| 7 | Contact form backend | Skip at v1 — email only | Defer until CF Pages migration enables the Worker |
| 8 | Custom domain | None at v1 — `sickdancemoves.github.io/ColSwap-TEST` | Brand not final; easy to add later |
| 9 | Repo name | Keep `ColSwap-TEST` | Reads as staging/sandbox, accurate for WIP brief |

## 17. References

- Business Brief: `COL - ColSwap Business Brief (WIP) (1).pdf` (May 2026, internal, confidential)
- Reference business model: https://base-l.tech/
- Reference site structure: https://fly-pay.io/
- Sibling project for build patterns: `sickdancemoves/ip-intelligence-center`, `sickdancemoves/lf-preview`
