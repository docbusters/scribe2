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

Building the library requires generating the web component + types. This can be achieved by executing the folling command:

```bash
npm run build:wc
```

This command basically uses `vite.wc.config.ts` to generate the web component in a single js and `tsconfig.types.json` to generate the corresponding types.

## Examples

- [**Simple plain html example**](/test/simple-webcomponent-test.html): Shows the library usage with the default components.

- [**Simple JSON html example**](/test/simple-webcomponent-test-json.html): Shows the library usage using an external JSON to declare the document schema.

## Important considerations

- **Tailwind**: can be used when developing **ONLY** on the route pages. When developing the web component, if used, styles will not be applied (This is a limitation of web components).
