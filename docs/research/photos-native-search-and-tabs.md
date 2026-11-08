# Photos search and frosted Tabs comparison

November 5, 2026. Direct observation on the configured iPhone15 Pro Max, iOS27.2.
The phone was already in Photos. Only navigation was used; no query was typed,
no recents were cleared and no photographs or preferences were changed. Search
was closed, the library returned to its prior end position and ownership released.
The offered saved flows modify albums and do not match this inspection.

## Native observations

The collapsed year/month/all control has a visibly frosted, gray material over
photographs, with subdued image detail. The search button opens Search immediately
with a focused input and keyboard; its field sits above the keyboard with a close
button on the right. The navigation dock yields to search controls. Close restores
the source library. Native recent-search thumbnails and date suggestions depend on
personal library/history; they are not copied into this sample.

## Changes

Shared Tabs glass now uses the regular glass-medium material instead of the small
control recipe. Its shared wrapper supplies20px blur; the Photos-specific small
blur override is removed. Actual browser paint layers report blur(20px), the medium
profile and its light70% white /10% gray paint stack. This is an explicit Web
material choice informed by the device, not a measured Apple blur radius or a
claim of identical adaptive tint. Plain Tabs retain their existing fill.

The dock search command now uses TabBar.Button, since it enters a transient search
mode rather than navigating to another persistent tab. The existing SearchField
moves to the bottom with a separate GlassButton close control. Its input takes
focus on mount. visualViewport changes update keyboard clearance with listener
cleanup. The dock is replaced during search; header library actions and the sample
footer are hidden. Blank queries show real sample suggestions and session recents,
not all photos. Enter records a nonempty query, Clear restores the starting state,
and queries still filter actual sample metadata.

Search captures source destination, collection, scroll position and minimization.
Close/Escape restore them in a layout effect, with focus returned to the triggering
button. The layout-effect restore also avoids the remounted TabBar interpreting a
later programmatic scroll as a new user direction.

## Verification

Actual browser: opening search focuses the searchbox; `forest` yields3 photos.
Enter then Clear shows the recorded recent query. An unmatched query shows
No photos found. Escape and the close control return to the source. A library
round trip measured445px before and445px after, focus on tab-bar-button. Entering
from Collections and closing restores the Collections heading. Bottom field and
close control were rendered; screenshots are photos-search-native-layout.jpg and
photos-tabs-frosted.jpg in the task artifact directory. Default viewport restored.

`bun run --filter @lenso/ui-docs test:photos` passes a full-demo DOM regression
with7 assertions: input focus, blank-search state, Escape, scroll restoration and
trigger focus. Its local preload compiles application StyleX with the official
plugin and supplies the CSSStyleDeclaration iterator absent from Happy DOM. This
does not simulate layout or a software keyboard.11 related DOM regressions,
affected format/lint, docs/React types, source boundaries,8-task package build and
installed-consumer exports/types/SSR/assets verification pass. React Doctor stays
59/100 with the pre-existing broad-working-tree error; no global clean-health claim.

## Limits

No Web demo run on the iPhone or WebKit in this pass. Native software-keyboard
geometry, dictation, Apple search recognition/indexing, adaptive tint calibration,
full search morph animation, exhaustive contrast and performance acceptance are
not established. Suggestions derive from sample metadata; recents are session-only.
No release, deployment or commit.
