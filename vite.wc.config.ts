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
		{
			name: 'patch-sortablejs',
			transform(code, id) {
				if (id.includes('sortablejs')) {
					return {
						code: code.replace(
							'var elemCSS = css(elem);',
							'var elemCSS = css(elem) || {};'
						),
						map: null
					};
				}
				return null;
			}
		},
		svelte({
			compilerOptions: {
				css: 'injected'
			},
			// Only the wrappers of `src/lib/elements` are compiled as custom elements: defining one is an effect of importing its module,
			// so they must be the only modules with that effect, and only the main entry imports them
			dynamicCompileOptions({ filename }) {
				if (filename.replace(/\\/g, '/').includes('/src/lib/elements/')) {
					return {
						customElement: true
					};
				}
			}
		})
	],
	build: {
		cssCodeSplit: false,
		lib: {
			// Two entries: `scribe` registers the custom elements, `core` has no import effects (see package.json `exports`).
			// They share chunks (stores, registry, Svelte runtime), so the page-wide singletons exist once even if a host loads both
			entry: {
				scribe: 'src/lib/scribe.ts',
				core: 'src/lib/core.ts'
			},
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`
		},
		rollupOptions: {
			output: {
				chunkFileNames: 'chunks/[name]-[hash].js'
			}
		},
		outDir: 'dist',
		emptyOutDir: true
	}
});
