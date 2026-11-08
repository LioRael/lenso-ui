# @lenso/tokens

Import `@lenso/tokens/styles.css` once, then use `tokens` from
`@lenso/tokens/tokens.stylex.const` in StyleX declarations. Component-family
StyleX maps are available at `@lenso/tokens/<family>`.

Compile package and application declarations together with the official StyleX
integration: `@stylexjs/unplugin` for Vite/Rolldown, or Babel and PostCSS for
Next. The package ships JS modules with relative constant imports preserved.
Include this package's `dist/**/*.js` in PostCSS scans and list `@lenso/tokens`
in Next's `transpilePackages`.

`styles.css` and `theme.css` contain theme/base CSS, not separately ranked atomic
styles. The application compiler owns atomic CSS generation. All declaration
modules, including the `.stylex.const` export, pass through that compiler for
client and server builds. Plain uncompiled Node imports of maps are unsupported.

The single semantic theme uses the supplied iOS/iPadOS 27 Figma colors and
Elevated backgrounds. Missing increased-contrast, placeholder and system-link
roles temporarily use documented UIKit 26.5 samples; missing Web states retain
explicit Lenso recipes. These fallbacks are not iOS 27 native certification. Lenso adds
paired foregrounds, readable status text, control boundaries and focus roles.
`src/apple-colors.ts` and `src/color-system.ts` generate the theme CSS, editable
metadata and StyleX references. Run `bun run generate:theme --check` in this package to check drift.
Color source data and per-cell provenance are retained in `tests/fixtures/apple-color-evidence/`.

Material geometry, optical paints and motion remain internal recipes with their
upstream notices. They are not another editable palette. Legacy color aliases
are removed.

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
and immutable `themeTokens` editor metadata. Keys omit the `--lenso-` prefix.
Metadata entries contain `{ key, label, category }`. Colors, `shape-content`,
`shape-field` and `font-body` are editable; optical recipes and native source
swatches are not. Use `tintOverrides` to derive a fill and its foreground pair.

```ts
import {
  defineTheme,
  themeToCSS,
  themeToVariables,
  tintOverrides,
  type ThemeConfig,
} from "@lenso/tokens";
import "@lenso/tokens/theme.css"; // theme + base, without compiled component atoms

const config = {
  name: "studio",
  light: {
    ...tintOverrides([0.1, 0.4, 0.9], "light"),
    "shape-content": "0.75rem",
    "font-body": '"Inter", system-ui, sans-serif',
  },
  dark: {
    ...tintOverrides([0.3, 0.6, 1], "dark"),
    "shape-content": "0.75rem",
    "shape-field": "0.5rem",
  },
  lightIncreased: tintOverrides([0.1, 0.4, 0.9], "light", "increased"),
  darkIncreased: tintOverrides([0.3, 0.6, 1], "dark", "increased"),
} satisfies ThemeConfig;
const theme = defineTheme(config);
const css = themeToCSS(theme); // modes and contrast variants; load after the default stylesheet
const previewStyle = themeToVariables(theme, "light"); // { "--lenso-tint": ..., ... }
```

Load the generated CSS after the base theme stylesheet. `styles.css` and
`theme.css` both contain the default mode and derivation rules. Atomic component
and caller styles are compiled together by the application.
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
other's overrides. `shape-content` and `shape-field` are independent. Use `lightIncreased` and
`darkIncreased` for contrast-specific overrides; `themeToCSS` handles the system
preference and `data-contrast="standard|increased"`. `ThemeScope` also accepts
`contrast` and `level="base|elevated"`. A supplied font stack
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

Native color fidelity alone is not a contrast guarantee. Supplemental text roles
are checked against the sampled opaque backgrounds. Custom overrides,
translucent content and arbitrary backgrounds require contextual checks.
The build preserves upstream license notices.
