# Shared inherited API tables

The `06632dc` docs deployment failed because Autocomplete HTML exceeded
Cloudflare Pages' 25 MiB file limit. This follow-up changes presentation only:
each public part retains its signature, own properties, callback states and
existing anchor. Identical inherited property-record sets refer to one shared,
complete server-rendered table.

Grouping uses canonical property IDs, not names or shortened type strings.
Different event types, requiredness, defaults, descriptions and source records
therefore remain distinct. No loader, runtime service or client-only API view is
introduced. The native links and disclosure controls are intended to work without
JavaScript; browser confirmation is still pending as described below.

## Current evidence

Node 26.10.0, pnpm 12.9.1; current attached source and rebuilt docs.

- The initial projection tests reproduced 23 repeated inherited tables instead of
  five distinct sets. Both failing deduplication tests now pass.
- Eight focused tests passed, including actual Autocomplete data, all 84 families,
  same-name/different-type records, missing references and filesystem size limits.
- Autocomplete inherited rows: 6,243 repeated rows become 1,383 rows across five
  shared tables. Every part still maps back to all its original property records.
- Production docs build/typecheck/export passed: 309 routes, 3,269 files.
- The post-export gate checked every file, including nested JS and JSON, against
  the hosting limit. Its unit tests cover the exact boundary and one byte over.
- The API reference, shared docs/CLI/MCP contract and authored docs index all
  retain exactly their pre-change SHA-256 hashes.
- Scoped lint/format passed, including the maintained browser entrypoint.
- The full `pnpm check` and production Storybook build passed for this follow-up.
- `packages/primitives` is unchanged.

| Autocomplete HTML |           Before |            After |
| ----------------- | ---------------: | ---------------: |
| EN                | 26,860,707 bytes | 17,051,668 bytes |
| CN                | 27,150,953 bytes | 17,362,482 bytes |

The largest exported file is now 16.56 MiB. This fixes the hosting rejection,
but does not claim that a large scenario/API page is fully performance-optimized.

## Production browser confirmation

`test/api-shared-properties.browser.mjs` passed four EN/CN cases with JavaScript
enabled/disabled: EN at desktop width, CN at phone width. It verifies original
part anchors, exact shared-table mapping, native keyboard navigation/toggling,
full native type text and overflow. Each case contains exactly five inherited
tables and 1,383 inherited rows. No page errors occurred.

The existing `test/native-api.browser.mjs` passed all 16 API/clipboard cases.
The normal `pnpm --filter @lenso/ui-docs test:browser` passed against the same
new production export. Only the managed server started by this run was stopped.

An earlier attempt could not start because Delta failed to materialize the
worktree. After recovery, the maintained entrypoints ran successfully; the
initial failure was not counted as browser evidence.

Ignored build logs and before/after hash records are under
`test-results/docs-api-size/`; final repository-gate logs are under
`test-results/land-api-size/`. These are pre-land validation results. Candidate CI
and deployment outcomes must be verified for the subsequently signed commit.
