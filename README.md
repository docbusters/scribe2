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

To style the default components, CSS variables can be used. It is recommended using the default styles [/src/lib/styles/scribe.css](/src/lib/styles/scribe.css) and manually setting specific variables when necessary:

```css
:root {
	/* Document-level variables */
	--scribe-doc-background: oklch(1 0 0); /* Document background color */
	--scribe-doc-foreground: oklch(0.145 0 0); /* Default text color */

	--scribe-primary: oklch(0.205 0 0); /* Primary background color for elements like buttons, etc. */
  	--scribe-primary-foreground: oklch(0.985 0 0); /* Text color for elements with primary background */
    --scribe-secondary: oklch(0.94 0 0); /* Secondary background color for elements like cards, modals, etc. */
    --scribe-secondary-foreground: oklch(0.205 0 0); /* Text color for elements with secondary background */

	/* Section-level variables */
	--scribe-section-background: oklch(0.97 0 0); /* Background color for sections */
	--scribe-section-foreground: oklch(0.205 0 0); /* Text color for sections */
	--scribe-section-radius: var(--scribe-radius-lg); /* Border radius for sections */
	--scribe-section-separation: 0.75rem; /* Gap between sections */
	--scribe-section-heading-gap: 1.5rem; /* Gap between section heading and content */

	/* Misc. variables */
	--scribe-border-color: oklch(72.193% 0.00008 271.152); /* Default border color for elements */
	--scribe-selection-color: oklch(0.6194 0.2085 255.62 / 25%); /* Color for text selection */
	--scribe-error: oklch(0.577 0.245 27.325); /* Background color for error states */
	--scribe-error-foreground: oklch(63.7% 0.237 25.331); /* Color for error text */
	--scribe-popover: oklch(1 0 0);
  	--scribe-popover-foreground: oklch(0.145 0 0);
	--scribe-muted: oklch(0.97 0 0);

    /** Font family variables */
    --scribe-font-heading: 'Segoe UI', sans-serif; /* Font for headings (h1, h2, etc.) */
	--scribe-font-sans: 'Segoe UI', sans-serif; /* Font for sans-serif text */
	--scribe-font-mono: 'Segoe UI Mono', monospace; /* Font for monospace text */

	/* Font size variables */
	--scribe-font-size-xs: 0.75rem;
	--scribe-font-size-sm: 0.875rem;
	--scribe-font-size-md: 1rem;
	--scribe-font-size-lg: 1.125rem;
	--scribe-font-size-xl: 1.25rem;
	--scribe-font-size-2xl: 1.5rem;
	--scribe-font-size-3xl: 1.875rem;
	--scribe-font-size-4xl: 2.25rem;

	--scribe-font-size-h1: var(--scribe-font-size-4xl); /* Font size for h1 */
	--scribe-font-size-h2: var(--scribe-font-size-2xl); /* Font size for h2 */
	--scribe-font-size-h3: var(--scribe-font-size-xl); /* Font size for h3 */
	--scribe-font-size-body: var(--scribe-font-size-md); /* Font size for body text */

	/* Font weight variables */
	--scribe-font-weight-light: 300;
	--scribe-font-weight-regular: 400;
	--scribe-font-weight-medium: 500;
	--scribe-font-weight-semibold: 600;
	--scribe-font-weight-bold: 700;

	--scribe-font-weight-h1: var(--scribe-font-weight-bold); /* Font weight for h1 */
	--scribe-font-weight-h2: var(--scribe-font-weight-semibold); /* Font weight for h2 */
	--scribe-font-weight-h3: var(--scribe-font-weight-semibold); /* Font weight for h3 */
	--scribe-font-weight-body: var(--scribe-font-weight-regular); /* Font weight for body text */

    /* Radius variables */
    --scribe-radius: 0.625rem; /** Base radius for all elements */

    /* Scaled radius values for different sizes */
	--scribe-radius-sm: calc(var(--scribe-radius) * 0.6); 
	--scribe-radius-md: calc(var(--scribe-radius) * 0.8);
	--scribe-radius-lg: var(--scribe-radius);
	--scribe-radius-xl: calc(var(--scribe-radius) * 1.4);
	--scribe-radius-2xl: calc(var(--scribe-radius) * 1.8);
	--scribe-radius-3xl: calc(var(--scribe-radius) * 2.2);
	--scribe-radius-4xl: calc(var(--scribe-radius) * 2.6);
}

:root .dark {
	/* Overwrite the values as desired for dark mode */
	/* ... */
}
```

## Important considerations

- **Tailwind**: can be used when developing **ONLY** on the route pages. When developing the web component, if used, styles will not be applied (This is a limitation of web components).
