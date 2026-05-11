import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			compilerOptions: {
				customElement: true 
			}
		})
	],
	build: {
		cssCodeSplit: false,
		lib: {
			entry: 'src/lib/index.ts',
			name: 'Scribe',
			fileName: 'scribe',
			formats: ['es']
		},
		rollupOptions: {
			output: {
				codeSplitting: false,
			},
		},
		outDir: 'dist',
		emptyOutDir: true
	}
});
