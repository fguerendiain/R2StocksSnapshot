export function renderSparkline(values, options = {}) {
    const {
        width = 120,
        height = 30,
        stroke = 'currentColor',
        strokeWidth = 2
    } = options;

    if (!values || values.length < 2) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return `
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            aria-hidden="true"
            focusable="false"
        >
            <polyline
                fill="none"
                stroke="${stroke}"
                stroke-width="${strokeWidth}"
                points="${points}"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    `;
}