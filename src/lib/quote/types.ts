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
