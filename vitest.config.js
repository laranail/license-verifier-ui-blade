import { defineConfig } from 'vitest/config';

export default defineConfig({
    // Each test builds an isolated JSDOM window and evals the shipped script, so
    // the Node environment is enough here.
    test: {
        environment: 'node',
        globals: true,
        include: ['tests/js/**/*.test.js'],
    },
});
