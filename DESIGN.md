---
name: Scribe
description: A guest document editor inside a SaaS shell, white section cards on a light desk, a blue primary for actions and chosen states, the same blue as accent for selection and data.
colors:
  desk: "oklch(0.962 0.002 250)"
  ink: "oklch(0.2 0.005 260)"
  primary: "oklch(0.54 0.19 260)"
  on-primary: "oklch(0.99 0 0)"
  secondary: "oklch(0.955 0.002 250)"
  secondary-ink: "oklch(0.28 0.005 260)"
  card: "oklch(1 0 0)"
  hairline: "oklch(0.915 0.003 250)"
  muted: "oklch(0.968 0.002 250)"
  muted-ink: "oklch(0.5 0.01 255)"
  accent: "oklch(0.54 0.19 260)"
  on-accent: "oklch(0.99 0 0)"
  error: "oklch(0.55 0.22 27)"
  error-ink: "oklch(0.5 0.21 27)"
  type-string: "oklch(0.55 0.17 300)"
  type-number: "oklch(0.52 0.14 155)"
  type-boolean: "oklch(0.58 0.14 65)"
  type-date: "oklch(0.55 0.11 200)"
  type-array: "oklch(0.54 0.17 250)"
  type-record: "oklch(0.55 0.19 345)"
  type-empty: "oklch(0.55 0.01 255)"
typography:
  h1:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.5
  h2:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.5
  h3:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
  dialog-title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1
  field-label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.2
  caps-label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  pill: "999px"
spacing:
  section-gap: "0.875rem"
  section-heading-gap: "1rem"
  dialog-pad: "1.5rem"
  control-gap: "0.375rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0 0.875rem"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-ink}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  button-destructive:
    backgroundColor: "{colors.error}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "2.375rem"
    padding: "0 0.75rem"
  section-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "1.25rem 1.5rem"
  dialog:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    width: "520px"
  choice-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.625rem 0.75rem"
  bound-value-chip:
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
    padding: "0 0.5em"
---

# Design System: Scribe

## Overview

**Creative North Star: "The Guest Panel"**

Scribe is a document editor that lives inside someone else's SaaS product, so it behaves like a well-mannered guest: a light grey desk, white section cards with 1px hairlines and a barely-there shadow, a blue primary (solid for actions, a soft wash for chosen toggles), and the same blue as the accent for selection, focus and data. Every dialog, row, panel and chip reuses the same card, row and tile language, so the host and Scribe read as one app.

The audience is non-technical report writers composing data-bound documents. Density is calm and moderate; controls are 32-40px tall, labels are small and plain. Hosts re-colour everything through `--scribe-*` variables, so the system is built from tokens and `color-mix` of tokens, never from hard-coded colour.

The build refuses the Word-clone grey ribbon, floating-label forms (labels sit above the field) and the shadcn grey default.

**Key Characteristics:**
- Desk plus white cards, hairlines instead of heavy shadow.
- Blue primary for actions (solid) and chosen state (soft wash); the accent for the canvas and for data.
- One tile system marks every data type: tinted fill, tinted hairline, saturated glyph.
- Radii scale from one base (10px): 6 / 8 / 10 / 14 / 18.
- Light and dark themes through the same token names (`.dark` on `html`, a wrapper, or the Scribe element).

## Colors

A neutral cool-grey ladder with a single saturated blue, used for both the primary and the accent. Values live in the frontmatter; prose names their roles.

### Primary
- **Signal Blue** (`primary`): filled buttons, checked marks, and the border of a chosen card or row. Chosen toggles use the accent as a soft wash instead of a fill. A lighter blue in dark theme. It starts equal to the accent but is its own token, so a host can split them.

### Secondary
- **Soft Slate** (`secondary`): soft fills such as segmented tracks and count pills.

### Tertiary
- **Canvas Blue** (`accent`): the selection ring and name tab on the canvas, focus rings, bound values, and the `binding` data kind. Text selection uses an 18% alpha of it (28% in dark).

### Neutral
- **Desk** (`desk`): the document background behind sections.
- **Paper** (`card`): section cards, dialogs, dropdowns and the variables panel.
- **Hairline** (`hairline`): 1px borders everywhere. `--scribe-border-strong` (a derived mix of foreground into card, 22%) draws field borders and dashed empty states.
- **Muted** (`muted`, `muted-ink`): hover fills, sunken footers, secondary text (kept at 4.5:1 on cards).
- **Error** (`error` solid, `error-ink` text and icons): destructive buttons and error states, with derived error wash and soft.

