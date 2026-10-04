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

Upstream color fidelity is not a WCAG contrast guarantee. The upstream vibrant
palette explicitly reduces contrast; soft foreground mixtures and accent/status
pairs need contextual contrast review. This package deliberately does not darken
source colors or claim all normal-text pairs pass WCAG AA.

The build includes upstream notices in `dist/third-party/heroui`.
