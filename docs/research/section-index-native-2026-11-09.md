# SectionIndex: Contacts comparison

Reference: physical iPhone 15 Pro Max, iOS 27.2, Contacts, dark appearance,
2026-11-09 (Asia/Shanghai). Inspected the resting screen and a recording of
holding and scrubbing the right-edge alphabet. No contact data is reproduced.

## Observations and implementation

- Contacts places its complete A–Z/# index at the trailing edge, centered on the
  visible list. Its letters are compact, blue and bold. There is no persistent
  current-letter pill or large floating letter in the inspected gesture.
- The list changes section while the finger is down, and stops at content
  boundaries. The index stays in place. Section headings provide location
  feedback; the gesture does not animate through every intervening row.
- Lenso now uses 11px semibold letters with 13.8px minimum pitch in a 16px visible
  column, retaining a 44px gesture strip. These are Web calibration choices,
  not extracted UIKit constants or a pixel-equivalence claim.
- Primary pointer-down activates immediately, takes capture and tracks the
  closest enabled letter even when the pointer moves sideways off the strip.
  Release does not activate again. Keyboard focus-only navigation, native
  fragment links and modified clicks remain supported.
- The produce demo now has A–Z/# sections, plain rows, sticky headings and a
  separately scrolling list. Its own click handler prevents native fragment
  navigation from scrolling the outer documentation page; its callback scrolls
  only the list. Ordinary list scrolling updates the current-location marker.

UIKit exposes separate [resting background](https://developer.apple.com/documentation/uikit/uitableview/sectionindexbackgroundcolor)
and [tracking background](https://developer.apple.com/documentation/uikit/uitableview/sectionindextrackingbackgroundcolor)
properties. Their existence does not establish which presentation Contacts
uses; the inspected dark reference did not justify adding a tracking capsule.

## Verification scope

Use `DOCS_URL=<dev-url> bun run --filter @lenso/ui-docs test:section-index` for
the real docs composition: Chromium/WebKit, 390/1280px, light/dark, pointer
press/scrub, Chromium touch/cancel, local scroll ownership, stationary index,
scroll-spy updates, keyboard and disabled state. DOM regression coverage checks
immediate activation, child-capture transfer, cancellation and release-click
suppression separately.

The eight docs browser combinations passed, as did all four light/dark
Chromium/WebKit combinations in `test:segmented-section`, five affected DOM
tests, affected formatting/lint and docs typechecking. The isolated fixture now
hides the overlapping scrollbar: WebKit was routing right-edge input to its
scrollbar rather than to the visible index. Its native-fragment test also
re-reads coordinates after pointer-down because activation now happens before
release. The final UI-wide typecheck was blocked by concurrent Command token
declaration changes; it did not report a SectionIndex diagnostic.

## Second review: row metrics and the pinned navigation edge

The first pass above restored interaction but did not reproduce the row or
header composition closely enough. The second pass used a full-resolution
1290×2796 screenshot from the same physical iPhone (3 device pixels per point),
plus resting and scrolled Contacts observations.

| Detail               | Native evidence                                                                      | Current Web composition                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Row pitch            | Successive divider starts are 231 device pixels apart                                | 77px minimum row, 16px vertical padding                                                                   |
| Leading image        | Approximately 135 device pixels wide                                                 | 45px Avatar; initials are sample produce content                                                          |
| Avatar/text guides   | Leading edge 48px; text/divider edge 231px                                           | 16px leading inset, 16px gap, text at 77px                                                                |
| Ordinary divider     | Starts at x=231, ends at x=1241 inclusive, 3px thick                                 | 1px line, 77px leading and 16px trailing inset                                                            |
| Section divider      | Starts at the outer content guide rather than text                                   | 1px line, 16px inset at both ends                                                                         |
| Typography           | Native body/header roles visually match 17pt; header is semibold                     | Body 17px/22px at 400; header 17px/22px at 600, in a 36px row                                             |
| Index blue           | Dominant un-antialiased pixel RGB(0,145,255)                                         | Semantic tint gives #0091FF in dark appearance; light uses the darker tint-text role                      |
| Index type and pitch | 23-device-pixel capitals, approximately 13.79pt row pitch across the native alphabet | 11px/13.8px at weight 600; the earlier 700 weight produced heavier stems in the inspected browser capture |
| Dark section label   | The reference is dimmer than the current 70% secondary-label role                    | 60% alpha of the same native secondary-label RGB, scoped to this demo                                     |
| Pinned boundary      | A one-device-pixel full-width edge replaces the ordinary inset rule                  | Subdued full-width hairline at the pinned edge, respecting 1×/2×/3× density                               |

The pinned section title and navigation belong to one backdrop band. The demo
uses NavigationBar with its individual edge disabled, and the existing shared
soft ScrollEdge behind both titles. After the follow-up correction, full-strength
coverage grows from 60px to 96px when a section pins, with a separate 24px fade
below that region (84px/120px total height). Scrolling content is still sampled
behind it. An aria-hidden
visual copy provides push-off and clipping at the navigation boundary without
adding an opaque sticky surface or blurring the label itself; the original
section headings remain in the accessibility tree.

The browser regression now measures the two divider guides and row typography,
and checks the pinned title, an 18px push-off, the next-header handoff and the
single shared edge in all eight Chromium/WebKit theme/viewport combinations.
The maintained docs typecheck, affected lint/format and five DOM tests pass.

The updated page was also opened in physical iPhone Safari over a temporary LAN
proxy to the existing dev server. Resting rows, a jump to M, ordinary list
scrolling and a continuous index gesture ending at R were inspected. Produce
navigation and the pinned group title stayed crisp while previous-group content
blurred behind them. The proxy is a development check, not a deployment.

The Web demo has different content and a shorter viewport than Contacts.
Typography uses the platform system font; there is no matched-content pixel-diff
claim. Native haptic equivalence, VoiceOver operation, light-appearance native
pixel matching and large-text index compression remain unverified.

## Follow-up: full-strength coverage before the fade

The second review shared the same effect node but stretched the default mask
to 96px. Its blur and tint were already almost transparent behind the pinned
title. The node count and height assertions could not catch that visual defect.

ScrollEdge now accepts an internal `fadeStart` distance. All blur bands and the
tint retain full mask coverage before that distance; the calibrated cosine
falloff occupies only the remaining tail. The default zero distance retains
the existing profiles for other callers. The indexed scene uses 96px of
coverage plus 24px of fade when pinned, rather than ending the fade at 96px.

The docs regression places high-frequency stripes behind the shared backdrop
and samples the painted pixels in the middle of the pinned-title region and
near the end of the tail. It must remove sharp stripe detail behind the title
while returning to clear content below it; sharing a DOM node alone is not
accepted as proof of a continuous backdrop.

The stripe probe passed in Chromium at 390/1280px in both appearances. In this
host's headless WebKit, an independent unmasked CSS blur reference also retained
sharp stripes, so that backend is not used as pixel-blur acceptance; its four
layout/interaction runs still passed. Physical iPhone Safari was reopened with
the corrected profile: a jump to M followed by ordinary scrolling showed rows
blurring through the navigation/title region and clearing below it, while the
pinned M stayed sharp. The temporary LAN proxy was stopped after inspection.
