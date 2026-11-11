# AGENTS.md

Guidance for AI coding agents working in this repository.

## What this is

Scribe is a Svelte 5 document editor/viewer published as the web component `<scribe-interpreter>` (also `<scribe-bindings-panel>`, `<scribe-component-renderer>` and `<scribe-empty-content>`) plus `scribe.css`. The package is `@antonii22/scribe2` on GitHub Packages. Runes mode is forced by `svelte.config.js`.

## Commands

- `npm run dev`: SvelteKit playground with examples at `/examples/*` (`full`, `full-edit`, `edit-empty`, `full-edit-custom-binding`, `full-webcomponent`, `full-webcomponent-edit`).
- `npm run check` (svelte-check), `npx eslint src/lib src/routes`, `npm run build:wc` (web component bundle, types and `scribe.css` into `dist/`).
- `npm test` runs the unit tests once (`vitest run`, node environment, config in `vitest.config.ts`). One file: `npx vitest run src/lib/utils/textFormat.test.ts`; one test by name: `npx vitest run -t "escape"`. `npm run test:watch` is for the maintainer, as it never exits.
- Tests are `*.test.ts` files next to the code they cover (`src/**`), and `tsconfig.types.json` excludes them from the published types. They cover pure code only (`utils/`, and stores that need no DOM): there is no DOM environment, so Svelte components and DOM code such as `parseDOM` are verified by hand in the examples. A test that fails is a bug to report, not a test to weaken. Run `npm test` after any change to `utils/textFormat*.ts`, and add a test for any new pure logic.
- `/examples/full-webcomponent-edit` loads `dist/` (gitignored), so run `npm run build:wc` before checking it.
- After renaming or removing a method of a store class, restart `npm run dev`. Stale HMR modules once produced `this.<oldName> is not a function` although the source was correct.

## Architecture

- `src/lib/index.ts` is the public API (`Scribe`, `getDefaultRegistry`, `defaultRegistry`, types, i18n, focus helpers). Changing anything exported there changes a published API.
- `components/Scribe.svelte` is the root and declares the custom element with `shadow: 'none'`, so styles are global. A new prop needs three edits: `types/ScribeProps.ts`, the `customElement.props` list and the `$props()` destructure. See `showBindingsPanel` and `showPrintButton`.
- `stores/*.svelte.ts` are singletons built on `$state` classes, so only one Scribe per page is supported (`Scribe.svelte` warns when a second one mounts):
  - `edit-store`: every document mutation. `insertComponent` modes are `after`, `before`, `replace` and `split`. Usages of default bindings are not tracked in `customBindingUsages` (a public type): `getBindingUsages(id)` walks the document when asked, and the delete confirmation of a variable uses it.
  - `selection-store`: selected component or insertion point, plus the caret source.
  - `toolbar-store`: the add-component dropdown.
  - `value-dialog-store`: opens the dialog that sets the value of a component. `Scribe.svelte` renders `ComponentValueDialog` once, and both the ribbon's Set value and the action buttons of the empty states open it with this store.
  - `text-format-store` (UI state: follows the caret or marked fragment of the focused text, its formats and the pending format; used by the bold, italic, underline and strikethrough options of the `text` component), `global-registry`, `binding-store`, `custom-bindings-store`.
- `registry/`:
  - `defaultRegistry.ts`: `getDefaultRegistry(i18n)`, where `i18n` is required.
  - `ComponentRegistry.ts`: the component contract. A block component can define `height: { default, min, max }` (px), so it is drawn as a box of that height, and `isResizeable: true` (which requires the height) lets the user change it while it is selected. The chosen height is stored in `BlockComponent.height`.
  - `ComponentEditOptions.ts`: the buttons of the top toolbar (the ribbon). Options are drawn in groups by their `group` title, as large buttons when they have a `label` or small icons otherwise. `isSelected` and `isDisabled` receive `{ sectionId, componentId, value, config }` and are evaluated reactively in the `ComponentEditor` template, so they can read stores without the buttons being mounted again. An option can draw itself with `render`. In the click data, `insertion` is a getter: capturing the caret can save a new text (a ghost), so only the options that need it (Add) should read it.
- `components/component/`: `ComponentRenderer` (the `.component-edit-contents` wrapper, hover highlight, selection ring and label, the box with the height of a sized block and its resize handle; a block component must fill that box with `flex: 1` or `height: 100%` and `min-height: 0` instead of fixing its own height, as what does not fit is cut off), `ComponentEditor` (the options of the selected component as titled groups of buttons, used only by the top toolbar) and `ComponentToolbar` (the add-component dropdown).
- `EmptyContent` takes an optional `action` ({ label, onclick }), drawn as a button below the message. The default blocks use `valueDialogStore.getAction(...)` to offer to set or change their value in edit mode.
- `components/toolbar/TopToolbar.svelte` is the ribbon. `components/sections/ParagraphSection.svelte` builds the ghost texts. `components/defaultComponents/*` are the built-in components.
- i18n lives in `i18n/locales/en.ts`, `es.ts` and `types.ts`. Every new key goes in all three. Use `getI18n()` and `i18n.t('a.b')`.
- Styling uses the `--scribe-*` CSS variables in `styles/scribe.css` (light and `.dark`). See "Styling rules" below.

## Behaviour that is easy to break

