// src/components/quote/QuoteWidget.tsx
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RefreshCw, Info } from 'lucide-react';
import type { PairId, QuoteResponse } from '@/lib/quote/types';
import { getQuote } from '@/lib/quote/get-quote';
import { PAIRS } from '@/lib/quote/mock-rates';
import { formatAmount, formatRate, parseAmount } from '@/lib/quote/formatters';
import { t, type Locale } from '@/i18n/t';

interface Props {
  locale: Locale;
  appBaseUrl: string;
  defaultPair?: PairId;
}

const PAIR_LABEL_KEY: Record<PairId, 'quote.pair.copToUsdt' | 'quote.pair.usdtToCop' | 'quote.pair.copToUsdc' | 'quote.pair.usdcToCop'> = {
  'COP-USDT': 'quote.pair.copToUsdt',
  'USDT-COP': 'quote.pair.usdtToCop',
  'COP-USDC': 'quote.pair.copToUsdc',
  'USDC-COP': 'quote.pair.usdcToCop',
};

export default function QuoteWidget({ locale, appBaseUrl, defaultPair = 'COP-USDT' }: Props) {
  const [pairId, setPairId] = useState<PairId>(defaultPair);
  const [rawAmount, setRawAmount] = useState<string>('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pair = PAIRS[pairId];

  useEffect(() => {
    const amount = parseAmount(rawAmount, locale);
    if (!Number.isFinite(amount) || amount <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeout = setTimeout(async () => {
      try {
        const q = await getQuote({ pairId, amount, side: 'from' });
        if (!cancelled) {
          setQuote(q);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message);
          setQuote(null);
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [rawAmount, pairId, locale]);

  const continueUrl = useMemo(() => {
    if (!quote) return null;
    const params = new URLSearchParams({
      pair: pairId,
      amount: String(quote.fromAmount),
      side: 'from',
    });
    return `${appBaseUrl}/request?${params.toString()}`;
  }, [quote, pairId, appBaseUrl]);

  return (
    <div className="quote-widget">
      <div className="qw-row">
        <label className="qw-label" htmlFor="qw-pair">{t('quote.direction', locale)}</label>
        <select
          id="qw-pair"
          className="qw-select"
          value={pairId}
          onChange={(e) => setPairId(e.target.value as PairId)}
          aria-label={t('quote.direction', locale)}
        >
          {(Object.keys(PAIRS) as PairId[]).map((id) => (
            <option key={id} value={id}>{t(PAIR_LABEL_KEY[id], locale)}</option>
          ))}
        </select>
      </div>

      <div className="qw-row">
        <label className="qw-label" htmlFor="qw-amount">
          {t('quote.from', locale)} ({pair.from.code})
        </label>
        <input
          id="qw-amount"
          type="text"
          inputMode="decimal"
          className="qw-input"
          value={rawAmount}
          onChange={(e) => setRawAmount(e.target.value)}
          placeholder={formatAmount(pair.from.min, pair.from.code, locale)}
        />
      </div>

      <div className="qw-result">
        {loading && <div className="qw-loading"><RefreshCw size={16} className="qw-spin" /></div>}
        {error && <div className="qw-error" role="alert">{error}</div>}
        {quote && !loading && !error && (
          <>
            <div className="qw-amount">
              <span className="qw-amount-label">{t('quote.to', locale)} ({pair.to.code})</span>
              <span className="qw-amount-value">
                {formatAmount(quote.toAmount, pair.to.code, locale)}
              </span>
            </div>
            <div className="qw-meta">
              <span>{t('quote.rate', locale)}: 1 {pair.from.code} = {formatRate(quote.rate, locale)} {pair.to.code}</span>
              <span className="qw-badge">{t(quote.source === 'mock' ? 'quote.source.mock' : 'quote.source.api', locale)}</span>
            </div>
          </>
        )}
      </div>

      <a
        className="qw-cta"
        href={continueUrl ?? '#'}
        aria-disabled={!continueUrl}
        tabIndex={continueUrl ? 0 : -1}
        onClick={(e) => { if (!continueUrl) e.preventDefault(); }}
      >
        {t('cta.continue', locale)} <ArrowRight size={16} />
      </a>

      <p className="qw-disclaimer">
        <Info size={12} /> {t('quote.disclaimer', locale)}
      </p>

      <style>{`
        .quote-widget { display: flex; flex-direction: column; gap: 14px; font-family: var(--font-sans); }
        .qw-row { display: flex; flex-direction: column; gap: 6px; }
        .qw-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-ink-600); }
        .qw-select, .qw-input {
          height: 44px;
          padding: 0 12px;
          font-size: var(--text-sm);
          border: 1px solid var(--color-paper-200);
          border-radius: var(--radius-md);
          background: var(--color-paper-50);
          font-family: inherit;
        }
        .qw-input { font-variant-numeric: tabular-nums; }
        .qw-select:focus-visible, .qw-input:focus-visible { border-color: var(--color-yellow-500); outline: none; }
        .qw-result {
          min-height: 84px;
          padding: 16px;
          background: var(--color-paper-100);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .qw-amount { display: flex; flex-direction: column; gap: 4px; }
        .qw-amount-label { font-size: var(--text-xs); color: var(--color-ink-600); }
        .qw-amount-value { font-size: var(--text-xl); font-weight: 700; font-variant-numeric: tabular-nums; }
        .qw-meta { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--color-ink-600); }
        .qw-badge {
          background: var(--color-yellow-100);
          border: 1px solid var(--color-yellow-500);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
          color: var(--color-ink-900);
        }
        .qw-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 48px;
          background: var(--color-ink-900);
          color: var(--color-paper-50);
          border-radius: var(--radius-md);
          font-weight: 700;
          text-decoration: none;
          transition: background 120ms ease;
        }
        .qw-cta:hover { background: var(--color-red-700); }
        .qw-cta[aria-disabled='true'] { opacity: 0.4; pointer-events: none; }
        .qw-disclaimer { font-size: var(--text-2xs); color: var(--color-ink-400); display: inline-flex; align-items: center; gap: 4px; margin: 0; }
        .qw-error { color: var(--color-danger); font-size: var(--text-xs); }
        .qw-loading { display: flex; justify-content: center; padding-block: 12px; }
        .qw-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
