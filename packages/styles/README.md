# @lenso/tokens

Import `@lenso/tokens/styles.css` once, then use `tokens` from
`@lenso/tokens/tokens.stylex.const` in StyleX declarations. Component-family
StyleX maps are available at `@lenso/tokens/<family>`.

Applications declaring their own StyleX styles must use the build-only
`@lenso/stylex-build` adapter with the exported `@lenso/tokens/stylex-rules.json`
artifact. Pin tooling `0.1.0` and StyleX `0.19.0`; see the tooling package's README
for Vite, Rolldown and Webpack configuration. Package and application raw rules
are processed together, so the same atom keeps a coherent priority rank.
Loading the theme stylesheet before application CSS is not a substitute.
The JSON is versioned, immutable build input, not a browser/runtime entry.

The `.stylex.const` entry is compiler-facing source, not a plain Node runtime
entry. It retains `defineConsts` metadata so an application's StyleX compiler
can substitute public CSS variable references rather than invent undeclared
hashed theme variables. The root package entry provides compiled runtime values.

The default theme is derived from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Its OKLCH values, color mixes,
shadows, scrollbar tokens, field tokens, radii and easing curves are retained.
The upstream Tailwind `@theme inline` declaration is expressed as ordinary
CSS custom properties; no Tailwind runtime or DTCG generator is required.
The sans stack matches Tailwind's default sans stack rather than loading a font.

Light is the root default. `.light`, `.default`, `.dark`, and corresponding
`data-theme` values establish theme scopes, including nested scopes. Shadow
hosts retain upstream support. CSS inheritance cannot cross a portal boundary.
The React package's `ThemeScope` supplies a body-level host with the complete
scoped custom-property environment, preserving local themes without clipping
overlays inside overflow containers. Explicit custom portal containers must
provide their own matching theme environment.
Derived properties are redeclared at theme boundaries to resolve against that
scope's inputs. Override source properties on a theme boundary when customizing.

## Shared theme configuration

The root runtime entry exports `defineTheme`, `themeToCSS`, `themeToVariables`
and immutable `themeTokens` editor metadata. Keys are the existing public CSS
variable names **without** `--`; there is no second token catalog. Metadata
entries contain `{ key, label, category }`, with categories `color`, `length`
and `font-family`. Only source semantic colors, `radius`, `field-radius`,
`border-width`, `field-border-width` and the actual font variable `font-sans`
are editable. Derived hover/soft mixes, radius scales and aliases stay in CSS.
No upstream defaults are copied into the configuration.

```ts
import { defineTheme, themeToCSS, themeToVariables, type ThemeConfig } from "@lenso/tokens";
import "@lenso/tokens/theme.css"; // theme + base, without compiled component atoms

const config = {
  name: "studio",
  light: {
    accent: "oklch(65% 0.18 250)",
    radius: "0.75rem",
    "font-sans": '"Inter", system-ui, sans-serif',
  },
  dark: {
    accent: "oklch(75% 0.14 250)",
    radius: "0.75rem",
    "field-radius": "0.5rem",
    "field-border-width": "1px",
  },
} satisfies ThemeConfig;
const theme = defineTheme(config);
const css = themeToCSS(theme); // both modes; save as CSS or use a style element
const previewStyle = themeToVariables(theme, "light"); // { "--accent": ..., ... }
```

Load the generated CSS after the base theme stylesheet. Consumers using the
precompiled component stylesheet can import `@lenso/tokens/styles.css` instead
of `theme.css`; use the build adapter described above for caller StyleX styles.
Both stylesheets include the necessary default mode and derivation rules.
Apply both attributes on the **same** scope element:

```html
<section data-lenso-theme="studio" data-theme="light">...</section>
<section data-lenso-theme="studio" data-theme="dark">...</section>
```

`themeToCSS` emits selectors matching these attributes. `data-lenso-theme`
selects the configuration; `data-theme` loads the existing light/dark defaults,
including reactive derived mixes. A preview applies `themeToVariables` to that
same mode boundary (for example React's `style` prop), not a descendant without
a mode attribute. When switching modes, replace the inline map rather than
merging it with the previous mode, so omitted overrides do not linger.
Unspecified properties retain CSS defaults/inheritance. Modes do not copy each
other's overrides. Setting `radius` updates derived radii and the default field
radius; an explicit `field-radius` remains independent. A supplied font stack
does not download or load fonts. Portal containers still need a matching theme
environment as described above.

### Validation boundaries

All three functions validate through the same path and throw `TypeError` for
unsupported configuration. `defineTheme` returns a frozen copy with both modes
(omitted modes become empty objects); inputs are not mutated. Inline maps and
metadata are also frozen. Names must start with an ASCII letter, then contain
only ASCII letters, digits, `_` or `-`, up to 64 characters.

Values use a deliberately bounded CSS subset, supported in Node and browsers:

- Colors: hex, `transparent`, `currentColor`, `black`, `white`, `red`, `green`,
  `blue`; numeric `oklch`, `oklab`, `lch`, `lab`, `rgb`/`rgba`, `hsl`/`hsla`,
  `hwb`; `var(--name[, fallback])`; and nested `color-mix` with two colors and
  optional percentages. Modern space-separated channels and slash alpha are
  supported, as are legacy comma-separated RGB/HSL channels.
- Lengths: nonnegative absolute, font-relative and viewport CSS lengths, unitless
  `0`, `var` with optional supported fallback, and `calc(length-or-var * number)`
  or division by a nonzero number. Percentages and general math expressions are
  intentionally not supported for these geometry properties.
- Font families: comma-separated ASCII family names, optionally single/double
  quoted, or `var` with a supported fallback.

Declaration separators, braces, HTML delimiters, comments, escapes, control
characters, `!important`, URLs and unsupported functions are rejected. Values
are trimmed and limited to 2048 characters. This is not a general CSS parser:
relative colors, `color()`, arbitrary named colors and escaped/non-ASCII font
names are outside the API. Variable existence, cycles, channel ranges,
computed-value validity and browser feature support remain the consumer's
responsibility. Validation does not guarantee contrast or accessibility.

Upstream color fidelity is not a WCAG contrast guarantee. The upstream vibrant
palette explicitly reduces contrast; soft foreground mixtures and accent/status
pairs need contextual contrast review. This package deliberately does not darken
source colors or claim all normal-text pairs pass WCAG AA.

The build includes upstream notices in `dist/third-party/heroui`.
