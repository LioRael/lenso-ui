# Lenso UI for Exact

Private, initial **Web** implementation for Expo Exact. Contract components own
their structure and Exact actions; a Web hatch applies shared Lenso StyleX tokens
and the existing glass renderer. There is no React runtime in this adapter.

Validated against Exact commit `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`.
This package does not yet implement an Exact iOS or Android adapter.
The target is the complete Lenso Web component catalog. [COMPONENTS.md](COMPONENTS.md)
tracks all 99 source families and their remaining acceptance work.

## Components

Exact currently requires every declared prop at a call site.

| Component     | Props                                                     | Children |
| ------------- | --------------------------------------------------------- | -------- |
| `Theme`       | `appearance`: `light` or `dark`                           | Yes      |
| `Backdrop`    | None; call as `Backdrop()`                                | Yes      |
| `Button`      | `label`, `press`, `disabled`, `size`, `variant`, `testId` | No       |
| `Glass`       | `testId`                                                  | Yes      |
| `GlassButton` | `label`, `press`, `disabled`, `size`, `variant`, `testId` | No       |

The initial form API adds `Input`, `TextArea`, `TextField`, `InputGroup`,
`InputGroupPrefix`, `InputGroupSuffix`, `Label`, `Description`, `FieldError`,
`Fieldset`, `Checkbox`, `CheckboxGroup`, `Radio`, and `RadioGroup`. `Surface`
currently supports the ordinary `default`, `secondary`, `tertiary` and
`transparent` variants. These are partial family implementations; see the
[form API](FORMS.md) and the [compiled consumer example](example/forms.contract).
`Surface(id="page", variant="secondary")` accepts children; `id` supplies its
DOM and Exact test id.

SearchField adds a native search input, small Glass group, rich clear control,
labels and explicit Exact value ownership. See [SearchField](SEARCH_FIELD.md) and
the [compiled example](example/search-field.contract).

Expandable content adds `Disclosure` and `Accordion` with heading, trigger,
indicator, body and panel parts. See [composition and state models](DISCLOSURE.md)
and the [runnable example](example/disclosure.contract). These use explicit shared
state shapes because Exact's slots retain the caller's provider scope.

Popover adds native non-modal top-layer content, anchored thick material,
collision-aware positioning, hover previews and nested keyboard/focus behavior. See
[Popover](POPOVER.md) and its [compiled export example](example/popover.contract)
for the API, [hover example](example/popover-hover.contract) and remaining modal,
portal and native integration work.

NumberField and Stepper add a shared nullable numeric model, locale editing,
keyboard/button/hold interaction and canonical form values. Stepper keeps the
ordinary two-segment treatment; NumberField uses field materials. See
[NumberField and Stepper](NUMBER_FIELD.md) for composition and remaining callback
and native integration work. [Drag adjustment](NUMBER_SCRUB.md) adds horizontal/vertical
scrubbing and an optional cursor, with a pointer-lock fallback.

[DateField and DateInputGroup](DATE_FIELD.md) add date-only segmented native
editing, localized calendar display with ISO identity, partial drafts and native
scalar form validation. They reuse primitive Input and the pure source draft
model. [TimeField](TIME_FIELD.md) reuses that owner for local time, hour cycles,
day periods and optional seconds. [Calendar](CALENDAR.md) adds a localized month grid with native primitive-derived
day buttons, selection and keyboard navigation. Range and date-picker families
remain unfinished. [CalendarYearPicker](CALENDAR_YEAR_PICKER.md) adds a controlled
year grid sharing Calendar browsing and bounds.

[List](LIST.md) adds grouped/plain rows, named sections and native action buttons
using ordinary list surfaces. Controlled editing selection and scoped select-all
are implemented, along with keyboard/pointer reorder requests and bounded edge
scrolling. Swipe actions and device acceptance remain open.

Select adds single and multiple string selections, keyboard navigation and typeahead,
native form values/reset/required validation, anchored medium Glass and dynamic items.
See [Select](SELECT.md) and its [compiled example](example/select.contract) for
composition, verified behavior and remaining API/motion gaps.

