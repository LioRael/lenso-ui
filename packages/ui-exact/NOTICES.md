# Additional notices

`src/switch.ts`, `src/slider-lift.ts`, `src/tabs-motion.ts`, `src/tab-bar-motion.ts`, `src/page-control.ts` and `src/control-lens.ts` adapt Lenso's Kelvin Zhang / Glisse
control motion and optical profiles (MIT), retaining their file-level notices.
Their MIT license and shared token attributions are included in the workspace
THIRD_PARTY_NOTICES.md copied into the distributable.

`src/glass-container.ts` adapts membership and preference ownership from Lenso
GlassContainer, using the shared non-React fusion API. `src/web.ts` connects
its shared press-light API independently of elastic motion.
Fusion optics, field preparation and their retained notices remain in the shared
glass implementation; the worker is bundled into the distributable assets.

`src/toolbar.ts` follows Lenso's Toolbar and installed Base UI interaction
contracts and reuses the attributed non-React glass press model. Its source
Toolbar, GlassButton, Link and material token maps remain shared imports.

`src/scroll-shadow.ts` adapts the shared Lenso scroll edge observation model.
Its styles and typed property declarations continue to come from `@lenso/tokens`.

`src/search-field.ts` adapts Lenso SearchField native clearing, Escape handling
and group focus semantics. SearchField presentation reuses the attributed
Kelvin Zhang / Glisse token maps from `@lenso/tokens`; the workspace notices
are included in the distributable.

`src/popover-hover.ts` and `src/popover-hover-corridor.ts` adapt Base UI 1.9.0
Popover hover interactions and Floating UI safePolygon geometry to native elements.
They retain the Material-UI and Floating UI MIT notices below.

`src/anchored-material.ts` adapts the shared Lenso AnchoredMaterial shape without React.
`src/popover.ts` uses Floating UI DOM 1.8.0 for native-element positioning.
`src/tooltip.ts` adapts Base UI 1.9.0 Tooltip timing, grouping, focus and dismissal
to native elements and uses the same Floating UI DOM positioning and safe polygon.
Its retained Material-UI and Floating UI MIT notices are reproduced below.
Floating UI core, DOM and utils are MIT licensed by the Floating UI contributors.

`src/modal-focus.ts` adapts native focus traversal from Base UI 1.9.0.
The retained notice is reproduced below. Other retained adaptations are covered
by the workspace THIRD_PARTY_NOTICES.md copied into the distributable notices.

MIT License

Copyright (c) 2019 Material-UI SAS
Copyright (c) 2021-present Floating UI contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

`src/menu.ts` uses Floating UI DOM 1.8.0 for native menu positioning and the
shared Lenso Glass renderer for the compact material. Menu presentation reuses
the attributed Lenso/Glisse maps; the retained workspace notices remain included.

`src/menu-submenu.ts` adapts Base UI 1.9.0 submenu hover and the shared Lenso
settled parent pose. It retains the Material-UI/Floating UI MIT notices above.

`src/menu-pointer-focus.ts` bridges Exact native pointer focus with keyboard
opening and submenu return focus; layout retargeting does not count as user movement.

`src/number-parse.ts` and `src/number-value.ts` retain Base UI 1.9.0 NumberField
locale parsing and validation utilities. `src/number-field.ts` adapts its native
input, step and press/hold contracts to Exact. They retain the Material-UI and
Floating UI MIT notices reproduced above; no React runtime is imported.

`src/number-scrub.ts` adapts Base UI 1.9.0 NumberField scrub interaction, cursor
coordinates and viewport wrapping. Its retained Material-UI and Floating UI MIT
notices are reproduced above. The authored Exact cursor uses the native top
layer rather than reparenting the framework-owned node.

The Contract files in `components/generated` derive from canonical
`@lenso/primitives-exact` Toggle, Link, FieldDescription, Input, Textarea, Checkbox, Radio, Disclosure, Accordion, TabsList, Tab, TabPanel, Dialog and Popover family sources
(MIT, Copyright 2026 Lenso contributors). Full licenses and source fingerprints
are retained in the generated files; `provenance.json` records each source and
the presentation/attribute transform.

## Pure color model

Color components import `react-stately/Color` from React Stately 3.51.0, Copyright
Adobe, Apache-2.0. This public export supplies parsing and value conversion only;
React interaction hooks are not imported. The package retains its separately
distributed license. Lenso color styles retain their existing NextUI attribution.

