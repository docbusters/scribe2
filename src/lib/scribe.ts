// The JavaScript entry of `@antonii22/scribe2` (the build entry `scribe`, see vite.wc.config.ts): importing it registers the custom elements,
// which needs a DOM. It is excluded from the types build (tsconfig.types.json): its types are in `index.ts`
import type { ScribeConstructor } from './core.js';
import ScribeElement from './elements/ScribeElement.svelte';
import ComponentRendererElement from './elements/ComponentRendererElement.svelte';
import ComponentSlotElement from './elements/ComponentSlotElement.svelte';
import EmptyContentElement from './elements/EmptyContentElement.svelte';
import BindingsPanelElement from './elements/BindingsPanelElement.svelte';

/** Svelte leaves the class of a custom element in the `element` property of the component, when the module of the component is evaluated */
const elementOf = (wrapper: unknown) => (wrapper as { element: CustomElementConstructor }).element;

// Every tag is defined here, so the registration is visible in one place (and used, so a bundler that takes the wrappers for pure keeps them).
// A tag that is already defined, by another copy of the library, is left as it is: `define` would throw
const ELEMENTS: [string, unknown][] = [
	['scribe-interpreter', ScribeElement],
	['scribe-component-renderer', ComponentRendererElement],
	['scribe-component-slot', ComponentSlotElement],
	['scribe-empty-content', EmptyContentElement],
	['scribe-bindings-panel', BindingsPanelElement]
];

for (const [tag, wrapper] of ELEMENTS) {
	if (!customElements.get(tag)) {
		customElements.define(tag, elementOf(wrapper));
	}
}

/** The class of `<scribe-interpreter>` */
export const Scribe = elementOf(ScribeElement) as unknown as ScribeConstructor;
