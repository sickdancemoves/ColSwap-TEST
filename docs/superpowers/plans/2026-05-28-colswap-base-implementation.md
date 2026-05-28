# ColSwap Marketing Site v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual (es-CO / en) static marketing site for ColSwap — a Colombian non-custodial OTC platform — with a React-island quote widget, content-collection-driven blog/FAQs/legal, and GitHub Pages deployment that is migration-ready for Cloudflare Pages.

**Architecture:** Astro static SSG with `output: 'static'` and a single `client:idle` React island for the interactive quote widget. Spanish is the default locale (no path prefix); English lives under `/en/...`. All UI strings come from per-locale JSON via a build-validated `t()` helper. Long-form content (blog, FAQs, legal) lives in Zod-validated content collections.

**Tech Stack:** Astro 4.x · @astrojs/react · React 18 · TypeScript (strict) · Tailwind v4 (CSS-first via `@tailwindcss/vite`) · @fontsource-variable/inter · @astrojs/sitemap · Vitest · @testing-library/react · ESLint · Prettier · GitHub Actions

**Spec:** `docs/superpowers/specs/2026-05-28-colswap-base-design.md`

---

## Phase A — Foundation

### Task 1: Bootstrap Node project with dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.nvmrc`
- Create: `.editorconfig`

- [ ] **Step 1: Create package.json**

```bash
cd /Users/diegoampuero/ColSwap-TEST
cat > package.json <<'EOF'
{
  "name": "colswap-web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "typecheck": "astro check && tsc --noEmit",
    "lint": "eslint . && prettier --check .",
    "lint:fix": "eslint . --fix && prettier --write .",
    "test": "vitest"
  },
  "engines": { "node": ">=20.11" }
}
EOF
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install \
  astro@^4 \
  @astrojs/react@^3 \
  @astrojs/sitemap@^3 \
  @astrojs/check@^0.9 \
  react@^18 \
  react-dom@^18 \
  @tailwindcss/vite@^4 \
  tailwindcss@^4 \
  @fontsource-variable/inter@^5 \
  @fontsource-variable/jetbrains-mono@^5 \
  lucide-react@^0.460 \
  astro-icon@^1 \
  @iconify-json/lucide@^1
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D \
  typescript@^5 \
  @types/react@^18 \
  @types/react-dom@^18 \
  @types/node@^20 \
  vitest@^2 \
  @vitest/ui@^2 \
  @testing-library/react@^16 \
  @testing-library/jest-dom@^6 \
  jsdom@^25 \
  eslint@^9 \
  @typescript-eslint/parser@^8 \
  @typescript-eslint/eslint-plugin@^8 \
  eslint-plugin-astro@^1 \
  eslint-plugin-react@^7 \
  eslint-plugin-react-hooks@^5 \
  prettier@^3 \
  prettier-plugin-astro@^0.14
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": ["src/**/*", "tests/**/*", ".astro/types.d.ts", "astro.config.mjs"],
  "exclude": ["dist", "node_modules"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.astro/
.env
.env.local
.DS_Store
*.log
coverage/
.vitest-cache/
```

- [ ] **Step 6: Create .nvmrc**

```
20.11.0
```

- [ ] **Step 7: Create .editorconfig**

```
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 8: Verify install + commit**

```bash
npm run typecheck
# Expected: no output (astro check errors fine, no src yet — skip the check below for now)
```

If `astro check` errors on missing src, that's expected at this stage. Commit anyway:

```bash
git add package.json package-lock.json tsconfig.json .gitignore .nvmrc .editorconfig
git commit -m "chore: bootstrap Astro + React + TypeScript project"
```

---

### Task 2: Configure Astro with i18n and integrations

**Files:**
- Create: `astro.config.mjs`
- Create: `src/env.d.ts`

- [ ] **Step 1: Create astro.config.mjs**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sickdancemoves.github.io',
  base: '/ColSwap-TEST',
  trailingSlash: 'always',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-CO', en: 'en' },
      },
    }),
    icon({ include: { lucide: ['*'] } }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 2: Create src/env.d.ts**

```typescript
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_APP_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 3: Verify astro check passes (or errors gracefully) and commit**

```bash
npx astro sync
git add astro.config.mjs src/env.d.ts
git commit -m "chore: configure Astro with i18n, base path, and integrations"
```

---

### Task 3: Set up Tailwind v4 with CSS-first design tokens

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`

- [ ] **Step 1: Create design tokens file**

```css
/* src/styles/tokens.css
 * Single source of truth for colors, type, spacing.
 * Placeholder identity: Colombian-inspired yellow + red accents.
 * Final brand identity will replace these tokens.
 */
