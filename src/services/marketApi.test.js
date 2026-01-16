import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchStockOverview,
  fetchStockQuote,
  fetchStockDayHistory,
  fetchStockHourlyHistory,
} from './marketApi';

vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: () => ({
      startSpan: () => ({
        recordException: vi.fn(),
        end: vi.fn(),
      }),
    }),
  },
}));

vi.mock('../observability/telemetry', () => ({
  incrementApiError: vi.fn(),
}));

beforeEach(() => {
  vi.restoreAllMocks();
  global.fetch = vi.fn();
});

describe('market api', () => {
  it('fetchStockOverview returns mapped data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Name: 'Apple Inc',
        OfficialSite: 'https://apple.com',
      }),
    });

    const result = await fetchStockOverview({
      symbol: 'AAPL',
      apiKey: 'key',
    });

    expect(result).toEqual({
      name: 'Apple Inc',
      url: 'https://apple.com',
    });
  });

  it('fetchStockOverview throws on missing apiKey', async () => {
    await expect(
      fetchStockOverview({ symbol: 'AAPL' })
    ).rejects.toThrow('API key is required');
  });

  it('fetchStockQuote returns mapped quote', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'Global Quote': {
          '01. symbol': 'AAPL',
          '05. price': '150',
          '09. change': '2',
          '10. change percent': '1.5%',
          '07. latest trading day': '2025-01-01',
        },
      }),
    });

    const result = await fetchStockQuote({
      symbol: 'AAPL',
      apiKey: 'key',
    });

    expect(result).toEqual({
      symbol: 'AAPL',
      price: '150.00',
      change: '2.00',
      changePercent: '1.50',
      lastUpdate: '2025-01-01',
    });
  });

  it('fetchStockDayHistory returns daily history', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'Time Series (Daily)': {
          '2025-01-03': { '4. close': '3' },
          '2025-01-02': { '4. close': '2' },
          '2025-01-01': { '4. close': '1' },
        },
      }),
    });

    const result = await fetchStockDayHistory({
      symbol: 'AAPL',
      apiKey: 'key',
      points: 2,
    });

    expect(result).toEqual([2, 3]);
  });

  it('fetchStockHourlyHistory returns hourly history', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        'Time Series (60min)': {
          '10:00': { '4. close': '10' },
          '09:00': { '4. close': '9' },
          '08:00': { '4. close': '8' },
        },
      }),
    });

    const result = await fetchStockHourlyHistory({
      symbol: 'AAPL',
      apiKey: 'key',
      points: 2,
    });

    expect(result).toEqual([9, 10]);
  });

  it('increments api error on fetch failure', async () => {
    const { incrementApiError } = await import('../observability/telemetry');

    fetch.mockResolvedValueOnce({ ok: false });

    await expect(
      fetchStockQuote({ symbol: 'AAPL', apiKey: 'key' })
    ).rejects.toThrow();

    expect(incrementApiError).toHaveBeenCalled();
  });
});
