# @lenso/design-lint

`@lenso/design-lint` is a small, independently publishable design-contract
linter for React + StyleX. The first release has one adapter: StyleX. It adds
organization policy on top of
[`@stylexjs/eslint-plugin`](https://stylexjs.com/docs/api/configuration/eslint-plugin);
the official plugin remains responsible for StyleX property/value validity,
shorthands, ordering, compiler syntax, and its own autofixes.

The CLI requires Node `22.0.0` or newer because it uses
`node:fs/promises.glob`. The package's `prepublishOnly` hook builds the
published `dist` files from a fresh checkout.

The parser runtime is pinned to TypeScript `5.9.3`, separately from the
workspace's TypeScript 7 toolchain, because the public legacy compiler API used
for this standalone source adapter is not exposed from the TypeScript 7
package.

## Install and run

```bash
pnpm add -D @lenso/design-lint @stylexjs/stylex @stylexjs/eslint-plugin
pnpm exec design-lint --config design-lint.config.json
```

The CLI accepts JSON or ESM `.js`/`.mjs` configuration (the module's default
export):

```json
{
  "adapter": "stylex",
  "files": ["src/**/*.tsx", "src/**/*.ts"],
  "stylex": {
    "validImports": ["@stylexjs/stylex", "stylex"]
  },
  "tokens": {
    "source": "./generated/token-contract.json",
    "imports": ["@lenso/tokens/tokens.stylex"],
    "families": {
      "color": {
        "tokenPrefixes": ["color."],
        "properties": ["color", "backgroundColor", "borderColor"],
        "allowLiterals": ["transparent", "currentColor"]
      },
      "spacing": {
        "tokenPrefixes": ["space."],
        "properties": ["gap", "padding", "paddingInline", "margin"],
        "allowLiterals": [0, "0", "auto"]
      },
      "radius": {
        "tokenPrefixes": ["radius."],
        "properties": ["borderRadius"],
        "allowLiterals": [0, "0", "inherit"]
      }
    }
  },
  "components": [
    {
      "source": "@lenso/ui/button",
      "export": "Button",
      "ownedXstyleProperties": ["color", "backgroundColor", "paddingInline"],
      "allowedXstyleProperties": ["width", "marginInline"],
      "guidance": "Use Button's `variant` or `size` props for visual changes."
    }
  ]
}
```

Paths in `tokens.source` and `files` are relative to the configuration file.
Command-line file arguments are relative to the current working directory.
`tokens.source` accepts the Lenso generated contract shape
(`defaultContext`, `contexts`, and optional `primitives`) and nested DTCG
objects containing `$value` and inherited `$type`. The linter reads generated
values; run the token generator first when the DTCG authority changes. The
repository's `pnpm design-lint` command checks generated-token freshness before
running this package.

The CLI prints `path:line:column`, rule id, property, authored value, and a
correction path. It exits `1` for error diagnostics and `2` for configuration
or input errors. `--format json` (or `--json`) returns diagnostics and skipped
entries as machine-readable JSON. There are no autofixes: changing a token or
component override can change semantics.

## Rules and proof boundary

- `design/color-literal` rejects raw color literals in configured color
  properties. Hex, RGB/HSL-like functions, common named colors, and
  `transparent`/`currentColor` are recognized; explicit `allowLiterals`
  exceptions are configuration policy.
- `design/spacing-literal` and `design/radius-literal` reject numeric and
  dimension literals in configured properties, including values inside
  StyleX conditional objects. When both the authored value and token values
  can be parsed, nearest candidates are sorted by numeric/color distance and
  token path.
- `design/wrong-family-token` catches a known token reference from the
  configured StyleX token module when its canonical token path belongs to the
  wrong configured family.
- `component/owned-xstyle` rejects locally provable owned properties passed to
  a declared component through `xstyle`. `allowedXstyleProperties` is an
  allowlist: properties in neither list get `component/undeclared-xstyle`.
  Owned-property diagnostics point to the component's variants/size guidance.

Version one resolves only direct StyleX namespace imports, named
`create` aliases, configured token imports, local style namespace aliases,
conditional values, arrays, ternaries, and `&&`/`||`/`??` branches. It does
not claim coverage for arbitrary alias/data-flow analysis, nested lexical
shadowing, function parameters, destructured bindings, cross-file style
composition, computed style access, spreads, or dynamic StyleX functions.
File-level StyleX declarations are analyzed; a shadowed nested declaration is
skipped rather than guessed.
Unknown or dynamic component `xstyle` expressions are returned in `skipped`
and summarized by the CLI instead of being silently treated as safe. Set
`unresolved: "warn"` to also emit non-blocking warning diagnostics for each
skipped composition; the MVP keeps skipped composition non-blocking by default.

Use this package alongside the official StyleX ESLint plugin rather than
replacing it:

```json
{
  "rules": {
    "@stylexjs/valid-styles": "error",
    "@stylexjs/no-unused": "error",
    "@stylexjs/valid-shorthands": "warn",
    "@stylexjs/sort-keys": "warn"
  }
}
```

Programmatic consumers can import `defineConfig`, `loadConfig`, `lintFiles`,
and `runDesignLint` from `@lenso/design-lint`.