@theme {
  /* Brand — Colombian yellow */
  --color-yellow-100: #FFF7CC;
  --color-yellow-300: #FFE56B;
  --color-yellow-500: #FFD100;
  --color-yellow-700: #D6A800;
  --color-yellow-900: #8A6B00;

  /* Accent — Colombian red */
  --color-red-100: #FBDCE1;
  --color-red-300: #E8616F;
  --color-red-500: #C8102E;
  --color-red-700: #8E0B20;

  /* Neutrals — warm-paper rather than stark white */
  --color-ink-900: #0E0E10;
  --color-ink-700: #2A2A2E;
  --color-ink-600: #4A4A52;
  --color-ink-400: #8A8A92;
  --color-ink-200: #C8C8CE;
  --color-paper-50: #FAFAF7;
  --color-paper-100: #F2EFE7;
  --color-paper-200: #E9E5DA;
  --color-paper-900: #1A1A1C;

  /* Semantic */
  --color-success: #1B7F3B;
  --color-warning: var(--color-yellow-700);
  --color-danger: var(--color-red-500);

  /* Typography */
  --font-sans: 'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, 'SF Mono', monospace;

  /* Modular scale 1.250 from 16px base */
  --text-2xs: 0.64rem;
  --text-xs: 0.8rem;
  --text-sm: 1rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.953rem;
  --text-2xl: 2.441rem;
  --text-3xl: 3.052rem;
  --text-4xl: 3.815rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-2xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 16px 32px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 2: Create globals.css with Tailwind import + base layer**

```css
/* src/styles/globals.css */
@import 'tailwindcss';
@import './tokens.css';
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';

@layer base {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    background: var(--color-paper-50);
    color: var(--color-ink-900);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    line-height: 1.55;
    margin: 0;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-sans);
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }

  h1 { font-size: var(--text-3xl); }
  h2 { font-size: var(--text-2xl); }
  h3 { font-size: var(--text-xl); }
  h4 { font-size: var(--text-lg); }

  a {
    color: var(--color-ink-900);
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-thickness: 1px;
  }

  a:hover {
    color: var(--color-red-700);
  }

  button {
    font-family: inherit;
  }

  code, pre, kbd, samp {
    font-family: var(--font-mono);
  }

  /* Focus ring */
  *:focus-visible {
    outline: 2px solid var(--color-yellow-500);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }
}

@layer utilities {
  .container-page {
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: clamp(1rem, 4vw, 2rem);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/styles/
git commit -m "feat(styles): add Tailwind v4 + Colombian-yellow design tokens"
```

---

## Phase B — i18n Foundation

### Task 4: Create i18n helper, seed UI strings, and completeness test (TDD)

**Files:**
- Create: `src/i18n/es.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/t.ts`
- Create: `src/i18n/route-map.json`
- Create: `tests/i18n.test.ts`
- Create: `tests/i18n-completeness.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
    },
  },
});
```

- [ ] **Step 2: Create tests setup file**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Write the failing test for t() helper**

```typescript
// tests/i18n.test.ts
import { describe, expect, it } from 'vitest';
import { t } from '@/i18n/t';

describe('t()', () => {
  it('returns the Spanish string for a known key', () => {
    expect(t('nav.home', 'es')).toBe('Inicio');
  });

  it('returns the English string for a known key', () => {
    expect(t('nav.home', 'en')).toBe('Home');
  });

  it('throws on unknown key with a helpful error', () => {
    expect(() => t('nav.nonexistent' as never, 'es')).toThrow(/missing translation/i);
  });

  it('throws on unknown locale', () => {
    // @ts-expect-error testing runtime guard
    expect(() => t('nav.home', 'fr')).toThrow(/unsupported locale/i);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

```bash
npm test -- --run tests/i18n.test.ts
```

Expected: FAIL — `Cannot find module '@/i18n/t'`

- [ ] **Step 5: Create es.json with seed strings**

```json
{
  "nav.home": "Inicio",
  "nav.howItWorks": "Cómo funciona",
  "nav.pricing": "Precios",
  "nav.business": "Empresas",
  "nav.compliance": "Cumplimiento",
  "nav.about": "Sobre nosotros",
  "nav.contact": "Contacto",
  "nav.faqs": "Preguntas frecuentes",
  "nav.blog": "Blog",

  "cta.signIn": "Iniciar sesión",
  "cta.signUp": "Crear cuenta",
  "cta.requestQuote": "Solicitar cotización",
  "cta.talkToSales": "Hablar con ventas",
  "cta.learnMore": "Más información",
  "cta.continue": "Continuar",

  "footer.tagline": "Plataforma OTC no custodial en Colombia",
  "footer.legal.terms": "Términos y condiciones",
  "footer.legal.privacy": "Política de privacidad",
  "footer.legal.aml": "Política AML",
  "footer.legal.cookies": "Cookies",
  "footer.copyright": "© {year} Paytrium Digital Holding. Todos los derechos reservados.",
  "footer.regulated": "Registrado ante la UIAF como VASP",

  "lang.switchTo": "English",

  "home.hero.title": "Convierte pesos colombianos y activos virtuales en segundos.",
  "home.hero.subtitle": "Plataforma OTC no custodial para empresas y profesionales. Tasas en vivo, sin saldo en custodia, ejecución directa a tu wallet.",
  "home.hero.quoteLabel": "Cotiza ahora",
  "home.hero.salesLabel": "¿Empresa con volumen alto? Habla con nuestro equipo de ventas.",
  "home.trust.title": "Operamos bajo el marco regulatorio colombiano",
  "home.trust.uiaf": "Registrado en UIAF",
  "home.trust.aml": "Programa AML completo",
  "home.trust.kyc": "KYC automatizado",
  "home.trust.kyb": "KYB para empresas",

  "quote.direction": "Dirección",
  "quote.from": "Envías",
  "quote.to": "Recibes",
  "quote.amount": "Cantidad",
  "quote.rate": "Tasa",
  "quote.spread": "Spread incluido",
  "quote.validity": "Cotización válida por",
  "quote.disclaimer": "Tasas indicativas. La cotización final se confirma al iniciar sesión.",
  "quote.source.mock": "Tasas indicativas",
  "quote.source.api": "Tasa en vivo",
  "quote.pair.copToUsdt": "COP → USDT",
  "quote.pair.usdtToCop": "USDT → COP",
  "quote.pair.copToUsdc": "COP → USDC",
  "quote.pair.usdcToCop": "USDC → COP",

  "howItWorks.title": "Cómo funciona",
  "howItWorks.intro": "Cuatro pasos. Sin custodia intermedia.",
  "howItWorks.step1.title": "Solicita cotización",
  "howItWorks.step1.body": "Indica la dirección y el monto desde nuestro sitio. Recibirás una tasa con spread embebido en segundos.",
  "howItWorks.step2.title": "Acepta la tasa",
  "howItWorks.step2.body": "La cotización es válida por una ventana de 60 segundos. Acepta para iniciar el flujo.",
  "howItWorks.step3.title": "Transfiere los fondos",
  "howItWorks.step3.body": "Transfiere COP a la cuenta operativa designada vía PSE o transferencia bancaria.",
  "howItWorks.step4.title": "Recibe en tu wallet",
  "howItWorks.step4.body": "Activamos al proveedor de liquidez y los activos se enrutan directo a tu wallet. Sin paso intermedio en nuestro balance.",

  "pricing.title": "Precios transparentes",
  "pricing.subtitle": "Spread embebido en la tasa. Sin tarifas ocultas.",

  "business.title": "ColSwap para empresas",
  "business.subtitle": "KYB acompañado, ejecutivos dedicados, reportes operativos.",

  "compliance.title": "Cumplimiento regulatorio",
  "compliance.subtitle": "Operamos bajo el marco UIAF para VASPs en Colombia.",

  "about.title": "Sobre nosotros",
  "about.subtitle": "ColSwap opera bajo Paytrium Digital Holding.",

  "contact.title": "Contacto",
  "contact.subtitle": "Estamos disponibles para clientes corporativos y consultas generales.",
  "contact.sales": "Ventas y onboarding empresarial",
  "contact.general": "Consultas generales",

  "faqs.title": "Preguntas frecuentes",
  "faqs.category.general": "General",
  "faqs.category.compliance": "Cumplimiento",
  "faqs.category.fees": "Tarifas",
  "faqs.category.process": "Proceso",
  "faqs.category.security": "Seguridad",

  "blog.title": "Blog",
  "blog.subtitle": "Notas sobre cripto, regulación y mercado en Colombia.",
  "blog.readMore": "Leer más",
  "blog.empty": "Pronto publicaremos artículos.",
  "blog.published": "Publicado",
  "blog.tags": "Etiquetas",

  "legal.lastUpdated": "Última actualización",
  "legal.version": "Versión"
}
```

- [ ] **Step 6: Create en.json with mirrored keys**

```json
{
  "nav.home": "Home",
  "nav.howItWorks": "How it works",
  "nav.pricing": "Pricing",
  "nav.business": "Business",
  "nav.compliance": "Compliance",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.faqs": "FAQs",
  "nav.blog": "Blog",

  "cta.signIn": "Sign in",
  "cta.signUp": "Sign up",
  "cta.requestQuote": "Request a quote",
  "cta.talkToSales": "Talk to sales",
  "cta.learnMore": "Learn more",
  "cta.continue": "Continue",

  "footer.tagline": "Non-custodial OTC platform in Colombia",
  "footer.legal.terms": "Terms & conditions",
  "footer.legal.privacy": "Privacy policy",
  "footer.legal.aml": "AML policy",
  "footer.legal.cookies": "Cookies",
  "footer.copyright": "© {year} Paytrium Digital Holding. All rights reserved.",
  "footer.regulated": "Registered with UIAF as VASP",

  "lang.switchTo": "Español",

  "home.hero.title": "Convert Colombian pesos and virtual assets in seconds.",
  "home.hero.subtitle": "Non-custodial OTC platform for businesses and professionals. Live rates, no custody, direct settlement to your wallet.",
  "home.hero.quoteLabel": "Get a quote",
  "home.hero.salesLabel": "High-volume business? Talk to our sales team.",
  "home.trust.title": "Operating under the Colombian regulatory framework",
  "home.trust.uiaf": "Registered with UIAF",
  "home.trust.aml": "Full AML program",
  "home.trust.kyc": "Automated KYC",
  "home.trust.kyb": "KYB for businesses",

  "quote.direction": "Direction",
  "quote.from": "You send",
  "quote.to": "You receive",
  "quote.amount": "Amount",
  "quote.rate": "Rate",
  "quote.spread": "Spread included",
  "quote.validity": "Quote valid for",
  "quote.disclaimer": "Indicative rates. Final quote confirmed at sign-in.",
  "quote.source.mock": "Indicative rates",
  "quote.source.api": "Live rate",
  "quote.pair.copToUsdt": "COP → USDT",
  "quote.pair.usdtToCop": "USDT → COP",
  "quote.pair.copToUsdc": "COP → USDC",
  "quote.pair.usdcToCop": "USDC → COP",

  "howItWorks.title": "How it works",
  "howItWorks.intro": "Four steps. No intermediate custody.",
  "howItWorks.step1.title": "Request a quote",
  "howItWorks.step1.body": "Pick a direction and amount on our site. You'll get a rate with embedded spread in seconds.",
  "howItWorks.step2.title": "Accept the rate",
  "howItWorks.step2.body": "The quote is valid for a 60-second window. Accept to start the flow.",
  "howItWorks.step3.title": "Wire the funds",
  "howItWorks.step3.body": "Transfer COP to the designated operating account via PSE or bank wire.",
  "howItWorks.step4.title": "Receive in your wallet",
  "howItWorks.step4.body": "We trigger the liquidity provider; assets route directly to your wallet. No stop on our balance sheet.",

  "pricing.title": "Transparent pricing",
  "pricing.subtitle": "Spread embedded in the rate. No hidden fees.",

  "business.title": "ColSwap for businesses",
  "business.subtitle": "Guided KYB, dedicated account managers, operational reporting.",

  "compliance.title": "Regulatory compliance",
  "compliance.subtitle": "We operate under Colombia's UIAF framework for VASPs.",

  "about.title": "About us",
  "about.subtitle": "ColSwap operates under Paytrium Digital Holding.",

  "contact.title": "Contact",
  "contact.subtitle": "We're available for corporate clients and general inquiries.",
  "contact.sales": "Sales and business onboarding",
  "contact.general": "General inquiries",

  "faqs.title": "Frequently asked questions",
  "faqs.category.general": "General",
  "faqs.category.compliance": "Compliance",
  "faqs.category.fees": "Fees",
  "faqs.category.process": "Process",
  "faqs.category.security": "Security",

  "blog.title": "Blog",
  "blog.subtitle": "Notes on crypto, regulation, and the Colombian market.",
  "blog.readMore": "Read more",
  "blog.empty": "Articles coming soon.",
  "blog.published": "Published",
  "blog.tags": "Tags",

  "legal.lastUpdated": "Last updated",
  "legal.version": "Version"
}
```

- [ ] **Step 7: Implement t() helper**

```typescript
// src/i18n/t.ts
import es from './es.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

const DICTIONARIES = { es, en } as const satisfies Record<Locale, Record<string, string>>;

export type TranslationKey = keyof typeof es;

export function t(key: TranslationKey, locale: Locale): string {
  if (!LOCALES.includes(locale)) {
    throw new Error(`Unsupported locale: "${locale}"`);
  }
  const dict = DICTIONARIES[locale];
  const value = dict[key];
  if (value === undefined) {
    throw new Error(`Missing translation for key "${key}" in locale "${locale}"`);
  }
  return value;
}

export function tInterpolate(
  key: TranslationKey,
  locale: Locale,
  vars: Record<string, string | number>
): string {
  const raw = t(key, locale);
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`
  );
}

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
```

- [ ] **Step 8: Run the t() test to verify it passes**

```bash
npm test -- --run tests/i18n.test.ts
```

Expected: 4 passed, 0 failed.

- [ ] **Step 9: Write the i18n completeness test**

```typescript
// tests/i18n-completeness.test.ts
import { describe, expect, it } from 'vitest';
import es from '@/i18n/es.json';
import en from '@/i18n/en.json';

describe('i18n completeness', () => {
  it('es.json and en.json have identical key sets', () => {
    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));

    expect(missingInEn, `Keys present in es.json but missing in en.json: ${missingInEn.join(', ')}`).toEqual([]);
    expect(missingInEs, `Keys present in en.json but missing in es.json: ${missingInEs.join(', ')}`).toEqual([]);
  });

  it('no empty translation values', () => {
    const empties: string[] = [];
    for (const [k, v] of Object.entries({ ...es, ...en })) {
      if (typeof v !== 'string' || v.trim().length === 0) {
        empties.push(k);
      }
    }
    expect(empties).toEqual([]);
  });
});
```

- [ ] **Step 10: Run completeness test**

```bash
npm test -- --run tests/i18n-completeness.test.ts
```

Expected: 2 passed.

- [ ] **Step 11: Create route-map.json**

```json
{
  "es-to-en": {
    "/": "/en/",
    "/como-funciona/": "/en/how-it-works/",
    "/precios/": "/en/pricing/",
    "/empresas/": "/en/business/",
    "/cumplimiento/": "/en/compliance/",
    "/sobre-nosotros/": "/en/about/",
    "/contacto/": "/en/contact/",
    "/preguntas-frecuentes/": "/en/faqs/",
    "/blog/": "/en/blog/",
    "/legal/terminos/": "/en/legal/terms/",
    "/legal/privacidad/": "/en/legal/privacy/",
    "/legal/aml/": "/en/legal/aml/",
    "/legal/cookies/": "/en/legal/cookies/"
  },
  "en-to-es": {
    "/en/": "/",
    "/en/how-it-works/": "/como-funciona/",
    "/en/pricing/": "/precios/",
    "/en/business/": "/empresas/",
    "/en/compliance/": "/cumplimiento/",
    "/en/about/": "/sobre-nosotros/",
    "/en/contact/": "/contacto/",
    "/en/faqs/": "/preguntas-frecuentes/",
    "/en/blog/": "/blog/",
    "/en/legal/terms/": "/legal/terminos/",
    "/en/legal/privacy/": "/legal/privacidad/",
    "/en/legal/aml/": "/legal/aml/",
    "/en/legal/cookies/": "/legal/cookies/"
  }
}
```

- [ ] **Step 12: Commit**

```bash
git add src/i18n/ tests/ vitest.config.ts
git commit -m "feat(i18n): add t() helper, seed UI strings, route map, completeness tests"
```

---

## Phase C — Layout & Navigation

### Task 5: Build BaseLayout with head meta, hreflang, OG tags

**Files:**
- Create: `src/lib/seo/meta.ts`
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create SEO meta helper**

```typescript
// src/lib/seo/meta.ts
import type { Locale } from '@/i18n/t';
import routeMap from '@/i18n/route-map.json';

export interface MetaInput {
  title: string;
  description: string;
  locale: Locale;
  currentPath: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface ComputedMeta {
  htmlLang: string;
  canonicalUrl: string;
  alternates: Array<{ hreflang: string; href: string }>;
  fullTitle: string;
  ogLocale: string;
}

const SITE_ORIGIN = 'https://sickdancemoves.github.io';
const SITE_BASE = '/ColSwap-TEST';
const SITE_NAME = 'ColSwap';

export function computeMeta(input: MetaInput): ComputedMeta {
  const { title, locale, currentPath } = input;
  const htmlLang = locale === 'es' ? 'es-CO' : 'en';
  const ogLocale = locale === 'es' ? 'es_CO' : 'en_US';

  const normalizedPath = ensureTrailingSlash(currentPath);
  const canonicalUrl = `${SITE_ORIGIN}${SITE_BASE}${normalizedPath}`;

  const alternates: Array<{ hreflang: string; href: string }> = [
    { hreflang: htmlLang, href: canonicalUrl },
  ];

  const otherLocale: Locale = locale === 'es' ? 'en' : 'es';
  const mapKey = `${locale}-to-${otherLocale}` as const;
  const map = routeMap[mapKey] as Record<string, string>;
  const otherPath = map[normalizedPath];
  if (otherPath) {
    const otherLang = otherLocale === 'es' ? 'es-CO' : 'en';
    alternates.push({
      hreflang: otherLang,
      href: `${SITE_ORIGIN}${SITE_BASE}${otherPath}`,
    });
    alternates.push({
      hreflang: 'x-default',
      href: `${SITE_ORIGIN}${SITE_BASE}/`,
    });
  }

  return {
    htmlLang,
    canonicalUrl,
    alternates,
    fullTitle: title === SITE_NAME ? SITE_NAME : `${title} · ${SITE_NAME}`,
    ogLocale,
  };
}

function ensureTrailingSlash(path: string): string {
  if (path.endsWith('/')) return path;
  return `${path}/`;
}
```

- [ ] **Step 2: Create BaseLayout.astro**

```astro
---
// src/layouts/BaseLayout.astro
import '@/styles/globals.css';
import { computeMeta, type MetaInput } from '@/lib/seo/meta';

interface Props extends MetaInput {}

const props = Astro.props;
const meta = computeMeta(props);
---
<!doctype html>
<html lang={meta.htmlLang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{meta.fullTitle}</title>
    <meta name="description" content={props.description} />
    <link rel="canonical" href={meta.canonicalUrl} />
    {props.noIndex && <meta name="robots" content="noindex" />}

    {meta.alternates.map((alt) => (
      <link rel="alternate" hreflang={alt.hreflang} href={alt.href} />
    ))}

    <meta property="og:title" content={meta.fullTitle} />
    <meta property="og:description" content={props.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={meta.canonicalUrl} />
    <meta property="og:site_name" content="ColSwap" />
    <meta property="og:locale" content={meta.ogLocale} />
    {props.ogImage && <meta property="og:image" content={props.ogImage} />}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={meta.fullTitle} />
    <meta name="twitter:description" content={props.description} />

    <link rel="icon" type="image/svg+xml" href={`${import.meta.env.BASE_URL}favicon.svg`} />

    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Add favicon.svg**

```bash
mkdir -p public
cat > public/favicon.svg <<'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#FFD100"/>
  <path d="M9 11 L23 11 M9 21 L23 21" stroke="#0E0E10" stroke-width="3" stroke-linecap="round"/>
  <circle cx="11" cy="11" r="2.5" fill="#0E0E10"/>
  <circle cx="21" cy="21" r="2.5" fill="#C8102E"/>
</svg>
EOF
```

- [ ] **Step 4: Add robots.txt**

```bash
cat > public/robots.txt <<'EOF'
User-agent: *
Allow: /

Sitemap: https://sickdancemoves.github.io/ColSwap-TEST/sitemap-index.xml
EOF
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/ src/layouts/BaseLayout.astro public/favicon.svg public/robots.txt
git commit -m "feat(layout): add BaseLayout with hreflang, OG, canonical + favicon + robots"
```

---

### Task 6: Build Header, LanguageSwitcher, Footer, and PageLayout

**Files:**
- Create: `src/components/nav/Header.astro`
- Create: `src/components/nav/LanguageSwitcher.astro`
- Create: `src/components/nav/Footer.astro`
- Create: `src/layouts/PageLayout.astro`

- [ ] **Step 1: Create LanguageSwitcher**

```astro
---
// src/components/nav/LanguageSwitcher.astro
import { type Locale, t } from '@/i18n/t';
import routeMap from '@/i18n/route-map.json';

interface Props {
  locale: Locale;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;
const otherLocale: Locale = locale === 'es' ? 'en' : 'es';
const mapKey = `${locale}-to-${otherLocale}` as const;
const map = routeMap[mapKey] as Record<string, string>;
const normalized = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
const otherPath = map[normalized] ?? (otherLocale === 'es' ? '/' : '/en/');
const href = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${otherPath}`;
---
<a
  href={href}
  hreflang={otherLocale === 'es' ? 'es-CO' : 'en'}
  rel="alternate"
  class="lang-switcher"
  aria-label={t('lang.switchTo', otherLocale)}
>
  {t('lang.switchTo', locale)}
</a>

<style>
  .lang-switcher {
    font-size: var(--text-xs);
    font-weight: 600;
    text-decoration: none;
    color: var(--color-ink-600);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-paper-200);
    transition: background 120ms ease, color 120ms ease;
  }
  .lang-switcher:hover {
    background: var(--color-yellow-100);
    color: var(--color-ink-900);
  }
</style>
```

- [ ] **Step 2: Create Header**

```astro
---
// src/components/nav/Header.astro
import { Icon } from 'astro-icon/components';
import { type Locale, t } from '@/i18n/t';
import LanguageSwitcher from './LanguageSwitcher.astro';

interface Props {
  locale: Locale;
  currentPath: string;
}

const { locale, currentPath } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const navLinks = locale === 'es'
  ? [
      { href: '/como-funciona/', key: 'nav.howItWorks' as const },
      { href: '/precios/', key: 'nav.pricing' as const },
      { href: '/empresas/', key: 'nav.business' as const },
      { href: '/cumplimiento/', key: 'nav.compliance' as const },
      { href: '/blog/', key: 'nav.blog' as const },
      { href: '/contacto/', key: 'nav.contact' as const },
    ]
  : [
      { href: '/en/how-it-works/', key: 'nav.howItWorks' as const },
      { href: '/en/pricing/', key: 'nav.pricing' as const },
      { href: '/en/business/', key: 'nav.business' as const },
      { href: '/en/compliance/', key: 'nav.compliance' as const },
      { href: '/en/blog/', key: 'nav.blog' as const },
      { href: '/en/contact/', key: 'nav.contact' as const },
    ];

const homeHref = locale === 'es' ? '/' : '/en/';
const appBaseUrl = import.meta.env.PUBLIC_APP_BASE_URL || 'https://app.colswap.tech';
---
<header class="site-header">
  <div class="container-page header-inner">
    <a href={`${base}${homeHref}`} class="brand" aria-label="ColSwap">
      <span class="brand-mark"></span>
      <span class="brand-name">ColSwap</span>
    </a>

    <nav class="primary-nav" aria-label="Primary">
      <ul>
        {navLinks.map((link) => (
          <li>
            <a href={`${base}${link.href}`}>{t(link.key, locale)}</a>
          </li>
        ))}
      </ul>
    </nav>

    <div class="header-actions">
      <LanguageSwitcher locale={locale} currentPath={currentPath} />
      <a href={`${appBaseUrl}/login`} class="btn btn-ghost">
        {t('cta.signIn', locale)}
      </a>
      <a href={`${appBaseUrl}/signup`} class="btn btn-primary">
        {t('cta.signUp', locale)}
      </a>
    </div>
  </div>
</header>

<style>
  .site-header {
    background: var(--color-paper-50);
    border-bottom: 1px solid var(--color-paper-200);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-inner {
    display: flex;
    align-items: center;
    gap: var(--space-6, 24px);
    padding-block: 14px;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--color-ink-900);
    font-weight: 700;
    font-size: var(--text-md);
  }

  .brand-mark {
    display: inline-block;
    width: 22px;
    height: 22px;
    background:
      linear-gradient(135deg, var(--color-yellow-500) 0 60%, var(--color-red-500) 60% 100%);
    border-radius: var(--radius-sm);
  }

  .primary-nav {
    flex: 1 1 auto;
  }
  .primary-nav ul {
    display: flex;
    gap: 22px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .primary-nav a {
    color: var(--color-ink-700);
    text-decoration: none;
    font-size: var(--text-xs);
    font-weight: 500;
  }
  .primary-nav a:hover { color: var(--color-ink-900); }

  .header-actions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    padding-inline: 14px;
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    font-weight: 600;
    text-decoration: none;
    transition: background 120ms ease, color 120ms ease, transform 120ms ease;
  }
  .btn-ghost {
    color: var(--color-ink-900);
    background: transparent;
    border: 1px solid var(--color-paper-200);
  }
  .btn-ghost:hover { background: var(--color-paper-100); }
  .btn-primary {
    color: var(--color-ink-900);
    background: var(--color-yellow-500);
    border: 1px solid var(--color-yellow-700);
  }
  .btn-primary:hover { background: var(--color-yellow-300); }

  @media (max-width: 860px) {
    .primary-nav { display: none; }
  }
</style>
```

- [ ] **Step 3: Create Footer**

```astro
---
// src/components/nav/Footer.astro
import { type Locale, t, tInterpolate } from '@/i18n/t';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const year = new Date().getFullYear();

const legalLinks = locale === 'es'
  ? [
      { href: '/legal/terminos/', key: 'footer.legal.terms' as const },
      { href: '/legal/privacidad/', key: 'footer.legal.privacy' as const },
      { href: '/legal/aml/', key: 'footer.legal.aml' as const },
      { href: '/legal/cookies/', key: 'footer.legal.cookies' as const },
    ]
  : [
      { href: '/en/legal/terms/', key: 'footer.legal.terms' as const },
      { href: '/en/legal/privacy/', key: 'footer.legal.privacy' as const },
      { href: '/en/legal/aml/', key: 'footer.legal.aml' as const },
      { href: '/en/legal/cookies/', key: 'footer.legal.cookies' as const },
    ];
---
<footer class="site-footer">
  <div class="container-page footer-inner">
    <div class="footer-brand">
      <div class="brand-mark"></div>
      <div>
        <div class="brand-name">ColSwap</div>
        <div class="brand-tag">{t('footer.tagline', locale)}</div>
      </div>
    </div>

    <nav class="footer-legal" aria-label="Legal">
      <ul>
        {legalLinks.map((link) => (
          <li>
            <a href={`${base}${link.href}`}>{t(link.key, locale)}</a>
          </li>
        ))}
      </ul>
    </nav>

    <div class="footer-meta">
      <div>{t('footer.regulated', locale)}</div>
      <div>{tInterpolate('footer.copyright', locale, { year })}</div>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    background: var(--color-paper-900);
    color: var(--color-paper-200);
    padding-block: 48px;
    margin-top: 80px;
  }
  .footer-inner {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 32px;
    align-items: start;
  }
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-mark {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--color-yellow-500) 0 60%, var(--color-red-500) 60% 100%);
    border-radius: var(--radius-sm);
  }
  .brand-name { font-weight: 700; color: var(--color-paper-50); }
  .brand-tag { font-size: var(--text-xs); color: var(--color-ink-400); }

  .footer-legal ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .footer-legal a {
    color: var(--color-paper-200);
    text-decoration: none;
    font-size: var(--text-xs);
  }
  .footer-legal a:hover { color: var(--color-yellow-500); }

  .footer-meta {
    text-align: right;
    font-size: var(--text-xs);
    color: var(--color-ink-400);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 700px) {
    .footer-inner { grid-template-columns: 1fr; }
    .footer-meta { text-align: left; }
  }
</style>
```

- [ ] **Step 4: Create PageLayout**

```astro
---
// src/layouts/PageLayout.astro
import BaseLayout from './BaseLayout.astro';
import Header from '@/components/nav/Header.astro';
import Footer from '@/components/nav/Footer.astro';
import type { MetaInput } from '@/lib/seo/meta';

interface Props extends MetaInput {}

const props = Astro.props;
---
<BaseLayout {...props}>
  <Header locale={props.locale} currentPath={props.currentPath} />
  <main>
    <slot />
  </main>
  <Footer locale={props.locale} />
</BaseLayout>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/nav/ src/layouts/PageLayout.astro
git commit -m "feat(layout): add Header, LanguageSwitcher, Footer, and PageLayout"
```

---

## Phase D — Content Collections

### Task 7: Define content collections with Zod schemas

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create content config**

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['es', 'en']);

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1).max(120),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    summary: z.string().min(20).max(300),
    tags: z.array(z.string()).default([]),
    author: z.string().default('ColSwap'),
    heroImage: z.string().optional(),
    locale: localeEnum,
    draft: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string().min(5).max(200),
    category: z.enum(['general', 'compliance', 'fees', 'process', 'security']),
    order: z.number().int().nonnegative(),
    locale: localeEnum,
  }),
});

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    slug: z.enum([
      'terminos',
      'privacidad',
      'aml',
      'cookies',
      'terms',
      'privacy',
    ]),
    lastUpdated: z.coerce.date(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'semver'),
    locale: localeEnum,
  }),
});

