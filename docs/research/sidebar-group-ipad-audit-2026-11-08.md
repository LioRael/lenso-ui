# Sidebar group appearance and motion: iPad audit

Date: 2026-11-08. Scope: comparison only; no Sidebar implementation changes.

## Sources and evidence

Physical device: 11-inch iPad Pro (M5), iPadOS 27.2, landscape. Observed Photos
Media Types and Music Library/Playlists disclosure groups. Music's Library and
Playlists were restored to their initially expanded states. Photos Media Types
was also restored expanded. No library items, playback, filters or settings
were changed. The device was released after inspection.

Quality H.264 recordings retain original presentation timestamps:

| Reference | Encoded frames | Duration | Dynamic median interval | Dynamic P90 interval |
| --------- | -------------: | -------: | ----------------------: | -------------------: |
| Photos    |          1,113 |  24.914s |                21.410ms |             23.545ms |
| Music     |            796 |  14.926s |                17.508ms |             19.866ms |

Dynamic intervals exclude gaps of 100ms or more. These figures describe capture
delivery, not a sustained frame rate or the panel refresh rate. Native raw frames
are oriented portrait; inspection sheets rotate and crop the sidebar. No
interpolated frames were inserted. Evidence is under
`output/playwright/sidebar-group-ipad/`, with Music in its `music/` subdirectory.
The reference includes personal library labels/backdrops and remains local.

Web: maintained development preview at
`http://127.0.0.1:3000/en/docs/react/components/sidebar`, Chromium and WebKit,
1194 by 834. A separate Chromium touch context checked coarse-pointer row size.
Checks waited for hydration before activating disclosure controls. Clicking SSR
markup earlier had produced no state change and was not counted as verification.

Prior sidebar notes were used to locate ownership and the actual `#nd-sidebar`
scroll container. Current source and rendered measurements establish the findings
below; older production acceptance is not reused as proof of the current page.

## Findings

1. **High: disclosure expansion is instantaneous in the current Web shell.**
   Both browser engines sampled only two panel bounds, 0 and 312px, across an
   opening, with no intermediate height. Native captures show continuous
   vertical movement and space being made for subsequent groups. The heading
   stays stable; child rows retain their text proportions. `Sidebar.DisclosurePanel`
   currently exports the raw Base UI panel and neither the shared Sidebar styles
   nor the Docs `children` style supplies an expansion/return transition.

2. **Medium: the disclosure arrow states and motion differ.**
   The physical groups use right-pointing collapsed and downward expanded
   chevrons. Docs uses a downward ChevronDown at rest and rotates it 180 degrees
   to point up when expanded. The browser samples show only the two end matrices,
   identity and a 180-degree rotation. The chevron has no nonzero transition
   duration. This is a page-owned style in
   `packages/docs/presentation/styles/sidebar.stylex.ts:129`.

3. **Medium: group heading styling is split across unrelated rules.**
   The shared static Label uses 15px/600, a secondary label color and a 54px
   minimum row. Shared DisclosureTrigger inherits an ordinary 17px/400 item
   with a 44px minimum. Docs overrides its trigger to 12px/500 with secondary
   color, 38px desktop rows and 44px coarse-pointer rows. The rendered 12px
   group titles are visibly smaller than the native reference's group headings.
   Native font parameters were not read from UIKit; no exact point-size match
   is claimed. A consistent group-heading rule should be distinct from ordinary
   destination items and shared by static/disclosure compositions as appropriate.

4. **Aligned within this scope: pane size and basic hierarchy.**
   Music's sidebar is approximately 280 logical pixels wide in the capture;
   the Docs pane is 280px. Both keep group headings subdued, ordinary destinations
   distinct and the selected destination in a rounded row. Docs reaches a 44px
   minimum row in the tested coarse-pointer context. This does not establish
   color/typography pixel parity. Existing Web document labels and navigation
   density remain application decisions.

## Ownership and suggested next change

`Sidebar.Group` is a static semantic section. Its lack of an animation is not
itself a defect: the compared folding behavior belongs to `Sidebar.Disclosure`,
`DisclosureTrigger` and `DisclosurePanel`.