Menu adds native anchored actions, checkbox/radio items, rich rows and compact
Glass material. See [Menu](MENU.md) and its [compiled example](example/menu.contract)
for the implemented path and remaining morph work.
[Menu modality](MENU_MODAL.md) adds pointer isolation and input-dependent page
scrolling with shared Dialog ownership; Tab continues to exit the menu.
[Compact edit bar](MENU_BAR.md) adds shared-material actions and a native expand
trigger whose anchor and pointer cutout cover the entire bar.
[Submenus](SUBMENUS.md) adds cascade/stacked composition and three-level keyboard
and touch interaction; its shared-title spring motion remains open.

Tooltip adds supplementary descriptions with hover/focus timing, grouped delays,
native trigger actions and anchored thick material. See [Tooltip](TOOLTIP.md) and
its [compiled example](example/tooltip.contract) for composition and open gaps.

GlassContainer adds shared fusion ownership for small Glass members, preference
fallback and packaged worker preparation through the non-React renderer API.
See [GlassContainer](GLASS_CONTAINER.md) and its [compiled example](example/glass-container.contract).

Toolbar adds named action groups, native roving keyboard focus, shared Glass
surfaces and explicit state for attached/grouped controls. See
[Toolbar](TOOLBAR.md), the [ordinary/attached example](example/toolbar.contract)
and the [detachable fusion example](example/toolbar-fusion.contract).
Sticky edges, Menu and native integration remain open.

Pagination adds ordinary native page links, summary/list/item composition,
localized rich Previous/Next content, decorative ellipsis and source size maps.
See [Pagination](PAGINATION.md) and its [compiled example](example/pagination.contract).

Content navigation adds `Link`, rich-content icon parts, `Breadcrumbs` with
explicit trail state and item/link/separator parts, and semantic/decorative
`Separator`. See [navigation API](NAVIGATION.md) and the
[compiled example](example/navigation.contract).

Progress and loading feedback adds `ProgressBar`, `Meter`, `ProgressCircle`,
`Spinner` and `Skeleton`. Range state drives both accessible values and visual
geometry, with composable labels/tracks/fills. See [feedback API](FEEDBACK.md)
and the [compiled example](example/feedback.contract).

Ordinary `ToggleButton` and `ToggleButtonGroup` add persistent selection with
explicit Exact state, rich children and native button activation. Groups support
single/multiple selection, joined/detached layouts and roving keyboard focus.
See [toggle composition](TOGGLES.md) and the [compiled example](example/toggle.contract).
`GlassToggleButton` and its grouped item reuse the same primitive state/activation
with shared Glass material and elastic feedback; see [Glass toggles](GLASS_TOGGLE_BUTTON.md).
Registered caller maps support custom tint and StyleX composition; see [caller styling](STYLING.md).

`ButtonGroup` adds rich ordinary/Glass actions, joined/detached geometry and native
Tab order through explicit group state and item parts. See [grouped actions](BUTTON_GROUP.md)
and the [compiled example](example/button-group.contract).

`PageControl` adds a controlled nine-dot window, native page buttons, full-range
keyboard navigation and prominent/plain tracks. See [page-control behavior](PAGE_CONTROL.md)
and the [compiled example](example/page-control.contract).

`ScrollShadow` adds native scroll viewports with shared scroll-driven fades,
observed overflow and explicit/manual visibility. See [scroll fades](SCROLL_SHADOW.md)
and the [compiled example](example/scroll-shadow.contract).

Native `Modal` adds composable backdrop, viewport, popup, header/body/footer,
icon, title/description and action/close parts. Browser commands own opening;
Exact actions own validation and save. See [modal API and acceptance limits](MODAL.md)
and the [compiled example](example/modal.contract). WebKit exit animation remains open.

`AlertDialog` adds native confirmation semantics, medium glass material, rich
actions, fields, icon tones and automatic footer layouts. See [confirmation API
and acceptance limits](ALERT_DIALOG.md) and the [compiled example](example/alert-dialog.contract).

`Alert`, `Badge`, ordinary `Chip` and native `CloseButton` add status messages,
positioned counters, rich labels and guarded loading actions. See
[content component APIs and acceptance](CONTENT.md) and the
[compiled example](example/content.contract).

