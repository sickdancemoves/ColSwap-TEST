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
  const mapKey = (locale === 'es' ? 'es-to-en' : 'en-to-es') as
    | 'es-to-en'
    | 'en-to-es';
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
