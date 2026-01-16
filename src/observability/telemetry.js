import { trace, metrics } from '@opentelemetry/api';

let tracer = null;
let meter = null;
let loadTimeHistogram = null;
let apiErrorCounter = null;

export function initTelemetry(config = {}) {
    if (config.enabled === false) return;

    tracer = trace.getTracer('r2-stocks-widget');
    meter = metrics.getMeter('r2-stocks-widget');

    loadTimeHistogram = meter.createHistogram('widget.load_time', {
        description: 'Time from init to first paint'
    });

    apiErrorCounter = meter.createCounter('stocks.api_errors', {
        description: 'Number of market API errors'
    });
}

export function recordLoadTime(ms) {
    if(!loadTimeHistogram) {
        console.log('[telemetry] load_time: ', ms);
        return;
    }
    loadTimeHistogram.record(ms);
}

export function incrementApiError(){
    if (!apiErrorCounter) {
        console.log('[telemetry] api_error');
        return;
    }
    apiErrorCounter.add(1);
}