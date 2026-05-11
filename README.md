# Scribe Web Component

## Development

> **Note:** Read [Important considerations](#important-considerations) before starting development.

For developing this library execute the following commands:

```bash
npm i
npm run dev
```

This will deploy a Sveltekit SPA that shows some examples making it easy to develop the library!

## Building the library

Building the library requires generating the web component + types + styles. This can be achieved by executing the folling command:

```bash
npm run build:wc
```

This command basically uses `vite.wc.config.ts` to generate the web component in a single js and `tsconfig.types.json` to generate the corresponding types. It also copies the styles `scribe.css` into the `dist` folder.

## Examples

- [**Simple plain html example**](/test/simple-webcomponent-test.html): Shows the library usage with the default components.

- [**Simple JSON html example**](/test/simple-webcomponent-test-json.html): Shows the library usage using an external JSON to declare the document schema.

- [**Simple html with styles example**](/test/simple-webcomponent-test-styles.html.html): Shows the library usage with custom styles

## Styling

To style the default components, CSS variables can be used. It is recommended using the default styles [/src/lib/styles/scribe.css](/src/lib/styles/scribe.css) and manually setting specific variables when necessary:

```css
:root {
	--scribe-background: oklch(1 0 0);
	--scribe-foreground: oklch(0.145 0 0);

	--scribe-secondary: oklch(0.97 0 0);
	--scribe-secondary-foreground: oklch(0.205 0 0);

	/** Font family variables */
	--scribe-font-heading: 'Segoe UI', sans-serif; /* Font for headings (h1, h2, etc.) */
	--scribe-font-sans: 'Segoe UI', sans-serif; /* Font for sans-serif text */

	/* Radius variables */
	--radius: 0.625rem; /** Base radius for all elements */

	/* Scaled radius values for different sizes */
	--radius-sm: calc(var(--radius) * 0.6);
	--radius-md: calc(var(--radius) * 0.8);
	--radius-lg: var(--radius);
	--radius-xl: calc(var(--radius) * 1.4);
	--radius-2xl: calc(var(--radius) * 1.8);
	--radius-3xl: calc(var(--radius) * 2.2);
	--radius-4xl: calc(var(--radius) * 2.6);
}

:root .dark {
	--scribe-background: oklch(0.145 0 0);
	--scribe-foreground: oklch(0.985 0 0);

	--scribe-secondary: oklch(0.269 0 0);
	--scribe-secondary-foreground: oklch(0.985 0 0);
}
```

## Important considerations

- **Tailwind**: can be used when developing **ONLY** on the route pages. When developing the web component, if used, styles will not be applied (This is a limitation of web components).
