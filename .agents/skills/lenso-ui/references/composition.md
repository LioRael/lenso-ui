# Compose native Lenso parts

Adapted from HeroUI's compound-composition and semantic-variant guidance.
Modified for Lenso native contracts and StyleX; see [provenance](../NOTICE.md).

## Establish the structure

Start from the matching family documentation, native signatures and applicable
example. Identify the root's state owner, its supporting parts and any context
requirements. Use actual public exports from `@lenso/ui`.

Base UI owns ordinary controls, collections and overlays. React Aria owns date,
time and color families and supporting parts that require those contexts. Native
HTML owns static structure. Follow the queried API for that family; similarly
named parts from another library are not interchangeable.

Use controlled state when the surrounding workflow needs to coordinate it.
Keep one owner for each fact: selection, dialog openness, draft, theme or URL.
Native callbacks perform the update; derive counts, summaries and filtered rows
from that owner. Preserve stable item keys when labels are translated.

Choose semantic variants by functional emphasis: a primary action, alternatives,
low-emphasis actions and destructive actions. Resolve the actual allowed variants
per family rather than applying a Button variant table to every component.

## Style without replacing behavior

Use semantic theme variables for shared colors, fonts and radii. Compose local
StyleX maps through the documented `xstyle` surface and leave caller overrides
last. Retain all `stylex.props` output, including runtime custom properties.
Merge native state-dependent style callbacks with those properties.

Preserve native refs, render composition, event callbacks, state attributes,
focus behavior and portal ownership. Keep the required root/trigger/content
hierarchy even when rearranging presentation. Apply slot-specific maps to the
corresponding exported parts, not broad descendant selectors.

Tabs include their native panels and tab/panel associations, not just styled
tab buttons beside unrelated content. Collections, forms and overlays likewise
retain the contextual supporting parts documented for their native family.

Read the current map for variants, sizes, motion and focus styling instead of
introducing a second scale. Keep component-specific variant names. Lenso uses
StyleX rather than Tailwind class composition; upstream styling syntax is a
visual reference, not working consumer code.

## Prove the composition

Run typecheck and the actual rendering build. Then operate the changed workflow
with a keyboard: select, submit, open, dismiss and return focus. Check disabled,
invalid, empty and loading states that the workflow can reach.

For overlays, confirm the rendered portal retains edited theme variables and
direction. For collection/form changes, confirm submitted values and selection
keys as well as visible labels. For layout changes, inspect the actual component
rectangles and scroll regions in both themes and relevant widths.

Keep component correctness and page design separate: this reference proves the
parts behave coherently, not that a composed screen matches a visual target.
