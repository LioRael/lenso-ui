# Dependency refresh and Highlights migration

Updated stable dependencies checked on November 10, 2026, including Fumadocs
Core/UI 16.18.4, MDX 15.5.3, Next 16.4.6, Vite 8.3.7, Storybook 10.6.6,
Playwright 1.65.0, and format/lint/build tooling. Babel stays on 7.x to match
the existing StyleX integration; migration to Babel 8 is outside this refresh.

Fumadocs offers an optional Highlights adapter; Shiki remains its default.
[Upstream ff83733](https://github.com/fuma-nama/fumadocs/commit/ff837337aca13c42a859b507f31461584c56a87b)
broadens the optional peer range rather than changing the default.

Site MDX now explicitly selects `createHighlights` with
`rehypeCodeFromHighlighter`. Shared server and deferred browser source renderers
use `@pierre/highlights` 0.5.0 directly. GitHub light/dark themes, numbered lines,
plain-text fallback and copying remain supported. The `--shiki-*` variables are
retained as the CSS compatibility format. Shiki remains installed for Fumadocs
compatibility; standalone Shiki grammar/theme dependencies were removed.

The public `highlightSource` API is unchanged. Consumers reusing the site's MDX
configuration must install Highlights alongside Fumadocs. Languages are built in;
live source no longer downloads individual Shiki grammars.

## Validation

- Frozen offline installation, workspace typechecks, lint, package builds,
  documentation site and Next documentation starter production builds, the full
  workspace test run, and stylesheet/static-export checks passed.
- Repository: 76 tests passed. Documentation framework: 71 passed. Site: 98 passed.
  Production stylesheet/static-export checks: 2 passed.
- Chromium revision 1248 and WebKit revision 2370 passed bilingual MDX hydration,
  code colors in both themes, copying, development isolation and deferred source
  highlighting/loading budgets with Playwright 1.65.0 and explicit executable
  paths. Downloads of its matching browsers stalled. These checks do not cover
  the newly bundled browser revisions or a physical iPhone.
- Loading-budget coverage now ignores redirect response bodies and recognizes
  Highlights requests when checking that offscreen source stays deferred.
