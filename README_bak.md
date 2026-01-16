# 📊 Stocks Snapshot Widget

A lightweight, embeddable stock price widget built with **Web Components**.  
Framework-agnostic, fully isolated via **Shadow DOM**, and explicitly themeable by the host application.

---

## ✨ Features

- Single JS bundle embed
- Shadow DOM style isolation
- Built-in default theme (zero configuration)
- Explicit theming via CSS variables or JavaScript
- Optional sparkline visualization
- Dynamic light / dark mode support (host-controlled)
- Optional Server-Side Rendering (SSR) example
- No dependency on host frameworks or styles

---

## 📦 Embedding the Widget

### 1. Include the bundle

```html
<script src="stocks.bundle.js"></script>
```

---

### 2. Add a container element

```html
<div id="stocks-widget"></div>
```

---

### 3. Initialize the widget

```html
<script>
  StocksSnapshot.init({
    containerId: 'stocks-widget',
    symbol: 'AAPL',
    apiKey: 'YOUR_API_KEY'
  });
</script>
```

The widget will render using its default styles if no theme is provided.

---

## ⚙️ Configuration

```ts
StocksSnapshot.init({
  containerId: string;      // required
  symbol: string;           // required
  apiKey: string;           // required
  refreshInterval?: number; // polling interval (ms)
  fontUrl?: string;         // optional font stylesheet URL
  theme?: ThemeConfig;      // optional theme override
});
```

---

## 🎨 Theming & Styling

The widget **does not read host styles automatically**.  
All customization must be **explicitly provided**.

### Supported CSS variables (theming contract)

```css
--stocks-bg-color
--stocks-text-color
--stocks-primary-color
--stocks-font-family
```

All variables have safe default values.

---

## 🧩 Styling Option 1 — HTML (CSS-only)

You can customize the widget directly in HTML using inline CSS variables:

```html
<div
  id="stocks-widget"
  style="
    --stocks-bg-color: #0f172a;
    --stocks-text-color: #e5e7eb;
    --stocks-primary-color: #38bdf8;
    --stocks-font-family: Inter, sans-serif;
  "
></div>
```

No JavaScript changes are required.

---

## 🧩 Styling Option 2 — JavaScript Theme (recommended)

You can pass a theme object when initializing the widget:

```js
StocksSnapshot.init({
  containerId: 'stocks-widget',
  symbol: 'AAPL',
  apiKey: 'YOUR_API_KEY',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  theme: {
    'bg-color': '#ffffff',
    'text-color': '#111111',
    'primary-color': '#0066ff',
    'font-family': 'Inter, sans-serif'
  }
});
```

Theme keys are internally mapped to `--stocks-*` CSS variables.

---

## 🌗 Light / Dark Mode (Dynamic)

The widget **does not implement light or dark mode internally**.  
The host application controls the theme and updates the widget explicitly.

---

### Example: Host-controlled Light / Dark Mode

#### 1. Define widget themes

```js
const widgetLightTheme = {
  'bg-color': '#ffffff',
  'text-color': '#111111',
  'primary-color': '#111111',
  'font-family': 'Inter, sans-serif'
};

const widgetDarkTheme = {
  'bg-color': '#0f172a',
  'text-color': '#e5e7eb',
  'primary-color': '#e5e7eb',
  'font-family': 'Inter, sans-serif'
};
```

---

#### 2. Helper to apply a theme

```js
function applyWidgetTheme(theme) {
  const widget = document.querySelector('stocks-snapshot');
  if (!widget) return;

  Object.entries(theme).forEach(([key, value]) => {
    widget.style.setProperty(`--stocks-${key}`, value);
  });
}
```

---

#### 3. Initialize with the default theme

```js
StocksSnapshot.init({
  containerId: 'stocks-widget',
  symbol: 'AAPL',
  apiKey: 'YOUR_API_KEY',
  fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap',
  theme: widgetLightTheme
});
```

---

#### 4. Toggle light / dark mode

```js
toggleButton.addEventListener('click', () => {
  const isDark = document.body.dataset.theme === 'dark';

  document.body.dataset.theme = isDark ? 'light' : 'dark';
  applyWidgetTheme(isDark ? widgetLightTheme : widgetDarkTheme);
});
```

---

### 🔗 Quote Click Interactivity

The widget emits a composed `CustomEvent` (`quoteClick`) when a quote is clicked, exposing the symbol and full quote URL retrieved from the API.  
Navigation and side effects are handled by the host application, keeping the widget decoupled, reusable, and framework-agnostic.

---


## 📈 Sparkline Behavior

The sparkline is initialized once and visualizes recent price movement based on the selected mode.

By default, the sparkline displays the **last 7 daily closing prices** and is not updated on subsequent live price refreshes.

The behavior can be configured using the `sparkline` option during initialization:

```js
StocksSnapshot.init({
  containerId: 'stocks-widget',
  symbol: 'AAPL',
  apiKey: 'YOUR_API_KEY',
  sparkline: 'week' // or 'hourly'
});
```

### Sparkline modes

- **sparkline: 'week'**
Uses daily historical data to render the last 7 closing prices.
This mode works with free Alpha Vantage API keys.

- **sparkline: 'hourly'**
Uses intraday hourly data to render the last 24 hours of price movement.
This mode requires a premium Alpha Vantage API key, as intraday historical
endpoints are not available in the free plan.

If the sparkline option is omitted or set to false, the sparkline will not be rendered.

---

## 🖥️ Server-Side Rendering (SSR)

The `/server` directory contains a minimal **Express** server that demonstrates how
the widget can be server-rendered for faster first paint.

The SSR setup:
- renders a lightweight HTML skeleton on the server
- improves perceived performance
- allows content to be visible before JavaScript execution

Using the server is **optional** and **not required** to embed or use the widget.
The widget works fully in client-side environments as well.

---

## 🐳 Docker

The widget can be consumed as a static bundle or rendered via an optional Node/Express SSR service for improved SEO and first paint.  
A multi-stage Docker setup is provided, along with a docker-compose configuration to run both static and SSR modes independently.

---

## 📊 Observability

The widget includes **lightweight observability** based on **OpenTelemetry concepts**.
It is designed to work **with or without** a telemetry backend, without adding runtime dependencies.

### 🔍 Tracing
Key execution paths (e.g. rendering) are wrapped in spans:

```js
const span = tracer.startSpan('widget.render');
// render logic
span.end();
```

If an OpenTelemetry-compatible tracer exists, spans can be collected automatically.
If not, tracing is **non-intrusive**:
- No errors
- No performance impact
- Normal widget behavior

### 📈 Metrics
Basic metrics (e.g. histograms) measure performance such as:
- API response times
- Rendering duration

### 🛡️ Error Observability
- API errors are surfaced in the UI
- Telemetry hooks can record error events
- Missing telemetry never breaks the widget

---

## 🧠 Design Principles

- The widget never reads host styles implicitly
- The host always provides explicit values
- Styling is done via a small, stable CSS variable contract
- Light / dark mode is a host concern
- Sparkline behavior adapts to API capabilities
- Defaults ensure zero-config usability

---

## ✅ Summary

- Works out of the box with sensible defaults
- Fully customizable when needed
- Safe to embed in any site
- No CSS leakage
- No framework lock-in
- Clear separation of responsibilities

---

## ✅ Demo html files on /public

 - **financeBlogDemo.html** dummy page showcasing theming, sparkline, auto‑refresh 
 - **onlyWidgetDemo.html** sandalone implementation widget only

---

## ✅ Api Keys for Alpha Vantage

 - V43D5Q7XYZT9B094
 - O5GMYY8SBQ83A8J4