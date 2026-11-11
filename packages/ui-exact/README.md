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

GlassContainer adds shared fusion ownership for small Glass members, preference
fallback and packaged worker preparation through the non-React renderer API.
See [GlassContainer](GLASS_CONTAINER.md) and its [compiled example](example/glass-container.contract).

Toolbar adds named action groups, native roving keyboard focus, shared Glass
surfaces and explicit state for attached/grouped controls. See
[Toolbar](TOOLBAR.md) and its [compiled example](example/toolbar.contract), including
detachable fusion in its [compiled example](example/toolbar-fusion.contract),
and remaining sticky-edge, Menu and native integration work.

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
It does not yet include the full family catalog, elastic motion, icons, loading
state, glass groups, overlays, or native adapters. Shared glass rendering retains its existing browser
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
