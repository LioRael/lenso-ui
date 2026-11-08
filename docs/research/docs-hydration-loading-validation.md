# Preserve the document during client hydration

## Failure and change

The documentation loader preloaded its asynchronous MDX file before server
rendering. The browser receives serialized loader data, not the server's loaded
module cache. The default client entry began hydration with a fresh document
module promise. The document-wide Suspense boundary could then replace an
already rendered article with `Loading document…`, after its playground had
already shown `Loading interactive controls…`.

`apps/docs/src/client.tsx` now prepares the current document module before
starting React hydration. The server-rendered article remains in the DOM while
that module loads. The existing route loader still prepares documents for
client-side navigation, and the playground retains its own local loading
boundary. There is no new loading overlay, timer or animation.

Only English/Chinese documentation paths enter the preparation branch. Other
paths do not import the document registry through this preparation step.
Canonical aliases use the existing route resolver. If module preparation
rejects, hydration still starts so the existing route error boundary can handle
the error rather than leaving an inert server page indefinitely. The custom
entry retains the default StrictMode and startTransition behavior.

## Rendered regression evidence

A temporary local audit server forwarded the maintained dev application and
inserted a self-removing, read-only DOM observer before client startup. Module
responses were delayed to expose the cold-cache race. The baseline served the
installed TanStack default client entry; the candidate served the custom entry.
The observer did not leave an extra DOM element during hydration.

| Check                                                 | Default entry | Candidate |
| ----------------------------------------------------- | ------------- | --------- |
| Server article initially present                      | Yes           | Yes       |
| Playground loading followed by whole-document loading | Reproduced    | Absent    |
| Initial article heading node removed/replaced         | Yes           | No        |
| Article retained until playground becomes interactive | No            | Yes       |

The baseline trace reads: server article plus local playground loading,
`Loading document…` with no heading, article plus local loading again, then
interactive content. The candidate retains its original heading and never
records the whole-document fallback. A final-code repeat, with only document
body modules delayed, also retains the heading and has no document fallback;
clicking Standalone Add increments its actual counter.

Client-side navigation from GlassContainer to Button and DatePicker retained
the document surface and did not enter the whole-document fallback. The
inspected candidate browser error log was empty.

The first audit also delayed frontmatter requests and deliberately made startup
very slow. Its wall-clock values are stress-fixture timings, not performance
benchmarks. A failed supplementary baseline attempt hit the audit server's
10-second idle limit while the production build was competing for resources;
it is not counted as a product result.

## Production and existing checks

- Docs application and scripts type checks pass: 2,214 and 41 files respectively.
- Affected format and lint checks pass.
- The maintained dev check passes bilingual SSR, API content, metadata, search,
  aliases, theme builder and 404 behavior.
- The normal production docs build and full static export complete successfully.
- Both StyleX artifact/static-export checks pass.
- The actual exported site was served locally with a 900ms delay on the
  GlassContainer MDX chunk. English and Chinese cold-entry checks retained
  the original heading, never showed the document fallback, and completed
  real counter activation. The Chinese document has `lang="zh-CN"`.
- Production navigation to Button also retained the article, and the inspected
  English/Chinese browser error logs were empty.

The saved session artifacts are under `docs-loading/`: initial baseline/candidate
traces, final candidate trace, Button/DatePicker navigation traces, production
English/Chinese traces and representative screenshots. The loading observer's
English playground-text probe does not classify Chinese local loading; the
Chinese check uses heading identity, the global fallback signal and real action
activation. Its generic example-ready selector is not an acceptance signal.

This pass does not establish loading performance on a remote deployment or
cross-engine timing parity. No deployment or publication was performed.

## Scoped delivery gate

- Hard Gate PASS: no new navigation, copy, asset or control was added; English
  and Chinese production pages activate, and the existing SSR/404 checks pass.
- Purpose Gate PASS: the preparation step keeps already rendered content on
  screen instead of hiding a missing browser module behind an article-wide fallback.
- Liveliness PASS: existing ENERGY 1 / RHYTHM 1 / MOTION 2 is retained. No new
  decorative treatment or transition was introduced.
- Craftsmanship PASS: the old behavior was reproduced under module delay, the
  new article identity was observed through hydration, and production export
  plus real browser activation were checked separately from type/lint results.
