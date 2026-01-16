import { describe, it, expect, vi, beforeEach } from 'vitest';
import { init } from './init';

// --------------------
// Mocks de dependencias
// --------------------
vi.mock('./config', () => ({
    parseConfig: vi.fn(),
}));

vi.mock('../components/StocksSnapshot', () => ({
    StocksSnapshot: vi.fn(),
}));

vi.mock('../observability/telemetry', () => ({
    recordLoadTime: vi.fn(),
}));

// --------------------
// Setup global
// --------------------
beforeEach(() => {
    document.body.innerHTML = '';

    // requestAnimationFrame inmediato
    global.requestAnimationFrame = (cb) => cb();

    // performance.now controlado
    global.performance = {
        now: vi.fn()
            .mockReturnValueOnce(100)
            .mockReturnValueOnce(150),
    };

    // customElements mock
    global.customElements = {
        get: vi.fn(),
        define: vi.fn(),
    };

    vi.restoreAllMocks();
});

// --------------------
// Tests
// --------------------
describe('init', () => {
    it('renders the widget and records load time', async () => {
        const { parseConfig } = await import('./config');
        const { StocksSnapshot } = await import('../components/StocksSnapshot');
        const { recordLoadTime } = await import('../observability/telemetry');

        parseConfig.mockReturnValue({ containerId: 'app' });

        const container = document.createElement('div');
        container.id = 'app';
        document.body.appendChild(container);

        const widgetInstance = document.createElement('div');
        StocksSnapshot.mockImplementation(() => widgetInstance);

        await init({});

        expect(parseConfig).toHaveBeenCalled();
        expect(container.firstChild).toBe(widgetInstance);
        expect(recordLoadTime).toHaveBeenCalled();
        expect(recordLoadTime.mock.calls[0][0]).toBeTypeOf('number');
    });

    it('rejects if container is not found', async () => {
        const { parseConfig } = await import('./config');

        parseConfig.mockReturnValue({ containerId: 'missing' });

        await expect(init({}))
            .rejects
            .toThrow('Container #missing not found');
    });

    it('defines custom element if not registered', async () => {
        const { parseConfig } = await import('./config');
        const { StocksSnapshot } = await import('../components/StocksSnapshot');

        parseConfig.mockReturnValue({ containerId: 'app' });

        document.body.innerHTML = '<div id="app"></div>';

        customElements.get.mockReturnValue(undefined);
        StocksSnapshot.mockImplementation(() => document.createElement('div'));

        await init({});

        expect(customElements.define).toHaveBeenCalledWith(
            'stocks-snapshot',
            StocksSnapshot
        );
    });

    it('does not redefine custom element if already registered', async () => {
        const { parseConfig } = await import('./config');
        const { StocksSnapshot } = await import('../components/StocksSnapshot');

        parseConfig.mockReturnValue({ containerId: 'app' });

        document.body.innerHTML = '<div id="app"></div>';

        customElements.get.mockReturnValue(true);
        StocksSnapshot.mockImplementation(() => document.createElement('div'));

        await init({});

        expect(customElements.define).not.toHaveBeenCalled();
    });

    it('propagates CSS custom properties from container to widget', async () => {
        const { parseConfig } = await import('./config');
        const { StocksSnapshot } = await import('../components/StocksSnapshot');

        parseConfig.mockReturnValue({ containerId: 'app' });

        const container = document.createElement('div');
        container.id = 'app';
        container.style.setProperty('--stocks-bg-color', 'red');
        document.body.appendChild(container);

        vi.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: (name) =>
                name === '--stocks-bg-color' ? 'red' : '',
        });

        const widgetInstance = document.createElement('div');
        StocksSnapshot.mockImplementation(() => widgetInstance);

        await init({});

        expect(
            widgetInstance.style.getPropertyValue('--stocks-bg-color')
        ).toBe('red');
    });
});
