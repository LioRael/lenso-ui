# UI SDK behavior ownership

The installed public SDK documentation and declarations define the interaction
contract. Lenso appearance uses StyleX and `data-lenso-slot`, leaving native
`data-slot`, state attributes, CSS variables and cancellation intact.

| Family                         | Owner and composition                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SectionIndex                   | A core primitive composes change reporting, roving focus and `bindDrag`. Anchors retain fragment destinations; navigation skips disabled entries.                                                                                                                                                       |
| SwipeActions                   | A core primitive composes `createSwipeActions`. Body owns the gesture; triggers and actions remain independent buttons. The native behavior owns thresholds, velocity, capture and live transforms.                                                                                                     |
| List                           | A core primitive composes `createSelection` and `createReorder`. The collection registers keys and geometry; the parent owns accepted ordering. Reorder's handled-key result prevents duplicate button activation. Native outside-close cancellation preserves first-tap dismissal of another row.      |
| WheelPicker                    | A core primitive owns the value/change contract. Listbox supplies keyboard selection and form participation; `bindScrollPicker` supplies scrolling, measurement and snapping. Rebinding the beta behavior after rejection restores the accepted selection without a second scrolling state machine.     |
| Date/time fields and calendars | A shared core primitive owns committed serialized values, cancellation, controllers, agents and roving focus. Internationalized date and Stately models retain calendar arithmetic, zones, editable segments and validation. Native Field and NumberInput own labels, descriptions and numeric editing. |
| Year picker                    | Native Collapsible owns disclosure. The value primitive and SDK roving focus own year selection and keyboard focus. Geometry only positions the overlay.                                                                                                                                                |
| Color controls                 | One native ColorPicker owns each composed color editor. Area, Slider and Swatches are its parts. Color models provide channel arithmetic, serialization and display while preserving powerless hue. A ColorField primitive commits a whole color independently of its editable text.                    |

A domain value crosses the controller/agent boundary as an ISO date, time,
two-element ISO range, CSS color, or visible year identifier. Decode and validate
that boundary; callbacks still receive their public domain model. Changes use
`createChange` or `dispatch` and preserve the originating event and source.
Canceled changes neither commit values nor close a containing picker.
Popover Content owns the dialog; Title labels the popup rather than wrapping
its interactive contents. Pickers expose native Title, Close and
PopoverDescription parts instead of a second Dialog container. Date picker
value models have disclosure disabled and do not expose open/close methods;
native Popover is the sole owner of opening, dismissal and focus restoration.
Cascaded closes use the native controller and its imperative reason;
`withSource` retains agent attribution. Direct value changes retain their
originating event and Button action details.

Range gestures use `bindDrag` for lifecycle, threshold, capture and Escape.
Only the range model's anchor/highlight is provisional; cancellation restores
that anchor. Form resets restore the primitive's default through the same change
contract. Hidden numeric/text primitives are excluded from agent discovery when
the whole-value primitive is the meaningful public operation.

The beta swipe behavior can request a commit after cancellation. A scoped
cancellation guard filters that request without implementing another recognizer.
ScrollPicker has no cancellation callback; its public cleanup/bind lifetime is
used to restore a refused value. Dependencies are not patched.

Verification lives in `packages/primitives/src/model-control/model-control.test.ts`,
UI DOM regressions, and the docs browser scripts `model-behaviors.mjs`,
`swipe-wheel.mjs`, `list-refresh.mjs` and `ui-sdk-native.mjs`. Browser checks cover
actual scrolling, capture, form values, popup focus, range dragging and agent
cancellation; DOM tests alone do not establish that behavior. Strict declaration
acceptance remains subject to [the upstream constraint issue](../upstream-ui-sdk-types.md).
