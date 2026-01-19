import { describe, it, expect, vi, beforeEach } from "vitest";
import { init } from "./init";

// --------------------
// Mocks
// --------------------
vi.mock("./config", () => ({
  parseConfig: vi.fn(),
}));

vi.mock("../observability/telemetry", () => ({
  recordLoadTime: vi.fn(),
}));

// --------------------
// Setup
// --------------------
beforeEach(() => {
  document.body.innerHTML = "";
  global.requestAnimationFrame = (cb) => cb();
});

// --------------------
// Tests
// --------------------
describe("init", () => {
  it("renders the widget and records load time", async () => {
    const { parseConfig } = await import("./config");
    const { recordLoadTime } = await import("../observability/telemetry");

    parseConfig.mockReturnValue({
      containerId: "app",
      symbol: "AAPL",
      apiKey: "key",
      refreshInterval: 1000,
    });

    const defineSpy = vi.spyOn(customElements, "define");
    vi.spyOn(customElements, "get").mockReturnValue(undefined);

    const container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    await init({});

    expect(container.querySelector("stocks-snapshot")).toBeTruthy();
    expect(recordLoadTime).toHaveBeenCalled();
    expect(recordLoadTime.mock.calls[0][0]).toBeGreaterThan(0);

    defineSpy.mockRestore();
  });

  it("rejects if container is not found", async () => {
    const { parseConfig } = await import("./config");
    parseConfig.mockReturnValue({ containerId: "missing" });

    await expect(init({})).rejects.toThrow(
      "Container #missing not found"
    );
  });

  it("does not redefine custom element if already registered", async () => {
    const { parseConfig } = await import("./config");

    parseConfig.mockReturnValue({
      containerId: "app",
      symbol: "AAPL",
      apiKey: "key",
      refreshInterval: 1000,
    });

    document.body.innerHTML = '<div id="app"></div>';

    vi.spyOn(customElements, "get").mockReturnValue(true);
    const defineSpy = vi.spyOn(customElements, "define");

    await init({});

    expect(defineSpy).not.toHaveBeenCalled();
  });

  it("propagates CSS custom properties from container to widget", async () => {
    const { parseConfig } = await import("./config");

    parseConfig.mockReturnValue({
      containerId: "app",
      symbol: "AAPL",
      apiKey: "key",
      refreshInterval: 1000,
    });

    const container = document.createElement("div");
    container.id = "app";
    container.style.setProperty("--stocks-bg-color", "red");
    document.body.appendChild(container);

    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (n) =>
        n === "--stocks-bg-color" ? "red" : "",
    });

    vi.spyOn(customElements, "get").mockReturnValue(true);

    await init({});

    const widget = container.querySelector("stocks-snapshot");
    expect(
      widget.style.getPropertyValue("--stocks-bg-color")
    ).toBe("red");
  });
});