`Card` and `EmptyState` add ordinary/glass card variants, named sections,
heading/message anatomy and caller-owned creation/retry actions. See
[layout composition](LAYOUT.md) and the [compiled example](example/layout.contract).
The pinned upstream compiler remains unchanged; [native text-tag gaps](SEMANTIC_GAPS.md)
for Typography/Kbd are retained explicitly.

Both buttons accept `sm`, `md` and `lg` sizes. Button variants are `prominent`,
`bordered` and `borderless`; GlassButton variants are `default` and `prominent`.
`press` takes an Exact action. These are native HTML buttons, including keyboard
activation and disabled behavior. Button content is currently a text label.

`Glass` uses the small material profile with 16 px padding and a 24 px radius.
Use Contract layout containers around it to place or size the surface.
`Backdrop` marks content eligible for the shared renderer's backdrop collection;
it does not guarantee that arbitrary DOM content can be replayed on WebKit.

## Caller styling

`styleWeb` composes compiled caller StyleX maps with the staged package's own
recipes, and `createWebHatch` uses the same rules in the browser. Registered
kind/instance rules support property removal, media and pseudo states, custom
properties and existing class cleanup without changing Contract component props.
See [the setup and verified boundaries](STYLING.md).

## Consumer setup

Build the package in this workspace:

```sh
bun run --cwd packages/ui-exact build
```

Install or link `@lenso/ui-exact` in the consumer. Its default export is the
Contract entry, resolved by Exact rather than JavaScript:

```text
use Theme, Button from "@lenso/ui-exact"

component App
  state count = 0
  action increment
    count = count + 1
  view
    Theme(appearance="light")
      Button(label=`Count: ${count}`, press=increment, disabled=false, size="md", variant="prominent", testId="count")
```

Before the Exact build, merge the package's declarations and stage its browser
assets from a Bun build script:

```ts
import { stageWeb, withLensoWeb } from "@lenso/ui-exact/stage";

const app = "/absolute/path/to/exact-app";
const file = Bun.file(`${app}/app.json`);
const configured = withLensoWeb(await file.json());
await Bun.write(file, JSON.stringify(configured, null, 2) + "\n");
await stageWeb(app);
```

After the normal Exact Web build, link the generated stylesheet before serving
the output:

```ts
import { linkWebStyles } from "@lenso/ui-exact/stage";

await linkWebStyles("/absolute/path/to/build-output");
```

Exact copies page modules without resolving browser package imports. In
`modules/web/index.js`, use the staged relative entry:

```js
export { element, elementEnded } from "./lenso-ui/browser.js";
```

If the app already exports hatch callbacks, dispatch `lenso-ui` handles to these
functions and keep the existing callbacks for other hatch words. Restage after
rebuilding this package. `withLensoWeb` is a pure merge; existing app fields,
data words and other hatch declarations are retained. `stageWeb` only writes
`modules/web/lenso-ui`. The raw declarations are exported as `webRequirements`
and `@lenso/ui-exact/manifest` for other build integrations.

The build also generates attribute selectors from the same compiled StyleX
recipes used by the hatch. `linkWebStyles` inserts blocking CSS after each
generated page's base URL; existing components can therefore render styled
before the post-paint hatch attaches classes. The hatch reuses that stylesheet
and retires the attribute fallback after initialization. See
[initial style delivery](INITIAL_STYLES.md) for scope and verification.

## Verification

```sh
bun run --cwd packages/ui-exact typecheck
bun run --cwd packages/ui-exact test
bun run --cwd packages/ui-exact build
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/ui-exact test:browser
```

The browser check requires an initialized Exact checkout with its Web compiler
and matching toolchain, plus the Docs workspace's Playwright browsers. It does
not install Exact or change the workspace's Rust toolchain. Use `TEST_BROWSER`
to select `chromium` or `webkit`, and optionally `CHROMIUM_CHANNEL=chrome` for
installed Chrome. These integration checks are separate from ordinary package
builds, which require no Rust toolchain.

`PLAYWRIGHT_MODULE` can point to an installed Playwright package with matching
browser binaries when the Docs dependency has changed locally.

