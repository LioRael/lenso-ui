# Native component migration

Objective: implement the full Lenso component library as native components where
possible. The baseline is all 99 families exported by `packages/ui/src/components`.
The [inventory](native-component-coverage.json) keeps every family visible, including
missing components and partial adapters. A facade or export is not feature parity.
The goal remains active until actual implementations and appropriate platform
verification cover the complete scope; this first batch does not redefine it.

## Platform ownership

iOS uses UIKit/system Glass where there is a corresponding system control. Android
uses native text input and accessibility infrastructure with Lenso presentation and
the existing native Glass renderer. React Native TextInput already hosts system
UITextField/UITextView and Android editing views; preserve its event-count,
composition, selection, clipboard and keyboard implementation rather than introducing
a competing text bridge. Web UI SDK contracts and preserved primitives are unchanged.

Share state/value models and compatible StyleX/RSD declarations. Keep platform-specific
native presentation files and native interaction APIs (`onPress`, native refs, etc.).
Do not claim that Web DOM props, selectors or browser shaders are interchangeable
with the native adapters. Ordinary form content uses ordinary surfaces; Glass belongs
to the corresponding floating control/material role.

## Current expansion

The first expansion adds ordinary UIKit buttons, UIStepper, UISegmentedControl,
UIKit selection buttons, native text editing, grouped choices and the content
primitives needed to compose a real settings form. Android uses the same state owner
with Lenso controls. Default values initialize uncontrolled state; explicit controlled
values remain authoritative when an owner rejects a proposal. Group disabled/readOnly
state dominates child flags. Radio choices cannot deselect themselves. Stepper values
are bounded but are not snapped onto the slider's minimum-relative grid: UIKit permits
off-grid owner values and increments from those values.

Text input forwards the actual native ref and editable/readOnly/disabled behavior.
The initial TextField is an ergonomic labeled input; it is not yet the Web compound
Root/Input/Label validation API. Checkbox does not yet implement indeterminate state.
ToggleButtonGroup currently supports multiple selection. ButtonGroup/Toolbar provide
layout but do not yet propagate shared child options. Chip/Tag currently expose static
presentation and do not establish dismissal/selection support. These remain `partial`
in the inventory. iOS Stepper increment/decrement accessibility naming is owned and
localized by UIKit; the custom label props currently target Android buttons.

The fixture's native catalog is a verification screen, not a claimed implementation
of TabBar or navigation. It exercises actual values, rejected changes, disabled/loading
actions, light/dark, native text editing and caller StyleX composition.

## Remaining scope

1. Finish foundational parity: validation/compound field parts, refs, indeterminate
   choices, single-mode toggle groups, shared groups, progress and complete typography.
2. Navigation and containers: native TabBar, Tabs with associated panels,
   NavigationBar, Sidebar, lists, tables, disclosure, scrolling, refresh and paging.
3. Overlay ownership: menus/context menus, popovers, dialogs, sheets/drawers,
   tooltips, command, toast/notification, sharing, focus restoration and dismissal.
4. Selection and specialized values: Select/ComboBox/Autocomplete/ListBox,
   numbers/OTP/wheels, date/time/calendar/ranges, and the complete color family.
5. Finish data/content families, Glass variants and all family-specific supporting
   parts. Cover localization/RTL, larger text, keyboard, screen-reader operation,
   reduced motion/transparency, supported old-OS fallbacks and representative devices.

## Evidence policy

Numeric tests catch stepper/selection edge cases absent from existing slider tests.
The inventory test catches omitted families; it does not prove their behavior.
Native builds must compile the real module. JavaScript exports and type checks do
not establish native linkage or rendering. Operate the actual application and record
the exact fixture, installed binary, accepted/rejected values and representative
appearance states. Never count a cached wrong test runner, standalone UIKit probe,
alias, empty mount or a source snippet as complete component acceptance.

Historical Glass-only acceptance remains in
[the initial delivery record](../research/native-source-delivery-2026-11-10.md).
New components require their own runtime receipts.
