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
