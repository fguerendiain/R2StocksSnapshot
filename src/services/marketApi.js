import { trace } from "@opentelemetry/api";
import { incrementApiError } from "../observability/telemetry";

const BASE_URL = 'https://www.alphavantage.co/query';
const tracer = trace.getTracer('r2-stocks-widget');


/**
 * @param {MarketRequest} params
 */
export async function fetchStockOverview({ symbol, apiKey }) {
    if (!apiKey) throw new Error('API key is required');
    const span = tracer.startSpan('stocks.fetch');

    try {
        const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
        const response = await fetch(url);
        if (!response.ok) throw new Error('Market API request failed');
        const data = await response.json();
        if (!data?.['Name']) throw new Error('Invalid market data');
        return {name: data['Name'], url: data['OfficialSite']};
    } catch (err) {
        span.recordException(err);
        incrementApiError();
        throw err;
    } finally {
        span.end();
    }
}


/**
 * @param {MarketRequest} params
 * @returns {Promise<MarketQuote>}
 */
export async function fetchStockQuote({ symbol, apiKey }) {
    if (!apiKey) throw new Error('API key is required');
    const span = tracer.startSpan('stocks.fetch');

    try {
        const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        const response = await fetch(url);
        if (!response.ok) throw new Error('Market API request failed');
        const data = await response.json();
        const quote = data['Global Quote'];
        if (!quote?.['05. price']) throw new Error('Invalid market data');

        return mapQuote(quote);
    } catch (err) {
        span.recordException(err);
        incrementApiError();
        throw err;
    } finally {
        span.end();
    }
}

/**
 * @param {MarketRequest} params
 */
export async function fetchStockDayHistory({ symbol, apiKey, points = 7 }) {
    if (!apiKey) throw new Error('API key is required');
    const span = tracer.startSpan('stocks.fetch');

    try {
        const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
        const response = await fetch(url);
        if (!response.ok) throw new Error('Market API request failed');
        const data = await response.json();
        const series = data['Time Series (Daily)'];
        if (!series) throw new Error('Invalid historical data');
        return Object.values(series)
            .slice(0, points)
            .map(entry => Number(entry['4. close']))
            .reverse();
    } catch (err) {
        span.recordException(err);
        incrementApiError();
        throw err;
    } finally {
        span.end();
    }
}

/**
 * @param {MarketRequest} params
 */
export async function fetchStockHourlyHistory({ symbol, apiKey, points = 24 }) {
    if (!apiKey) throw new Error('API key is required');
    const span = tracer.startSpan('stocks.fetch');

    try {
        const url = `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&apikey=${apiKey}`
        const response = await fetch(url);
        if (!response.ok) throw new Error('Market API request failed');
        const data = await response.json();
        const series = data['Time Series (60min)'];
        if (!series) throw new Error('Invalid historical data');
        return Object.values(series)
            .slice(0, points)
            .map(entry => Number(entry['4. close']))
            .reverse();
    } catch (err) {
        span.recordException(err);
        incrementApiError();
        throw err;
    } finally {
        span.end();
    }
}



/**
 * @param {AlphaVantageQuoteRaw} quote
 * @returns {MarketQuote}
 */
function mapQuote(quote, symbolName) {
    return {
        symbol: quote['01. symbol'],
        price: Number(quote['05. price']).toFixed(2),
        change: Number(quote['09. change']).toFixed(2),
        changePercent: Number(quote['10. change percent'].replace('%', '')).toFixed(2),
        lastUpdate: quote['07. latest trading day']
    }
}