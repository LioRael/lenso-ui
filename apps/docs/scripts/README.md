# Documentation generation

The documentation app owns its maintained examples, presentation and component
contracts. Retained adaptations are documented in the
[repository's third-party notices](../../../THIRD_PARTY_NOTICES.md).

## Content and build

The current documentation is authored in `content/lenso`, with runnable demos in
`src/demos`. `content/example-catalog.json` records their public names, local
paths and component placements. Generation reads that catalog and the current
component API without fetching upstream content. Retained adaptations and their licenses are identified in the root
`THIRD_PARTY_NOTICES.md`.

`bun run dev:docs` generates development metadata and starts TanStack Start/Vite
against workspace source with hot reload. `bun run --filter @lenso/ui-docs build`
generates site metadata, builds with Vite and checks export size. The app uses
the StyleX integration and shared token styles. See `CONTRIBUTING.md` for
development and production verification requirements.

## Extend live demos

1. Implement the example in `src/demos/en/<family>/<example>.tsx` using the
   local `@lenso/ui` contract and StyleX. Keep one named exported demo per file
   and preserve attribution when adapting retained source.
2. Add the public scenario name and local path to `content/example-catalog.json`
   for each locale, and add it to the corresponding component page's previews.
   Unregistered files are not exposed as examples.
3. Add the matching `src/demos/cn/<family>/<example>.tsx` for Chinese placement.
   `src/demos/localized-manifest.json` contains only explicit `cn` exceptions:
   a different Chinese path or intentional reuse of the matching English module.
   Missing Chinese counterparts remain labelled English fallbacks. These local
   files have no byte-level pins or duplicate English inventory.
4. Run `bun run generate` from `apps/docs`. It derives `src/demos/live-manifest.json`
   and the independently loaded `src/demos/generated.ts` registry. Do not edit
   either generated file. English placement comes from the local catalog.
5. Typecheck and build against the rebuilt sibling packages. A registry entry
   alone does not prove runtime parity.

## Generation

`bun run generate` is the incremental entrypoint for the native API, local registry,
authored component pages and index, shared contract, and search. Development and
build scripts select their generation targets explicitly; typecheck reads
existing generated artifacts. Prepare a fresh checkout as described in
`CONTRIBUTING.md` before running package checks.

The same entrypoint exposes `generate:api`, `generate:content` and
`generate:contract` for task dependencies and contract consumers. Each includes
its prerequisites. Contract generation does not generate search or run
the site compiler. Per-stage input and output fingerprints live in ignored `.cache/`; a warm
stage does no work, missing/changed outputs are repaired, and failed generation
is never cached. Generated component MDX is excluded from its producer's inputs.

`typecheck:scripts` checks the orchestration, registry and their TypeScript
tests. Scripts run with Bun.

The source viewer reads the **local live module** and its relative helpers.
A registry entry establishes placement, not proof of complete runtime behavior;
verify the interaction being claimed.

Ordinary APIs use native Base UI contracts. Dates, time, and color use explicit
local specialized parts: e.g. `DateField.Label`, rather than the unrelated
`Label`. Native Tabs indicators are List siblings, not children of every Tab.

## Verification

From the repository root:

```sh
bun run --filter @lenso/ui-docs test
bun run --filter @lenso/ui-docs typecheck:scripts
bun run --filter @lenso/ui-docs test:stylex-artifacts # after a production build
```

Automated tests use Bun and a simulated DOM. Review rendered behavior manually when required; the automated checks do not establish layout or visual parity. See `CONTRIBUTING.md` for production acceptance and the candidate gate.