ColorField's generated editable node is another styled derivative of the same
canonical Input source. Its source fingerprint and MIT notice are retained in
`components/generated/color-field-input.contract`. Channel formatting uses the
public pure Color model, and localized number parsing reuses the existing
attributed NumberField utilities.

ColorSlider derives its native range from the canonical primitive Slider, retaining
its source fingerprint and MIT license. Shared color-slider styles retain the
existing NextUI attribution; the Slider behavior/motion adapters retain their
existing notices. The range-to-color bridge is Lenso-owned Web integration.

ColorArea reuses the shared Lenso ColorArea/Slider recipes and primitive-derived
range inputs. Its pure gradient calculation retains the existing Adobe React
Aria adaptation (Copyright 2022 Adobe, Apache-2.0); no React interaction hooks
are included. The Web adapter owns atomic two-axis color proposals and cleanup.

ColorPicker uses shared NextUI-derived ColorPicker recipes (Apache-2.0) and
canonical primitive PopoverTrigger source (MIT, full generated notice retained).
Native popover interaction, positioning and medium Glass use existing Lenso
adapters. Color state is caller-owned; no React interaction runtime is included.

ListBox uses shared Lenso collection recipes and adapts the collection interaction
model already maintained in packages/ui. The Exact controller and pure selection
helper retain caller-owned selection and use native focus/events; no React hooks
or external collection interaction runtime are included.

Tag and TagGroup reuse the Lenso-maintained Tag/TagGroup recipes, shared small
Glass material and the existing collection selection model. The Exact adapters
share their controlled selection bridge with ListBox and retain the source
post-removal focus contract. No React hook or external collection runtime is
introduced.

The Exact Tag presentation adds a selected-hover foreground contrast adaptation;
shared Tag recipes and the original React component remain unchanged.

ComboBox uses the shared HeroUI-derived ComboBox/collection-field recipes under
their retained Apache-2.0 notices. Native editing, invoker and option controls
derive from canonical primitive source with retained MIT provenance. Pure filter
matching adapts Base UI 1.9.0 internals/filter (MIT, Copyright 2019 Material-UI SAS);
its complete MIT notice is retained in src/combo-box-filter.ts. No Base UI React
hook or interaction runtime is imported by this adapter.

Autocomplete reuses the canonical Input, Popover, PopoverTrigger and MenuItem
source derivatives described above, retaining full generated MIT notices. Shared
Autocomplete token recipes retain their HeroUI Apache-2.0 attribution. Its Web
filtering and virtual-focus behavior reuse the existing ComboBox adapter and
Base UI filter adaptation; no extra primitive or upstream runtime fork is added.

InputOTP slots derive from canonical primitive Input, retaining the full generated
MIT notice. `src/input-otp-value.ts` adapts Base UI 1.9.0 OTP value operations
(Material-UI SAS, MIT); replacement/removal use explicit Unicode code-point arrays.
Its Web adapter follows the installed Base UI OTP keyboard, completion and
normalization contracts without importing React interaction code. Shared OTP
StyleX recipes retain their existing Lenso attribution.

PopupButton's Menu trigger derives from canonical PopoverTrigger (MIT, full
notice and source fingerprint retained in the generated Contract). Its ordinary
button uses Exact's native control under the headless package's documented
Button boundary. The shared PopupButton token recipes and existing Menu/Select
adapters retain their original attribution and interaction ownership.

SectionIndex items derive from canonical primitive Link (MIT, full generated
notice and source fingerprint retained). Its navigation/nearest-item behavior
follows Lenso's existing SectionIndex interaction contract, with an authored
linear nearest-center helper. It imports the existing shared SectionIndex token
recipes; no React interaction runtime or upstream SDK patch is introduced.

TabBar destination links derive from canonical primitive Link with full generated
MIT provenance. `src/tab-bar-motion.ts` adapts the source TabBar motion by Kelvin
Zhang and Moein Saharkhiz (MIT), retaining their notices and replacing React
lifetime hooks with explicit cleanup plus stock-router click arbitration.
`src/tab-bar-minimize.ts` adapts Lenso's existing minimization spring, and the
scroll adapter retains its direction/threshold contract. Shared TabBar, Tabs,
Glass and material token recipes retain their original attribution.

RefreshControl's status node derives from canonical primitive Status, retaining
the full generated MIT notice and source fingerprint. Its Web controller adapts
the existing Lenso RefreshControl touch-axis, resistance, phase and release-click
contract to explicit Exact lifetimes. Shared RefreshControl token recipes supply
the ordinary presentation. Exact native buttons retain trigger activation; the
application owns asynchronous work and results. No new Glass renderer or React
runtime dependency is introduced.