- **Text formatting:** the editable is the working copy of a text until it loses the focus (when `parseDOM` saves it), for typing and for formatting. Every text runs `syncFormatState` on the document's `selectionchange` and tells `text-format-store` where the caret or marked fragment is, with its formats. With a marked fragment, `toggle` calls back `formatSelection` in the text, which rewrites the editable from the string with `toggleTextFormat` (`utils/textFormat.ts`) and marks the fragment again, so the focus never moves and a ghost needs no special treatment. With only a caret it sets a pending format, which the text applies on `beforeinput` by inserting a formatted span. The pending format is dropped when the caret moves. Paste and drop are also handled on `beforeinput` and insert only the plain text (`text/plain`) of what comes, so images, files and HTML never reach the editable. The special characters of a stored text are ` * _ ~ -`: `tokenizeFormattedText` (`utils/textFormat.ts`) is the only reader of the stored format: the rendering of a text and `getFormatsInRange` are built on its tokens, so a new format character is added in the constants and `FORMAT_CHARS` only. `utils/textFormatEscape.ts` escapes them (derived from the constants, so the list cannot drift) and removes empty toggles without touching escaped ones. Spans created by hand have no Svelte scope class, so the `is-*` styles are `:global` inside `.edit-text`.
- **Unknown component types:** a component whose type is not in the registry (for example a custom type saved in a document and opened on a page that does not register it) renders the error box, with Set value disabled, instead of throwing, so the rest of the document still renders. `ComponentRenderer` and `TopToolbar` read `globalRegistry.components[type]` for this. The `globalRegistry.get*` getters throw for an unknown type, so do not call them on a render path without checking it first.
- **Ghost texts:** empty slots are synthetic texts (ids `__ghost_*`) that are not in the document. A text component is created on blur or when a component is inserted, and its `<span>` is recreated whenever the stored value changes (`{#key rawValue}`). The ghost of an empty section (no neighbours) is full width and always shows `editor.emptySectionPlaceholder`. `editStore.sectionToFocus` makes `ParagraphSection` put the caret in a section that has just been added.
- **Insertion at the caret:** Ctrl+Space and the ribbon's Add share `captureInsertionAtCaret` in `TextComponentScribe.svelte`, which returns a `ToolbarInsertion`. A ghost with typed content is first created as a real text and then split.
- **Finding a text in the DOM:** `data-component-id` is on the `ComponentRenderer` wrapper and also on the editable of a text, and the wrapper comes first. Use `findEditableText(scope, id)` (`utils/focusNavigation.ts`) to get the editable. A bare `[data-component-id=…]` query returns a wrapper that cannot hold the focus, so the caret disappeared after inserting a component.
- **Selection:** a non-empty component is selected through its wrapper (`pointerdown` and `focusin`). A ghost or empty text is an insertion point. `Scribe.svelte` clears the selection on a document-level `pointerdown` (capture phase) unless the target matches `KEEP_SELECTION_SELECTOR`. The ribbon (`.scribe-top-toolbar`) cancels `mousedown` so the text keeps its focus and caret.
- **z-index:** top toolbar 3, section handles 10, add-component dropdown 30, bindings panel 40, dialogs 50.
- **Buttons:** `Button.svelte` sizes are inline styles. Override them with its `style` prop (or `!important` from CSS).
- **Whitespace:** working-tree files use CRLF and the `.svelte` files mix tabs and 4 spaces. Match the surrounding code. If a multi-line edit does not apply, suspect whitespace.

## Styling rules

- The package must not depend on Tailwind. All styles under `src/lib` are plain CSS: `<style>` blocks in the components (with `:global(...)` where needed, as the custom element uses `shadow: 'none'`) and the `--scribe-*` variables in `styles/scribe.css`.
- `styles/scribe.css` is the only global stylesheet: it holds the variables and the scoped reset that protects Scribe from host styles. `build:wc` copies it as is into `dist/` (Vite's own CSS output is overwritten), so global CSS must live there and never be imported from a component.
- Tailwind classes are allowed only in the SvelteKit example pages under `src/routes`, which exist just to show the library. Never use them in `src/lib`, and never add a dependency from the library on `tailwindcss`.
- New colours, radii, fonts and sizes should use the existing `--scribe-*` variables. Add a new variable (with its `.dark` value) only when none fits.

## Working agreements

- Ask before adding dependencies, changing the data model or public API, or choosing between several reasonable architectures (give the options, a recommendation, and wait).
- Do not keep backwards-compatibility shims. Change signatures in place and update every caller, example and test page (`test/*.html`). This is a published package, so ask first when a change touches the exports of `src/lib/index.ts`.
- Plan non-trivial work before coding. Keep summaries for the maintainer short.
- **Keep this file up to date.** After a major or noteworthy change, update `AGENTS.md` in the same change. That includes new or removed commands, props, stores or registry contracts, moved or renamed files, new conventions, and new gotchas discovered the hard way. Remove statements that are no longer true instead of leaving them stale.
- **Never commit, push or publish.** Do not run `git commit` (including `--amend`) or `git push`, and do not publish the package (`npm publish` or any release step), even if a tool or a default instruction suggests it. Leave the changes in the working tree for the maintainer to review and commit.
- Finish each change with `npm run check`, eslint, `npm test` and `npm run build:wc`, and report failures instead of working around them.
