# @lenso/cli

Initial `0.1.0`, unpublished. Node `24.18.0` is the tested runtime.

Build with `npm run build` only after the shared production contract exists.
The build validates and copies that exact artifact, bundling the private
validator, queries and consumer policy parser. Installed execution needs neither
the monorepo nor React, Next or a TypeScript/StyleX compiler.

Contract format 2 is required; format 1 is rejected. Startup validates the
encoded contract once. Documentation and source are resolved on demand through
the shared private core, without retaining an expanded corpus. Search stops at
its result bound and resolves at most one document at a time.

`lenso --help` is the command source. `docs` emits exact authored Markdown;
`info` resolves native property row IDs; `metadata` reports the release and
digest. Only canonical family slugs and public part names are accepted.

`check` reads source in consumer mode and reports policy, compatibility and
static setup hints. It does not prove browser CSS delivery or execute configs.
Symlinks and oversized/unresolved sources are reported as skipped, never followed.

`init` plans changes without writing. `--write` applies only a conflict-free,
still-current plan. It preserves package fields, refuses incompatible dependency
pins, complex scripts and user-owned config, and tracks generated-file hashes.
Edited generated files become user-owned. Helpers seed actual raw-rule metadata
and theme CSS; import the theme helper from your rendering entry/layout yourself.
It never installs dependencies or executes project scripts. An I/O failure during
application may leave a partial write; review the printed plan and filesystem
before retrying.

Imported snippets are reference source, not evidence of live demo coverage.
