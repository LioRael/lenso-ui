# UI SDK strict declaration compatibility

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

Reproduce against the installed release:

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
passes the authoritative verification gate.