export const collections = { blog, faqs, legal };
```

- [ ] **Step 2: Verify schemas with astro sync**

```bash
npx astro sync
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts
git commit -m "feat(content): define Zod schemas for blog, faqs, legal collections"
```

---

### Task 8: Seed content collections

**Files:**
- Create: `src/content/blog/es/regulacion-vasp-colombia.md`
- Create: `src/content/blog/en/colombia-vasp-regulation.md`
- Create: `src/content/faqs/es/general-1.md`, `general-2.md`, `compliance-1.md`, `process-1.md`
- Create: `src/content/faqs/en/general-1.md`, `general-2.md`, `compliance-1.md`, `process-1.md`
- Create: `src/content/legal/es/terminos.md`, `privacidad.md`, `aml.md`, `cookies.md`
- Create: `src/content/legal/en/terms.md`, `privacy.md`, `aml.md`, `cookies.md`

- [ ] **Step 1: Create blog seed (Spanish)**

```markdown
---
title: 'Regulación VASP en Colombia: lo que necesitas saber'
slug: 'regulacion-vasp-colombia'
publishDate: 2026-05-28
summary: 'Un repaso del marco regulatorio actual para proveedores de servicios de activos virtuales (VASP) en Colombia, incluyendo UIAF, SARLAFT y SAGRILAFT.'
tags: ['regulación', 'UIAF', 'Colombia']
author: 'Equipo ColSwap'
locale: 'es'
---

Colombia avanza hacia un marco regulatorio claro para los proveedores de servicios de activos virtuales. ColSwap opera bajo este marco desde el primer día.

## ¿Qué es un VASP?

La UIAF define como VASP a cualquier persona natural o jurídica que ejecute, por cuenta de un tercero, operaciones como intercambio entre activos virtuales y moneda fiat, transferencia de activos virtuales, o custodia y administración.

## ¿Qué obligaciones tiene ColSwap?

- Registro obligatorio en UIAF a través del sistema SIREL.
- Programa AML completo: identificación de clientes, monitoreo de transacciones, reporte de operaciones sospechosas.
- Reportes mensuales de operaciones agregadas que superen USD 450 e individuales que superen USD 150.

## El cambio que viene

El proyecto de ley PL 510/2025 introducirá requisitos adicionales para 2027/2028. Trabajamos hoy con un programa que cumple SARLAFT como buena práctica para estar preparados.
```

- [ ] **Step 2: Create blog seed (English)**

```markdown
---
title: 'VASP regulation in Colombia: what you need to know'
slug: 'colombia-vasp-regulation'
publishDate: 2026-05-28
summary: 'A walkthrough of the current regulatory framework for virtual asset service providers (VASPs) in Colombia, including UIAF, SARLAFT, and SAGRILAFT.'
tags: ['regulation', 'UIAF', 'Colombia']
author: 'ColSwap Team'
locale: 'en'
---

Colombia is moving toward a clear regulatory framework for virtual asset service providers. ColSwap operates under this framework from day one.

## What is a VASP?

UIAF defines a VASP as any natural or legal person that performs, on behalf of a third party, activities like exchange between virtual assets and fiat currency, transfer of virtual assets, or custody and administration.

## What obligations does ColSwap carry?

- Mandatory registration with UIAF through the SIREL system.
- Full AML program: customer identification, transaction monitoring, suspicious-operation reporting.
- Monthly reporting of aggregate operations exceeding USD 450 and individual transactions exceeding USD 150.

## What is changing

Draft bill PL 510/2025 will introduce additional requirements for 2027/2028. We operate today with a SARLAFT-aligned program as best practice, so the team is ready.
```

- [ ] **Step 3: Create FAQ seeds (Spanish — 4 files)**

```markdown
---
question: '¿ColSwap custodia mis fondos?'
category: 'general'
order: 1
locale: 'es'
---
No. ColSwap es una plataforma OTC no custodial. En ningún momento mantenemos saldos a nombre del cliente. Coordinamos cada operación entre el proveedor de fiat y el proveedor de liquidez cripto, y los activos se entregan directamente a tu wallet designada.
```

```markdown
---
question: '¿Cuáles son los pares disponibles?'
category: 'general'
order: 2
locale: 'es'
---
En v1 operamos los pares COP↔USDT y COP↔USDC. Otros pares se habilitarán a medida que sumamos proveedores de liquidez.
```

```markdown
---
question: '¿Por qué necesitan KYC?'
category: 'compliance'
order: 3
locale: 'es'
---
ColSwap está registrado ante la UIAF como sujeto obligado. El proceso KYC nos permite cumplir con las obligaciones de identificación y monitoreo establecidas por la regulación colombiana para los VASPs.
```

```markdown
---
question: '¿Cuánto tarda una operación?'
category: 'process'
order: 4
locale: 'es'
---
Una vez aceptas la cotización y se recibe la transferencia COP en la cuenta operativa, el flujo a tu wallet típicamente toma entre 5 y 20 minutos, sujeto a confirmaciones en cadena y al proveedor de liquidez.
```

- [ ] **Step 4: Create FAQ seeds (English — 4 files mirroring Spanish)**

```markdown
---
question: 'Does ColSwap custody my funds?'
category: 'general'
order: 1
locale: 'en'
---
No. ColSwap is a non-custodial OTC platform. At no point do we hold client balances. We coordinate each operation between the fiat provider and the crypto liquidity provider, and assets are delivered directly to your designated wallet.
```

```markdown
---
question: 'Which pairs are available?'
category: 'general'
order: 2
locale: 'en'
---
At v1 we operate COP↔USDT and COP↔USDC. Additional pairs become available as we onboard more liquidity providers.
```

```markdown
---
question: 'Why do you need KYC?'
category: 'compliance'
order: 3
locale: 'en'
---
ColSwap is registered with UIAF as an obligated entity. The KYC process lets us meet the identification and monitoring requirements set by Colombian regulation for VASPs.
```

```markdown
---
question: 'How long does an operation take?'
category: 'process'
order: 4
locale: 'en'
---
Once you accept the quote and the COP transfer arrives at the operating account, settlement to your wallet typically takes 5 to 20 minutes, depending on on-chain confirmations and the liquidity provider.
```

- [ ] **Step 5: Create legal seeds (Spanish — 4 files)**

```markdown
---
title: 'Términos y condiciones'
slug: 'terminos'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'es'
---

# Términos y condiciones

Este documento es un placeholder que será reemplazado por el equipo legal de Paytrium Digital Holding antes del lanzamiento. Define los términos bajo los cuales los usuarios acceden y utilizan la plataforma ColSwap como servicio OTC no custodial regulado en Colombia.

## 1. Aceptación

Al utilizar la plataforma, el cliente acepta estos términos.

## 2. Servicios

ColSwap actúa como coordinador entre proveedores de fiat y liquidez cripto. No mantiene custodia.

## 3. Contacto

ventas@colswap.tech
```

```markdown
---
title: 'Política de privacidad'
slug: 'privacidad'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'es'
---

# Política de privacidad

Este documento es un placeholder que será reemplazado por el equipo legal de Paytrium. Describirá el tratamiento de datos personales conforme a la Ley 1581 de 2012 y normativa colombiana de protección de datos.

## Datos que recolectamos

Identificación KYC, datos de la operación, comunicaciones con el equipo.

## Contacto del responsable

privacidad@colswap.tech
```

```markdown
---
title: 'Política AML'
slug: 'aml'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'es'
---

# Política de Prevención de Lavado de Activos y Financiamiento del Terrorismo

ColSwap cumple con las obligaciones aplicables ante la UIAF como sujeto obligado.

## Componentes del programa

- Identificación de clientes (KYC / KYB)
- Monitoreo continuo de transacciones
- Reporte de operaciones sospechosas
- Reportes mensuales agregados a través de SIREL

Este documento será ampliado por el equipo de cumplimiento de Paytrium.
```

```markdown
---
title: 'Política de cookies'
slug: 'cookies'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'es'
---

# Política de cookies

Utilizamos cookies estrictamente necesarias para la operación del sitio. No utilizamos cookies de seguimiento publicitario.

Este documento será actualizado cuando se integren herramientas de analítica.
```

- [ ] **Step 6: Create legal seeds (English — 4 files mirroring Spanish)**

```markdown
---
title: 'Terms & conditions'
slug: 'terms'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'en'
---

# Terms & conditions

This document is a placeholder to be replaced by Paytrium Digital Holding's legal team before launch. It will define the terms under which users access and use the ColSwap platform as a non-custodial OTC service regulated in Colombia.

