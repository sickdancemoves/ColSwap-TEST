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
