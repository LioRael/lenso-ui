# Private design policy

`checkDesignPolicy({files: [{filename, source}], mode: "library" | "consumer"})`
returns `{diagnostics, skipped}`. Locations use one-based lines and columns.
Diagnostics have stable `ruleId` values and `severity: "error"`; skipped
analysis has a reason, not a passing verdict. There are no fixes.

Library mode restricts React Aria runtime imports to date, time, calendar
and color source families. Consumer mode does not impose the library's
directory convention. Both modes identify removed Lenso imports and
Tailwind runtime imports. Type-only imports are not runtime violations.

The module uses the existing `scripts/source-imports.ts` parser and runtime
reference implementation. It complements oxlint and browser tests; it does not
maintain a reconstruction inventory.

StyleX checks support direct default/namespace import bindings, direct
`.props(...).className` extraction into JSX `className`, and directly bound `xstyle` function
parameters composed before another argument. Shadowed StyleX bindings and
unsupported caller bindings are skipped rather than diagnosed. Aliases,
indirect output flows and computed bindings are not statically certified.
Allowed caller styles, literals, focus behavior and geometry are not banned
or certified.

The small CI adapter prints the same JSON result and fails for diagnostics.
Explicit `--strict` also fails for skipped analysis; ordinary consumer analysis
does not treat unresolved framework modules as proven policy violations:

```sh
node tooling/design-policy/cli.mjs library --strict path/to/component.tsx
node tooling/design-policy/cli.mjs consumer path/to/application.tsx
node --test scripts/source-imports.test.ts tooling/design-policy/index.test.mjs
```

This is private source tooling, not a revived public design-lint package.