### Data type hues
`type-string`, `type-number`, `type-boolean`, `type-date`, `type-array`, `type-record`, `type-empty`: one hue each, used only through `.scribe-tile` and `.scribe-pill` via `data-type`. Dark theme lifts each to a lighter value.

### Derived tokens
Declared in `scribe.css` as `color-mix(in oklab, ...)` of base tokens on the Scribe elements and dialog/dropdown content, so they follow any host or `.dark` override: `--scribe-border-strong`, `--scribe-accent-wash` (9%), `--scribe-accent-soft` (28%), `--scribe-accent-text` (78% accent into foreground), `--scribe-error-wash`, `--scribe-error-soft`. Button hovers, tile fills and pill fills are likewise mixes.

### Named Rules
**The Public Token Rule.** Tokens are public API. Hosts set the base tokens; derived tokens are `color-mix` of base tokens and are never hand-set. A new base token needs a `.dark` value and a README entry.

**The Two Selection Languages Rule.** Chosen cards and rows (type cards, pickers, list choices) select with a primary (blue) border, an accent wash and a `.scribe-check` box; the canvas selects with the blue accent ring. The split is intentional: a choice is a form answer, the canvas selection is a place in the document. Do not ring a card like a canvas component, or give a canvas component a check box.

**The No Hard-Coded Colour Rule.** No hex, `rgb()` or `oklch()` in components; use a token or a mix of tokens. User data colours (chart series) are the exception.

## Typography

**Font:** Inter with a system sans fallback (`ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto`), for heading and body alike. A monospace token exists for code-like content only and is not used in components.

**Character:** One quiet family; hierarchy comes from size and a 600 weight, not from a second face.

### Hierarchy
- **H1** (600, 1.875rem, 1.5): document title.
- **H2** (600, 1.25rem): section title.
- **H3** (600, 1.125rem): sub-heading.
- **Dialog title** (600, 1.125rem, 1.3, -0.01em): dialog headings.
- **Body** (400, 1rem, 1.5): document text.
- **Control** (500, 0.875rem, line-height 1): buttons; small buttons 0.8125rem.
- **Field label** (500, 0.75rem): label above a text input or select.
- **Caps label** (600, 0.6875rem, 0.06em, uppercase): label of a field or group (`.scribe-caps-label`), in muted ink.

### Named Rules
**The Label Is The Label Rule.** Uppercase tracked text is only the label of a field or group, never a kicker or eyebrow above a heading. Variable names are shown as typed, not uppercased.

## Layout

A single document column of stacked section cards (0.875rem apart, 1rem between heading and content, 1.25rem by 1.5rem inside). A sticky ribbon card sits on top: icon over label, group title under each group. The variables panel is a fixed card at the top right, 340px wide, grouped by data type in collapsible groups, each with a type tile and a count.

Dialogs are max 520px and `100% - 2rem` wide, with a header, a 1.5rem-padded body with 1.25rem gaps, and a muted footer with a top hairline. Dialogs are built as stacked form parts; labels sit above fields (6px gap).

**390px behaviour.** The floating variables panel starts folded to a pill chip. Under 640px it opens as a bottom sheet (0.75rem inset left, right and bottom, full width, max-height 60vh) so the document stays visible above it. Dialogs shrink to the viewport minus 2rem.

Z-order: ribbon 3, section handles 10, dropdown 30, variables panel 40, dialogs 50.

## Elevation & Depth

Hybrid, hairline-first. Sections rest on the desk with a hairline and `--scribe-shadow-sm`; outline buttons also carry `shadow-sm`. `--scribe-shadow-float` is for layers that float: the variables panel and chip, dropdowns, dialogs. `shadow-md` and `shadow-lg` exist as tokens. Dark theme deepens every shadow alpha.

### Named Rules
**The Float Only Rule.** Hairlines carry structure; `shadow-float` is only for layers that sit above the page.

## Shapes

Softly rounded, from one base radius (10px): sm 6 (small tiles, kbd, chips, check box), md 8 (buttons, inputs, tiles), lg 10 (choice cards, empty states), xl 14 (section cards, panel, dropdown), 2xl 18 (dialogs). Count pills, type pills and the folded chip are fully round (999px). Borders are 1px; the check box is 18px.