The browser check rebuilds the library and a real consumer using its distributable
Contract and browser assets. It covers keyboard/click activation, native text
editing and selection, field associations, validation hints, required/read-only/
disabled behavior, checkbox mixed state, radio arrow navigation, size and theme
changes, and disposal/recreation. Rendered forms are captured at 390 and 820 px
in light and dark appearances. Screenshots and a browser/version/asset-hash receipt
are written under `.cache/example`. Browser layout checks are not physical-device
or GPU performance qualification. `example:build` builds the same consumer without
starting a browser.

Disclosure/Accordion checks also cover single/multiple selection, nested and RTL
keyboard navigation, disabled skipping, dynamic panel height, animation reversal,
live Reduced Motion changes and unmounting during animation. Their screenshots
and per-frame samples are included in the same evidence directory.

## Current boundary

This is an initial integration slice, not the full Lenso React component API.
The full family catalog and capability matrix remain incomplete; see
[component coverage](COMPONENTS.md). Native adapters follow Web completion. Shared glass rendering retains its existing browser
limitations; using Exact Web does not bypass WebKit or establish a performance
improvement. Generated assets include the repository's third-party notices.

## Glass screenshot acceptance

Run `test:glass-capture` before judging glass from screenshots. The browser suite
records capture eligibility separately from behavior. The current macOS WebKit
Playwright image omits backdrop blur that native-window capture shows; see
[the probe and proof boundaries](VISUAL_CAPTURE.md).

See [Avatar and AvatarGroup](AVATAR.md) for image fallback behavior and explicit group composition.

See [Switch](SWITCH.md) for state, native forms, source motion and remaining acceptance gates.

See [Slider](SLIDER.md) for range values, collision policy, keyboard operation and remaining acceptance gates.

See [Tabs](TABS.md) for selection, panel lifetime, keyboard contracts, source motion and remaining acceptance gates.

See [SegmentedControl](SEGMENTED_CONTROL.md) for radio selection, native form values and shared selection presentation.

`ToggleButton`, `Link`, `Description`, `TextArea`, `Checkbox` and `Radio` now derive their semantic Contracts from `@lenso/primitives-exact`
at build time. The generated styled primitives retain the original nodes and
add Lenso presentation metadata and the explicitly supported UI attributes; its source fingerprint and license ship in
`components/generated`. See the [migration plan](../../docs/plans/exact-primitives-migration.md)
for scope and remaining families. Rebuilding this package currently requires
its monorepo primitive source; installed consumers use the generated Contract.

Disclosure/Accordion roots, items and triggers now derive from primitive source,
with existing Lenso IDs, slotted accessible names and state extensions preserved.
The animated panels remain Lenso implementations; primitive display hiding is
not substituted for the current height animation.

TabsList also derives its semantic container from primitive source while retaining
Lenso's layout, lenses and activation metadata. Tab and Panel native nodes are also primitive-derived, with explicit UI
compatibility projections for disabled focus, dynamic targets and kept panels.
Navigation, mounting policy and motion remain UI enhancements.

Input now uses one primitive-derived styled node for its existing public type
interface. A guarded identity projection preserves canonical text-mode behavior
and legacy static types without a duplicate fallback renderer. The pinned
compiler's restriction on arbitrary runtime input-kind strings still applies.

Modal/AlertDialog roots, triggers and close controls also derive from primitive
source. Validation actions and the UI focus/scroll/animation layer remain intact;
they do not adopt the primitive's unconditional DialogAction close behavior.

Popover's native positioner and open/close controls are primitive-derived, with
explicit compatibility projections for the existing presentation container and
hide invoker. Named Popup content, positioning, hover and Glass remain UI-owned.

Menu's native positioner, invoker, item actions, checkbox/radio items and submenu
invoker now derive from the canonical Menu parts in the primitive Popover source.
Menu links, hover corridors, modality, navigation and Glass remain UI extensions.

See [SwipeActions](SWIPE_ACTIONS.md) for controlled leading/trailing actions,
keyboard alternatives, opt-in full swipe and gesture acceptance boundaries.

