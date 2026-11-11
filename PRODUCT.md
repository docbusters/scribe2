# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Non-technical report writers working inside a host product. They compose reports that mix
formatted text with tables, charts, images, maps and formulas, much like a lightweight word
processor. Readers of the finished documents use view mode. Developers who embed the
component are a secondary audience: they care about the API, theming and extension points.

## Product Purpose
Scribe lets people write and read structured, data-driven documents inside any web app.
Success means a writer builds a complete report without technical help, and a reader sees it
rendered correctly with live data.

## Positioning
Scribe combines three things a generic rich-text editor does not:
- **Data-bound documents:** a document is a schema whose components bind to data (default and
  custom bindings, collections), so one template renders with many datasets.
- **Drop-in web component:** `<scribe-interpreter>` plus one `scribe.css`, framework-agnostic,
  with no Tailwind and no host framework required.
- **Extensible registry:** host apps register their own component types and ribbon edit options
  next to the built-in ones.

## Operating Context
- Embedded by third parties in apps Scribe does not control. It uses `shadow: 'none'`, so it
  must hold up against unknown host CSS (scoped reset in `styles/scribe.css`).
- Two modes: edit (ribbon toolbar, insertion at the caret, Ctrl+Space, value dialogs, bindings
  panel) and view.
- Built-in components: text (bold/italic/underline/strikethrough), text binding, text input,
  table, chart, image, map (geocoding), LaTeX.
- Published as `@antonii22/scribe2` on GitHub Packages. Companion elements:
  `<scribe-bindings-panel>`, `<scribe-component-renderer>`, `<scribe-empty-content>`.

## Capabilities and Constraints
- One Scribe instance per page (singleton stores).
- Locales: English and Spanish. Every UI string goes through i18n.
- Light and dark themes through `--scribe-*` variables.
- Plain CSS only in the library. Tailwind is never a dependency of `src/lib`.
- Unknown component types must render an error box, not break the document.
- The public API (`src/lib/index.ts`) is published, so changes to it are deliberate.

## Brand Commitments
Name: Scribe. The visual language matches modern SaaS host apps (grey desk, white hairline cards, a blue primary, one blue accent), and every colour must stay customisable through `--scribe-*` variables. No other binding brand assets, voice or identity rules have been confirmed.

## Evidence on Hand
- Example documents: `src/lib/examples/` (`fullExampleDocument`, `fullExampleBindings`).
- Playground pages at `/examples/*`, and plain-HTML tests in `test/*.html`.
- No testimonials, customers, usage metrics or case studies exist. Do not fabricate any.

## Product Principles
1. The writer never needs to know about schemas: data binding must feel like inserting a word.
2. Be a good guest: never break, restyle or depend on the host page.
3. The document always renders: a bad component degrades locally, never globally.
4. Extensions are first-class: custom components get the same affordances as built-in ones.

## Accessibility & Inclusion
WCAG 2.x AA is required, because third parties embed Scribe in their products. That covers
keyboard operation of the editor and ribbon, visible focus, sufficient contrast in both
themes, and screen-reader-meaningful labels in both locales.