## 1. Acceptance

By using the platform, the client accepts these terms.

## 2. Services

ColSwap acts as a coordinator between fiat and crypto liquidity providers. It does not hold custody.

## 3. Contact

sales@colswap.tech
```

```markdown
---
title: 'Privacy policy'
slug: 'privacy'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'en'
---

# Privacy policy

This document is a placeholder to be replaced by Paytrium's legal team. It will describe personal data processing under Colombian Law 1581/2012 and applicable data protection regulation.

## Data we collect

KYC identification, operation data, communications with the team.

## Contact

privacy@colswap.tech
```

```markdown
---
title: 'AML policy'
slug: 'aml'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'en'
---

# AML / CFT policy

ColSwap meets the applicable obligations as a UIAF-registered obligated entity.

## Program components

- Customer identification (KYC / KYB)
- Continuous transaction monitoring
- Reporting of suspicious operations
- Monthly aggregate reporting via SIREL

This document will be expanded by Paytrium's compliance team.
```

```markdown
---
title: 'Cookies policy'
slug: 'cookies'
lastUpdated: 2026-05-28
version: '1.0.0'
locale: 'en'
---

# Cookies policy

We use strictly necessary cookies for site operation. We do not use advertising tracking cookies.

This document will be updated when analytics tools are integrated.
```

- [ ] **Step 7: Verify content collection build + commit**

```bash
npx astro sync
git add src/content/blog src/content/faqs src/content/legal
git commit -m "feat(content): seed blog, FAQs, and legal collections (es + en)"
```

---

## Phase E — Pages

### Task 9: Create the Spanish home page with hero placeholder

**Files:**
- Create: `src/pages/index.astro`
- Create: `src/components/cta/SalesContactCTA.astro`
- Create: `src/components/trust/ComplianceBadges.astro`

- [ ] **Step 1: Create SalesContactCTA**

```astro
---
// src/components/cta/SalesContactCTA.astro
import { type Locale, t } from '@/i18n/t';
interface Props { locale: Locale; }
const { locale } = Astro.props;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const contactPath = locale === 'es' ? '/contacto/' : '/en/contact/';
---
<section class="sales-cta">
  <div class="container-page sales-inner">
    <p>{t('home.hero.salesLabel', locale)}</p>
    <a href={`${base}${contactPath}`} class="btn-sales">
      {t('cta.talkToSales', locale)}
    </a>
  </div>
</section>

<style>
  .sales-cta {
    background: var(--color-yellow-100);
    border-block: 1px solid var(--color-yellow-300);
  }
  .sales-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-block: 20px;
  }
  .sales-inner p { margin: 0; font-weight: 500; color: var(--color-ink-700); }
  .btn-sales {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding-inline: 18px;
    background: var(--color-ink-900);
    color: var(--color-paper-50);
    border-radius: var(--radius-md);
    font-weight: 600;
    text-decoration: none;
    transition: background 120ms ease;
  }
  .btn-sales:hover { background: var(--color-red-700); color: var(--color-paper-50); }
  @media (max-width: 700px) {
    .sales-inner { flex-direction: column; align-items: flex-start; }
  }
</style>
```

- [ ] **Step 2: Create ComplianceBadges**

```astro
---
// src/components/trust/ComplianceBadges.astro
import { Icon } from 'astro-icon/components';
import { type Locale, t } from '@/i18n/t';
interface Props { locale: Locale; }
const { locale } = Astro.props;

const badges = [
  { iconName: 'lucide:shield-check', titleKey: 'home.trust.uiaf' as const },
  { iconName: 'lucide:scale', titleKey: 'home.trust.aml' as const },
  { iconName: 'lucide:user-check', titleKey: 'home.trust.kyc' as const },
  { iconName: 'lucide:building', titleKey: 'home.trust.kyb' as const },
];
---
<section class="trust">
  <div class="container-page">
    <h2 class="trust-title">{t('home.trust.title', locale)}</h2>
    <ul class="badges">
      {badges.map((b) => (
        <li class="badge">
          <Icon name={b.iconName} class="badge-icon" />
          <span>{t(b.titleKey, locale)}</span>
        </li>
      ))}
    </ul>
  </div>
</section>

<style>
  .trust { padding-block: 64px; background: var(--color-paper-100); }
  .trust-title {
    text-align: center;
    font-size: var(--text-md);
    color: var(--color-ink-600);
    font-weight: 500;
    margin-bottom: 24px;
  }
  .badges {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px;
    background: var(--color-paper-50);
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-md);
    text-align: center;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-ink-700);
  }
  .badge-icon {
    width: 28px;
    height: 28px;
    color: var(--color-red-500);
  }
  @media (max-width: 760px) {
    .badges { grid-template-columns: repeat(2, 1fr); }
  }
</style>
```

- [ ] **Step 3: Create Spanish home page (widget mounted in later task)**

```astro
---
// src/pages/index.astro
import PageLayout from '@/layouts/PageLayout.astro';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
import ComplianceBadges from '@/components/trust/ComplianceBadges.astro';
import { t } from '@/i18n/t';

const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/"
  title="ColSwap"
  description={t('home.hero.subtitle', locale)}
>
  <section class="hero">
    <div class="container-page hero-inner">
      <div class="hero-copy">
        <h1>{t('home.hero.title', locale)}</h1>
        <p class="hero-sub">{t('home.hero.subtitle', locale)}</p>
      </div>
      <div class="hero-widget-slot">
        <!-- QuoteWidget mounted in Task 13 -->
        <div id="quote-widget-mount" data-locale="es"></div>
      </div>
    </div>
  </section>

  <SalesContactCTA locale={locale} />
  <ComplianceBadges locale={locale} />
</PageLayout>

