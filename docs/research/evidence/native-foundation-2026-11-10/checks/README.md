# Local checks

Toolchain: Bun 1.4.4 and Node 26.10.0. Final affected checks passed:

- `bun install --frozen-lockfile` — no lockfile changes.
- `bun run format:check` and `bun run lint` — repository checks passed.
- `bun run source:check` — interaction ownership boundary passed.
- `bun run --filter @lenso/ui-native typecheck` — 26 files, no errors.
- `bun run --filter @lenso/native-example typecheck` — 21 files, no errors.
- `bun run --filter @lenso/ui-native test` — 9 passing tests, 128 assertions.
- `bun run --filter @lenso/ui-native generate:check` — consistent. Bun reports
  its existing moduleSuffixes support warning; package/example typechecks use their
  explicit configuration and the actual platform bundles were independently exported.
- Expo production Hermes exports — iOS and Android passed, 650 modules each.
- React Doctor full package scan — 92/100 with one pre-existing generator warning;
  full example scan — 100/100. The introduced context warning was corrected.
- `git diff --check` — clean. Preserved primitives have no diff from the base.

The first default npm-based Doctor invocation could not resolve workspace catalog
overrides. Bun's isolated runner succeeded without changing repository dependencies.
The full package scan includes new source; the earlier tracked-diff-only score is
not presented as whole-package acceptance.

These local checks supplement the signed exact-SHA candidate's repository workflow.
Neither repository CI nor the JS export steps claim native application compilation;
the actual native builds and simulator/emulator operations have separate receipts.
