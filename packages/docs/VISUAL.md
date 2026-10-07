# Lenso UI Docs presentation verification

## Authority and reuse

The target is the actual Lenso UI Docs application at repository base
`a742a55d7171fe6f43e2a25e5f9ab921b428e646`, not a default Fumadocs theme.
The application retains the HeroUI provenance recorded in the root `DESIGN.md`.

The extracted StyleX maps, Tabs, syntax highlighter and responsive TOC now live
in `packages/docs/presentation`; build-only adapters compile those owned sources.
The same Inter variable font, fallback metrics, license and
provenance are packaged. Runtime modules import only compiled package output.
The shared source includes an optional-value type clarification in the TOC
helper and an explicit full-width shell rule. The latter prevents short content
from shrinking the grid inside the flex document, independently of TOC presence.

## Rendered comparison

Both applications rendered the same authored Getting started MDX. The generic
fixture removes only the application's navigationGroup/navigationOrder
frontmatter. Captures use Chromium, fonts ready, reduced motion, desktop
1440×1000 and phone 390×844, in light and dark.

The measured header, main, article, title, description, first prose paragraph,
list, h2, h3, code and TOC have matching x/y/width, typography and padding in all
four viewport/theme pairs.

| Measurement            | Desktop                             | Phone                  |
| ---------------------- | ----------------------------------- | ---------------------- |
| Header                 | 100px; rows 56px + 44px             | 92px; rows 52px + 40px |
| Sidebar                | 220px                               | Hidden                 |
| Main padding           | 32px 48px 24px                      | 16px 24px 24px         |
| Article origin / width | x288, y132 / 816px                  | x24, y165 / 342px      |
| Title                  | 28px / 42px, weight 600             | Same                   |
| Description            | 16px / 24px                         | Same                   |
| Prose paragraph        | 14px / approximately 24px           | Same                   |
| List                   | 16px / 24px                         | Same                   |
| Code                   | 13px / 18.5718px; padding 14px 24px | Same                   |

Code line-number geometry and syntax-token colors match the reference.
The full-page code-wrapper spacing and mobile Copy Markdown split-control
wrapping were compared and corrected, not inferred from a successful build.
Both viewports have no whole-document horizontal overflow.

Local captures and computed measurements are generated under
`packages/docs/.cache/visual-comparison/`; they are not release artifacts.
The maintained packaged browser proof separately checks frame/typography
geometry, font delivery, table cells, native keyboard operation, raw clipboard
contents, theme switching, navigation dismissal and live edits.

## First hosted migration

The English and Chinese Getting started routes now use `DocumentationArticle`
from `@lenso/docs/react`, while retaining the application shell, compiled MDX,
source actions and adjacent-page footer.

Eight baseline/candidate full-page screenshot pairs were byte-identical:
both languages at 1440×1000 and 390×844, in light and dark. Text, headings,
links, geometry, typography and syntax-token colors were also compared.
Inter loaded from the emitted hashed asset with its original bytes.
Exact authored Markdown copying, source links, search selection, locale
switching and mobile TOC/navigation dismissal passed. Button activation and
Theme Builder mounting received smoke checks only.

Local evidence lives in `apps/docs/.cache/framework-migration-proof/`.
The maintained `test:stylex-build` separately verifies authoritative source/
compiled-map equality, a single atomic stylesheet without duplicate rules or
keyframes, delivered font bytes, composition, RTL and search portals.

## Remaining documentation pages

The catch-all documentation route now uses `DocumentationArticle` unconditionally
for both languages, including guides, tools, component overviews and native API/
Demo pages. Component-reference links use the `beforeContent` slot, outside the
prose body. MDX compilation, native API projection and Demo registration remain
application-owned.

Twenty-four baseline/candidate samples covered installation, colors, Button,
DatePicker, tools and the component overview in both languages, at desktop light
and mobile dark. Article text, heading text/IDs, link text/hrefs and measured
shell/article/table geometry matched exactly. No client page errors or
whole-document horizontal overflow were observed. This comparison does not
claim byte-identical screenshots or exhaustive visual parity.

Localized Button activation, native API anchors, mobile TOC/drawer dismissal and
four byte-exact Markdown clipboard comparisons passed. Local reproduction
evidence lives in `apps/docs/.cache/remaining-migration-proof/`.

The maintained native API proof passed sixteen locale/theme/viewport cases,
including component-reference link presence and ordering before live examples.
The maintained general browser proof passed native demos, focus restoration,
semantic accessibility, overview galleries, source-link focus/hover, search,
locale navigation, mobile layout and Theme Builder. An initial overview image
decoding failure was not reproduced in the baseline/candidate capture or the
successful general-proof rerun; thumbnails still depend on the external CDN.
The StyleX delivery proof also passed against the migrated export.

## Generic framework adoption

The product host now consumes framework source lookup/navigation, RSC compilation,
site layout and search, with explicit product adapters for routes, controls,
native API projection and Demos. The standalone file consumer uses the same
source identity, site layout, search and article modules.

An isolated snapshot of the actual product application built all 313 static
pages with Next 16.3.8 and passed its TypeScript check. The maintained native API
browser suite passed sixteen cases, and the maintained general browser suite
passed after its State select probe was scoped to the owned popup rather than
the unrelated permanent File actions listbox. The ambiguous probe also failed
against the pre-migration baseline; it was a test defect, not a hidden UI change.

