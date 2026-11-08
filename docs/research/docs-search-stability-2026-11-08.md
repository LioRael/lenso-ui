# Search contour and sticky-layout stability

The reported disappearing header/sidebar was reproduced on the live docs page
in Chromium and WebKit after scrolling 1200px. Opening search kept `scrollY` at
1200 but moved both sticky elements to -1200px. Radix's scroll lock applies
`overflow:hidden` to the positioned body, making it their new scroll container.
Closing also caused a jump to Y 0 during focus restoration.

Result-driven popup heights changed between 134px, 350px and 460px. The old
non-live glass geometry temporarily painted the CSS fallback contour while the
new optical maps encoded: 13 of 40 frames in an isolated input loop. This is
observable contour-mode switching, not a high-speed native Safari recording.

Changes:

- Both docs stylesheets override Radix's locked body with `overflow:clip`.
  Sticky elements keep the viewport as their scroll reference. Radix retains
  wheel/touch isolation and scrollbar compensation.
- Search opts into the existing glass renderer's live geometry and continuous
  foreground rim, avoiding the fallback contour during resize.
- Active-option reveal adjusts only the search result viewport, preserving its
  24px scroll padding. Focus restoration uses `preventScroll`.

The new maintained `test:search-stability` exercises the actual search dialog,
rapid query/result/height changes, keyboard result scrolling, background wheel
input, Escape, restored focus, and every-frame sticky/scroll/contour state.
Before the fix its first desktop case failed with 49 displaced-header frames,
49 displaced-sidebar frames, 5 changed-scroll frames and 10 fallback-contour
frames. Afterward it passed in Chromium/WebKit at widths 1440 and 390 in light
and dark appearance (8 combinations), with zero recorded violations.

Docs package build, docs/app typechecks and affected format/lint passed. The
existing search material suite passed on home/docs in both appearances and
engines: Chromium material pixel checks passed; headless WebKit retained its
known native-blur-control limitation and passed ownership checks only.

The development preview was port 3000. An attempted native Safari review did
not complete because its active tab changed to another preview during the
check; no native Safari visual or high-speed pixel acceptance is claimed.
No full production site build, commit, release or deployment was performed.

No consumer prop changes are required. Consumers receive the runtime fix with
the docs package and must include its current stylesheet for the scroll-lock
override; the application stylesheet carries the same rule for workspace dev.