See [Color components](COLOR.md) for named transparency samples, native-radio
SwatchPicker composition, shared color-model identity and remaining color families.

See [ColorField and ColorInputGroup](COLOR_FIELD.md) for live color/channel edits,
localized percentages, controlled proposals, commits and native form projection.

See [ColorSlider](COLOR_SLIDER.md) for primitive-backed color channels, ordinary
gradient tracks, native form output and pointer/keyboard/touch acceptance.

See [ColorArea](COLOR_AREA.md) for primitive-backed dual-axis color editing,
atomic color proposals, keyboard/form semantics and cancellation behavior.

See [ColorPicker](COLOR_PICKER.md) for a primitive-backed Glass popover combining
ColorArea, ColorSlider, ColorField and a swatch palette under one application value.

See [ListBox](LIST_BOX.md) for controlled single/multiple collections, rich grouped
options, range selection, typeahead and dynamic-item focus cleanup.

See [Tag and TagGroup](TAGS.md) for controlled selectable/removable tags, shared
collection navigation and focus restoration after accepted removal.

See [ComboBox](COMBO_BOX.md) for primitive-backed editable selection, grouped
filtering, multiple chips, controlled query/value callbacks and native form values.

See [Autocomplete](AUTOCOMPLETE.md) for external selected-value triggers with
popup search, grouped options, removable multiple selections and native forms.
It shares the editable collection controller with ComboBox while retaining a
separate popup-query and trigger-focus policy.

See [InputOTP](INPUT_OTP.md) for real native code slots, grouped/separated
composition, paste/autofill, alphabet validation, completion and native forms.
Ordinary primary/secondary fields and explicit floating Glass slots share the
same controlled code model.

See [PopupButton](POPUP_BUTTON.md) for the shared ordinary tint-colored button,
its double-chevron indicator and direct Menu/Select trigger compositions. The
menu trigger derives from the canonical primitive command on the actual button;
popup selection and material stay with their existing owners.

See [SectionIndex](SECTION_INDEX.md) for native fragment links, roving keyboard
focus, pointer scrubbing and optional navigation inside a named scrollport. It
reuses primitive Link nodes with shared narrow-index recipes and explicit
application-owned current-location state.

See [TabBar](TAB_BAR.md) for application navigation using native destination links
and actions, phone/tablet Glass groups, source-derived draggable indicators,
controlled minimization and scroll-triggered collapse. Its navigation semantics
remain distinct from in-page Tabs.

See [RefreshControl](REFRESH_CONTROL.md) for touch-only pull-to-refresh, a native
keyboard/touch trigger, application-owned async results and localized status/error
feedback. The runnable root example demonstrates timed, synchronous and rejected
operations; the family remains Partial for broader APIs and platform coverage.

See [ContextMenu](CONTEXT_MENU.md) for native right-click, keyboard context keys,
long-press targets and pointer-origin Menu composition. The ordinary popup shares
Menu semantics, items and submenus. Compact actions now expand into the full menu
with controlled branch lifetimes and source spring geometry. Inert previews support
vertical/horizontal and leading/trailing layouts. Chromium retains the closing
return animation; tested WebKit restores the target immediately. Full motion/API
and native/device acceptance remain open.

See [NavigationBar](NAVIGATION_BAR.md) for shared Toolbar actions, a sticky title,
large-heading collapse and uniform/soft scroll-bound edges. Explicit state selects
heading level, scroll target, direction and toolbar presentation; WebKit/Chromium
behavior and initial geometry are verified while broader API/material/native gates
remain open.

See [WheelPicker](WHEEL_PICKER.md) for controlled string options, native snap
scrolling and cylindrical label projection. It shares ListBox interaction and
supports disabled choices, external form values, value rejection and dynamic
collections. Initial projection, broader APIs and native/device gates remain open.

See [GlassMagnifier](GLASS_MAGNIFIER.md) for a pointer-driven lens using the shared
Glass renderer and motion helper, with independent dragging/animation, optional
elastic feedback and rich child controls. Behavior and lifecycle are verified in
both browser engines; WebKit background magnification/refraction remains a known
backend gap, and full API/optical/native-device acceptance remains open.
