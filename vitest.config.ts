import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts on purpose: the tests cover pure code, so they do not need Tailwind or SvelteKit
export default defineConfig({
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