Twenty-four representative en/cn guide, component and tool comparisons matched
article text, heading identities and sampled geometry, without document overflow
or client errors. Final en/cn mobile search and navigation drawer screenshots
were pixel-identical to baseline after restoring the empty-search state, plain
drawer section links and the canonical keyboard-chip styling. Broader behavior
suites were not repeated for those visual-only follow-ups.

Local logs, captures and reproduction evidence live in
`apps/docs/.cache/generic-framework-proof/`. The original app output directories
and the user's running development server were not replaced by the snapshot.

The independent packed consumer additionally builds all five starter pages under
`/manual`, including ordinary, component and API kinds, custom component/slot
factories, custom JSON metadata, a source-relative Counter and live keyboard
activation, labelled reference tables, responses and exact API Markdown copying.
These are live example checks, not imported source counted as runnable evidence.

## CLI hosting and sidebar state

The actual product site now builds through `lenso-docs`, including 200 bilingual
documentation pages, six product routes and 106 exact redirects. Production
export, typechecking, native API browser checks, the general browser suite and
the single-StyleX-union proof passed against the CLI export. Actual CLI dev served
both languages, Theme Builder and coverage, returned 404 for unknown routes and
redirected the legacy Dropdown alias.

Desktop sidebar state was reproduced failing at 900px → 0px after an article
click, with the original DOM disconnected. The framework now restores state by
navigation scope, not by article URL. On the CLI production export, consecutive
article clicks, previous navigation, browser back and returning from another
collection retained 900px. The other collection independently used 0px; mobile
drawer interactions did not overwrite desktop state and document scroll stayed
at 0px. There were no client errors.

The sidebar DOM may still remount across route boundaries. The proof establishes
state restoration, not a claim that the DOM is never recreated. The production
menu had no nested branches, so that run does not prove every nested expansion
case. Reproduce with `test/sidebar-scroll.browser.mjs`; its report is generated
under `test-results/sidebar-scroll/`.

## Compilation-scope regression

The previous root customization reached a 676,412-byte demo registry containing
1,329 literal dynamic-import targets. Root and plain prose dependency tests
reproduced that coupling before the fix. Root customization/rendering and
document units are now separate; preview infrastructure receives page-local
references. Getting started's generated server unit is 481 bytes with no preview
import. Button's client unit has fifteen dynamic targets, not the site inventory.

An isolated Node 26.10 / Next 16.3.8 webpack comparison used fresh snapshot-local
`.lenso/.next` directories. First HTTP observations were:

| Route           |   Before |   After |
| --------------- | -------: | ------: |
| Home            |  79.202s | 42.563s |
| Getting started | 107.546s | 13.479s |
| English Button  |   5.241s |  4.555s |
| Chinese Button  |   6.150s |  3.452s |

All responses were 200 with correct HTML languages. The global generated-registry
Babel warning disappeared from the measured route logs. These are sequential,
single-run observations sharing dependency files and OS caches, not statistical
benchmarks or a claim that the remaining homepage cold cost is acceptable.
Recipe, frozen sources and logs are local under
`apps/docs/.cache/compile-performance/`.

The actual CLI production build, native API browser suite, general interactions,
sidebar scroll restoration and StyleX union delivery passed after the changes.

### Precompiled UI transpilation

A second isolated experiment changed only the product's `transpilePackages`
list, removing the already-built `@lenso/ui` ESM package. Framework and token
processing, Babel, StyleX and all five homepage previews remained unchanged.
Four fresh-cache runs used the order baseline, candidate, candidate, baseline:

| Run         | First homepage HTTP | Immediate warm HTTP |
| ----------- | ------------------: | ------------------: |
| Baseline 1  |             52.164s |              0.208s |
| Candidate 1 |             42.429s |              0.087s |
| Candidate 2 |             45.032s |              0.145s |
| Baseline 2  |             54.459s |              0.191s |

All responses returned 200 with the English document language. Candidate 2's
browser smoke verified five mounted showcase tabs, Dashboard/Components
selection, real preview controls and no client errors. Candidate 1's selection
probe timed out without an explicit hydration wait; that failure is retained,
not counted as passing interaction evidence.

These are two samples per configuration with shared dependency/OS caches and
uncontrolled machine load, not a guaranteed speedup. Source hashes confirmed
the single configuration difference. Removing redundant UI transpilation does
not eliminate the remaining homepage cold cost. The experiment report and
snapshots are under `apps/docs/.cache/homepage-transpile-proof/` in the
measurement thread's checkout.

The candidate also passed an isolated actual-product CLI production build with
Next 16.3.8: TypeScript, 314 static routes and 200 exported documentation pages.
The maintained native API (16 cases), general browser, sidebar restoration
(nine transitions) and StyleX delivery checks all passed against that export.
The effective generated config retained only docs/tokens transpilation.
One union stylesheet delivered 2,198 unique atomic rules and the same pinned
Inter font. Source generation was frozen for this proof; fresh regeneration,
packed installation and the full candidate landing gate were not rerun.
Logs are under `apps/docs/.cache/precompiled-ui-production-proof/` in the
production verification thread's checkout.

## Remaining scope

This is sampled rendered evidence, not an assertion that every application page
or interaction is pixel-identical. The generic fixture has one navigation page,
so its adjacent-page footer and article height differ from the full source
site. Site identity, navigation and optional links remain consumer content.
The source product's release selector, Theme Builder and language switch are
not invented for a generic single-language documentation site.

Source palette fidelity is not a WCAG certification. Contrast and RTL were not
audited in this verification.
