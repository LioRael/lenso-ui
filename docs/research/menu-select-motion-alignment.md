# Select and icon Menu motion alignment

Date: 2026-11-08

Follow-up: the circular icon Menu decisions below were superseded by
[physical-device measurements](menu-icon-device-alignment.md). Text Menu and
Select behavior from this pass remains unchanged.

Select previously shared Menu's material/glyph infrastructure, but used a separate spring when native selected-item alignment was active and an anchored-scale fallback otherwise. It now uses the same interruptible Menu timeline from its trigger in both placements. Base UI still owns placement, option selection, scrolling, keyboard handling, focus and dismissal.

Two concrete defects were more conspicuous on icon-only Menu triggers. The returning glyph gained an extra scale/translation and blur based on the panel's progress, so it could balloon and drift even after becoming opaque. The closing drop also started at the source center and used the whole popup height, rather than attaching to the source edge and using the remaining height. Glyphs now retain their measured geometry and use the reference face-opacity blur. The drop joins the appropriate source edge, rounds only its free end, and becomes invisible when its reach is zero.

The reference's recorded closing squeeze/lift belongs to a wide text button. Icon-only triggers now retain their independent press response instead. Text Menu triggers retain the sampled horizontal return, with their height preserved. This icon distinction is an intentional Lenso decision, not a physical-device calibration. The underlying Menu opening/closing shape tables and optical material recipes remain.

Select also keeps its source field stationary during return. An intermediate implementation applied the wide Menu label squeeze/lift to Select and reproduced a WebKit `ResizeObserver` delivery-loop warning after touch selection. Keeping the native selection anchor fixed removed the warning in the targeted reproduction; the complete strict browser regression was then rerun. Selected label copies are refreshed at close, and their transform is cleared before measuring their new dimensions.

## Verification

- Package build and installed-consumer exports/types/SSR/production-assets checks.
- Affected format, lint and UI/docs type checks.
- Nine existing/extended Menu motion, toolbar ownership and submenu-title DOM tests. The shape assertions cover attachment above/below, short/zero-reach drops, stationary icon/Select anchors, interrupted motion and shared-source cleanup.
- Maintained browser test: `apps/docs/test/menu-select-animation.mjs`, Chromium and WebKit at 1440px and 390px widths.
- Desktop Select uses native selected-row alignment and keyboard End/Enter selection. Mobile uses actual browser touch taps, exercising ordinary placement; mouse reopening and Escape preserve the selected value and restore focus.
- Opening frames demonstrate the shared Select morph. Ordinary touch placement is explicitly asserted to have a side other than `none`.
- Default icon Menu captures retain a 20×20 glyph during its visible return, without the wide-label squeeze. Text-trigger returns retain their horizontal trajectory and original height.
- Both families exercise reduced motion. Final strict checks reject page errors, including the WebKit warning found during development.

The motion sampler captures its owned popup synchronously before dismissal. Looking for `data-open` only on the next animation frame misses a closing popup. Screenshots are taken outside frame collection so screenshot work does not skip the brief visible-glyph interval. Documentation source/action menus are separate from the live example; the test targets the actual `Actions` example.

Daily rendered verification uses the existing docs preview on port 4337. Package-consumer verification uses production packaging. Screenshots and frame samples establish scoped browser behavior, not native iPhone equivalence. Physical iOS recordings, all custom-render triggers, multiple-selection configurations, all nested menus and full contrast acceptance were not exhaustively tested. CPU was not benchmarked; material/fusion computation was not changed.

Artifacts: `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/menu-select-motion-alignment/`.

Scoped design gate: PASS for existing feedback motion, unchanged page composition, native selection/keyboard behavior, reduced motion and desktop/mobile rendering. No new navigation, controls, copy claims or assets were introduced. This is not a full-site accessibility certification.
