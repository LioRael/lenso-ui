# PageControl for Exact Web

PageControl selects a zero-based page through explicit Exact state. It renders at
most nine native buttons; small edge dots indicate more pages outside the visible
window. All pages remain reachable with the keyboard, including pages outside
that window. It is distinct from pagination links and from panel-owning Tabs.

`PageControlState` contains `id`, `label`, `count`, `page`, `labels`, `disabled`,
`variant`, `direction`. Use prominent/plain and ltr/rtl. Prominent retains Lenso's
26px small Glass capsule, rim and shadow. Plain has the same dots and hit areas
without the material. Root and button hit areas are at least 44px high. The
seven-page case retains its source 18px buttons and 7px capsule padding; nine-dot
windows use 14px edge buttons. Active and overflow dots use the shared semantic
colors, transitions and reduced-motion rule.

`PageControl(state, change)` normalizes negative counts to zero, floors fractional
counts/pages and clamps the current page. Zero pages renders no root. The owner
keeps its supplied value until it accepts `change(nextPage)`. Equal selections do
not emit another change. An empty labels array uses `Page N of total`; otherwise
each indexed label overrides that page's accessible name, with a default for
missing entries. Labels are independent of selection identities.

Only the current page is in the Tab sequence. Left/Right follow direction;
Up/Down move numerically, and Home/End reach the first/last page. Navigation
clamps at the ends. Keyboard focus moves to the requested button only after the
owner accepts that page and the keyed window contains it. Rejected values retain
selection and focus. Count changes, disabling, a different accepted value, a
pointer action or disposal cancel obsolete focus requests. Programmatic focus
alone does not select a page. Canceled and modified key events are left to the
caller. Native Enter/Space and click retain native activation.

For custom composition use `PageControlRoot(state, change)`,
`PageControlTrack(state)`, `PageControlItem(state, index, label, change)` with
children, and `PageControlDot(active, overflow)`. The root supplies keyboard
behavior; callers provide the indexed items and conditions for empty content.
Items retain their Exact-owned nodes while their keys remain in the window.
Registered caller StyleX maps compose last through the shared hatch.

A private range input carries keyboard requests through Exact's native numeric
input action, including targets outside the mounted window. It is hidden from
assistive technology and the Tab sequence, has no name, and is explicitly
disassociated from forms. It reconciles with the owned page after rejection;
it does not own a second page state. Listeners, observers, pending frames and
Glass resources end with their owning nodes.

## Verification and limits

The compiled consumer exercises window boundaries, a 1000-page jump, first/last
clamping, native click/Enter/Space, one Tab entry, RTL, callback cancellation,
rejection and deferred acceptance, count-change focus cancellation, disabled
state, custom labels, negative/fractional/out-of-range inputs, empty/single/seven
page geometry, rich composition, forced colors, reduced motion and disposal.
Screenshots cover both variants in light/dark, LTR/RTL and 390/820px layouts.
Blocking initial CSS, the affected presentation recipes and Tabs regression run
alongside that acceptance. The browser check can filter presentation families;
the canonical full browser suite still compares all registered recipes.

The family remains Partial. Full native nav/ref/render/event contracts and a
getPageLabel callback rather than explicit labels remain open. The runnable
Exact example does not establish nonfinite input acceptance: division by zero
did not update its owned state in the pinned host, so that probe cannot prove a
nonfinite value reached the component. The normalizer includes a finite guard,
but that branch is not reported as browser-verified from the probe.

Glass optical/transition reference acceptance, physical touch and native-platform
adapters remain open. WebKit's automated Glass capture is still unqualified
(VISUAL_CAPTURE.md). These checks establish Web behavior and geometry, not a
relative rendering-performance result.
