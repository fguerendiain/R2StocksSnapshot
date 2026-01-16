import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StocksSnapshot } from './StocksSnapshot';

vi.mock('@opentelemetry/api', () => ({
    trace: {
        getTracer: () => ({
            startSpan: () => ({
                end: vi.fn(),
            }),
        }),
    },
}));

vi.mock('../services/marketApi', () => ({
    fetchStockQuote: vi.fn(),
    fetchStockOverview: vi.fn(),
    fetchStockDayHistory: vi.fn(),
    fetchStockHourlyHistory: vi.fn(),
}));

vi.mock('../ui/sparkline.js', () => ({
    renderSparkline: vi.fn(() => '<svg></svg>'),
}));

beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();

    global.requestIdleCallback = undefined;
});

describe('StocksSnapshot', () => {
    it('renders shell on connectedCallback', () => {
        if (!customElements.get('stocks-snapshot')) {
            customElements.define('stocks-snapshot', StocksSnapshot);
        }

        const el = document.createElement('stocks-snapshot');
        el.config = {
            symbol: 'AAPL',
            apiKey: 'key',
            refreshInterval: 1000,
            theme: {},
        };

    document.body.appendChild(el);

    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot.querySelector('.widget')).toBeTruthy();
});

it('applies theme variables', () => {
    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: { primary: 'red' },
    };

document.body.appendChild(el);

expect(el.style.getPropertyValue('--stocks-primary')).toBe('red');
});

it('renders company name and binds click', async () => {
    const { fetchStockOverview } = await import('../services/marketApi');

    fetchStockOverview.mockResolvedValue({
        name: 'Apple',
        url: 'https://apple.com',
    });

    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: {},
    };

document.body.appendChild(el);
await el.getCompanyName();

expect(el.shadowRoot.querySelector('.companyName').textContent)
    .toBe('Apple');
});

it('renders quote data', () => {
    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: {},
    };

document.body.appendChild(el);

el.renderData({
    symbol: 'AAPL',
    price: '100.00',
    change: '2.00',
    changePercent: '2.00',
    lastUpdate: '2025-01-01',
});

expect(el.shadowRoot.querySelector('.price').textContent)
    .toBe('$100.00');
});

it('renders error message', () => {
    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: {},
    };

document.body.appendChild(el);
el.renderError('fail');

expect(el.shadowRoot.querySelector('.error').textContent)
    .toContain('fail');
});

it('renders sparkline when data is available', async () => {
    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: {},
        sparkline: 'week',
    };

document.body.appendChild(el);

el.prices = [1, 2, 3];
await el.renderSparkline();

expect(el.shadowRoot.querySelector('.sparkline').innerHTML)
    .toContain('svg');
});

it('clears interval on disconnectedCallback', () => {
    if (!customElements.get('stocks-snapshot')) {
        customElements.define('stocks-snapshot', StocksSnapshot);
    }

    const el = document.createElement('stocks-snapshot');
    el.config = {
        symbol: 'AAPL',
        apiKey: 'key',
        refreshInterval: 1000,
        theme: {},
    };

document.body.appendChild(el);
el.intervalId = setInterval(() => { }, 1000);

const spy = vi.spyOn(global, 'clearInterval');

el.disconnectedCallback();

expect(spy).toHaveBeenCalled();
});
});
