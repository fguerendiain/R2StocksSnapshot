import styles from './StocksSnapshot.css?inline';
import { trace } from '@opentelemetry/api';
import { fetchStockHourlyHistory, fetchStockDayHistory, fetchStockQuote } from "../services/marketApi";
import { fetchStockOverview } from '../services/marketApi.js';

const tracer = trace.getTracer('r2-stocks-widget');
const ALPHAVANTAGE_DELAY_MS = 2000;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class StocksSnapshot extends HTMLElement {

    constructor() {
        super();
        this.config = null;
        this.intervalId = null;
        this.prices = [];
        this.maxPoints = 20;
        this.fetchRequest = {};
    }


    connectedCallback() {
        if (!this.config) {
            throw new Error('StocksSnapshot: config is required');
        }

        this.fetchRequest = {
            symbol: this.config.symbol,
            apiKey: this.config.apiKey
        };

        this.attachShadow({ mode: 'open' });
        this.loadFont();
        this.applyTheme();

        this.renderShell();

        this.initializeData()

        this.intervalId = setInterval(
            () => this.getData(),
            this.config.refreshInterval
        )
    }

    disconnectedCallback() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    handleClick() {
        this.dispatchEvent(
            new CustomEvent('quoteClick', {
                detail: {
                    symbol: this.fetchRequest.symbol,
                    url: this.fetchRequest.companyUrl
                },
                bubbles: true,
                composed: true
            })
        );
    }



    async initializeData() {
        await this.getCompanyName();
        await delay(ALPHAVANTAGE_DELAY_MS);
        await this.getData();
        await delay(ALPHAVANTAGE_DELAY_MS);
        await this.getSparkline();
    }

    async getData() {
        try {
            const data = await fetchStockQuote(this.fetchRequest);
            this.renderData(data);
        } catch (err) {
            this.renderError(err.message)
        }
    }

    async getCompanyName() {
        try {
            const data = await fetchStockOverview(this.fetchRequest);
            this.fetchRequest.companyUrl = data.url
            this.renderCompanyName(data.name);
        } catch (err) {
            this.renderError(err.message)
        }
    }

    async getSparkline() {
        if (!this.config.sparkline) return;
        try {
            const history =
                this.config.sparkline === 'week'
                    ? await fetchStockDayHistory(this.fetchRequest)
                    : await fetchStockHourlyHistory(this.fetchRequest);
            this.prices = history;
            this.scheduleSparklineRender();
        } catch { }
    }

    loadFont() {
        if (!this.config.fontUrl) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = this.config.fontUrl;
        this.shadowRoot.appendChild(link);
    }

    applyTheme() {
        if (!this.config.theme) return;

        Object.entries(this.config.theme).forEach(([key, value]) => {
            this.style.setProperty(`--stocks-${key}`, value);
        });
    }


    renderShell() {
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="widget">
                <div class="widgetLeft">
                    <div class="widgetCompany">
                        <div class="companyName"></div>
                        <div class="symbol"></div>
                    </div>
                    <div class="widgetPrice">
                        <div class="price loading">
                            <div class="spinner"></div>
                            <div class="error"></div>
                        </div>
                        <div class="change loading"></div>
                    </div>
                    <div class="timestamp"></div>
                </div>
                <div class="sparkline"></div>
            </div>
  `;
    }

    renderError(message) {
        const container = this.shadowRoot.querySelector('.spinner');
        this.shadowRoot.querySelector('.error').textContent = `Error: ${message}`;
        container.classList.add('has-error');
    }

    renderCompanyName(name) {
        this.shadowRoot.querySelector('.companyName').textContent = name;
        this.shadowRoot.querySelector('.symbol').addEventListener('click', this.handleClick.bind(this));
    }

    /**
     * @param {MarketQuote}
    */
    renderData({ symbol, price, change, changePercent, lastUpdate }) {
        const span = tracer.startSpan('widget.render')

        this.shadowRoot.querySelector('.symbol').textContent = `(${symbol})`;

        this.shadowRoot.querySelector('.price').textContent = `$${price}`;

        const changeEl = this.shadowRoot.querySelector('.change');
        changeEl.textContent = `$${change} (${changePercent}%)`;
        changeEl.className = `change ${change >= 0 ? 'up' : 'down'}`;

        this.shadowRoot.querySelector('.timestamp').textContent =
            `Last update: ${this.formatDateDDMMYYYY(lastUpdate)}`;

        span.end();
    }

    scheduleSparklineRender() {
        if (!this.config.sparkline) return;
        if (this.prices.length < 2) return;
        if (!('requestIdleCallback' in window)) {
            this.renderSparkline();
            return;
        }
        requestIdleCallback(() => {
            this.renderSparkline();
        });
    }

    async renderSparkline() {
        if (this.sparklineRendered) return;

        const container = this.shadowRoot.querySelector('.sparkline');
        if (!container) return;

        const { renderSparkline } = await import('../ui/sparkline.js');

        container.innerHTML = renderSparkline(this.prices, {
            stroke:
                this.prices[this.prices.length - 1] >= this.prices[0]
                    ? 'var(--stocks-up-color)'
                    : 'var(--stocks-down-color)'
        });
        container.classList.add('has-data');
        this.sparklineRendered = true;
    }

    formatDateDDMMYYYY(dateString) {
        const date = new Date(dateString);
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();

        return `${dd}-${mm}-${yyyy}`;
    }

}