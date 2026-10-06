# Configure one Lenso theme

Adapted from HeroUI's semantic CSS-variable theming guidance. Modified for
Lenso's typed theme and scope APIs; see [provenance](../NOTICE.md).

Read the matching authored theming guide and `@lenso/tokens` exports. The theme
stylesheet supplies defaults and derived values; load it from the actual
rendering document before adding overrides.

## Choose the supported surface

- Shared semantic overrides: `defineTheme`, `themeToVariables`, `themeToCSS`.
- Theme editor inputs: derive keys/categories from `themeTokens`.
- Local component presentation: use its exported parts and `xstyle`.
- Scoped component/portal rendering: use `ThemeScope`.

A basic application composition is:

```tsx
import { defineTheme, themeToVariables } from "@lenso/tokens";
import { ThemeScope } from "@lenso/ui";
import "@lenso/tokens/styles.css";

const theme = defineTheme({
  name: "studio",
  light: { accent: "oklch(0.55 0.18 270)", radius: "0.625rem" },
  dark: { accent: "oklch(0.75 0.15 270)" },
});

<ThemeScope theme="light" data-lenso-theme={theme.name} style={themeToVariables(theme, "light")}>
  {/* Application components */}
</ThemeScope>;
```

For generated CSS, load `themeToCSS(theme)` after the default stylesheet. Put
`data-lenso-theme` and the matching `data-theme` on the same intended scope.
Replace the inline variable map when switching modes so omitted overrides return
to their defaults.

## Keep the source of truth

Use public CSS names without `--` in typed overrides. Leave derived hover/soft
mixes, radius scales and aliases in the theme CSS. Retrieve the current editable
keys rather than maintaining another token inventory or copying default values.
Treat background and `-foreground` variables as a pair; preserve distinct
accent, surface, muted and status roles instead of using one raw color everywhere.
The font source key is `font-sans`; named font references also need their family
variable and actual stylesheet/font delivery.

Keep a Theme Builder's editable settings, generated palettes and exported CSS
on one validated path. URL state is configuration, not sample application data.
Preserve separate ownership for preview content. Validate imported/shared input
with the existing domain guard before applying it.

## Inspect the rendered result

Exercise both modes, hover/focus states, explicit field radius overrides and a
portalled overlay. Check colors and geometry in computed styles, not just a
serializer string. Changing hue can change contrast: source fidelity and a
working theme selector do not certify WCAG contrast.