<style>
  .hero {
    padding-block: 80px;
    background:
      radial-gradient(ellipse at top right, var(--color-yellow-100), transparent 60%),
      var(--color-paper-50);
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero h1 {
    font-size: clamp(var(--text-xl), 4vw, var(--text-3xl));
    margin: 0 0 20px;
  }
  .hero-sub {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin: 0;
  }
  .hero-widget-slot {
    min-height: 360px;
    background: var(--color-paper-50);
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 4: Verify dev build runs**

```bash
npm run dev &
sleep 5
curl -s http://localhost:4321/ColSwap-TEST/ | head -20
kill %1
```

Expected: HTML output starting with `<!doctype html>`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/components/cta/ src/components/trust/
git commit -m "feat(pages): add Spanish home page with hero, sales CTA, compliance badges"
```

---

### Task 10: Create remaining Spanish marketing pages

**Files:**
- Create: `src/pages/como-funciona.astro`
- Create: `src/pages/precios.astro`
- Create: `src/pages/empresas.astro`
- Create: `src/pages/cumplimiento.astro`
- Create: `src/pages/sobre-nosotros.astro`
- Create: `src/pages/contacto.astro`

- [ ] **Step 1: Create como-funciona.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;

const steps = [
  { titleKey: 'howItWorks.step1.title', bodyKey: 'howItWorks.step1.body', n: 1 },
  { titleKey: 'howItWorks.step2.title', bodyKey: 'howItWorks.step2.body', n: 2 },
  { titleKey: 'howItWorks.step3.title', bodyKey: 'howItWorks.step3.body', n: 3 },
  { titleKey: 'howItWorks.step4.title', bodyKey: 'howItWorks.step4.body', n: 4 },
] as const;
---
<PageLayout
  locale={locale}
  currentPath="/como-funciona/"
  title={t('howItWorks.title', locale)}
  description={t('howItWorks.intro', locale)}
>
  <section class="container-page page-section">
    <h1>{t('howItWorks.title', locale)}</h1>
    <p class="lede">{t('howItWorks.intro', locale)}</p>

    <ol class="steps">
      {steps.map((s) => (
        <li class="step">
          <div class="step-n">{s.n}</div>
          <div>
            <h3>{t(s.titleKey, locale)}</h3>
            <p>{t(s.bodyKey, locale)}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 48px;
  }
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 24px;
  }
  .step {
    display: grid;
    grid-template-columns: 56px 1fr;
    gap: 20px;
    padding: 24px;
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    background: var(--color-paper-50);
  }
  .step-n {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--color-yellow-500);
    color: var(--color-ink-900);
    font-weight: 700;
    font-size: var(--text-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .step h3 { margin: 0 0 8px; }
  .step p { margin: 0; color: var(--color-ink-600); }
</style>
```

- [ ] **Step 2: Create precios.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/precios/"
  title={t('pricing.title', locale)}
  description={t('pricing.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('pricing.title', locale)}</h1>
    <p class="lede">{t('pricing.subtitle', locale)}</p>

    <div class="pricing-grid">
      <article class="tier">
        <h3>Spot</h3>
        <p class="tier-desc">Operaciones únicas o esporádicas.</p>
        <div class="spread">150 bps <span>spread embebido</span></div>
        <ul>
          <li>Cotización en segundos</li>
          <li>KYC automatizado</li>
          <li>Hasta USD 10.000 mensuales</li>
        </ul>
      </article>
      <article class="tier featured">
        <h3>Empresarial</h3>
        <p class="tier-desc">Volumen recurrente, KYB y ejecutivo asignado.</p>
        <div class="spread">A medida <span>según volumen</span></div>
        <ul>
          <li>KYB acompañado</li>
          <li>Ejecutivo dedicado</li>
          <li>Reportes operativos mensuales</li>
        </ul>
      </article>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 48px;
  }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  .tier {
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    padding: 32px;
    background: var(--color-paper-50);
  }
  .tier.featured {
    border-color: var(--color-yellow-500);
    background: var(--color-yellow-100);
  }
  .tier h3 { margin: 0 0 8px; }
  .tier-desc { color: var(--color-ink-600); margin: 0 0 24px; }
  .spread {
    font-size: var(--text-xl);
    font-weight: 700;
    margin-bottom: 24px;
  }
  .spread span {
    display: block;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-ink-600);
  }
  .tier ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 8px;
  }
  .tier li {
    padding-left: 20px;
    position: relative;
    font-size: var(--text-xs);
  }
  .tier li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--color-red-500);
    font-weight: 700;
  }
  @media (max-width: 700px) {
    .pricing-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 3: Create empresas.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/empresas/"
  title={t('business.title', locale)}
  description={t('business.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('business.title', locale)}</h1>
    <p class="lede">{t('business.subtitle', locale)}</p>

    <div class="features">
      <article>
        <h3>KYB acompañado</h3>
        <p>Nuestro equipo te guía paso a paso por el proceso de verificación de la empresa, los UBOs y las cuentas operativas.</p>
      </article>
      <article>
        <h3>Ejecutivo dedicado</h3>
        <p>Un punto de contacto único para tu operación, cotizaciones, reportes y resolución de incidencias.</p>
      </article>
      <article>
        <h3>Reportes operativos</h3>
        <p>Reportes mensuales con todas tus operaciones, tasas aplicadas, tiempos de ejecución y trazabilidad para tu contabilidad.</p>
      </article>
      <article>
        <h3>Integración fiat-cripto</h3>
        <p>Operamos con PSE a través de SoyPago para entradas COP y con proveedores de liquidez globales para la salida cripto.</p>
      </article>
    </div>
  </section>
  <SalesContactCTA locale={locale} />
</PageLayout>

<style>
  .page-section { padding-block: 64px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 48px;
  }
  .features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .features article {
    padding: 24px;
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    background: var(--color-paper-50);
  }
  .features h3 { margin: 0 0 8px; }
  .features p { margin: 0; color: var(--color-ink-600); }
  @media (max-width: 720px) {
    .features { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 4: Create cumplimiento.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/cumplimiento/"
  title={t('compliance.title', locale)}
  description={t('compliance.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('compliance.title', locale)}</h1>
    <p class="lede">{t('compliance.subtitle', locale)}</p>

    <div class="callout">
      <h3>Registro UIAF</h3>
      <p>ColSwap está en proceso de registro como sujeto obligado en el Sistema de Información para el Reporte de Operaciones (SIREL) administrado por la Unidad de Información y Análisis Financiero.</p>
    </div>

    <div class="callout">
      <h3>Programa AML</h3>
      <p>Identificación de clientes (KYC para personas naturales, KYB para empresas), monitoreo continuo de transacciones, procedimientos de detección y reporte de operaciones sospechosas.</p>
    </div>

    <div class="callout">
      <h3>Reportes regulatorios</h3>
      <p>Reportes mensuales agregados que igualen o superen USD 450, reportes individuales que superen USD 150, y reportes de clientes activos / inactivos.</p>
    </div>

    <div class="callout">
      <h3>SARLAFT / SAGRILAFT</h3>
      <p>Aplicamos lineamientos SARLAFT como buena práctica. Implementaremos SAGRILAFT si superamos los umbrales aplicables, conforme a la regulación de la Superintendencia de Sociedades.</p>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 32px;
  }
  .callout {
    padding: 24px;
    margin-bottom: 16px;
    border-left: 4px solid var(--color-red-500);
    background: var(--color-paper-50);
    border-radius: 0 var(--radius-md) var(--radius-md) 0;
  }
  .callout h3 { margin: 0 0 8px; }
  .callout p { margin: 0; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 5: Create sobre-nosotros.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/sobre-nosotros/"
  title={t('about.title', locale)}
  description={t('about.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('about.title', locale)}</h1>
    <p class="lede">{t('about.subtitle', locale)}</p>

    <article class="prose">
      <h2>Paytrium Digital Holding</h2>
      <p>ColSwap opera bajo Paytrium Digital Holding, una compañía dedicada a infraestructura financiera para mercados emergentes. Nuestro equipo está distribuido y combina experiencia en regulación, ingeniería y operaciones cripto.</p>

      <h2>Por qué Colombia, por qué OTC</h2>
      <p>Colombia tiene un volumen creciente de empresas y profesionales con necesidades de conversión recurrente entre pesos y activos digitales. El modelo OTC no custodial elimina el riesgo de saldo bajo nuestra responsabilidad y permite ejecutar a tasas competitivas con trazabilidad regulatoria completa.</p>

      <h2>Nuestra misión</h2>
      <p>Construir la capa de coordinación más confiable para conversiones COP↔cripto en Colombia, con cumplimiento regulatorio desde el primer día.</p>
    </article>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 32px;
  }
  .prose { max-width: 70ch; }
  .prose h2 { margin: 32px 0 12px; }
  .prose p { margin: 0 0 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 6: Create contacto.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { Icon } from 'astro-icon/components';
import { t } from '@/i18n/t';
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath="/contacto/"
  title={t('contact.title', locale)}
  description={t('contact.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('contact.title', locale)}</h1>
    <p class="lede">{t('contact.subtitle', locale)}</p>

    <div class="contact-grid">
      <article class="contact-card">
        <Icon name="lucide:briefcase" class="contact-icon" />
        <h3>{t('contact.sales', locale)}</h3>
        <a href="mailto:ventas@colswap.tech">ventas@colswap.tech</a>
      </article>
      <article class="contact-card">
        <Icon name="lucide:mail" class="contact-icon" />
        <h3>{t('contact.general', locale)}</h3>
        <a href="mailto:hola@colswap.tech">hola@colswap.tech</a>
      </article>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin-bottom: 32px;
  }
  .contact-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .contact-card {
    padding: 28px;
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    background: var(--color-paper-50);
  }
  .contact-card h3 { margin: 12px 0 8px; }
  .contact-icon {
    width: 28px;
    height: 28px;
    color: var(--color-red-500);
  }
  .contact-card a {
    color: var(--color-ink-900);
    font-weight: 600;
  }
  @media (max-width: 700px) {
    .contact-grid { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 7: Commit**

```bash
git add src/pages/como-funciona.astro src/pages/precios.astro src/pages/empresas.astro src/pages/cumplimiento.astro src/pages/sobre-nosotros.astro src/pages/contacto.astro
git commit -m "feat(pages): add Spanish marketing pages (how-it-works, pricing, business, compliance, about, contact)"
```

---

### Task 11: Create English marketing pages (mirrors)

**Files:**
- Create: `src/pages/en/index.astro`
- Create: `src/pages/en/how-it-works.astro`
- Create: `src/pages/en/pricing.astro`
- Create: `src/pages/en/business.astro`
- Create: `src/pages/en/compliance.astro`
- Create: `src/pages/en/about.astro`
- Create: `src/pages/en/contact.astro`

- [ ] **Step 1: Create en/index.astro**

Mirror `src/pages/index.astro` but with `locale = 'en'` and `currentPath = "/en/"`. The structure and components are identical.

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
import ComplianceBadges from '@/components/trust/ComplianceBadges.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/"
  title="ColSwap"
  description={t('home.hero.subtitle', locale)}
>
  <section class="hero">
    <div class="container-page hero-inner">
      <div class="hero-copy">
        <h1>{t('home.hero.title', locale)}</h1>
        <p class="hero-sub">{t('home.hero.subtitle', locale)}</p>
      </div>
      <div class="hero-widget-slot">
        <div id="quote-widget-mount" data-locale="en"></div>
      </div>
    </div>
  </section>
  <SalesContactCTA locale={locale} />
  <ComplianceBadges locale={locale} />
</PageLayout>

<style>
  .hero {
    padding-block: 80px;
    background:
      radial-gradient(ellipse at top right, var(--color-yellow-100), transparent 60%),
      var(--color-paper-50);
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero h1 {
    font-size: clamp(var(--text-xl), 4vw, var(--text-3xl));
    margin: 0 0 20px;
  }
  .hero-sub {
    font-size: var(--text-md);
    color: var(--color-ink-600);
    max-width: 60ch;
    margin: 0;
  }
  .hero-widget-slot {
    min-height: 360px;
    background: var(--color-paper-50);
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: Create en/how-it-works.astro**

Mirror `src/pages/como-funciona.astro` with `locale = 'en'`, `currentPath = '/en/how-it-works/'`. All template logic is the same; the `t()` calls automatically resolve to English strings.

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
const steps = [
  { titleKey: 'howItWorks.step1.title', bodyKey: 'howItWorks.step1.body', n: 1 },
  { titleKey: 'howItWorks.step2.title', bodyKey: 'howItWorks.step2.body', n: 2 },
  { titleKey: 'howItWorks.step3.title', bodyKey: 'howItWorks.step3.body', n: 3 },
  { titleKey: 'howItWorks.step4.title', bodyKey: 'howItWorks.step4.body', n: 4 },
] as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/how-it-works/"
  title={t('howItWorks.title', locale)}
  description={t('howItWorks.intro', locale)}
>
  <section class="container-page page-section">
    <h1>{t('howItWorks.title', locale)}</h1>
    <p class="lede">{t('howItWorks.intro', locale)}</p>
    <ol class="steps">
      {steps.map((s) => (
        <li class="step">
          <div class="step-n">{s.n}</div>
          <div>
            <h3>{t(s.titleKey, locale)}</h3>
            <p>{t(s.bodyKey, locale)}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 48px; }
  .steps { list-style: none; margin: 0; padding: 0; display: grid; gap: 24px; }
  .step { display: grid; grid-template-columns: 56px 1fr; gap: 20px; padding: 24px; border: 1px solid var(--color-paper-200); border-radius: var(--radius-lg); background: var(--color-paper-50); }
  .step-n { width: 56px; height: 56px; border-radius: 50%; background: var(--color-yellow-500); color: var(--color-ink-900); font-weight: 700; font-size: var(--text-md); display: flex; align-items: center; justify-content: center; }
  .step h3 { margin: 0 0 8px; }
  .step p { margin: 0; color: var(--color-ink-600); }
</style>
```

- [ ] **Step 3: Create en/pricing.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/pricing/"
  title={t('pricing.title', locale)}
  description={t('pricing.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('pricing.title', locale)}</h1>
    <p class="lede">{t('pricing.subtitle', locale)}</p>

    <div class="pricing-grid">
      <article class="tier">
        <h3>Spot</h3>
        <p class="tier-desc">One-off or occasional operations.</p>
        <div class="spread">150 bps <span>embedded spread</span></div>
        <ul>
          <li>Quote in seconds</li>
          <li>Automated KYC</li>
          <li>Up to USD 10,000 monthly</li>
        </ul>
      </article>
      <article class="tier featured">
        <h3>Business</h3>
        <p class="tier-desc">Recurring volume, KYB, and dedicated account manager.</p>
        <div class="spread">Custom <span>by volume</span></div>
        <ul>
          <li>Guided KYB</li>
          <li>Dedicated account manager</li>
          <li>Monthly operational reports</li>
        </ul>
      </article>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 48px; }
  .pricing-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .tier { border: 1px solid var(--color-paper-200); border-radius: var(--radius-lg); padding: 32px; background: var(--color-paper-50); }
  .tier.featured { border-color: var(--color-yellow-500); background: var(--color-yellow-100); }
  .tier h3 { margin: 0 0 8px; }
  .tier-desc { color: var(--color-ink-600); margin: 0 0 24px; }
  .spread { font-size: var(--text-xl); font-weight: 700; margin-bottom: 24px; }
  .spread span { display: block; font-size: var(--text-xs); font-weight: 500; color: var(--color-ink-600); }
  .tier ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .tier li { padding-left: 20px; position: relative; font-size: var(--text-xs); }
  .tier li::before { content: '✓'; position: absolute; left: 0; color: var(--color-red-500); font-weight: 700; }
  @media (max-width: 700px) { .pricing-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Create en/business.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/business/"
  title={t('business.title', locale)}
  description={t('business.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('business.title', locale)}</h1>
    <p class="lede">{t('business.subtitle', locale)}</p>

    <div class="features">
      <article>
        <h3>Guided KYB</h3>
        <p>Our team walks you step by step through verifying the company, its UBOs, and operational accounts.</p>
      </article>
      <article>
        <h3>Dedicated account manager</h3>
        <p>A single point of contact for your operations, quotes, reports, and incident resolution.</p>
      </article>
      <article>
        <h3>Operational reporting</h3>
        <p>Monthly reports with all your operations, applied rates, execution times, and traceability for your books.</p>
      </article>
      <article>
        <h3>Fiat-to-crypto integration</h3>
        <p>We operate with PSE through SoyPago for COP inflows and with global liquidity providers for crypto outflows.</p>
      </article>
    </div>
  </section>
  <SalesContactCTA locale={locale} />
</PageLayout>

<style>
  .page-section { padding-block: 64px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 48px; }
  .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .features article { padding: 24px; border: 1px solid var(--color-paper-200); border-radius: var(--radius-lg); background: var(--color-paper-50); }
  .features h3 { margin: 0 0 8px; }
  .features p { margin: 0; color: var(--color-ink-600); }
  @media (max-width: 720px) { .features { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Create en/compliance.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/compliance/"
  title={t('compliance.title', locale)}
  description={t('compliance.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('compliance.title', locale)}</h1>
    <p class="lede">{t('compliance.subtitle', locale)}</p>

    <div class="callout">
      <h3>UIAF registration</h3>
      <p>ColSwap is in the process of registering as an obligated entity in the SIREL reporting system, administered by Colombia's Financial Information and Analysis Unit (UIAF).</p>
    </div>

    <div class="callout">
      <h3>AML program</h3>
      <p>Customer identification (KYC for individuals, KYB for businesses), continuous transaction monitoring, suspicious-operation detection and reporting procedures.</p>
    </div>

    <div class="callout">
      <h3>Regulatory reporting</h3>
      <p>Monthly aggregate reports that meet or exceed USD 450, individual reports above USD 150, and active / inactive client reports.</p>
    </div>

    <div class="callout">
      <h3>SARLAFT / SAGRILAFT</h3>
      <p>We apply SARLAFT guidelines as best practice. We will implement SAGRILAFT if we exceed the applicable thresholds, in line with the Superintendency of Companies' regulation.</p>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 32px; }
  .callout { padding: 24px; margin-bottom: 16px; border-left: 4px solid var(--color-red-500); background: var(--color-paper-50); border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  .callout h3 { margin: 0 0 8px; }
  .callout p { margin: 0; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 6: Create en/about.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/about/"
  title={t('about.title', locale)}
  description={t('about.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('about.title', locale)}</h1>
    <p class="lede">{t('about.subtitle', locale)}</p>

    <article class="prose">
      <h2>Paytrium Digital Holding</h2>
      <p>ColSwap operates under Paytrium Digital Holding, a company focused on financial infrastructure for emerging markets. Our team is distributed and combines experience in regulation, engineering, and crypto operations.</p>

      <h2>Why Colombia, why OTC</h2>
      <p>Colombia has a growing volume of businesses and professionals with recurring conversion needs between pesos and digital assets. The non-custodial OTC model eliminates balance risk on our side and lets us execute at competitive rates with full regulatory traceability.</p>

      <h2>Our mission</h2>
      <p>Build the most trustworthy coordination layer for COP↔crypto conversions in Colombia, with regulatory compliance from day one.</p>
    </article>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 32px; }
  .prose { max-width: 70ch; }
  .prose h2 { margin: 32px 0 12px; }
  .prose p { margin: 0 0 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 7: Create en/contact.astro**

```astro
---
import PageLayout from '@/layouts/PageLayout.astro';
import { Icon } from 'astro-icon/components';
import { t } from '@/i18n/t';
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath="/en/contact/"
  title={t('contact.title', locale)}
  description={t('contact.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('contact.title', locale)}</h1>
    <p class="lede">{t('contact.subtitle', locale)}</p>

    <div class="contact-grid">
      <article class="contact-card">
        <Icon name="lucide:briefcase" class="contact-icon" />
        <h3>{t('contact.sales', locale)}</h3>
        <a href="mailto:sales@colswap.tech">sales@colswap.tech</a>
      </article>
      <article class="contact-card">
        <Icon name="lucide:mail" class="contact-icon" />
        <h3>{t('contact.general', locale)}</h3>
        <a href="mailto:hello@colswap.tech">hello@colswap.tech</a>
      </article>
    </div>
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 32px; }
  .contact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .contact-card { padding: 28px; border: 1px solid var(--color-paper-200); border-radius: var(--radius-lg); background: var(--color-paper-50); }
  .contact-card h3 { margin: 12px 0 8px; }
  .contact-icon { width: 28px; height: 28px; color: var(--color-red-500); }
  .contact-card a { color: var(--color-ink-900); font-weight: 600; }
  @media (max-width: 700px) { .contact-grid { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 8: Run dev server, verify both locales render**

```bash
npm run dev &
sleep 5
curl -s http://localhost:4321/ColSwap-TEST/ | grep -o '<title>[^<]*</title>'
curl -s http://localhost:4321/ColSwap-TEST/en/ | grep -o '<title>[^<]*</title>'
kill %1
```

Expected: First call returns Spanish title, second returns English title.

- [ ] **Step 9: Commit**

```bash
git add src/pages/en/
git commit -m "feat(pages): add English marketing pages (mirrors of Spanish)"
```

---

### Task 12: Create dynamic content routes (blog, legal, FAQs)

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/en/blog/index.astro`
- Create: `src/pages/en/blog/[slug].astro`
- Create: `src/pages/legal/[slug].astro`
- Create: `src/pages/en/legal/[slug].astro`
- Create: `src/pages/preguntas-frecuentes.astro`
- Create: `src/pages/en/faqs.astro`

- [ ] **Step 1: Create blog index (Spanish)**

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const posts = (await getCollection('blog', ({ data }) => data.locale === 'es' && !data.draft))
  .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
---
<PageLayout
  locale={locale}
  currentPath="/blog/"
  title={t('blog.title', locale)}
  description={t('blog.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('blog.title', locale)}</h1>
    <p class="lede">{t('blog.subtitle', locale)}</p>

    {posts.length === 0 ? (
      <p class="empty">{t('blog.empty', locale)}</p>
    ) : (
      <ul class="post-list">
        {posts.map((post) => (
          <li>
            <a href={`${base}/blog/${post.data.slug}/`} class="post-card">
              <time>{post.data.publishDate.toLocaleDateString('es-CO', { dateStyle: 'long' })}</time>
              <h3>{post.data.title}</h3>
              <p>{post.data.summary}</p>
              <span class="read-more">{t('blog.readMore', locale)} →</span>
            </a>
          </li>
        ))}
      </ul>
    )}
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 48px; }
  .empty { color: var(--color-ink-400); }
  .post-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
  .post-card {
    display: block;
    padding: 24px;
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    background: var(--color-paper-50);
    text-decoration: none;
    color: inherit;
    transition: border-color 120ms ease, transform 120ms ease;
  }
  .post-card:hover { border-color: var(--color-yellow-500); transform: translateY(-2px); }
  .post-card time { font-size: var(--text-xs); color: var(--color-ink-400); }
  .post-card h3 { margin: 8px 0; }
  .post-card p { margin: 0 0 12px; color: var(--color-ink-600); }
  .read-more { font-size: var(--text-xs); font-weight: 600; color: var(--color-red-500); }
</style>
```

- [ ] **Step 2: Create blog [slug] dynamic route (Spanish)**

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, type CollectionEntry } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => data.locale === 'es' && !data.draft);
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

interface Props { post: CollectionEntry<'blog'>; }
const { post } = Astro.props;
const { Content } = await post.render();
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath={`/blog/${post.data.slug}/`}
  title={post.data.title}
  description={post.data.summary}
>
  <article class="container-page page-section post">
    <header class="post-header">
      <time>{post.data.publishDate.toLocaleDateString('es-CO', { dateStyle: 'long' })}</time>
      <h1>{post.data.title}</h1>
      <p class="summary">{post.data.summary}</p>
      <div class="meta">
        <span>{post.data.author}</span>
        {post.data.tags.length > 0 && (
          <span class="tags">
            {post.data.tags.map((tag) => <span class="tag">#{tag}</span>)}
          </span>
        )}
      </div>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .post { max-width: 70ch; }
  .post-header { margin-bottom: 32px; }
  .post-header time { font-size: var(--text-xs); color: var(--color-ink-400); }
  .post-header h1 { margin: 8px 0 16px; }
  .summary { font-size: var(--text-md); color: var(--color-ink-600); }
  .meta { display: flex; gap: 16px; font-size: var(--text-xs); color: var(--color-ink-600); margin-top: 12px; }
  .tags { display: inline-flex; gap: 6px; }
  .tag { color: var(--color-red-500); }
  .prose :global(h2) { margin-top: 32px; }
  .prose :global(p) { margin-bottom: 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 3: Create en/blog/index.astro**

```astro
---
// src/pages/en/blog/index.astro
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const posts = (await getCollection('blog', ({ data }) => data.locale === 'en' && !data.draft))
  .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
---
<PageLayout
  locale={locale}
  currentPath="/en/blog/"
  title={t('blog.title', locale)}
  description={t('blog.subtitle', locale)}
>
  <section class="container-page page-section">
    <h1>{t('blog.title', locale)}</h1>
    <p class="lede">{t('blog.subtitle', locale)}</p>

    {posts.length === 0 ? (
      <p class="empty">{t('blog.empty', locale)}</p>
    ) : (
      <ul class="post-list">
        {posts.map((post) => (
          <li>
            <a href={`${base}/en/blog/${post.data.slug}/`} class="post-card">
              <time>{post.data.publishDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
              <h3>{post.data.title}</h3>
              <p>{post.data.summary}</p>
              <span class="read-more">{t('blog.readMore', locale)} →</span>
            </a>
          </li>
        ))}
      </ul>
    )}
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .lede { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin-bottom: 48px; }
  .empty { color: var(--color-ink-400); }
  .post-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
  .post-card { display: block; padding: 24px; border: 1px solid var(--color-paper-200); border-radius: var(--radius-lg); background: var(--color-paper-50); text-decoration: none; color: inherit; transition: border-color 120ms ease, transform 120ms ease; }
  .post-card:hover { border-color: var(--color-yellow-500); transform: translateY(-2px); }
  .post-card time { font-size: var(--text-xs); color: var(--color-ink-400); }
  .post-card h3 { margin: 8px 0; }
  .post-card p { margin: 0 0 12px; color: var(--color-ink-600); }
  .read-more { font-size: var(--text-xs); font-weight: 600; color: var(--color-red-500); }
</style>
```

- [ ] **Step 3b: Create en/blog/[slug].astro**

```astro
---
// src/pages/en/blog/[slug].astro
import { getCollection, type CollectionEntry } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => data.locale === 'en' && !data.draft);
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

interface Props { post: CollectionEntry<'blog'>; }
const { post } = Astro.props;
const { Content } = await post.render();
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath={`/en/blog/${post.data.slug}/`}
  title={post.data.title}
  description={post.data.summary}
>
  <article class="container-page page-section post">
    <header class="post-header">
      <time>{post.data.publishDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</time>
      <h1>{post.data.title}</h1>
      <p class="summary">{post.data.summary}</p>
      <div class="meta">
        <span>{post.data.author}</span>
        {post.data.tags.length > 0 && (
          <span class="tags">
            {post.data.tags.map((tag) => <span class="tag">#{tag}</span>)}
          </span>
        )}
      </div>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .post { max-width: 70ch; }
  .post-header { margin-bottom: 32px; }
  .post-header time { font-size: var(--text-xs); color: var(--color-ink-400); }
  .post-header h1 { margin: 8px 0 16px; }
  .summary { font-size: var(--text-md); color: var(--color-ink-600); }
  .meta { display: flex; gap: 16px; font-size: var(--text-xs); color: var(--color-ink-600); margin-top: 12px; }
  .tags { display: inline-flex; gap: 6px; }
  .tag { color: var(--color-red-500); }
  .prose :global(h2) { margin-top: 32px; }
  .prose :global(p) { margin-bottom: 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 4: Create legal [slug] route (Spanish)**

```astro
---
// src/pages/legal/[slug].astro
import { getCollection, type CollectionEntry } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';

export async function getStaticPaths() {
  const docs = await getCollection('legal', ({ data }) => data.locale === 'es');
  return docs.map((doc) => ({
    params: { slug: doc.data.slug },
    props: { doc },
  }));
}

interface Props { doc: CollectionEntry<'legal'>; }
const { doc } = Astro.props;
const { Content } = await doc.render();
const locale = 'es' as const;
---
<PageLayout
  locale={locale}
  currentPath={`/legal/${doc.data.slug}/`}
  title={doc.data.title}
  description={doc.data.title}
>
  <article class="container-page page-section legal">
    <header class="legal-header">
      <h1>{doc.data.title}</h1>
      <p class="meta">
        {t('legal.lastUpdated', locale)}: {doc.data.lastUpdated.toLocaleDateString('es-CO', { dateStyle: 'long' })}
        · {t('legal.version', locale)} {doc.data.version}
      </p>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .legal { max-width: 70ch; }
  .legal-header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--color-paper-200); }
  .meta { font-size: var(--text-xs); color: var(--color-ink-400); }
  .prose :global(h1) { display: none; }
  .prose :global(h2) { margin-top: 32px; }
  .prose :global(p) { margin-bottom: 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 5: Create en/legal/[slug].astro**

```astro
---
// src/pages/en/legal/[slug].astro
import { getCollection, type CollectionEntry } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';

export async function getStaticPaths() {
  const docs = await getCollection('legal', ({ data }) => data.locale === 'en');
  return docs.map((doc) => ({
    params: { slug: doc.data.slug },
    props: { doc },
  }));
}

interface Props { doc: CollectionEntry<'legal'>; }
const { doc } = Astro.props;
const { Content } = await doc.render();
const locale = 'en' as const;
---
<PageLayout
  locale={locale}
  currentPath={`/en/legal/${doc.data.slug}/`}
  title={doc.data.title}
  description={doc.data.title}
>
  <article class="container-page page-section legal">
    <header class="legal-header">
      <h1>{doc.data.title}</h1>
      <p class="meta">
        {t('legal.lastUpdated', locale)}: {doc.data.lastUpdated.toLocaleDateString('en-US', { dateStyle: 'long' })}
        · {t('legal.version', locale)} {doc.data.version}
      </p>
    </header>
    <div class="prose">
      <Content />
    </div>
  </article>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .legal { max-width: 70ch; }
  .legal-header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid var(--color-paper-200); }
  .meta { font-size: var(--text-xs); color: var(--color-ink-400); }
  .prose :global(h1) { display: none; }
  .prose :global(h2) { margin-top: 32px; }
  .prose :global(p) { margin-bottom: 16px; color: var(--color-ink-700); }
</style>
```

- [ ] **Step 6: Create FAQs page (Spanish)**

```astro
---
// src/pages/preguntas-frecuentes.astro
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'es' as const;

const items = (await getCollection('faqs', ({ data }) => data.locale === 'es'))
  .sort((a, b) => a.data.order - b.data.order);

const categories = ['general', 'compliance', 'fees', 'process', 'security'] as const;
const grouped = categories.map((cat) => ({
  category: cat,
  items: items.filter((i) => i.data.category === cat),
}));
---
<PageLayout
  locale={locale}
  currentPath="/preguntas-frecuentes/"
  title={t('faqs.title', locale)}
  description={t('faqs.title', locale)}
>
  <section class="container-page page-section">
    <h1>{t('faqs.title', locale)}</h1>

    {grouped.filter((g) => g.items.length > 0).map((group) => (
      <div class="category-block">
        <h2>{t(`faqs.category.${group.category}` as const, locale)}</h2>
        <div class="faq-list">
          {group.items.map(async (entry) => {
            const { Content } = await entry.render();
            return (
              <details class="faq">
                <summary>{entry.data.question}</summary>
                <div class="answer">
                  <Content />
                </div>
              </details>
            );
          })}
        </div>
      </div>
    ))}
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .category-block { margin-bottom: 32px; }
  .category-block h2 { margin: 24px 0 12px; font-size: var(--text-md); color: var(--color-ink-600); }
  .faq-list { display: grid; gap: 8px; }
  .faq {
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-md);
    background: var(--color-paper-50);
    overflow: hidden;
  }
  .faq summary {
    list-style: none;
    cursor: pointer;
    padding: 16px 20px;
    font-weight: 600;
    color: var(--color-ink-900);
    position: relative;
  }
  .faq summary::after {
    content: '+';
    position: absolute;
    right: 20px;
    top: 14px;
    font-size: var(--text-md);
    color: var(--color-red-500);
    font-weight: 700;
  }
  .faq[open] summary::after { content: '−'; }
  .faq .answer {
    padding: 0 20px 16px;
    color: var(--color-ink-700);
  }
  .faq .answer :global(p) { margin: 0; }
</style>
```

- [ ] **Step 7: Create en/faqs.astro**

```astro
---
// src/pages/en/faqs.astro
import { getCollection } from 'astro:content';
import PageLayout from '@/layouts/PageLayout.astro';
import { t } from '@/i18n/t';
const locale = 'en' as const;

const items = (await getCollection('faqs', ({ data }) => data.locale === 'en'))
  .sort((a, b) => a.data.order - b.data.order);

const categories = ['general', 'compliance', 'fees', 'process', 'security'] as const;
const grouped = categories.map((cat) => ({
  category: cat,
  items: items.filter((i) => i.data.category === cat),
}));
---
<PageLayout
  locale={locale}
  currentPath="/en/faqs/"
  title={t('faqs.title', locale)}
  description={t('faqs.title', locale)}
>
  <section class="container-page page-section">
    <h1>{t('faqs.title', locale)}</h1>

    {grouped.filter((g) => g.items.length > 0).map((group) => (
      <div class="category-block">
        <h2>{t(`faqs.category.${group.category}` as const, locale)}</h2>
        <div class="faq-list">
          {group.items.map(async (entry) => {
            const { Content } = await entry.render();
            return (
              <details class="faq">
                <summary>{entry.data.question}</summary>
                <div class="answer">
                  <Content />
                </div>
              </details>
            );
          })}
        </div>
      </div>
    ))}
  </section>
</PageLayout>

<style>
  .page-section { padding-block: 64px 80px; }
  .category-block { margin-bottom: 32px; }
  .category-block h2 { margin: 24px 0 12px; font-size: var(--text-md); color: var(--color-ink-600); }
  .faq-list { display: grid; gap: 8px; }
  .faq { border: 1px solid var(--color-paper-200); border-radius: var(--radius-md); background: var(--color-paper-50); overflow: hidden; }
  .faq summary { list-style: none; cursor: pointer; padding: 16px 20px; font-weight: 600; color: var(--color-ink-900); position: relative; }
  .faq summary::after { content: '+'; position: absolute; right: 20px; top: 14px; font-size: var(--text-md); color: var(--color-red-500); font-weight: 700; }
  .faq[open] summary::after { content: '−'; }
  .faq .answer { padding: 0 20px 16px; color: var(--color-ink-700); }
  .faq .answer :global(p) { margin: 0; }
</style>
```

- [ ] **Step 8: Verify the build picks up all dynamic routes**

```bash
npm run build
ls dist/blog/regulacion-vasp-colombia/
ls dist/en/blog/colombia-vasp-regulation/
ls dist/legal/terminos/
ls dist/en/legal/terms/
ls dist/preguntas-frecuentes/
ls dist/en/faqs/
```

Expected: each directory contains an `index.html`.

- [ ] **Step 9: Commit**

```bash
git add src/pages/blog src/pages/en/blog src/pages/legal src/pages/en/legal src/pages/preguntas-frecuentes.astro src/pages/en/faqs.astro
git commit -m "feat(pages): add dynamic blog, legal, and FAQs pages (es + en)"
```

---

## Phase F — Quote Widget

### Task 13: Quote types and mock rates module

**Files:**
- Create: `src/lib/quote/types.ts`
- Create: `src/lib/quote/mock-rates.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// src/lib/quote/types.ts
import { type Locale } from '@/i18n/t';

export type AssetCode = 'COP' | 'USDT' | 'USDC';

export type PairId = 'COP-USDT' | 'USDT-COP' | 'COP-USDC' | 'USDC-COP';

export interface AssetInfo {
  code: AssetCode;
  label: string;
  decimals: number;
  min: number;
}

export interface QuotePair {
  id: PairId;
  from: AssetInfo;
  to: AssetInfo;
}

export interface QuoteRequest {
  pairId: PairId;
  amount: number;
  side: 'from' | 'to';
}

export interface QuoteResponse {
  pairId: PairId;
  rate: number;
  spreadBps: number;
  fromAmount: number;
  toAmount: number;
  validUntil: string;
  source: 'mock' | 'api';
}

export type { Locale };
```

- [ ] **Step 2: Create mock-rates.ts**

```typescript
// src/lib/quote/mock-rates.ts
import type { AssetInfo, PairId, QuotePair } from './types';

const COP: AssetInfo = { code: 'COP', label: 'Peso colombiano', decimals: 0, min: 100_000 };
const USDT: AssetInfo = { code: 'USDT', label: 'Tether USD', decimals: 2, min: 25 };
const USDC: AssetInfo = { code: 'USDC', label: 'USD Coin', decimals: 2, min: 25 };

export const PAIRS: Record<PairId, QuotePair> = {
  'COP-USDT': { id: 'COP-USDT', from: COP, to: USDT },
  'USDT-COP': { id: 'USDT-COP', from: USDT, to: COP },
  'COP-USDC': { id: 'COP-USDC', from: COP, to: USDC },
  'USDC-COP': { id: 'USDC-COP', from: USDC, to: COP },
};

// Mid-market rates expressed as: 1 unit of `from` = X units of `to`.
// Placeholder values; real engine will replace.
export const MOCK_MID_RATES: Record<PairId, number> = {
  'COP-USDT': 1 / 4150,
  'USDT-COP': 4150,
  'COP-USDC': 1 / 4150,
  'USDC-COP': 4150,
};

export const DEFAULT_SPREAD_BPS = 150;
export const QUOTE_VALIDITY_SECONDS = 60;
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/quote/types.ts src/lib/quote/mock-rates.ts
git commit -m "feat(quote): add types and mock rate config"
```

---

### Task 14: getQuote() function with TDD

**Files:**
- Create: `tests/quote.test.ts`
- Create: `src/lib/quote/get-quote.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/quote.test.ts
import { describe, expect, it } from 'vitest';
import { getQuote } from '@/lib/quote/get-quote';
import { MOCK_MID_RATES, DEFAULT_SPREAD_BPS } from '@/lib/quote/mock-rates';

describe('getQuote', () => {
  it('returns a quote with the expected pair and mock source', async () => {
    const q = await getQuote({ pairId: 'COP-USDT', amount: 1_000_000, side: 'from' });
    expect(q.pairId).toBe('COP-USDT');
    expect(q.source).toBe('mock');
  });

  it('computes toAmount when side is "from"', async () => {
    const amount = 1_000_000;
    const q = await getQuote({ pairId: 'COP-USDT', amount, side: 'from' });
    expect(q.fromAmount).toBe(amount);
    // toAmount = amount * mid_rate * (1 - spread)
    const expectedNoSpread = amount * MOCK_MID_RATES['COP-USDT'];
    expect(q.toAmount).toBeLessThan(expectedNoSpread);
    expect(q.toAmount).toBeGreaterThan(expectedNoSpread * 0.95);
  });

  it('computes fromAmount when side is "to"', async () => {
    const amount = 250;
    const q = await getQuote({ pairId: 'USDT-COP', amount, side: 'to' });
    expect(q.toAmount).toBe(amount);
    expect(q.fromAmount).toBeGreaterThan(0);
  });

  it('attaches a validUntil ISO timestamp 60s in the future', async () => {
    const before = Date.now();
    const q = await getQuote({ pairId: 'COP-USDT', amount: 1_000_000, side: 'from' });
    const valid = new Date(q.validUntil).getTime();
    expect(valid).toBeGreaterThanOrEqual(before + 59_000);
    expect(valid).toBeLessThanOrEqual(before + 65_000);
  });

  it('reports a non-zero spreadBps', async () => {
    const q = await getQuote({ pairId: 'COP-USDT', amount: 1_000_000, side: 'from' });
    expect(q.spreadBps).toBeGreaterThan(0);
    expect(q.spreadBps).toBeGreaterThanOrEqual(DEFAULT_SPREAD_BPS - 20);
    expect(q.spreadBps).toBeLessThanOrEqual(DEFAULT_SPREAD_BPS + 20);
  });

  it('rejects non-positive amounts', async () => {
    await expect(getQuote({ pairId: 'COP-USDT', amount: 0, side: 'from' })).rejects.toThrow(/positive/);
    await expect(getQuote({ pairId: 'COP-USDT', amount: -1, side: 'from' })).rejects.toThrow(/positive/);
  });

  it('rejects amounts below the pair minimum', async () => {
    await expect(getQuote({ pairId: 'COP-USDT', amount: 1000, side: 'from' })).rejects.toThrow(/minimum/);
  });

  it('rejects unknown pairId', async () => {
    // @ts-expect-error testing runtime guard
    await expect(getQuote({ pairId: 'XYZ-COP', amount: 100, side: 'from' })).rejects.toThrow(/pair/i);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm test -- --run tests/quote.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/quote/get-quote'`.

- [ ] **Step 3: Implement getQuote**

```typescript
// src/lib/quote/get-quote.ts
import type { QuoteRequest, QuoteResponse } from './types';
import {
  PAIRS,
  MOCK_MID_RATES,
  DEFAULT_SPREAD_BPS,
  QUOTE_VALIDITY_SECONDS,
} from './mock-rates';

const JITTER_BPS_RANGE = 20;

export async function getQuote(req: QuoteRequest): Promise<QuoteResponse> {
  const { pairId, amount, side } = req;

  const pair = PAIRS[pairId];
  if (!pair) {
    throw new Error(`Unknown pair: "${pairId}"`);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number');
  }

  const sideAsset = side === 'from' ? pair.from : pair.to;
  if (amount < sideAsset.min) {
    throw new Error(`Amount is below the minimum for ${sideAsset.code} (${sideAsset.min})`);
  }

  const midRate = MOCK_MID_RATES[pairId];
  const jitter = (Math.random() * 2 - 1) * JITTER_BPS_RANGE;
  const spreadBps = Math.round(DEFAULT_SPREAD_BPS + jitter);
  const spreadFactor = 1 - spreadBps / 10_000;

  const effectiveRate = midRate * spreadFactor;

  let fromAmount: number;
  let toAmount: number;
  if (side === 'from') {
    fromAmount = amount;
    toAmount = round(amount * effectiveRate, pair.to.decimals);
  } else {
    toAmount = amount;
    fromAmount = round(amount / effectiveRate, pair.from.decimals);
  }

  const validUntil = new Date(Date.now() + QUOTE_VALIDITY_SECONDS * 1000).toISOString();

  return {
    pairId,
    rate: effectiveRate,
    spreadBps,
    fromAmount,
    toAmount,
    validUntil,
    source: 'mock',
  };
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
```

- [ ] **Step 4: Run test to verify all pass**

```bash
npm test -- --run tests/quote.test.ts
```

Expected: 8 passed, 0 failed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/quote/get-quote.ts tests/quote.test.ts
git commit -m "feat(quote): implement getQuote() with mock rates, spread, jitter, validity (TDD)"
```

---

### Task 15: Locale formatters with TDD

**Files:**
- Create: `tests/formatters.test.ts`
- Create: `src/lib/quote/formatters.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/formatters.test.ts
import { describe, expect, it } from 'vitest';
import { formatAmount, formatRate, parseAmount } from '@/lib/quote/formatters';

describe('formatAmount', () => {
  it('formats COP with no decimals and Colombian thousands separator', () => {
    expect(formatAmount(1234567, 'COP', 'es')).toBe('1.234.567');
  });

  it('formats USDT with 2 decimals and Colombian separators', () => {
    expect(formatAmount(1234.5, 'USDT', 'es')).toBe('1.234,50');
  });

  it('formats USDT with 2 decimals and English separators', () => {
    expect(formatAmount(1234.5, 'USDT', 'en')).toBe('1,234.50');
  });
});

describe('formatRate', () => {
  it('formats COP->USDT rate as fraction (5 sig figs)', () => {
    const formatted = formatRate(0.00024, 'es');
    expect(formatted).toMatch(/0,00024|0,00024\d/);
  });

  it('formats large rate USDT->COP with thousands separator', () => {
    const formatted = formatRate(4123.45, 'es');
    expect(formatted).toMatch(/4\.123,4[5-9]?/);
  });
});

describe('parseAmount', () => {
  it('parses Colombian-formatted number', () => {
    expect(parseAmount('1.234.567', 'es')).toBe(1234567);
    expect(parseAmount('1.234,50', 'es')).toBe(1234.5);
  });

  it('parses English-formatted number', () => {
    expect(parseAmount('1,234.50', 'en')).toBe(1234.5);
  });

  it('returns NaN for empty or invalid input', () => {
    expect(parseAmount('', 'es')).toBeNaN();
    expect(parseAmount('abc', 'es')).toBeNaN();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm test -- --run tests/formatters.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement formatters**

```typescript
// src/lib/quote/formatters.ts
import type { AssetCode, Locale } from './types';

const LOCALE_TAGS: Record<Locale, string> = {
  es: 'es-CO',
  en: 'en-US',
};

const DECIMALS_FOR: Record<AssetCode, number> = {
  COP: 0,
  USDT: 2,
  USDC: 2,
};

export function formatAmount(value: number, asset: AssetCode, locale: Locale): string {
  const decimals = DECIMALS_FOR[asset];
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatRate(rate: number, locale: Locale): string {
  const digits = rate >= 1 ? 4 : 5;
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(rate);
}

export function parseAmount(input: string, locale: Locale): number {
  if (!input || typeof input !== 'string') return NaN;
  const cleaned = input.trim();
  if (cleaned.length === 0) return NaN;

  const normalized = locale === 'es'
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');

  const num = Number(normalized);
  return Number.isFinite(num) ? num : NaN;
}

export function formatSpread(bps: number, locale: Locale): string {
  const pct = bps / 100;
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent',
  }).format(pct / 100);
}
```

- [ ] **Step 4: Run test to verify all pass**

```bash
npm test -- --run tests/formatters.test.ts
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add src/lib/quote/formatters.ts tests/formatters.test.ts
git commit -m "feat(quote): add locale-aware formatters with TDD"
```

---

### Task 16: QuoteWidget React component

**Files:**
- Create: `src/components/quote/QuoteWidget.tsx`

- [ ] **Step 1: Implement QuoteWidget**

```tsx
// src/components/quote/QuoteWidget.tsx
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, Info } from 'lucide-react';
import type { PairId, QuoteResponse } from '@/lib/quote/types';
import { getQuote } from '@/lib/quote/get-quote';
import { PAIRS } from '@/lib/quote/mock-rates';
import { formatAmount, formatRate, parseAmount } from '@/lib/quote/formatters';
import { t, type Locale } from '@/i18n/t';

interface Props {
  locale: Locale;
  appBaseUrl: string;
  defaultPair?: PairId;
}

const PAIR_LABEL_KEY: Record<PairId, 'quote.pair.copToUsdt' | 'quote.pair.usdtToCop' | 'quote.pair.copToUsdc' | 'quote.pair.usdcToCop'> = {
  'COP-USDT': 'quote.pair.copToUsdt',
  'USDT-COP': 'quote.pair.usdtToCop',
  'COP-USDC': 'quote.pair.copToUsdc',
  'USDC-COP': 'quote.pair.usdcToCop',
};

export default function QuoteWidget({ locale, appBaseUrl, defaultPair = 'COP-USDT' }: Props) {
  const [pairId, setPairId] = useState<PairId>(defaultPair);
  const [rawAmount, setRawAmount] = useState<string>('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pair = PAIRS[pairId];

  useEffect(() => {
    const amount = parseAmount(rawAmount, locale);
    if (!Number.isFinite(amount) || amount <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const q = await getQuote({ pairId, amount, side: 'from' });
        if (!cancelled) {
          setQuote(q);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setQuote(null);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [rawAmount, pairId, locale]);

  const continueUrl = useMemo(() => {
    if (!quote) return null;
    const params = new URLSearchParams({
      pair: pairId,
      amount: String(quote.fromAmount),
      side: 'from',
    });
    return `${appBaseUrl}/request?${params.toString()}`;
  }, [quote, pairId, appBaseUrl]);

  return (
    <div className="quote-widget">
      <div className="qw-row">
        <label className="qw-label" htmlFor="qw-pair">{t('quote.direction', locale)}</label>
        <select
          id="qw-pair"
          className="qw-select"
          value={pairId}
          onChange={(e) => setPairId(e.target.value as PairId)}
          aria-label={t('quote.direction', locale)}
        >
          {(Object.keys(PAIRS) as PairId[]).map((id) => (
            <option key={id} value={id}>{t(PAIR_LABEL_KEY[id], locale)}</option>
          ))}
        </select>
      </div>

      <div className="qw-row">
        <label className="qw-label" htmlFor="qw-amount">
          {t('quote.from', locale)} ({pair.from.code})
        </label>
        <input
          id="qw-amount"
          type="text"
          inputMode="decimal"
          className="qw-input"
          value={rawAmount}
          onChange={(e) => setRawAmount(e.target.value)}
          placeholder={formatAmount(pair.from.min, pair.from.code, locale)}
        />
      </div>

      <div className="qw-result">
        {loading && <div className="qw-loading"><RefreshCw size={16} className="qw-spin" /></div>}
        {error && <div className="qw-error" role="alert">{error}</div>}
        {quote && !loading && !error && (
          <>
            <div className="qw-amount">
              <span className="qw-amount-label">{t('quote.to', locale)} ({pair.to.code})</span>
              <span className="qw-amount-value">
                {formatAmount(quote.toAmount, pair.to.code, locale)}
              </span>
            </div>
            <div className="qw-meta">
              <span>{t('quote.rate', locale)}: 1 {pair.from.code} = {formatRate(quote.rate, locale)} {pair.to.code}</span>
              <span className="qw-badge">{t(quote.source === 'mock' ? 'quote.source.mock' : 'quote.source.api', locale)}</span>
            </div>
          </>
        )}
      </div>

      <a
        className="qw-cta"
        href={continueUrl ?? '#'}
        aria-disabled={!continueUrl}
        tabIndex={continueUrl ? 0 : -1}
        onClick={(e) => { if (!continueUrl) e.preventDefault(); }}
      >
        {t('cta.continue', locale)} <ArrowRight size={16} />
      </a>

      <p className="qw-disclaimer">
        <Info size={12} /> {t('quote.disclaimer', locale)}
      </p>

      <style>{`
        .quote-widget { display: flex; flex-direction: column; gap: 14px; font-family: var(--font-sans); }
        .qw-row { display: flex; flex-direction: column; gap: 6px; }
        .qw-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-600); }
        .qw-select, .qw-input {
          height: 44px;
          padding: 0 12px;
          font-size: var(--text-sm);
          border: 1px solid var(--color-paper-200);
          border-radius: var(--radius-md);
          background: var(--color-paper-50);
          font-family: inherit;
        }
        .qw-input { font-variant-numeric: tabular-nums; }
        .qw-select:focus-visible, .qw-input:focus-visible { border-color: var(--color-yellow-500); outline: none; }
        .qw-result {
          min-height: 84px;
          padding: 16px;
          background: var(--color-paper-100);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .qw-amount { display: flex; flex-direction: column; gap: 4px; }
        .qw-amount-label { font-size: var(--text-xs); color: var(--color-ink-600); }
        .qw-amount-value { font-size: var(--text-xl); font-weight: 700; font-variant-numeric: tabular-nums; }
        .qw-meta { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-ink-600); }
        .qw-badge {
          background: var(--color-yellow-100);
          border: 1px solid var(--color-yellow-500);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
          color: var(--color-ink-900);
        }
        .qw-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 48px;
          background: var(--color-ink-900);
          color: var(--color-paper-50);
          border-radius: var(--radius-md);
          font-weight: 700;
          text-decoration: none;
          transition: background 120ms ease;
        }
        .qw-cta:hover { background: var(--color-red-700); }
        .qw-cta[aria-disabled='true'] { opacity: 0.4; pointer-events: none; }
        .qw-disclaimer { font-size: var(--text-2xs); color: var(--color-ink-400); display: inline-flex; align-items: center; gap: 4px; margin: 0; }
        .qw-error { color: var(--color-danger); font-size: var(--text-xs); }
        .qw-loading { display: flex; justify-content: center; padding-block: 12px; }
        .qw-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/quote/QuoteWidget.tsx
git commit -m "feat(quote): add QuoteWidget React island with pair selector, amount input, formatted result"
```

---

### Task 17: QuoteWidget tests

**Files:**
- Create: `tests/components/QuoteWidget.test.tsx`

- [ ] **Step 1: Write tests**

```tsx
// tests/components/QuoteWidget.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuoteWidget from '@/components/quote/QuoteWidget';

describe('QuoteWidget', () => {
  const baseProps = { locale: 'es' as const, appBaseUrl: 'https://app.colswap.tech' };

  it('renders the pair selector and amount input', () => {
    render(<QuoteWidget {...baseProps} />);
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/envías/i)).toBeInTheDocument();
  });

  it('does not show a quote with empty amount', () => {
    render(<QuoteWidget {...baseProps} />);
    expect(screen.queryByText(/recibes/i)).not.toBeInTheDocument();
  });

  it('shows a quote after typing a valid amount (Colombian format)', async () => {
    render(<QuoteWidget {...baseProps} />);
    const input = screen.getByLabelText(/envías/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.000.000' } });

    await waitFor(() => {
      expect(screen.getByText(/recibes/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText(/tasa/i)).toBeInTheDocument();
  });

  it('switches pair when the select changes', async () => {
    render(<QuoteWidget {...baseProps} />);
    const select = screen.getByLabelText(/dirección/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'USDT-COP' } });
    expect(select.value).toBe('USDT-COP');
  });

  it('shows an error for amount below minimum', async () => {
    render(<QuoteWidget {...baseProps} />);
    const input = screen.getByLabelText(/envías/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '500' } });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/minimum|mínimo/i);
    }, { timeout: 1000 });
  });

  it('renders English labels when locale is "en"', () => {
    render(<QuoteWidget {...baseProps} locale="en" />);
    expect(screen.getByLabelText(/direction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/you send/i)).toBeInTheDocument();
  });

  it('builds a "Continuar" URL with the expected querystring', async () => {
    render(<QuoteWidget {...baseProps} />);
    fireEvent.change(screen.getByLabelText(/envías/i), { target: { value: '1.000.000' } });

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /continuar/i }) as HTMLAnchorElement;
      expect(link.href).toContain('app.colswap.tech/request');
      expect(link.href).toContain('pair=COP-USDT');
      expect(link.href).toContain('amount=1000000');
    }, { timeout: 1000 });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run tests/components/QuoteWidget.test.tsx
```

Expected: 7 passed.

- [ ] **Step 3: Commit**

```bash
git add tests/components/QuoteWidget.test.tsx
git commit -m "test(quote): add QuoteWidget component tests covering both locales and edge cases"
```

---

### Task 18: Mount QuoteWidget on home pages

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/en/index.astro`

- [ ] **Step 1: Update Spanish home page to mount widget**

Replace the placeholder `<div id="quote-widget-mount">...</div>` section with the imported React component:

```astro
---
// src/pages/index.astro
import PageLayout from '@/layouts/PageLayout.astro';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
import ComplianceBadges from '@/components/trust/ComplianceBadges.astro';
import QuoteWidget from '@/components/quote/QuoteWidget';
import { t } from '@/i18n/t';

const locale = 'es' as const;
const appBaseUrl = import.meta.env.PUBLIC_APP_BASE_URL || 'https://app.colswap.tech';
---
<PageLayout
  locale={locale}
  currentPath="/"
  title="ColSwap"
  description={t('home.hero.subtitle', locale)}
>
  <section class="hero">
    <div class="container-page hero-inner">
      <div class="hero-copy">
        <h1>{t('home.hero.title', locale)}</h1>
        <p class="hero-sub">{t('home.hero.subtitle', locale)}</p>
      </div>
      <div class="hero-widget-slot">
        <QuoteWidget client:idle locale="es" appBaseUrl={appBaseUrl} />
      </div>
    </div>
  </section>
  <SalesContactCTA locale={locale} />
  <ComplianceBadges locale={locale} />
</PageLayout>

<style>
  .hero {
    padding-block: 80px;
    background:
      radial-gradient(ellipse at top right, var(--color-yellow-100), transparent 60%),
      var(--color-paper-50);
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero h1 { font-size: clamp(var(--text-xl), 4vw, var(--text-3xl)); margin: 0 0 20px; }
  .hero-sub { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin: 0; }
  .hero-widget-slot {
    background: var(--color-paper-50);
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 2: Update English home page to mount widget**

```astro
---
// src/pages/en/index.astro
import PageLayout from '@/layouts/PageLayout.astro';
import SalesContactCTA from '@/components/cta/SalesContactCTA.astro';
import ComplianceBadges from '@/components/trust/ComplianceBadges.astro';
import QuoteWidget from '@/components/quote/QuoteWidget';
import { t } from '@/i18n/t';
const locale = 'en' as const;
const appBaseUrl = import.meta.env.PUBLIC_APP_BASE_URL || 'https://app.colswap.tech';
---
<PageLayout
  locale={locale}
  currentPath="/en/"
  title="ColSwap"
  description={t('home.hero.subtitle', locale)}
>
  <section class="hero">
    <div class="container-page hero-inner">
      <div class="hero-copy">
        <h1>{t('home.hero.title', locale)}</h1>
        <p class="hero-sub">{t('home.hero.subtitle', locale)}</p>
      </div>
      <div class="hero-widget-slot">
        <QuoteWidget client:idle locale="en" appBaseUrl={appBaseUrl} />
      </div>
    </div>
  </section>
  <SalesContactCTA locale={locale} />
  <ComplianceBadges locale={locale} />
</PageLayout>

<style>
  .hero {
    padding-block: 80px;
    background:
      radial-gradient(ellipse at top right, var(--color-yellow-100), transparent 60%),
      var(--color-paper-50);
  }
  .hero-inner {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    align-items: center;
  }
  .hero h1 { font-size: clamp(var(--text-xl), 4vw, var(--text-3xl)); margin: 0 0 20px; }
  .hero-sub { font-size: var(--text-md); color: var(--color-ink-600); max-width: 60ch; margin: 0; }
  .hero-widget-slot {
    background: var(--color-paper-50);
    border: 1px solid var(--color-paper-200);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  @media (max-width: 900px) {
    .hero-inner { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 3: Verify dev build, click around**

```bash
npm run dev &
sleep 5
curl -s "http://localhost:4321/ColSwap-TEST/" | grep -o 'quote-widget\|QuoteWidget' | head -5
kill %1
```

Expected: At least one match (React island hydration markers).

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/en/index.astro
git commit -m "feat(home): mount QuoteWidget React island on home pages (es + en)"
```

---

## Phase G — Quality Gates & CI/CD

### Task 19: ESLint + Prettier configuration

**Files:**
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

- [ ] **Step 1: Create eslint.config.mjs**

```js
// eslint.config.mjs (flat config for ESLint v9)
import eslintAstro from 'eslint-plugin-astro';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'coverage/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-key': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
  ...eslintAstro.configs.recommended,
];
```

- [ ] **Step 2: Create .prettierrc.json**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": { "parser": "astro" }
    }
  ]
}
```

- [ ] **Step 3: Create .prettierignore**

```
dist/
.astro/
node_modules/
coverage/
package-lock.json
src/i18n/*.json
```

- [ ] **Step 4: Run lint and fix anything obvious**

```bash
npm run lint:fix
npm run lint
```

Expected: clean output (or only warnings, no errors).

- [ ] **Step 5: Commit**

```bash
git add eslint.config.mjs .prettierrc.json .prettierignore
git commit -m "chore: configure ESLint flat config + Prettier"
```

---

### Task 20: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create workflow**

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

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test -- --run

      - name: Build
        run: npm run build
        env:
          PUBLIC_APP_BASE_URL: https://app.colswap.tech

      - uses: actions/configure-pages@v5

      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow with lint/typecheck/test gates"
```

---

### Task 21: Cloudflare Pages workflow (disabled stub)

**Files:**
- Create: `.github/workflows/deploy-cloudflare.yml`

- [ ] **Step 1: Create disabled workflow**

```yaml
name: Deploy to Cloudflare Pages (disabled)

# Triggered only manually until ready to migrate from GH Pages.
on:
  workflow_dispatch:

jobs:
  deploy:
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

      - name: Publish to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: colswap-web
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy-cloudflare.yml
git commit -m "ci: add disabled Cloudflare Pages workflow as migration stub"
```

---

### Task 22: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

```markdown
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

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Static build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `astro check` + `tsc --noEmit` |
| `npm run lint` | ESLint + Prettier (check) |
| `npm run lint:fix` | ESLint --fix + Prettier --write |
| `npm test` | Run Vitest in watch mode |
| `npm test -- --run` | Run Vitest once |

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

| Path | Purpose |
|---|---|
| `src/pages/` | Astro pages (Spanish at root, English under `/en/`) |
| `src/layouts/` | BaseLayout (head/meta) and PageLayout (header + footer wrapper) |
| `src/components/` | Reusable Astro and React components |
| `src/content/` | Markdown collections: `blog/`, `faqs/`, `legal/` (per locale) |
| `src/i18n/` | UI strings (`es.json`, `en.json`), `t()` helper, route map |
| `src/lib/quote/` | Quote engine: types, mock rates, `getQuote()`, formatters |
| `src/lib/seo/` | SEO meta helpers |
| `src/styles/` | `tokens.css` (single source of truth) + `globals.css` |
| `tests/` | Vitest test files |

## Adding content

### Blog post

Create `src/content/blog/{es|en}/{slug}.md` with frontmatter:

```yaml
---
title: 'Post title'
slug: 'kebab-case-slug'
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
category: 'general'   # general | compliance | fees | process | security
order: 5
locale: 'es'
---

Answer body in markdown.
```

### Legal document

Edit existing `src/content/legal/{es|en}/{slug}.md` files. Slugs are constrained by the schema — adding a new one requires updating `src/content/config.ts`.

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with stack, scripts, structure, content guide, deploy notes"
```

---

### Task 23: Final smoke test and deploy

**Files:** none (verification only)

- [ ] **Step 1: Run full local check pipeline**

```bash
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

Expected: all four succeed.

- [ ] **Step 2: Inspect the built output**

```bash
ls dist/
ls dist/en/
test -f dist/index.html && echo "ES home OK"
test -f dist/en/index.html && echo "EN home OK"
test -f dist/blog/regulacion-vasp-colombia/index.html && echo "ES blog post OK"
test -f dist/en/blog/colombia-vasp-regulation/index.html && echo "EN blog post OK"
test -f dist/legal/terminos/index.html && echo "ES legal OK"
test -f dist/en/legal/terms/index.html && echo "EN legal OK"
test -f dist/preguntas-frecuentes/index.html && echo "ES FAQs OK"
test -f dist/en/faqs/index.html && echo "EN FAQs OK"
test -f dist/sitemap-index.xml && echo "Sitemap OK"
test -f dist/robots.txt && echo "robots.txt OK"
```

Expected: all "OK" lines print.

- [ ] **Step 3: Preview the production build locally**

```bash
npm run preview &
sleep 3
curl -sI "http://localhost:4322/ColSwap-TEST/" | head -1
curl -sI "http://localhost:4322/ColSwap-TEST/en/" | head -1
curl -s "http://localhost:4322/ColSwap-TEST/" | grep -o '<html lang="[^"]*"'
curl -s "http://localhost:4322/ColSwap-TEST/en/" | grep -o '<html lang="[^"]*"'
kill %1
```

Expected: `HTTP/1.1 200`, `<html lang="es-CO"` and `<html lang="en"` respectively.

- [ ] **Step 4: Push to trigger first deploy**

```bash
git push origin main
```

Watch the Actions tab on GitHub. The workflow should complete within 2–3 minutes.

- [ ] **Step 5: Verify live site**

After the workflow finishes, open:
- https://sickdancemoves.github.io/ColSwap-TEST/
- https://sickdancemoves.github.io/ColSwap-TEST/en/

Click around: home → language switcher → blog → legal → FAQs → contact. Test the quote widget on the home page (enter `1.000.000` in Spanish home, expect a quote to appear).

- [ ] **Step 6: Tag the v0.1.0 release**

```bash
git tag -a v0.1.0 -m "v0.1.0 — initial scaffolded marketing site"
git push origin v0.1.0
```

---

## Self-Review (already done)

**Spec coverage check:**
- §3 In-scope items: all covered by tasks ✓
- §3 Out-of-scope items: none accidentally implemented ✓
- §5 Repo structure: matches the files created ✓
- §6 Pages inventory: 16 marketing routes + dynamic routes ✓
- §7 Routing & i18n: covered in Tasks 2 and 4 ✓
- §8 Content model: covered in Tasks 7-8 ✓
- §9 Quote widget contract: covered in Tasks 13-18 ✓
- §10 Visual design tokens: covered in Task 3 ✓
- §11 Forms strategy (no form at v1): contact page (Tasks 10-11) shows email only ✓
- §12 Deploy & CI: covered in Tasks 20-21 ✓
- §13 Testing & quality: covered in Tasks 4 (i18n), 14-15 (quote), 17 (widget), 19 (lint/format) ✓
- §14 Future evolution: seams documented in README (Task 22) ✓

**Placeholder scan:** clean — no "TBD", "TODO", or "fill in later" markers. Legal docs contain real (if generic) compliance copy that the team can refine.

**Type consistency:** `QuoteRequest`, `QuoteResponse`, `PairId`, `Locale` defined once in Task 13, referenced consistently in 14, 15, 16, 17, 18.

**Scope check:** one project, one plan — appropriate.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-28-colswap-base-implementation.md`.

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best when you want to step away and have me drive.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Best when you want to stay close to each change.

Which approach?