## Components

### Buttons
Variants: default (primary), secondary, outline, ghost, destructive, ghost-destructive. Sizes: default 36px, sm 32px, lg 40px, icon 36px, icon-sm 28px. 8px corners. Default hover mixes 86% primary toward the card colour; secondary hover mixes 85% toward foreground; ghost hovers to `muted`; ghost-destructive stays muted until hover shows the error wash. Press scales to 0.98; disabled is 45% opacity. Transitions are 150ms ease-out.

### Inputs / Fields
TextInput and Select: label above (0.75rem, 500), 38px field, 1px strong border, 8px corner. Hover darkens the border; focus-within is an accent border plus a 1px accent outline; error is an error-ink border over an error wash with an icon and message.

### Choice cards and rows (DataTypeCard)
Hairline card, 10px corner, tile plus label plus a two-line description. Hover is `muted` with a strong border. Selected is a primary border plus a 1px primary outline and a `.scribe-check` box (see The Two Selection Languages Rule). Groups use `role="radiogroup"`.

### Type tile and pill
`.scribe-tile` is 32px (24px small), 8px corner, 10% tint fill, 22% tint hairline, saturated glyph. `.scribe-pill` is a 20px round label tinted the same way. `data-type="binding"` uses the accent.

### Section cards
White card, hairline, 14px corner, `shadow-sm`. Edit handles and the section editor appear on hover or focus-within.

### Ribbon and add-component dropdown
White sticky card; large buttons (icon over label) in titled groups, the chosen option shown as a soft blue pill (accent wash, accent text, accent hairline) through the `soft` button variant. The dropdown is a 264px popover card, 14px corner, `shadow-float`, 8px item corners.

### Ribbon tooltip
A compact label in the ink of the document on the section surface (inverted, so it stands out from the white ribbon in both themes), `shadow-float`, 8px corner, 12px medium text. It drops below the whole ribbon, not over the group title, with a small arrow at its button. The name is the title and the shortcut sits on a second line under it, drawn as quiet translucent key caps (symbols on a Mac), never as the bordered keys of the forms. It appears after 400ms in 140ms with exponential ease-out.

### Dialogs
Popover card, 18px corner, `shadow-float`, scrim from `--scribe-overlay`. The footer is a muted band with right-aligned buttons.

### Variables panel
Folded chip (36px pill) or a 340px card with collapsible groups per data type, each showing a type tile and a `.scribe-count`; dashed hairline empty state. `EmptyContent` offers an optional action button below its message.

### Bound-value chip (signature)
A bound value in the editor is drawn like a calendar event chip: accent wash fill, accent-soft hairline, accent-text colour, 6px corner, `0 0.5em` padding.

### Canvas selection
A selected component gets a 6% accent tint, a 2px accent ring outside it (inset -3px) and an accent name tab on the top edge; it enters in 150ms. Text components show only their caret.

## Do's and Don'ts

### Do:
- **Do** keep every colour a token or a `color-mix` of tokens, and give new base tokens a `.dark` value.
- **Do** select chosen cards and rows with the primary border plus `.scribe-check`, and the canvas with the accent ring.
- **Do** mark data types with `.scribe-tile` / `.scribe-pill` and `data-type`.
- **Do** give every control a visible focus state (the 2px accent `:focus-visible` ring) and an accessible name.
- **Do** keep transitions to 150ms ease-out and honour `prefers-reduced-motion`.

### Don't:
- **Don't** use coloured pills for data types outside the tile system.
- **Don't** use shadows for structure; hairlines do that.
- **Don't** put Tailwind or monospace into `src/lib`.
- **Don't** use floating labels or placeholder-as-label; the label sits above the field.
- **Don't** use uppercase tracked text as a kicker above headings.

## Known gaps

- Inter is not self-hosted; the host decides whether it loads, otherwise the system sans fallback applies.
- No authored motion beyond 150ms colour fades (with the 0.98 press scale and the selection-in) and a 160ms dialog entrance (fade plus 0.98 scale). The 1s spinner and the 2s skeleton pulse are functional only.
- The example pages' own ES/EN switcher overlaps the variables panel (routes only, not the library).
