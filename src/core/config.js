const DEFAULT_CONFIG = {
    symbol: 'MSFT',
    refreshInterval: 60000,
    sparkline: false,
    theme: {}
};


/**
 * @param {WidgetConfig} userConfig
 * @returns {WidgetConfig}
 */
export function parseConfig(userConfig = {}) {
    if (!userConfig.containerId) {
        throw new Error('containerId is required');
    }

    return {
        ...DEFAULT_CONFIG,
        ...userConfig,
        sparkline: normalizeSparkline(userConfig.sparkline)
    };
}

function normalizeSparkline(value) {
    if ( !value ) return false;
    const normalized = value.toLowerCase();
    if (normalized === 'hourly') return 'hourly';
    if (normalized === 'week') return 'week';
    return false;
}