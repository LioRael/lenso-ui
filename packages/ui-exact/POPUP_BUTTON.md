# PopupButton for Exact Web

PopupButton provides the source's ordinary tint-colored button and double-chevron
indicator. It owns no open or selected state. Its exact source recipe is shared
with Lenso; floating menu/selection surfaces retain their existing material owner.

- `PopupButton(id, label, disabled, type, press)` renders one native button with
  caller content followed by the indicator. `type` is button/submit/reset.
  Exact's native button supplies activation; the headless primitive package
  deliberately has no ordinary Button wrapper.
- `PopupButtonMenuTrigger(id, label, target, disabled)` derives the actual button
  from canonical PopoverTrigger, with native menu metadata and the existing Menu
  controller. The ordinary marker excludes the Glass trigger recipe/optics.
- `PopupButtonSelectTrigger(state: SelectState)` delegates to the existing
  SelectTrigger on the same native node, preserving value, readonly, form and
  listbox ownership, then appends the shared indicator. It retains Select's slot.
- `PopupButtonIndicator` is available for authored composition and is hidden from
  assistive technology. The convenience buttons append exactly one by default.

The runnable example composes ordinary activation, Menu radio choices and a
controlled Select. A button by itself does not create a popup. The menu and
selection parts supply their full keyboard, dismissal and focus-return behavior;
PopupButton does not simulate that behavior or place a second wrapper around them.

Generic refs/render/native attribute forwarding and all host props remain explicit
API gaps. Menu/Select retain their documented broader motion/optical/native gaps.
Browser behavior and actual rendering must be verified independently of Contract
compilation. No upstream SDK or primitive package changes are needed.

## Focused Web acceptance

The isolated stock consumer passes Chromium/WebKit initial font/height/background
and indicator checks before the hatch connects, then native Space/Enter/pointer
activation, native Menu commands, radio selection and rejected updates, Select
navigation skipping disabled choices, readonly/disabled guards, outside/Escape
dismissal, focus return, RTL and removal/remount. Both engines pass native touch
taps through Menu and Select. The initial-style fixture waits for its blocked
module requests to finish before navigating to the behavior page.

Twenty-four captures cover button compositions and open Menu/Select surfaces in
light/dark at 390/820px. Assertions retain the 44px button height, 18px font,
14x18 indicator, transparent ordinary background and viewport containment.
Captures wait for finite transitions to finish. The earlier RGBA serialization,
transition-endpoint and route-fixture observations are retained; no product code
was changed to make a transient background pass a steady-state assertion.

Receipt: `.cache/acceptance/popup-button-settled/acceptance.json`.
The suite passes 67 tests / 249 assertions, typechecking covers 117 files, and
affected lint/format plus the isolated stock build pass (six existing warnings).
The focused browser cohort does not exercise submit/reset consumer forms or
close the parent Menu/Select optical, motion and native-device qualification.
It does not establish a performance improvement or source pixel parity.

The same candidate also passes the original Menu focused regression in both
engines: `.cache/acceptance/popup-button-menu-regression/acceptance.json`.
Its existing Glass-trigger behavior and 36 placement endpoints per engine pass
with empty page/console errors. This does not extend the component optical gate.
