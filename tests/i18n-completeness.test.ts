import { describe, expect, it } from 'vitest';
import es from '@/i18n/es.json';
import en from '@/i18n/en.json';

describe('i18n completeness', () => {
  it('es.json and en.json have identical key sets', () => {
    const esKeys = Object.keys(es).sort();
    const enKeys = Object.keys(en).sort();

    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));
    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));

    expect(
      missingInEn,
      `Keys present in es.json but missing in en.json: ${missingInEn.join(', ')}`
    ).toEqual([]);
    expect(
      missingInEs,
      `Keys present in en.json but missing in es.json: ${missingInEs.join(', ')}`
    ).toEqual([]);
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
