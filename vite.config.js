import { defineConfig } from "vite"

export default defineConfig({
    publicDir: false,
    build: {
        lib: {
            entry: 'src/index.js',
            name: 'StocksSnapshot',
            fileName: () => 'stocks.bundle.js',
            formats: ['umd'],
        },
    },
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            all: true,
            reporter: ['text', 'html'],
            reportsDirectory: './coverage',
            include: ['src/**/*.js'],
            exclude: [
                '**/*.test.*',
                '**/node_modules/**',
                '**/dist/**',
                '**/server/**',
                '**/public/**',
                'src/types/**',
                'src/ui/**',
                'src/observability/**'
            ],
        },
    }
});

