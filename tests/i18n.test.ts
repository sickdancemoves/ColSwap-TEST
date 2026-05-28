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
