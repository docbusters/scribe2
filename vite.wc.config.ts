import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/lib')
		}
	},
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
