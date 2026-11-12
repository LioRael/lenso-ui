# Exact experiments — retired on 2026-11-13

The owner paused the Exact direction and requested removal of the active Exact
UI, primitives and documentation implementations. This is an archive of an
unfinished experiment, not a released or fully accepted component library.
The ordinary Lenso UI, primitives, documentation and Glass work is retained.

## Recovery point

All tracked and previously untracked, non-ignored workspace changes were committed
before removal:

- Checkpoint: `767da483ad146939cdb9c1dccbdae0c45168ec49`.
- Local recovery branch: `archive/exact-2026-11-13`.
- The checkpoint includes the other UI/Docs/Glass work present at that time.
- This operation makes local commits only; nothing is pushed or published.

Inspect or resume in a separate checkout, preserving the current main tree:

```sh
git worktree add --detach ../lenso-ui-exact-resume 767da483ad146939cdb9c1dccbdae0c45168ec49
cd ../lenso-ui-exact-resume
bun install --frozen-lockfile
```

Create a research branch there when development is resumed. The snapshot's
original package manifests, lockfile, source, tests, SDK pins and runnable
examples remain in Git; this archive intentionally retains records rather than
active packages or build entry points.

## Removed active paths

- `packages/ui-exact` — `@lenso/ui-exact`.
- `packages/primitives-exact` — `@lenso/primitives-exact`.
- `experiments/exact-docs` — the Exact documentation experiment.
- `experiments/glass-comparison` — the comparison runner depended on Exact UI;
  its report, numerical results and screenshots remain here.

The workspace lockfile was regenerated after removal. The original React
`packages/primitives`, regular UI, maintained Docs and independent Glass research
are retained.

## Preserved records

- [Exact UI coverage and remaining gates](ui-exact/COMPONENTS.md).
- [Exact UI architecture and APIs](ui-exact/README.md).
- [Exact primitives baseline and limitations](primitives-exact/VERIFICATION.md).
- [Exact Docs research](exact-docs/README.md).
- [Glass comparison report and captures](glass-comparison/REPORT.md).
- [Primitive migration history](../../plans/exact-primitives-migration.md).
- [Upstream performance evidence](../../research/exact-performance-evidence-2026-11-10.md).
- [Local Web Glass prototype](../../research/exact-glass-web-prototype-2026-11-10.md).
- [Machine-readable archive record](archive.json).

At retirement, the 99-family Web inventory recorded 12 families with Web behavior
verification, 71 Partial and 16 Pending. The 12 still had broader delivery gates;
these counts are not a percentage-complete claim. Kbd/Typography retained the
owner-accepted gaps of the unmodified SDK. CalendarYearPicker was in progress;
its final selected-year color correction had not completed final compiled browser
acceptance. Exact iOS/Android UI adapters were not implemented.

Historical test counts, browser receipts, benchmark results and source hashes
apply only to their stated cohorts. They do not establish current compatibility,
completion or a final green build of the checkpoint. Temporary external SDK
archives/builds are not guaranteed to remain available.

## Local caches and acceptance material

The complete retired directories, including ignored build caches and acceptance
material, were moved intact to:

`/Users/leosouthey/Projects/framework/.archives/lenso-ui-exact-20261113`

This is a local backup, outside Git and the active workspace. It retains roughly
19 GB of existing local material. Git contains the recovery point and the records
in this directory; it does not contain ignored caches. Reinstall dependencies
when restoring source rather than assuming archived dependency links still work.
