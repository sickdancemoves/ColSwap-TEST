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

  if (side === 'from' && amount < pair.from.min) {
    throw new Error(
      `Amount is below the minimum for ${pair.from.code} (${pair.from.min})`,
    );
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
