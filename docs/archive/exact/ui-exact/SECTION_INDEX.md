> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# SectionIndex for Exact Web

SectionIndex renders a narrow navigation index of real fragment links. It shares
the Lenso 44px rail, 16px links, compact type, focus ring and disabled recipe.
Each link derives from canonical primitive Link with retained MIT provenance;
the primitive package and upstream Exact remain unchanged.

`SectionIndex(state, items, change)` takes opaque unique item values, visible
labels, same-page `#fragment` hrefs and disabled flags. The controlled state has
`id`, localized `label`, `value`, `hasValue`, `disabled`, `direction`, `scrollport`
and `scrollOffset`. `hasValue` distinguishes no current location from a selected
empty-string key. `change(value)` proposes the key; the application owns location.
No selected-key string is split or normalized. The example has ordinary page
fragments and a separate local contacts scrollport.

ArrowUp/Down and Home/End move focus without selection and skip disabled links;
Enter uses native link activation. One available link is a tab stop. Pointer
scrubbing captures the primary pointer and activates the nearest enabled link by
vertical center. Authored order resolves equal distances. Repeated motion over
one key does not repeat the request, and the trailing pointer click is suppressed.
Modified clicks retain native browser behavior without proposing a value.
Disabling, cancelling, losing capture and unmounting release the drag.

An empty `scrollport` retains native fragment navigation. A nonempty scrollport ID
confines unmodified navigation to that container and subtracts `scrollOffset`
from the target's position. The real href remains for browser link semantics and
modified activation. The scoped click guard runs at window capture because the
stock Exact router handles fragment links at document capture; a later element
handler cannot cancel a route already taken. It ignores every other root and
releases its listener on unmount. In either mode, rejecting a current-location
proposal does not veto navigation, matching the source's controlled link model.

Scroll-position tracking belongs to the application; this example updates its
current location through activation and does not derive it from manual scrolling.
Generic native/event/ref forwarding, richer child composition, pre-hatch local
navigation, source geometry/motion parity and physical-device gestures remain
separate gates. Browser DOM checks do not establish platform accessibility
or touch-device acceptance. The pinned compiler renders a navigation role on its
native box rather than promising an HTML nav tag.

## Focused Web acceptance

The isolated stock consumer passes Chromium/WebKit native fragment navigation,
opaque Unicode/comma and empty keys (including repeated activation), controlled
rejection without a navigation veto, modifier-event bypass, roving arrows and
Home/End without selection, disabled items/root, dynamic item removal, RTL,
scoped scrolling with a 12px offset, mouse scrubbing and click deduplication,
pointer cancellation and removal/remount. The local scrollport checks retain the
page URL and outer scroll position. A full native mouse path skips an unavailable
item and invokes each crossed enabled item once. Both engines pass browser taps;
Chromium also passes a continuous native CDP touch sequence. WebKit continuous
touch and physical devices remain open. Synthetic cancellation/modifier events
are distinguished from native mouse/touch input.

Thirty-two index captures and thirty-two content captures cover enabled/disabled,
LTR/RTL, light/dark and 390/820px layouts. Assertions retain the 44px rail, 16px
links, 11px default text, logical alignment, containment and disabled opacity.
The first layout fixture forced a 100%-wide scrollport beside the rail and shrank
the index; the final example gives the scrollport the remaining flex space.
An earlier fixture also left C enabled while the drag test expected it disabled;
its observations are retained and are not treated as a duplicate-event defect.

Receipt: `.cache/acceptance/section-index-layout/acceptance.json`.
Existing native link/navigation tests also pass both engines with identical copied
test source in an isolated output folder:
`.cache/acceptance/section-index-navigation/acceptance.json`. Page/console errors
are empty. The package suite passes 69 tests / 261 assertions, typechecking covers
120 files, and affected lint/format plus the isolated stock consumer build pass
(six existing warnings). This is selected candidate behavior/rendering evidence,
not source pixel/optical parity, complete native API coverage or a performance
comparison. Native fragment fallback remains available before local enhancement;
the pre-hatch local-scroll behavior has not been qualified.
