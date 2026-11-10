# Initial style delivery

Exact loads page hatch modules after first paint. Delivering a stylesheet early
is insufficient when its selectors require classes that the hatch has not yet
attached. The Lenso build supplies both paths from one presentation function.

## How it works

The build compiles the shared StyleX recipes, enumerates their supported
metadata/variant combinations and adds attribute alternatives to the resulting
atomic class selectors. It keeps the declarations, rule order, media queries,
and original class branch. Attribute alternatives live inside `:where`, so they
do not increase specificity. State alternatives recognize declarative boolean
metadata before the native state attributes have been attached.

Only nodes without `data-lenso-ready` use this fallback. The normal hatch applies
its classes and native state, initializes the relevant behavior, then marks the
node ready. Subsequent rendering uses the class branch and native state
selectors. The initial fallback therefore does not keep forcing default
presentation over future class composition. Removing a hatch also removes its
ready marker.

The build refuses a Contract kind with no initial recipe. A recipe requiring
inline runtime values needs a declarative value adapter before it can join this
path; the build does not silently omit those values. Future components must add
their recipe variants and acceptance evidence.

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

All 71 current recipe combinations are also compared against their compiled
class branches in both browsers. The comparison includes button sizes/variants,
ordinary Surface variants, field variants, single/multiline text areas,
input-group composition, labels and expandable-content presentation. Initialized
metadata without classes must stop receiving the initial fallback. These checks
run with the existing keyboard, editing, motion and disposal regressions.

This establishes initial style delivery for the current recipes and linked
consumer pages. It is not a claim that all 99 component families exist, that
request-rendered integration has been validated, or that optical detail is
ready before the glass renderer initializes. Native attributes unsupported by
Contract, such as field `required` and `name`, still arrive with the hatch.
No startup-speed or device-performance improvement is claimed from style parity.