ContextMenu's positioner derives from canonical primitive Menu with the full
generated MIT notice and source SHA256. The trigger gesture timing/movement
contract adapts installed Base UI ContextMenuTrigger 1.9.0; its full MIT license
is retained in `src/context-menu.ts`. Point anchoring, bounded native release
arbitration and explicit lifetimes integrate with the existing authored Menu
controller. Context trigger/backdrop and popup dimensions reuse the existing
Lenso shared recipes; no React runtime or replacement renderer is introduced.

ContextMenu compact items/More derive from canonical primitive MenuItem, retaining
the generated MIT notice and source fingerprint. Compact presentation reuses the
shared ContextMenu/Menu recipes on the shared actual popup anatomy. Its explicit
lifetime controller adapts Lenso ContextMenuPopup's existing 600/46 expansion
formula and placement settling, using the unchanged shared glass motion package.

ContextMenu preview motion adapts Lenso's existing `context-preview.ts` spring,
geometry, corner interpolation and opacity handoff. The Web owner uses explicit
Exact lifetimes and native popover drawing retention; the preview/layout recipes
remain shared Lenso styles. Unsupported native exit drawing restores the target
without a replacement interactive popup or renderer.

GlassToggleButton and grouped items derive from the canonical primitive Toggle,
retaining full generated MIT notices and source SHA256. Their native boolean
activation remains primitive-owned. Presentation reuses the existing GlassButton,
ToggleButton and GlassToggleButton shared recipes, while elastic interaction and
optics consume the existing glass package with explicit lifecycle cleanup.

NavigationBar adapts Lenso's Kelvin Zhang / Moein Saharkhiz NavigationBar and
scroll-edge observation model, retaining its MIT file-level attribution. Its
progressive soft masks and variance model adapt Lenso's pure soft-edge helper.
Shared NavigationBar, Toolbar and material token maps retain their original
notices; the full upstream licenses ship in THIRD_PARTY_NOTICES.md. Native Toolbar
activation/focus and the existing glass package remain the interaction/material
owners, without a new renderer or React runtime dependency.

WheelPicker adapts Lenso's existing measured cylindrical projection, native snap
settlement and controlled-value reconciliation without React. It composes the
existing authored Exact ListBox extension, whose native root/items, scalar
selection bridge and focus owner remain shared. WheelPicker/ListBox token maps
retain their original notices; both primitive packages remain unchanged.

GlassMagnifier reuses Kelvin Zhang's attributed Glass/Magnifier token maps and
the existing MIT glassMotion helper, retaining file-level attribution in the Exact
lifetime adapter. It imports the shared renderer and motion implementations;
no duplicate optical or spring algorithm is introduced. Full shared notices
remain in the bundled THIRD_PARTY_NOTICES.md.

DateField adapts Adobe's pure IncompleteDate model from react-stately 3.51.0
under Apache-2.0. The full 2026 Adobe notice remains in date-incomplete.ts;
date-incomplete.provenance.json records its source fingerprint and strict-type
adaptations. It imports public @internationalized/date 3.12.4 types and calendar
operations without React state hooks. Date segments derive from canonical
primitive Input with generated MIT notice/source hashes. Shared DateField and
DateInputGroup maps retain their existing NextUI Apache-2.0 attribution.

TimeField shares DateField's Adobe IncompleteDate pure model (react-stately
3.51.0, Apache-2.0) and primitive-derived MIT inputs. It imports the existing
NextUI TimeField recipe and DateInputGroup maps with their retained notices.
Local time parsing, serialization and Intl calendar formatting use the pinned
@internationalized/date 3.12.4 public API. The model source notice and provenance
are included explicitly in the package file list.

Calendar retains the shared NextUI Apache-2.0 calendar recipes. Its default
calendar-offset bounds and month-heading formatting adapt the existing Lenso
calendar implementation, including getFormattableMonth handling. Date math and
locale formatting use @internationalized/date 3.12.4 public APIs. The day button
derives from canonical primitives-exact Toggle with full generated MIT notice
and source SHA256. No React state hook or SDK modification is introduced.

CalendarYearPicker's pure calendarYears policy adapts Lenso's React Aria 3.52.1
helper, Copyright 2026 Adobe, Apache-2.0. Shared NextUI CalendarYearPicker maps
retain their Apache-2.0 notice. Trigger/cell buttons derive from canonical
primitives-exact Toggle with full generated MIT notices and source hashes.
The Web owner supplies navigation, focus timing and reversible layout/lifetimes;
it does not introduce a second date-selection model or React runtime dependency.
