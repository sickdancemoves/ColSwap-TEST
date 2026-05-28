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
  return raw.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
}

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
