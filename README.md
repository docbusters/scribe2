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

This command basically uses `vite.wc.config.ts` to generate the web component in a single js and `tsconfig.types.json` to generate the corresponding types. It also copies the styles `scribe.css` into the `dist` folder.

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

## Examples

- [**Simple plain html example**](/test/simple-webcomponent-test.html): Shows the library usage with a basic example.

- [**Simple JSON html example**](/test/simple-webcomponent-test-json.html): Shows the library usage using an external JSON to declare the document schema.

- [**Simple html with styles example**](/test/simple-webcomponent-test-styles.html): Shows the library usage with custom styles

- [**Simple html in edit mode**](/test/simple-webcomponent-test-edit.html): Shows the library usage in edit mode

## Styling

Scribe is drawn to sit inside a modern app: a grey desk, white cards with hairline borders, a near-black primary colour and one blue accent. Every colour comes from a CSS variable, so a host app can make it match its own palette by overriding the variables below. Load [/src/lib/styles/scribe.css](/src/lib/styles/scribe.css) and set only what you need:

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
	--scribe-primary: oklch(0.2 0.005 260); /* Filled buttons, the chosen ribbon button, check marks */
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

Add the `dark` class to `<html>`, to a wrapper or to the Scribe element, and override the variables for it:

```css
.dark {
	/* Overwrite the values as desired for dark mode, see styles/scribe.css for the defaults */
	/* ... */
}
```

## Important considerations

- **Tailwind**: can be used when developing **ONLY** on the route pages. When developing the web component, if used, styles will not be applied (This is a limitation of web components).
- **One Scribe per page**: the document, bindings, registry and selection are stored page-wide, so two Scribe instances on the same page overwrite each other. Scribe logs a console warning when a second one is mounted.
