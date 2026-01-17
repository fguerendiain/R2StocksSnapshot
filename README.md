# 📊 Stocks Snapshot Widget

A **lightweight, embeddable stock quote widget** built with **Web Components** and **vanilla JavaScript**.  
Framework-agnostic, fully isolated via **Shadow DOM**, and explicitly themeable by the host application.

Designed to be dropped into any site with minimal setup while remaining production-ready.

---

## ✨ Key Features

- 📦 Single JS bundle embed
- 🧩 Web Components (Custom Elements + Shadow DOM)
- 🎨 Explicit theming via CSS Variables or JavaScript
- 📈 Real-time stock data (Alpha Vantage)
- 🔁 Auto-refresh (default: 60s)
- 📊 Optional sparkline (7d or 24h)
- ⚡ Performance-focused (lazy loading, requestIdleCallback)
- 🔍 Lightweight observability (OpenTelemetry concepts)
- 🧪 Unit tested, framework-independent

---

## 🚀 Embedding the Widget

### 1. Include the bundle

```html
<script async src="stocks.bundle.js"></script>
```

### 2. Add a container

```html
<div id="stocks-widget"></div>
```

### 3. Initialize

```html
<script>
  StocksSnapshot.init({
    containerId: 'stocks-widget',
    symbol: 'AAPL',
    apiKey: 'YOUR_API_KEY'
  });
</script>
```

`init()` returns a Promise that resolves on first paint and rejects on fatal errors.

---

## ⚙️ Configuration

```ts
StocksSnapshot.init({
  containerId: string;       // required
  symbol?: string;           // default: MSFT
  apiKey: string;            // required
  refreshInterval?: number;  // ms (default: 60000)
  sparkline?: 'week' | 'hourly' | false;
  fontUrl?: string;
  theme?: ThemeConfig;
});
```

---

## 🎨 Theming & Styling

The widget **never reads host styles implicitly**.  
All styling is **explicit**, predictable, and isolated.

### Supported CSS Variables

```css
--stocks-bg-color
--stocks-text-color
--stocks-primary-color
--stocks-up-color
--stocks-down-color
--stocks-font-family
```

All variables have safe defaults.

---

### Styling Option 1 — CSS Only

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

---

### Styling Option 2 — JavaScript Theme (recommended)

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

Theme keys are mapped internally to `--stocks-*` CSS variables.

---

## 🌗 Light / Dark Mode

The widget does **not** manage light/dark mode internally.  
Theme changes are fully controlled by the host application.

This keeps the widget:
- Decoupled
- Predictable
- Easy to integrate into existing design systems

---

## 🔗 Interactivity

The widget emits a composed `CustomEvent` (`quoteClick`) when the quote is clicked:

```js
widget.addEventListener('quoteClick', (e) => {
  console.log(e.detail.symbol, e.detail.url);
});
```

Navigation and side effects remain a host responsibility.

---

## 📈 Sparkline

Optional sparkline visualizing recent price movement.

```js
sparkline: 'week'   // last 7 daily closes (free API)
sparkline: 'hourly' // last 24h intraday (premium API)
```

The sparkline is rendered once and does not re-render on every refresh.

---

## 📊 Observability

The widget includes **lightweight observability** based on **OpenTelemetry concepts**.

### Tracing
- `stocks.fetch`
- `widget.render`

Spans are created only if a compatible tracer exists.
Otherwise, observability is a **no-op** (no errors, no overhead).

### Metrics
- Widget load time
- API error count

---

## ⚡ Performance Notes

- Shadow DOM for isolation
- Lazy-loaded sparkline rendering
- `requestIdleCallback` for non-critical work
- Minimal runtime dependencies
- Designed to stay under **50 KB gzipped** (core features)

---

### Testing & Coverage

Unit tests focus on public contracts, lifecycle behavior, and business logic.
Rendering-only code, type definitions, and passive observability hooks are intentionally excluded to avoid artificial coverage.

```bash
npm test
```

---

## 🖥️ Server-Side Rendering (Optional)

A minimal Express server demonstrates how the widget can be pre-rendered for:
- Faster first paint
- Improved perceived performance

SSR is optional; the widget works fully client-side.

---

## 🐳 Docker

Multi-stage Docker setup:
- Build stage: `node:alpine` (build & bundle)
- Runtime stage: `nginx:alpine` (serve static assets)

### Run with Docker Compose

A `docker-compose.yml` is included to simplify local development and demos.

```bash
docker-compose up --build
```
**Use cases:**

- Serve the static widget bundle
- Run the optional SSR server

Docker Compose is optional and intended for reproducible local environments.

---

## 🧪 Demo Pages

The `/public` directory contains two standalone HTML files that demonstrate
different usage scenarios of the widget.

### `financeBlogDemo.html`

This page simulates a financial news website layout where the widget is embedded
inside a sidebar.

It demonstrates:
- Embedding the widget in a real-world layout
- Theme integration (light / dark mode)
- Responsive behavior inside a constrained container
- How the widget adapts to layout changes using container-based responsiveness

This demo represents a realistic production use case.

---

### `onlyWidgetDemo.html`

This page renders only the widget in isolation.

It is useful for:
- Local development
- Visual testing
- Debugging widget behavior
- Performance and network throttling tests

This demo focuses exclusively on the widget without external layout influences.

---

## 📎 Notes

Built as part of the **R2 Frontend Architect & Developer Challenge**, with focus on:
- Embedding experience
- Isolation & theming
- Performance
- Observability
- Developer ergonomics
