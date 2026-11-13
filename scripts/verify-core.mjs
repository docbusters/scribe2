// Checks the built entries of the package. It runs at the end of `build:wc`, so a package whose entries do not behave as documented can
// not be packed or published:
//   - `dist/core.js` is imported as a host's Node unit test would: a clean Node process, no DOM and no mocks, and it has no import effects
//   - `dist/scribe.js` is the only file that defines custom elements, and it defines all five of them
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const distDir = fileURLToPath(new URL('../dist/', import.meta.url));
const DOM_GLOBALS = ['document', 'window', 'HTMLElement', 'customElements'];
const TAGS = ['scribe-interpreter', 'scribe-component-renderer', 'scribe-component-slot', 'scribe-empty-content', 'scribe-bindings-panel'];

// 1. core, in a Node process with nothing the DOM provides, or the import would prove nothing
for (const name of DOM_GLOBALS) {
	assert.equal(typeof globalThis[name], 'undefined', `${name} exists in this Node process`);
}

const core = await import(pathToFileURL(join(distDir, 'core.js')).href);

assert.ok(core.defaultRegistry && Object.keys(core.defaultRegistry).length > 0, 'defaultRegistry is empty');
assert.equal(typeof core.getDefaultRegistry, 'function');
assert.equal(typeof core.createColorOption, 'function');
assert.equal(typeof core.getI18n, 'function');

// Importing core must not have defined any DOM global either (it would be an effect, even if it were guarded)
for (const name of DOM_GLOBALS) {
	assert.equal(typeof globalThis[name], 'undefined', `importing core defined ${name}`);
}

// 2. No chunk may define a custom element: `sideEffects` lists only dist/scribe.js, so a bundler could drop a definition in a chunk
const defines = [];
const walk = (dir) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) walk(path);
		else if (entry.name.endsWith('.js') && readFileSync(path, 'utf8').includes('customElements.define')) defines.push(entry.name);
	}
};
walk(distDir);
assert.deepEqual(defines, ['scribe.js'], `customElements.define is in: ${defines.join(', ') || 'no file'}`);

// 3. The main entry, with the two globals it needs stubbed, defines every tag. A bundler that takes a wrapper for pure drops its definition
// without any error, so the tags that were really defined are compared one by one
// It runs in its own process, with the stubs set before anything is imported: the Svelte runtime in the shared chunk takes `HTMLElement`
// when it is evaluated, and the process above evaluated it without one
const probe = `
	const defined = new Map();
	globalThis.HTMLElement = class HTMLElement {};
	globalThis.customElements = { define: (tag, constructor) => defined.set(tag, constructor), get: (tag) => defined.get(tag) };
	const entry = await import(${JSON.stringify(pathToFileURL(join(distDir, 'scribe.js')).href)});
	console.log(JSON.stringify({ tags: [...defined.keys()], scribeIsInterpreter: entry.Scribe === defined.get('scribe-interpreter') }));
`;
const result = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', probe], { encoding: 'utf8' }));

assert.deepEqual(result.tags.sort(), [...TAGS].sort(), 'dist/scribe.js does not define exactly the five elements');
assert.ok(result.scribeIsInterpreter, 'Scribe is not the class of <scribe-interpreter>');

console.log(`verify ok: core loads in Node (${Object.keys(core.defaultRegistry).length} default components), scribe.js defines ${result.tags.length} elements and only it does`);
