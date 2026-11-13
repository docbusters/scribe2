# Scribe Web Component

> [!NOTE]  
> It is neccessary to define an env variable named `GITHUB_TOKEN` to publish the package

## Development

> **Note:** Read [Important considerations](#important-considerations) before starting development.

For developing this library execute the following commands:

```bash
npm i
npm run dev
```

Unit tests (vitest) run with `npm test`.

This will deploy a Sveltekit SPA that shows some examples making it easy to develop the library!

## Building the library

Building the library requires generating the web component + types + styles. This can be achieved by executing the folling command:

```bash
npm run build:wc
```

This command uses `vite.wc.config.ts` to generate the two JavaScript entries (`dist/scribe.js`, which registers the custom elements, and `dist/core.js`, which has no import effects) with the chunks they share in `dist/chunks`, and `tsconfig.types.json` to generate the corresponding types. It also copies the styles `scribe.css` and the source of `@antonii22/scribe2/svelte` into the `dist` folder, and finishes with `scripts/verify-core.mjs`, which imports `core` in a clean Node process, checks that `scribe.js` is the only file that defines the five elements, and fails the build otherwise (`npm run verify:core` runs it alone).

## Testing the library locally in other package

In order to test the library in other package via npm, a tgz file can be generated and installed directly:

```bash
npm pack
```

The previous command already builds the lib and prepares it to be installed via npm. Now simply place the file in the new project and install it:

```bash
npm i ../scribe2-0.0.1.tgz
```

Make sure it is intalled correctly in `package.json`

```json
...
"dependencies": {
    "scribe2": "../scribe2-0.0.1.tgz",
    ...
}
...
```

## Using the package

The package has three entries:

| Import | What it is |
| --- | --- |
| `@antonii22/scribe2` | Registers the custom elements (`<scribe-interpreter>`, `<scribe-component-slot>`, `<scribe-component-renderer>`, `<scribe-empty-content>` and `<scribe-bindings-panel>`). It needs a DOM. |
| `@antonii22/scribe2/core` | Everything else, with **no effect when imported**: the types, `getDefaultRegistry` and `defaultRegistry`, `createColorOption`, the i18n (`en`, `es`, `getI18n`...) and the focus helpers. It can be imported in a Node unit test, with no DOM and no mock. |
| `@antonii22/scribe2/svelte` | `createSvelte5Mount` and `createSvelteItemRenderer`, published as source (see below). |

The app imports the main entry once, and the styles, which are a separate file:

```js
import '@antonii22/scribe2';
import '@antonii22/scribe2/scribe.css';
```

Both are imports for their side effects, so a host that takes nothing by name from the package still gets the elements. The package declares this in `sideEffects` (`**/*.css` and `./dist/scribe.js`), so a production build (Vite, Rollup, webpack) keeps the import instead of dropping it as unused.

Everything else is imported from `/core`, so a module of the host that only builds a registry or reads a type is safe to import in a test:

```ts
import { defaultRegistry, type Document } from '@antonii22/scribe2/core';

export const registry = { ...defaultRegistry, callout: myCallout };
```

```js
// registry.test.js, run by Vitest in its default Node environment
import { registry } from './registry.js';

it('registers the callout', () => expect(Object.keys(registry)).toContain('callout'));
```

The main entry does not re-export the values of `core` (only their types), so importing a value from it by mistake brings the DOM requirement back into the test, and fails there with `Class extends value undefined`. The package is ESM only.

`/core` has no effect when imported, but it is not smaller for that: the library is one module underneath, so a bundle that imports only `en` from `/core` is about as large as one that imports the registry. Use the main entry or `/core` for what they do, not to save bytes.

## Events

Scribe tells the host about changes with two DOM events on the element, which bubble and are composed. In the Svelte component the same events arrive in the `ondocumentchange` and `onbindingchange` props.

### `documentchange`

Fired each time the document changes in edit mode (not for the initial document). Its detail is a `DocumentChangeDetail`:

```ts
el.addEventListener('documentchange', (event) => {
	const { document, customBindingUsages } = event.detail;
	// document: the document after the change, as a plain snapshot
	// customBindingUsages: binding type → binding id → Set of the ids of the components that use it
});
```

`customBindingUsages` is the same `CustomBindingUsages` that `el.getCustomBindingUsages()` returns, but it belongs to exactly the document of the event, so the host does not need the element. It covers custom bindings only, and it holds `Set`s, which `JSON.stringify` writes as `{}`: save `document`, not the whole detail. The event is not fired for the initial document, so call `getCustomBindingUsages()` once for the starting state.

### `bindingchange`

Fired when a variable of the document is created, updated or deleted, and when the value of a custom binding changes. Its detail is a `BindingChangeEventDetail`, discriminated by `type`: `binding_create`, `binding_update` and `binding_delete` carry the variable `id` (and its `definition`, except for the delete), and `value_update` carries `bindingType`, `id` and the new `value`. Both `binding_update` and `value_update` have an `updateType` (`onchange` while typing, `onblur` when done).

## Examples

- [**Simple plain html example**](/test/simple-webcomponent-test.html): Shows the library usage with a basic example.

- [**Simple JSON html example**](/test/simple-webcomponent-test-json.html): Shows the library usage using an external JSON to declare the document schema.

- [**Simple html with styles example**](/test/simple-webcomponent-test-styles.html): Shows the library usage with custom styles

- [**Simple html in edit mode**](/test/simple-webcomponent-test-edit.html): Shows the library usage in edit mode

## Slots: editable areas inside a component

A **slot** is an area inside a component that works like a section: the user types text in it, inserts any registered component with Add or <kbd>Ctrl</kbd>+<kbd>Space</kbd>, and moves through it with the arrow keys, leaving it into the next text or cell. The cells of the default table are slots. The custom element `<scribe-component-slot>` draws one, so a custom component (a card, a two-column layout, a callout...) gets all of that without handling any of it.

### How it is stored

The component that holds slots keeps them in its value, which must be a **record**: every entry is one slot, and its value is a record of components keyed by their ids, in order. A slot that is not in the record is empty.

```ts
const callout = {
	id: 'callout-1',
	type: 'callout',
	mode: 'block',
	value: {
		type: 'record',
		value: {
			// The slot "body": one text, keyed by its id
			body: {
				type: 'record',
				value: {
					'text-1': { type: 'component', value: { id: 'text-1', type: 'text', mode: 'inline', value: { type: 'string', value: 'Hello' } } }
				}
			}
		}
	}
};
```

Register the type with `empty.value: 'record'` and `valueTypes: ['record']`. A new component starts with an empty record, as a slot is stored when something is written in it. The editor does the rest: inserting, deleting and duplicating components in a slot (the copy gets new ids, nested components included), splitting a text at the caret, and tracking the bindings of the nested components.

### In a Svelte component

Use the custom element, and give it the props the component receives. Svelte sets `componentData` as a property, and the others follow your component when they change:

```svelte
<script lang="ts">
	import type { ScribeComponentProps } from '@antonii22/scribe2/core';
	let { componentData, sectionId, mode, isDarkMode }: ScribeComponentProps<CalloutComponent> = $props();
</script>

<aside class="callout">
	<scribe-component-slot {componentData} slotKey="body" {sectionId} {mode} {isDarkMode}></scribe-component-slot>
</aside>
```

The element is registered when `@antonii22/scribe2` is imported, and its props are typed for Svelte, JSX and `HTMLElementTagNameMap` (`ComponentSlotProps`).

**Why not a Svelte component?** The bundle carries its own copy of the Svelte runtime, and Svelte keeps its reactive state (the effect that is running, the context) in the runtime that compiled the component. A Svelte component of Scribe rendered inside one of yours would read your props with the wrong runtime, so it would draw once and then ignore the changes of your own `$state` and of the component data (a component inserted in the slot would be stored but not drawn). A custom element is a plain DOM element, so Svelte passes the props through the DOM and each side keeps its own runtime. That is why Scribe exports no Svelte components (only the helpers of `@antonii22/scribe2/svelte`, which are published as source for this reason).

| Prop | Description |
| --- | --- |
| `componentData` | The component that holds the slot. Its value must be a record. |
| `slotKey` | The entry of that record where the slot is stored. Every key is a different slot, so a component can have as many as it needs (the table uses `row:col`). |
| `sectionId`, `mode`, `isDarkMode` | The same ones every component receives. |

### In plain HTML

Outside of Svelte the element is the same, with `componentData` as an object property and the others as attributes:

```html
<scribe-component-slot slotKey="body" sectionId="section-1" mode="edit"></scribe-component-slot>
```

### Good to know

- A slot is not the whole component: clicking the padding around slots selects the component that holds them, and clicking inside a slot places the caret there. Set `padding` on the area that surrounds each slot (as the table does on its cells), so the component can be selected.
- Slots can be nested: a table in a table cell works, and so does a callout in a callout.
- An entry that is not a record of components (for example a document saved before the component used slots) shows an error box instead of the content.
- `SlotRef` (`{ parentId, slotKey }`) is the type that says where a component is stored, and `ComponentSlotProps` the props above.

## Colour picker for the toolbar

`createColorOption` makes a ribbon option that lets the user pick a colour: a button with a block of the current colour that opens a palette (with the native picker for any other colour). Put it in the `options` of a component of your registry:

```ts
import { createColorOption } from '@antonii22/scribe2/core';

const options = [
    ...defaultComponentOptions,
    createColorOption({
        type: 'highlight-color',
        name: 'Highlight colour', // tooltip and accessible name
        label: 'Colour',          // optional text under the block
        group: 'Colour',          // title of the group of the ribbon
        configKey: 'color',       // the choice is saved in config.color of the component
        defaultColor: '#facc15',  // shown while the config has none
        resettable: true,         // optional: adds an "Automatic" row that removes config.
    }),
];
```

The colour is a `#rrggbb` string in `config[configKey]`. Your component reads it from `componentData.config`, and should ignore anything that is not `#rrggbb` (a document can hold any value). `shortcut` and `isDisabled` are optional, like in any option.

### Colour in a text

The text component colours a fragment of its text, and stores it in the text itself: `{#rrggbb}` sets the colour of what follows and `{#}` goes back to the colour of the theme, for example `Hello {#ef4444}world{#}!`. A colour ends at the end of its line. Any other `{` is plain text (a literal `{` is written as `\{`), so existing texts are read as before. If you read the text of a document outside Scribe, remove these markers as you would the `*`, `_`, `~` and `-` of the other formats.

## Svelte components in the registry and in `renderItem`

If your app is written in Svelte 5, two helpers mount your components where Scribe needs a `mount`, `update` and `unmount`: `createSvelte5Mount` for the entries of the component registry, and `createSvelteItemRenderer` for the rows of a custom binding (`CustomBinding.renderItem`).

```ts
import { createSvelte5Mount, createSvelteItemRenderer } from '@antonii22/scribe2/svelte';
```

**Why a separate import.** `@antonii22/scribe2` is a bundle that carries its own copy of the Svelte runtime. A helper exported from it would mount *your* components with *that* runtime, while they were compiled against yours. So the helpers are published as source (`@antonii22/scribe2/svelte`, with the `svelte` export condition) and your bundler compiles them with your own Svelte, as it does with the rest of your code. This needs Svelte 5 and a bundler that compiles Svelte libraries (such as `vite-plugin-svelte`). The file imports nothing from Scribe.

**The context has to be passed.** A component mounted by Scribe is a new root, not a child of yours, so it does not inherit your Svelte context (i18n, stores, a router...). Both helpers take it as an optional last argument, which goes to Svelte's `mount()`. `getAllContexts()` only works while a component initialises, so build the registry or the renderer there:

```svelte
<script lang="ts">
	import { getAllContexts } from 'svelte';
	import { getDefaultRegistry, type ScribeComponentProps } from '@antonii22/scribe2/core';
	import { createSvelte5Mount, createSvelteItemRenderer } from '@antonii22/scribe2/svelte';
	import MyCard from './MyCard.svelte'; // a component of your own, which can use getContext
	import MyRow from './MyRow.svelte';

	const context = getAllContexts(); // a snapshot: what is set later in your components is not seen

	// A registry component
	const registry = {
		...getDefaultRegistry(i18n),
		'my-card': {
			name: 'Card',
			description: 'A card',
			icon: '<svg>...</svg>',
			...createSvelte5Mount<ScribeComponentProps<MyCardComponent>>(MyCard, context),
			empty: { type: 'my-card', mode: 'block', value: 'string' },
			valueTypes: ['string']
		}
	};

	// The rows of a custom binding. `bareItems` makes Scribe draw no frame, so MyRow draws its own card
	const customBinding: CustomBinding = {
		type: 'my-binding',
		name: 'My binding',
		renderItem: createSvelteItemRenderer(MyRow, context),
		bareItems: true,
		getAvailableIds: () => [],
		getData: async () => ({ type: 'string', value: '' })
	};
</script>
```

Without `context`, `getContext` in `MyCard` or `MyRow` returns `undefined`. You can also pass a `Map` of your own instead of `getAllContexts()`. The playground shows the row case in `/examples/full-edit-custom-binding`.

Inside these components, draw the parts of Scribe with its custom elements, such as `<scribe-component-slot>` (see "Slots" above). Scribe exports no Svelte components for this, for the same reason of the two runtimes.

## Styling

Scribe is drawn to sit inside a modern app: a grey desk, white cards with hairline borders, a blue primary colour that doubles as the accent. Every colour comes from a CSS variable, so a host app can make it match its own palette by overriding the variables below. Load [/src/lib/styles/scribe.css](/src/lib/styles/scribe.css) and set only what you need:

```css
:root {
	/* Page and cards */
	--scribe-doc-background: oklch(0.962 0.002 250); /* The desk the sections lie on */
	--scribe-doc-foreground: oklch(0.2 0.005 260); /* Default text colour */
	--scribe-section-background: oklch(1 0 0); /* Section cards */
	--scribe-section-foreground: oklch(0.2 0.005 260);
	--scribe-popover: oklch(1 0 0); /* Dialogs, dropdowns, the variables panel */
	--scribe-popover-foreground: oklch(0.2 0.005 260);

	/* Buttons and the chosen state */
	--scribe-primary: oklch(0.54 0.19 260); /* Filled buttons, check marks, the border of a chosen card. Separate from the accent, so a host can split them */
	--scribe-primary-foreground: oklch(0.99 0 0);
	--scribe-secondary: oklch(0.955 0.002 250); /* Soft fills: count pills, segmented controls */
	--scribe-secondary-foreground: oklch(0.28 0.005 260);

	/* Lines and muted surfaces */
	--scribe-border-color: oklch(0.915 0.003 250); /* Hairlines */
	--scribe-muted: oklch(0.968 0.002 250); /* Hover fills, sunken boxes */
	--scribe-muted-foreground: oklch(0.5 0.01 255); /* Secondary text (keep at least 4.5:1 on cards) */

	/* Accent: selection, focus and values bound to a variable */
	--scribe-accent: oklch(0.54 0.19 260);
	--scribe-accent-foreground: oklch(0.99 0 0); /* Text on a solid accent */
	--scribe-selection-color: oklch(0.54 0.19 260 / 18%); /* Text selection and hover highlight */

	/* Danger */
	--scribe-error: oklch(0.55 0.22 27); /* Background of destructive buttons */
	--scribe-error-foreground: oklch(0.5 0.21 27); /* Error text and icons */
	--scribe-on-error: oklch(0.99 0 0); /* Text on a solid error background */

	/* One colour per data type, used by the type icons and labels */
	--scribe-type-string: oklch(0.55 0.17 300);
	--scribe-type-number: oklch(0.52 0.14 155);
	--scribe-type-boolean: oklch(0.58 0.14 65);
	--scribe-type-date: oklch(0.55 0.11 200);
	--scribe-type-array: oklch(0.54 0.17 250);
	--scribe-type-record: oklch(0.55 0.19 345);
	--scribe-type-empty: oklch(0.55 0.01 255);

	/* Layers */
	--scribe-overlay: oklch(0.2 0.01 260 / 35%); /* Behind dialogs */
	--scribe-shadow-sm: 0 1px 2px 0 oklch(0 0 0 / 5%);
	--scribe-shadow-md: 0 2px 8px -2px oklch(0 0 0 / 8%), 0 1px 2px 0 oklch(0 0 0 / 4%);
	--scribe-shadow-lg: 0 8px 24px -6px oklch(0 0 0 / 12%), 0 2px 6px 0 oklch(0 0 0 / 5%);
	--scribe-shadow-float: 0 12px 32px -8px oklch(0 0 0 / 16%), 0 2px 6px 0 oklch(0 0 0 / 6%); /* Layers that float over the page */

	/* Sections */
	--scribe-section-radius: var(--scribe-radius-xl);
	--scribe-section-separation: 0.875rem; /* Gap between sections */
	--scribe-section-heading-gap: 1rem; /* Gap between section heading and content */

	/* Fonts: Inter is used when the host loads it, otherwise the system font */
	--scribe-font-heading: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	--scribe-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
	--scribe-font-mono: ui-monospace, 'Cascadia Code', Menlo, monospace; /* Only for code-like content */

	/* Sizes: --scribe-font-size-xs ... 4xl, and the h1, h2, h3 and body sizes built from them */
	--scribe-font-size-h1: var(--scribe-font-size-3xl);
	--scribe-font-size-h2: var(--scribe-font-size-xl);
	--scribe-font-size-h3: var(--scribe-font-size-lg);
	--scribe-font-size-body: var(--scribe-font-size-md);

	/* Weights: --scribe-font-weight-light ... bold, and the h1, h2, h3 and body weights built from them */
	--scribe-font-weight-h1: var(--scribe-font-weight-semibold);
	--scribe-font-weight-h2: var(--scribe-font-weight-semibold);
	--scribe-font-weight-h3: var(--scribe-font-weight-semibold);
	--scribe-font-weight-body: var(--scribe-font-weight-regular);

	/* Radius: one base value, scaled for sm, md, lg, xl, 2xl, 3xl and 4xl */
	--scribe-radius: 0.625rem;
}
```

Some colours are derived from these with `color-mix` (field borders, the fill of a bound value, error washes), so they follow your overrides and the dark theme without being set.

### Dark theme

Add the `dark` class to `<html>`, to a wrapper or to the Scribe element, and override the variables for it. Scribe is dark when its root element or **any ancestor** has the class, as the CSS is, and it follows the class live: adding or removing `dark` while the editor is open updates the colours and the `isDarkMode` prop that the components receive (the map switches its base map, and your own components can read it). It also works when Scribe sits inside the shadow root of another element, with the class outside of it.

```css
.dark {
	/* Overwrite the values as desired for dark mode, see styles/scribe.css for the defaults */
	/* ... */
}
```

### Content drawn by the host

Scribe resets the styles of plain tags inside the document (`span`, `p`, headings, `a`, `button`, `input`... and the `border-color` of every element), so the CSS of the host app does not leak into it. Those resets are not in a CSS layer, so they also win over utility classes that are, such as the ones of Tailwind v4 (`@layer utilities`).

Any element with the attribute `data-scribe-host`, and everything inside it, is left out of those resets. The content drawn by the host then inherits the font and colour of its surroundings, its own classes apply as written, and the default margins of the browser are the host's to reset (Tailwind's preflight does it).

- Scribe already sets the attribute on the content of `CustomBinding.renderItem`, the rows of the value selector. By default Scribe also draws the frame of each row (border, background, check and the Incompatible pill). With `CustomBinding.bareItems: true` it draws none of that and the host draws it from `isSelected` and `isDisabled`, keeping Scribe's button (selection, keyboard, focus ring).
- A registered component that draws with the CSS of the host can put `data-scribe-host` on its root element.

## Important considerations

- **Tailwind**: can be used when developing **ONLY** on the route pages. When developing the web component, if used, styles will not be applied (This is a limitation of web components).
- **One Scribe per page**: the document, bindings, registry and selection are stored page-wide, so two Scribe instances on the same page overwrite each other. Scribe logs a console warning when a second one is mounted.
