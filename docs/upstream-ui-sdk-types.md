# UI SDK strict declaration compatibility

## Current support policy: beta.8

The workspace pins `@ui-sdk/core` and `@ui-sdk/react` to `0.1.0-beta.8`.
`packages/primitives` restores `exactOptionalPropertyTypes: true`; its inherited
`strict: true` and explicit `skipLibCheck: false` remain enabled. No dependency
patch, runtime compatibility layer or compiler suppression is added. Other
workspace compiler configurations remain unchanged.

The installed-consumer regression checks actual packed primitive declarations
with all three settings above, including SDK `createParts` use of the exported
core definitions. The normal complete candidate CI still must pass before
landing or publication.

This support is scoped to `@lenso/primitives`, not the full `@lenso/ui` package or
every SDK component. Beta.8 still reproduces two separate exact-optional errors:

- React Tooltip's `shortcut.present` can explicitly be `undefined`, but the
  `SlotFields` constraint does not allow that (TS2344 in `tooltip.d.ts`). Lenso's
  Tooltip imports this SDK component.
- `createPreference()` returns `storage: ValueStorage | undefined`, while
  `PreferenceLike` requires `storage?: ValueStorage`. Passing the result to
  React `Preferences` fails with TS2375 in consumer source. `skipLibCheck` alone
  cannot hide this source-level error.

## Beta.8 verification: 2026-11-18

On macOS, a copy of the primitives source using the official beta.8 packages
passed strict typechecking (453 files), JavaScript/declaration builds and all
14 existing tests. Installing its real tarball into a separate consumer passed
both Bun and TypeScript checks with `exactOptionalPropertyTypes: true` and
`skipLibCheck: false`, including all primitive entries and custom renderer calls.
The installed package also passed a core state-change and React SSR smoke check.

The two remaining SDK errors above were reproduced with both Bun and TypeScript;
the same probe passed with only `exactOptionalPropertyTypes` disabled. These
checks justify restoring the primitive setting, not broadening the full UI
package's supported compiler configuration.

Upstream [#488](https://github.com/vercel-labs/ui/issues/488) was closed by
[#754](https://github.com/vercel-labs/ui/pull/754), which adds `| undefined` to
`Primitive.options` and `WithFeatures.options`. Beta.8 includes that fix. It
removes the factory/renderer constraint mismatch described below.

## Historical temporary policy: 2026-11-14

The owner authorized `exactOptionalPropertyTypes: false` for primitives while
retaining `strict: true` and `skipLibCheck: false`. Restoration required an
official SDK release to pass the strict primitive typecheck/build and a real
packed-consumer check with exact optional properties and library checking
enabled. Beta.8 passed those checks; the workaround is no longer needed for
primitives. The investigation below records the earlier beta.1/beta.2 behavior.

## Historical investigation before the temporary policy

Affected packages: `@ui-sdk/core` and `@ui-sdk/react` `0.1.0-beta.1`.

With `exactOptionalPropertyTypes: true` and `skipLibCheck: false`, generated SDK
declarations fail their `Primitive` constraint with TS2344. The constraint has
`options?: Record<string, PropSpec>`; generated primitives expose an `options`
property whose value can explicitly be `undefined`.

A clean file importing only `Button` from `@ui-sdk/react/button` reproduces 11
upstream declaration errors. After removing the redundant Command primitive,
the SDK-composed Sidebar reaches the same upstream constraint at `Parts`,
`createParts`, `mount` and `checkServer` call sites. The refactored strict project currently reports 42 diagnostics: 11 in SDK
declarations and 31 at renderer/testing usages and the resulting loss of
inferred state. The declaration-only build reports 20 because test files are
excluded.
All have the same SDK factory/renderer constraint mismatch; the local
locations are usages of that API, not independent implementation failures. A diagnostic run with only exact optional properties disabled
passes all 452 files reached by the primitives project.

Historical reproduction against beta.1:

```sh
bun run --filter @lenso/primitives typecheck
bun run --filter @lenso/primitives build
bun check --no-script -p packages/primitives/tsconfig.json --exactOptionalPropertyTypes false
```

The first command exits 1 and the build exits 2. The last command exits 0 and is
only a diagnostic comparison. It does not replace the strict gate. A minimal
probe should retain `strict: true`, `exactOptionalPropertyTypes: true`,
`skipLibCheck: false`, React JSX, and bundler module resolution.

No SDK files, dependency patches, `patchedDependencies`, or compiler settings
were changed to bypass this issue. Lenso's pre-existing UI/docs checks use their
existing configuration. Their passing results do not establish compatibility
for consumers that check SDK declarations with the stricter options above.

The upstream fix must make the generated primitive type and its `Primitive`
constraint agree under exact optional property checking. Other migration work
and runtime verification can proceed independently. Strict reconstruction and
landing acceptance remain unsuccessful until the upstream issue is resolved.

## Custom primitive call sites

The same constraint also affects `createParts` for SectionIndex and SwipeActions.
After the touch cancellation fix, a diagnostic invocation with only
`exactOptionalPropertyTypes` disabled passes all 452 files in the primitives
project. Its configured strict typecheck and declaration build still fail at
SDK primitive constraints; neither SDK declarations nor project flags were
changed to bypass them.

The installed `definePrimitive` returns `options: Record<string, PropSpec> | undefined`,
while `Primitive` requires `options?: Record<string, PropSpec>`. With exact
optional properties enabled, passing the former to SDK renderer/testing helpers
fails even when the definition supplies an options schema. Sidebar uses public
SDK type annotations for portable declarations; it does not cast the primitive
past this constraint or replace the SDK's metadata.

A separate local testing-helper limitation remains: `checkPattern(...,
"disclosure")` reports a missing `aria-controls` target in the core `mount`
fixture even though `document.getElementById` returns that panel immediately
before the check. Acceptance uses explicit reference, state and focus assertions,
SDK `checkServer`, and Chromium/WebKit interaction checks. The helper result is
not reported as a passing APG audit.

## Release gate recheck: 2026-11-14

The full repository gate still fails in the configured primitives strict typecheck
with 42 diagnostics. The official npm `beta` tag now points to `0.1.0-beta.2`,
while `latest` remains `0.1.0-beta.1`. A separate temporary consumer using the
unmodified official beta.2 tarballs and importing only React Button reproduces
11 declaration diagnostics under the same strict options. Its generated
factory still exposes `options: Record<string, PropSpec> | undefined` against
`options?: Record<string, PropSpec>` in `Primitive`. Therefore beta.2 does not
resolve this release blocker, and this checkout retains its pinned beta.1.
No dependencies, declaration patches, casts or compiler relaxations were applied.
The prepared Lenso 0.11.0 release must not land or publish until its exact candidate
passes the authoritative verification gate, using the current support policy above.