The bounded next change is to supply coherent disclosure heading/chevron styles
and a reversible panel transition while retaining Base UI's state, keyboard,
focus and presence ownership. Preserve row text proportions, stable headings,
sibling reflow and independently scrolling content. Include rapid reversal,
nested groups, reduced motion and focus inside a returning panel. Keep the
existing 280px Docs shell and real navigation model.

The native captures support motion relationships and qualitative timing. Exact
native spring constants, glyph interpolation, all themes, VoiceOver and
contrast ratios were not measured. This audit introduces no API, component
source, build, publication or landing change.

## Saved local replay

At the user's request, the Music disclosure navigation was saved locally to
`/Users/leosouthey/.iphone-use/flows/music/ipad-sidebar-groups-reference.json`.
Its 12 steps completed on the physical iPad, and a subsequent screen read
confirmed Recently Added and All Playlists were visible again. It requires the
Chinese Music sidebar to be visible with Library and Playlists expanded, folds
and restores both groups, and does not judge animation or record video. Offline
validation passed. No flow was published.

## Implementation follow-up

The approved follow-up now styles `Sidebar.DisclosureTrigger` as a 15px/600
secondary heading and wraps the native `Collapsible.Panel` with StyleX styling.
A 250ms transition uses Base UI's measured panel height. The unscaled inner
body is bottom-aligned inside a clipped panel so child rows slide from beneath
the stationary heading and following groups reflow continuously. Native Base UI
still owns state, presence, keyboard handling and refs. Reduced motion uses zero
duration. Shared chevron styling gives a right-to-down quarter turn in LTR and
a left-to-down turn in RTL.

Docs uses 15px/600 headings, 44px heading targets and consistent 12px group
spacing. Normal destination-row typography and the 280px shell are retained.
The Sidebar story demonstrates the shared arrow style.

The Panel's native props remain available, with caller StyleX last and native
state-dependent inline styles preserved. Its DOM now contains an internal
`data-slot="sidebar-disclosure-body"` wrapper; consumer direct-child selectors
must account for it. Existing calls without direct-child assumptions need no
migration. Component API documentation was regenerated with the maintained
script. No primitives source was changed.

Verification on the final CSS/native-measurement implementation:

- Tokens, UI, Docs and testing package typechecks passed.
- Affected lint/format checks and the new nested/retained-panel ref and
  state-style DOM regression passed. DOM tests do not prove layout.
- Chromium and WebKit at 1194 by 834 passed intermediate opening/closing height
  and chevron samples, constant child-row height, rapid Enter-driven reversal,
  reduced motion and RTL. This focused check is maintained in
  `apps/docs/test/sidebar-motion.mjs` and wired into the Docs browser entry.
  The complete general Docs browser suite was not rerun.
- Chromium at 834 by 1194 in a Chinese touch context also verified 15px/600
  headings, 44px targets without horizontal label overflow, and Enter activation.
- A temporary closing sampler followed the trigger's `aria-controls` after
  close, incorrectly reporting zero height once that association was removed.
  Keeping the actual panel reference fixed the sampler. An unnecessary
  ResizeObserver fallback was removed; no extra geometry observer remains.
- Physical iPad Safari's sampled replay showed continuous expansion/return,
  stable text proportions and sibling reflow. Its closing burst spans
  71.929–72.181s, with eight changed frames roughly 33–42ms apart. The capture
  `/Users/leosouthey/.iphone-use/instances/ipad/runs/recordings/2026-11-08T16-11-04Z.mp4`
  is variable-rate and does not establish 60/120Hz parity.
- After removing the extra measurement fallback, refreshed iPad Safari verified
  the final native-measurement-only candidate again. Its close contains eight
  changed frames at 156.916–157.173s, about 33–38ms apart, with continuous panel
  and following-group movement. Final recording:
  `/Users/leosouthey/.iphone-use/instances/ipad/runs/recordings/2026-11-08T17-00-40Z.mp4`.
  This physical pass used the user's existing windowed iPad Safari and dark
  appearance. The device lease was released after verification.
- React Doctor scanned the workspace's accumulated changes and returned 64/100
  with existing findings in unrelated controls/theme code. It did not report
  Sidebar findings. This is not a clean full-workspace score or a measured
  before/after score comparison.

No production-specific integration was changed; no full production site build,
landing or publication was performed.
