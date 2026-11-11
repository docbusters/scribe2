---
version: 1
slug: "src-lib-components-scribe-svelte"
primary_target: "src/lib/components/Scribe.svelte"
related_targets: ["src/lib/styles/scribe.css"]
---

# Scribe library redesign

Scope: the whole `src/lib` UI (editor chrome, dialogs, variables panel, built-in components). Mode: Operate, code-led.

Audience, job: non-technical report writers composing data-bound documents inside a host SaaS app. Constraint: third parties re-colour everything through `--scribe-*` variables, so no hard-coded colour anywhere and derived tokens use `color-mix`.

## Direction contract

THESIS: Scribe is a guest panel inside a modern SaaS shell. It refuses the Word-clone grey ribbon, floating-label forms and the shadcn grey default.

OWN-WORLD: Light grey desk, white cards with 1px hairlines and a barely-there shadow, radii 6/8/10/14/18. Blue primary for actions and a soft blue wash for chosen toggles and cards, the accent for selection, focus and bound values. Data types are marked by one tile system: soft tinted fill, tinted hairline, saturated glyph, always the same shape. Small uppercase tracked labels that are themselves the label, with grey count pills.

STORY: The writer sees a calm document of white section cards. Data appears as blue event chips. Every dialog and the variables panel use the same card, row and tile language, so the host product and Scribe read as one app.

FIRST VIEWPORT: Sticky white ribbon card at the top (icon over label, group title under each group), then the document title, then white section cards. The variables panel is a floating white card on the right, grouped by data type in collapsible groups, each with a type tile and a count.

FORM: seed: none (pinned), "match a modern style that integrates with an app similar to these images". Signature move: bound values drawn like the calendar event chips (accent wash, accent hairline, accent text) plus the shared type tile.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
