# Photos demo: iPad navigation adaptation

## Physical reference

Observed Photos on the connected 11-inch iPad Pro (M5), iPadOS 27.2,
landscape. With its sidebar hidden, the destination control is a compact,
text-based capsule at the top center. Search is a separate upper-right action.
The year/month/all-photos control remains at the bottom. Opening the native
sidebar replaces the top destination capsule with sidebar navigation; the
sidebar was closed again after inspection.

This change adopts the top destination placement, separate search action and
bottom timeline in the Web Photos demo. It does not add the native sidebar.
The 768px viewport boundary is a Lenso application decision, not a recovered
Apple size-class constant. A narrow iPad window uses the phone composition.

## Implementation

The Photos demo subscribes to viewport changes and composes the existing
`TabBar` phone/tablet layouts. At 768px and above it keeps the main text capsule
expanded at the top center, moves Search to the header and keeps the timeline
available below. Smaller windows retain the existing bottom navigation and
scroll minimization. Search and selection retain their existing state and
focus ownership. Shared TabBar props, materials and primitives are unchanged.

The existing search regression now covers both 390px and 834px. Its previous
component-specific selector assumed Search always lived in a TabBar group;
the two cases verify input focus, source scroll restoration and focus returning
to the correct trigger in each composition.

## Development verification

- Photos DOM/regression suite: 11 passed, 0 failed.
- Affected formatting and lint passed.
- Docs typecheck initially passed. A later run was blocked by the separately
  modified `src/components/fumadocs/ui/search-dialog.tsx`: its `labels.hint`
  property is absent from the current label type. This file was not changed
  for the iPad adaptation.
- Chromium and WebKit: 390, 767, 768, 834 and 1194px widths exercised navigation
  placement, destination changes, Search opening/input focus/closing/focus
  restoration, and the tablet timeline. Live transitions between phone and
  tablet layouts also reached the expected final composition.
- Chromium at 834px portrait additionally exercised selection/cancel,
  keyboard destination activation, dark appearance, RTL and reduced motion.
- Physical iPad Safari, landscape (approximately 1194 by 834 including browser
  chrome): inspected the interactive top text capsule, upper-right Search and
  bottom timeline. Library/Collections changed the displayed content; Search
  focused its input and opened the keyboard; Close search dismissed the keyboard
  and restored Library, top navigation and timeline. No overlapping header
  controls or clipped labels were observed. The first settled capture showed
  the server-rendered phone layout before client viewport adaptation; later
  interactive captures showed the tablet layout. No zero-flash initial-render
  guarantee or native reload verification is claimed.
- Chromium reported no page-script errors in the width matrix. WebKit completed
  the functional checks but emitted three blob-resource access-control errors
  during the multi-navigation/resize run. No claim of an error-free WebKit
  session or fully loaded WebKit photo backdrops is made.

Investigation screenshots are in `output/playwright/ipad-tabbar-*.png`.
This is development evidence; no production build, landing or publication was
requested or performed.
