import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuoteWidget from '@/components/quote/QuoteWidget';

describe('QuoteWidget', () => {
  const baseProps = { locale: 'es' as const, appBaseUrl: 'https://app.colswap.tech' };

  it('renders the pair selector and amount input', () => {
    render(<QuoteWidget {...baseProps} />);
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/envías/i)).toBeInTheDocument();
  });

  it('does not show a quote with empty amount', () => {
    render(<QuoteWidget {...baseProps} />);
    expect(screen.queryByText(/recibes/i)).not.toBeInTheDocument();
  });

  it('shows a quote after typing a valid amount (Colombian format)', async () => {
    render(<QuoteWidget {...baseProps} />);
    const input = screen.getByLabelText(/envías/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '1.000.000' } });

    await waitFor(() => {
      expect(screen.getByText(/recibes/i)).toBeInTheDocument();
    }, { timeout: 1000 });

    expect(screen.getByText(/^tasa:/i)).toBeInTheDocument();
  });

  it('switches pair when the select changes', async () => {
    render(<QuoteWidget {...baseProps} />);
    const select = screen.getByLabelText(/dirección/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'USDT-COP' } });
    expect(select.value).toBe('USDT-COP');
  });

  it('shows an error for amount below minimum', async () => {
    render(<QuoteWidget {...baseProps} />);
    const input = screen.getByLabelText(/envías/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '500' } });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/minimum|mínimo/i);
    }, { timeout: 1000 });
  });

  it('renders English labels when locale is "en"', () => {
    render(<QuoteWidget {...baseProps} locale="en" />);
    expect(screen.getByLabelText(/direction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/you send/i)).toBeInTheDocument();
  });

  it('builds a "Continuar" URL with the expected querystring', async () => {
    render(<QuoteWidget {...baseProps} />);
    fireEvent.change(screen.getByLabelText(/envías/i), { target: { value: '1.000.000' } });

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /continuar/i }) as HTMLAnchorElement;
      expect(link.href).toContain('app.colswap.tech/request');
      expect(link.href).toContain('pair=COP-USDT');
      expect(link.href).toContain('amount=1000000');
    }, { timeout: 1000 });
  });
});
