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
