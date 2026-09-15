# Linear Theme Builder and internal Theme Editor

## Direct conclusion

Linear uses two related tools with different audiences:

- The **user-facing Theme Builder** is a personalization feature. A user chooses a small set of inputs—currently described as base UI color, accent color, and contrast—and Linear derives a coherent theme instead of asking the user to edit every token.
- The **internal Theme Editor** shown in the supplied screenshot is a design-system workbench inside Linear's developer toolbar. It adds per-token LCH controls, immediate in-product evaluation, shareable recipes, and JSON export to Figma.

The important idea is not the editor UI itself. It is the generation model: semantic surfaces, text, icons, controls, selected states, focus states, menus, and elevated subtrees are derived from a few coherent inputs rather than tuned as unrelated hex values.

## What Linear explicitly states

### Why it exists

- Linear already let users build custom themes by selecting base UI and accent colors and adjusting contrast. The 2026 refresh changed the shipped light and dark palettes, so the team also needed a faster way to iterate on those defaults. [Linear, “A calmer interface for a product in motion”](https://linear.app/now/behind-the-latest-design-refresh)
- Their previous loop—Figma mockup, PR, preview build, review, repeat—was “painfully slow.” They therefore built the color tool directly into Linear's developer toolbar. [Linear, “A calmer interface for a product in motion”](https://linear.app/now/behind-the-latest-design-refresh)
- The palette goal was to move away from the old cool blue cast toward a warmer, less saturated gray while remaining crisp; Linear explicitly notes that moving too warm can make the interface muddy. [Linear, “A calmer interface for a product in motion”](https://linear.app/now/behind-the-latest-design-refresh)

### Inputs and generated output

- Linear's theme-generation system defines a theme from **base color, accent color, and contrast**, instead of separately defining 98 variables. It uses LCH to generate aliases for surfaces, text, icons, and controls across different elevations such as backgrounds, foregrounds, panels, dialogs, and modals. [Linear, “How we redesigned the Linear UI (part II)”](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Contrast is a first-class input, including support for very high-contrast themes for accessibility. [Linear, “How we redesigned the Linear UI (part II)”](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Linear now describes the implementation as deriving **more than one hundred color variables** from the small input set. It regenerates a theme for selected rows, focus, menus, and elevated surfaces, scoped to their subtrees through nested `ThemeProvider`s. [Linear, “Styling Linear for the future with StyleX”](https://linear.app/now/styling-linear-for-the-future-stylex)

### How designers and engineers use it

1. Start from base UI color, accent color, and contrast—the same capabilities available in the user-facing builder.
2. In the internal tool, adjust the hue, chroma, and lightness of individual semantic design tokens while viewing the result in the real application.
3. Let anyone at Linear try combinations and share a preferred “recipe,” widening dogfooding beyond the design-system authors.
4. Once a palette is accepted, copy its token values as JSON and import them into Figma through an internal plugin, aligning the implemented interface with the design system.

These steps are stated in [“A calmer interface for a product in motion”](https://linear.app/now/behind-the-latest-design-refresh).

For end users, custom themes live under account preferences; Linear documents choosing presets or creating a custom theme there. [Linear Docs, “Preferences”](https://linear.app/docs/account-preferences)

## What the supplied screenshot shows

The following observations come from the screenshot and should not be treated as claims made in the article text:

- `Base Theme Input` contains `Base Color`, `Accent Color`, and `Contrast`; the two colors are represented in LCH.
- `Derived Themes` exposes at least `Elevated` and `Menu`. Each has a color preview plus `L` and `C` numeric controls.
- `Color Tokens` groups tokens semantically; the visible `Background (9)` group contains examples such as `bgBase`, `bgBaseHover`, and `bgSub`.
- Each visible token shows a swatch and computed hex output. Some rows also show `L` and `C` adjustments.
- `Reset` and `Copy All` suggest rapid experimentation and complete-value export.

### Reasonable inferences from the screenshot

- `Elevated` and `Menu` appear to be derived subthemes rather than independent palettes. Their `L` and `C` fields likely adjust the base recipe for those surface contexts.
- The token rows appear to combine generated defaults with targeted relative overrides, while showing the resolved color for inspection.
- No visible hue field on the derived-theme rows may mean hue is inherited from the base color, but the screenshot alone does not prove that rule.
- The screenshot does not establish the exact formulas, allowed ranges, validation rules, persistence format, or whether every field is editable.

## Implication for Lenso UI

A useful first version for Lenso UI would be an **internal/docs theme workbench**, not necessarily an end-user product feature. Its job would be to make the existing semantic theme contract observable and tunable as one system:

- choose base neutral, accent, and contrast;
- derive the entire surface hierarchy, including canvas, panel, control, elevated, menu/popover, dialog, hover, selected, and borders;
- preview representative components and full layouts in light and dark modes;
- show accessibility contrast and gamut warnings;
- export the resolved semantic token set for code and Figma.

This directly addresses the current surface-color problem: dark-mode surfaces should be evaluated as one generated palette, not corrected overlay by overlay. A public user-facing builder would only become necessary if a Lenso product explicitly supports customer or workspace personalization.

## First-party sources

- [A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh)
- [How we redesigned the Linear UI (part II)](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Styling Linear for the future with StyleX](https://linear.app/now/styling-linear-for-the-future-stylex)
- [Preferences — Linear Docs](https://linear.app/docs/account-preferences)
- [Custom Themes — Linear Changelog](https://linear.app/changelog/2020-12-04-themes)
