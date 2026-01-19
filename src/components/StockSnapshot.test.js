import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import { StocksSnapshot } from "./StocksSnapshot";

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────
vi.mock("../services/marketApi", () => ({
  fetchStockQuote: vi.fn(),
  fetchStockOverview: vi.fn(),
  fetchStockDayHistory: vi.fn(),
  fetchStockHourlyHistory: vi.fn(),
}));

vi.mock("../ui/sparkline.js", () => ({
  renderSparkline: vi.fn(() => "<svg></svg>"),
}));

vi.mock("@opentelemetry/api", () => ({
  trace: {
    getTracer: () => ({
      startSpan: () => ({ end: vi.fn() }),
    }),
  },
}));

import {
  fetchStockQuote,
  fetchStockOverview,
  fetchStockDayHistory,
} from "../services/marketApi";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const baseConfig = {
  symbol: "AAPL",
  apiKey: "test-key",
  refreshInterval: 1000,
  sparkline: "week",
  theme: { primary: "red" },
};

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────
describe("StocksSnapshot", () => {
  beforeAll(() => {
    if (!customElements.get("stocks-snapshot")) {
      customElements.define("stocks-snapshot", StocksSnapshot);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";

    vi.spyOn(StocksSnapshot.prototype, "initializeData").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders shell on connectedCallback", () => {
    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    expect(el.shadowRoot).toBeTruthy();
    expect(el.shadowRoot.querySelector(".widget")).toBeTruthy();
  });

  it("applies theme variables", () => {
    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    expect(el.style.getPropertyValue("--stocks-primary")).toBe("red");
  });

  it("renders company name and binds click", async () => {
    fetchStockOverview.mockResolvedValue({
      name: "Apple Inc",
      url: "https://apple.com",
    });

    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    await el.getCompanyName();

    const name = el.shadowRoot.querySelector(".companyName");
    const symbol = el.shadowRoot.querySelector(".symbol");

    expect(name.textContent).toBe("Apple Inc");

    const clickSpy = vi.fn();
    el.addEventListener("quoteClick", clickSpy);

    symbol.click();

    expect(clickSpy).toHaveBeenCalled();
    expect(clickSpy.mock.calls[0][0].detail.symbol).toBe("AAPL");
  });

  it("renders quote data", async () => {
    fetchStockQuote.mockResolvedValue({
      symbol: "AAPL",
      price: 150,
      change: 2,
      changePercent: 1.2,
      lastUpdate: "2024-01-10",
    });

    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    await el.getData();

    expect(el.shadowRoot.querySelector(".price").textContent).toBe("$150");
    expect(
      el.shadowRoot.querySelector(".change").classList.contains("up"),
    ).toBe(true);
  });

  it("renders error message on API failure", async () => {
    fetchStockQuote.mockRejectedValue(new Error("API error"));

    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    await el.getData();

    expect(el.shadowRoot.querySelector(".error").textContent).toContain(
      "API error",
    );
  });

  it("renders sparkline when data is available", async () => {
    fetchStockDayHistory.mockResolvedValue([10, 12, 11, 14]);

    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    await el.getSparkline();
    await el.renderSparkline();

    const sparkline = el.shadowRoot.querySelector(".sparkline");
    expect(sparkline.innerHTML).toContain("<svg");
    expect(sparkline.classList.contains("has-data")).toBe(true);
  });

  it("clears interval on disconnectedCallback", () => {
    const el = document.createElement("stocks-snapshot");
    el.setConfig(baseConfig);
    document.body.appendChild(el);

    const spy = vi.spyOn(global, "clearInterval");
    el.disconnectedCallback();

    expect(spy).toHaveBeenCalled();
  });
});
