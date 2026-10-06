# @lenso/ui-cli

`@lenso/ui-cli@0.1.0` is private and unpublished. Its current runtime requires Node `26.10.0` or a later Node 26 release.

## Maintainer build

Build with `npm run build` only after the shared production contract exists.
This maintainer-only step validates and copies that exact artifact, bundling the
private validator, queries and consumer policy parser. Installed execution needs
neither the monorepo nor React, Next or a TypeScript/StyleX compiler.

Source, build scripts and tests are strict TypeScript. `dist/cli.js` is the
compiled ESM entrypoint; installed execution does not require `tsx` or `tsc`.

Contract format 3 is required; older formats are rejected. Startup validates the
encoded contract once. Documentation and source are resolved on demand through
the shared private core, without retaining an expanded corpus. Search stops at
its result bound and resolves at most one document at a time.

`lenso-ui --help` is the command source. `docs` emits exact authored Markdown;
`info` resolves native property row IDs; `source`, `styles`, `examples` and
`theme` return matching source graphs, StyleX maps, example graphs and raw scoped
theme declarations. `search` queries authored documentation; `metadata` reports
the release and digest. Only canonical family slugs and public part names are
accepted. Source references do not embed third-party dependency implementations,
and theme values are CSS expressions, not fabricated computed colors.

`check` reads source in consumer mode and reports policy, compatibility and
static setup hints. It does not prove browser CSS delivery or execute configs.
Symlinks and oversized/unresolved sources are reported as skipped, never followed.

`doctor` adds Node compatibility and installed-package resolution/version evidence
without executing package entrypoints or repairing files. Its result is still
not browser proof.

`init` plans changes without writing. `--write` applies only a conflict-free,
still-current plan. It preserves package fields, refuses incompatible dependency
pins, complex scripts and user-owned config, and tracks generated-file hashes.
Edited generated files become user-owned. Helpers seed actual raw-rule metadata
and theme CSS; import the theme helper from your rendering entry/layout yourself.
It never installs dependencies or executes project scripts. An I/O failure during
application may leave a partial write; review the printed plan and filesystem
before retrying.

These project writers check ordinary stale preimages, linked paths and file
ownership. They are not a filesystem sandbox or a guarantee against adversarial
concurrent parent-directory replacement. Apply plans only while the target
project's directories are trusted and stable.

`install`, `upgrade` and `uninstall` plan manifest changes from the same contract,
not a remote latest release. They do not run a package manager. Install refuses
incompatible existing pins; upgrade touches only existing managed entries;
uninstall preserves user-owned config/source and shared StyleX dependencies.
Review the reported manual package-manager and CSS/import followup steps. Private
candidate packages are not currently available from the registry.

`agents-md` prepares exact local documentation, an index and a delimited
reference block in `AGENTS.md`, preserving authored text outside the block.
`skills` prepares the two bundled project-local workflow directories, references
and licenses. Both are dry-run by default; `--write` applies a still-current
conflict-free plan using the same ownership protections. Neither writes global
agent configuration, downloads skills or activates an agent host.

Imported snippets are reference source, not evidence of live demo coverage.
