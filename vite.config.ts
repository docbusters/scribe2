import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
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
		tailwindcss(),
		sveltekit()
	],
	server: {
		// /examples/full-webcomponent-edit loads dist/, and its lazy chunks (QR code, charts) are separate files since the build is split in chunks
		fs: { allow: ['dist'] }
	}
});
