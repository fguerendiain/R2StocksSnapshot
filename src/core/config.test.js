import { describe, it, expect } from 'vitest';
import { parseConfig } from './config';

describe('parseConfig', () => {
  it('throws if containerId is missing', () => {
    expect(() => parseConfig({})).toThrow('containerId is required');
  });

  it('applies default config values', () => {
    const config = parseConfig({ containerId: 'app' });

    expect(config).toEqual({
      containerId: 'app',
      symbol: 'MSFT',
      refreshInterval: 60000,
      sparkline: false,
      theme: {},
    });
  });

  it('overrides default values with user config', () => {
    const config = parseConfig({
      containerId: 'app',
      symbol: 'AAPL',
      refreshInterval: 30000,
      theme: { mode: 'dark' },
    });

    expect(config.symbol).toBe('AAPL');
    expect(config.refreshInterval).toBe(30000);
    expect(config.theme).toEqual({ mode: 'dark' });
  });

  it('normalizes sparkline hourly', () => {
    const config = parseConfig({
      containerId: 'app',
      sparkline: 'hourly',
    });

    expect(config.sparkline).toBe('hourly');
  });

  it('normalizes sparkline week', () => {
    const config = parseConfig({
      containerId: 'app',
      sparkline: 'week',
    });

    expect(config.sparkline).toBe('week');
  });

  it('disables sparkline for invalid values', () => {
    const config = parseConfig({
      containerId: 'app',
      sparkline: 'invalid',
    });

    expect(config.sparkline).toBe(false);
  });

  it('disables sparkline for falsy values', () => {
    const config = parseConfig({
      containerId: 'app',
      sparkline: false,
    });

    expect(config.sparkline).toBe(false);
  });
});
