# Initial style delivery

Exact loads page hatch modules after first paint. Delivering a stylesheet early
is insufficient when its selectors require classes that the hatch has not yet
attached. The Lenso build supplies both paths from one presentation function.

## How it works

The build compiles the shared StyleX recipes, enumerates their supported
metadata/variant combinations and adds attribute alternatives to the resulting
atomic class selectors. A compound-selector trie factors identical tails without
introducing new combinations, avoiding Cartesian repetition in the output.
Complex selectors remain unchanged by that factoring step. It keeps the declarations, rule order, media queries,
and original class branch. Attribute alternatives live inside `:where`, so they
do not increase specificity. State alternatives recognize declarative boolean
metadata before the native state attributes have been attached.

For toggle nodes, persistent selected predicates use `aria-pressed=true` instead
of Exact's transient `data-pressed` marker. The scoped bridge preserves the
original predicate specificity and is active before and after initialization.

Only nodes without `data-lenso-ready` use this fallback. The normal hatch applies
its classes and native state, initializes the relevant behavior, then marks the
node ready. Subsequent rendering uses the class branch and native state
selectors. The initial fallback therefore does not keep forcing default
presentation over future class composition. Removing a hatch also removes its
ready marker.

SVG circle parts cannot receive a hatch or data words in the pinned Exact host.
Their generated alternatives use the component-owned ID suffixes documented in
FEEDBACK.md. Those declarative rules remain active after initialization; Exact
continues to own the circle geometry. Other initialized parts retire the initial
attribute path normally.

The build refuses a Contract kind with no initial recipe. A recipe requiring
inline runtime values needs a declarative value adapter before it can join this
path; the build does not silently omit those values. Future components must add
their recipe variants and acceptance evidence. STYLING.md documents how compiled
caller maps participate in the same generation and callback paths.

## Consumer integration

1. Build the library, merge `withLensoWeb` into `app.json` and call `stageWeb(app)`.
2. Run the normal Exact Web build.
3. Call `linkWebStyles(outputDirectory)` before serving its generated HTML.

Source staging uses `modules/web/lenso-ui`. Exact's built output flattens that
to `modules/lenso-ui`; `linkWebStyles` targets the built location. It inserts a
blocking stylesheet link immediately after the generated base element, including
a content hash for cache invalidation. Repeating it with unchanged CSS does not
rewrite the page; changing CSS replaces the owned link. Foreign HTML without an
actual `#exact-root` element is left alone. Generated pages missing an early base
element are refused before writes begin.

The helper updates generated HTML files. A server that constructs HTML per
request must include the same stylesheet early in its response; this helper
does not patch a server's response code. The standalone browser hatch still
loads CSS if a consumer omitted the early link, but that fallback does not
guarantee initial styling.

## Verification and boundary

The current compiled consumer is checked in Chromium 156 and Playwright WebKit
27.2. The browser test blocks `modules/index.js`, allows the Exact application to
render through two animation frames, and captures light/dark pages with zero initialized
Lenso hatches. It then releases the module and compares computed geometry and
ordinary presentation before and after initialization. The native hatch reuses
the early stylesheet without making a second stylesheet request.

Core generation retains 613 recipe combinations. The consumer with registered
caller styles compares 689 composed cases against their compiled class branches
in both browsers. The comparison includes button sizes/variants,
ordinary Surface variants, field variants, single/multiline text areas,
input-group composition, labels, expandable-content presentation and navigation/separator variants, range indicators, spinners, skeleton animations, ordinary toggle/group presentation and Modal parts. Native
Modal command opening/closing is also checked while the hatch is blocked; the
initialized scroll lock and boundary Tab loop are separate checks. Initialized
metadata without classes must stop receiving the initial fallback. These checks
run with the existing keyboard, editing, motion and disposal regressions.

This establishes initial style delivery for the current recipes and linked
consumer pages. It is not a claim that all 99 component families exist, that
request-rendered integration has been validated, or that optical detail is
ready before the glass renderer initializes. Native attributes unsupported by
Contract, such as field `required` and `name`, still arrive with the hatch.
The current core uses the reserved `lenso-exact-` class prefix; caller CSS must
not redefine those classes. Missing referenced class definitions fail the build.
No startup-speed or device-performance improvement is claimed from style parity.
