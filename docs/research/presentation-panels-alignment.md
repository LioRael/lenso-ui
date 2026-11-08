# Dialog and panel alignment

Date: 2026-11-08

## Scope and decisions

Modal remains the general-purpose dialog for focused content, forms and
full-screen tasks. AlertDialog retains native alertdialog semantics for explicit
decisions. Drawer primarily documents side panels; Sheet owns bottom detents and
vertical dragging. ActionSheet and ShareSheet retain their task-specific
compositions. No public component was removed, renamed or aliased to Dialog.

The earlier Modal/Drawer surfaces used a separate blur/saturation rule underneath
an opaque background, smaller typography and unrelated corner/shadow settings.
Default examples also mixed glass and ordinary content actions. Drawer repeated
bottom presentations already covered more fully by Sheet.

The chosen treatment shares the existing desktop Sheet content surface and panel
constants: light primary/dark secondary background, 32px corners and the same
shadow. Modal and Drawer keep a 20px/25px semibold title, 15px/20px description and
17px/22px body. Their headers reserve a 36px circular dismissal control; headers
and footers do not shrink when body content scrolls. Footers wrap at narrow widths.

For side Drawer, retaining the flush square-edged layout would preserve the old
visual separation. A floating rounded panel instead joins the existing panel
family while preserving its height, width and native swipe behavior. It uses
8px edge spacing below 640px and 12px above it. Exit transforms include that
spacing. Up/down directions retain their attached-edge behavior.

The local iOS 27 Figma archive's Sheets (Modals) example contains Sheet
`12740:35288`, 936 × 355 with 38px corners. It supports the content-panel role;
the 32px Web corner and responsive side-panel treatment follow the current Lenso
Sheet convention. This is not a same-revision Figma pixel reconstruction.

Default demos now share runnable profile editing and reading preferences scenes.
Save persists the submitted name/email, Cancel discards an unsubmitted edit,
preference switches retain their state and Reset restores their defaults.
Content actions use ordinary Button peers; auxiliary Modal/Drawer examples also
use ordinary actions and the standard dismissal control. Documentation projection
explains when to choose each overlay instead of introducing another public alias.

## Compatibility

Existing Modal sizes, placements, inside/outside scrolling and native state/ref
contracts remain supported. Full-screen Modal stays edge-to-edge and caller
styles remain last; the photo viewer/editor still use that contract. Existing
Drawer physical directions and Base UI swipe/snap/focus ownership remain intact.
Sheet continues composing Drawer interaction parts with its own presentation.
AlertDialog, ActionSheet and ShareSheet interaction contracts are unchanged.

No consumer prop/import migration is required. The larger type, 32px corners,
36px dismiss control and side-panel spacing are intentional default visual
changes. Consumers with custom layouts should review their sizing overrides;
styles authored through xstyle or native style remain supported. No primitives
component source or public API was changed.

## Verification scope

The maintained presentation-panels browser check exercises the actual shared
scenes through the docs development pipeline in Chromium and WebKit at 1440,
390 and 320 CSS pixels, light/dark appearance and reduced motion. It checks form
save/cancel, preference changes/reset, matching action heights, panel bounds,
focus return, full-screen caller overrides and existing physical directions.
Additional cases cover RTL dismissal placement, a long scrolling body with fixed
header/footer, AlertDialog outside-press semantics and Sheet composition. Chromium
also receives real touch input through its browser protocol for side dismissal.

These failures need real layout and interaction coverage; the existing simulated
DOM tests do not measure panel bounds, action sizing or body scrolling. Screenshots
for visual inspection are captured separately from the maintained check.

Real Safari/iOS, OS virtual keyboards, screen-reader acceptance and exact native
pixel equivalence are outside this verification. Production deployment and landing
were not requested.

## Results

All 12 engine/width/theme combinations and six additional RTL/scroll/semantic
checks pass. The Chromium 390px case also passes touch swipe dismissal. The
photos suite passes 11 tests, including editor appearance changes and dirty-draft
cancellation; the documentation projection suite passes nine tests. Format/lint,
UI/styles/docs typechecks, the seven-task package generation/build graph and the
installed consumer exports/types/SSR/production-assets check pass.

A changed-scope React Doctor scan of docs reports 84/100 with 23 warnings in nine
files. It is a broad workspace diagnostic rather than a baseline comparison for
this change; no score improvement or whole-project clean bill is claimed.
