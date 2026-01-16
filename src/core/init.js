import { parseConfig } from "./config";
import { StocksSnapshot } from "../components/StocksSnapshot";
import { recordLoadTime } from "../observability/telemetry"

const nextPaint = () => {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

export const init = async (userConfig) => {
    try {
        const config = parseConfig(userConfig);

        const container = document.getElementById(config.containerId);

        if (!container) throw new Error(`Container #${config.containerId} not found`);

        if (!customElements.get('stocks-snapshot')) customElements.define('stocks-snapshot', StocksSnapshot);

        const widget = new StocksSnapshot(config);

        propagateParentCustomStyles(container, widget);

        container.innerHTML = '';
        container.appendChild(widget);
        
        const startTime = performance.now();
        await nextPaint();
        recordLoadTime(performance.now() - startTime)
        return;

    } catch (err) {
        return Promise.reject(err)
    }
}

function propagateParentCustomStyles(container, widget) {
    const cssVars = [
        '--stocks-bg-color',
        '--stocks-text-color',
        '--stocks-primary-color',
        '--stocks-up-color',
        '--stocks-down-color',
        '--stocks-font-family'
    ];

    cssVars.forEach(varName => {
        const value = getComputedStyle(container).getPropertyValue(varName);
        if (value) widget.style.setProperty(varName, value);
    })
}