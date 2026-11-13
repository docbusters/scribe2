import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The file is published as source and compiled by the host with its own Svelte. If it imported anything of Scribe,
// the host would need the bundle (and its own copy of the Svelte runtime) to compile it
describe('mount.svelte.js (published as source)', () => {
	it('imports only svelte', () => {
		// Without comments, as the JSDoc types use import('...') and are erased
		const source = readFileSync(new URL('./mount.svelte.js', import.meta.url), 'utf8')
			.replace(/\/\*[\s\S]*?\*\//g, '')
			.replace(/^\s*\/\/.*$/gm, '');
		const specifiers = [...source.matchAll(/^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((match) => match[1]);

		expect(specifiers).toEqual(['svelte']);
		// A dynamic import or a require would get around the check above
		expect(source).not.toMatch(/\bimport\s*\(|\brequire\s*\(/);
	});
});
