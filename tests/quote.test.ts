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
    await expect(getQuote({ pairId: 'COP-USDT', amount: 0, side: 'from' })).rejects.toThrow(
      /positive/
    );
    await expect(getQuote({ pairId: 'COP-USDT', amount: -1, side: 'from' })).rejects.toThrow(
      /positive/
    );
  });

  it('rejects amounts below the pair minimum', async () => {
    await expect(getQuote({ pairId: 'COP-USDT', amount: 1000, side: 'from' })).rejects.toThrow(
      /minimum/
    );
  });

  it('rejects unknown pairId', async () => {
    // @ts-expect-error testing runtime guard
    await expect(getQuote({ pairId: 'XYZ-COP', amount: 100, side: 'from' })).rejects.toThrow(
      /pair/i
    );
  });
});
