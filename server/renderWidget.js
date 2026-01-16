export async function renderWidget({ symbol, fontFamily }) {
    return `
    <style>
      .widget {
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border-width: 2px;
        border: 3px solid
          color-mix(in srgb, #0066ff 30%, transparent);
        border-top-color: #0066ff;
        animation: spin 1.2s linear infinite;
        margin: 8px 0;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
    </style>

    <div class="widget">
      <div class="spinner"></div>
    </div>
  `;
}