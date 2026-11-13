# Photos demo reference and motion

The demo is an interactive Web interpretation of Apple Photos, not an Apple
application or a calibrated reproduction of the native renderer.

## References inspected on November 4, 2026

- [Get started with Photos, iOS 27 user guide](https://support.apple.com/en-au/guide/iphone/iphc259d0ac7/27/ios/27):
  official Library screenshot, three-column edge-to-edge grid, overlaid title
  and item count, Filter and Select actions, grouped Library/Collections dock
  and separate Search destination.
- [View photos and videos, iOS 27 user guide](https://support.apple.com/en-au/guide/iphone/iph3d267610/27/ios/27):
  official viewer screenshot with a back control, centered information capsule,
  thumbnail filmstrip and grouped bottom actions.
- [Apple services announcement, June 9, 2026](https://www.apple.com/newsroom/2026/06/apple-unveils-innovative-features-and-intelligence-experiences-across-services/):
  official Shared Albums image and 3.33-second video. Inspected the glass
  controls over photography and changing album grid. This clip does not show
  opening and closing an individual photo.
- [Enhance your UI animations and transitions, WWDC24](https://developer.apple.com/videos/play/wwdc2024/10145/):
  Apple's source-view zoom transition and interruptible presentation principles.
  This is motion guidance, not an iOS 27 Photos timing measurement.

The reference images and video are research artifacts, not demo assets. The
application continues to use the attributed Unsplash sample photographs.

## Web decisions

The Library grid runs behind its overlaid heading. A localized dark fade keeps
white text readable over photographs. Filter uses native menu radio items for All Items, Favorites and Edited, with
density and appearance actions; Select enters multi-selection with batch favorites. The viewer uses separate Share and Delete controls around a central favorites
and information group. Share offers image download and copying its URL. Delete
removes a sample from in-memory state after confirmation; the library offers
Undo. The central toolbar also opens a working, non-destructive adjustment editor.

The viewer keeps the UI SDK modal for focus containment, Escape, nested
popovers and focus restoration. The same Lenso Toolbar and TabBar materials
own the floating controls; the page does not introduce another glass recipe.
The thumbnail strip selects real photos in the current collection.

For pointer opening, a temporary presentation image starts at the actual tile
center, expands uniformly to the fitted image bounds, and releases its square
crop as it moves. The source tile is hidden only for the transition. Closing
returns to the current photo's tile. An offscreen or removed tile falls back to
immediate dismissal. Background and controls fade with the image's movement.

Opening uses 280 ms and closing 240 ms with the existing
`--lenso-motion-ease-out-quart` token. These are Lenso Web tuning decisions.
Closing during an opening animation reads its current transform, crop and
opacity before reversing. Changing photos or unmounting cancels animations
and restores visibility. Reduced motion and keyboard opening skip the zoom;
Escape closes immediately. Toolbar arrow-key ownership remains with UI SDK.

## Pull-down dismissal

Only the photo stage starts this gesture. An eight-pixel vertical intent
threshold avoids treating a tap or horizontal motion as dismissal. Pointer
capture retains control outside the image. Cancellation and lost capture return
the image; a second pointer hands control to image scaling. Native
image dragging is disabled. The photo stage uses `touch-action: none` for its
owned image gestures; browser zoom remains available outside the stage.

During a pull the image follows pointer displacement, scales down to a bounded
size and reveals the library as the background and controls fade. Upward travel
past the resting position has resistance. Re-grabbing an opening or returning
image reads its current transform, crop and opacity before taking control.

Release dismisses after `min(160px, 22vh)` of downward displacement, or after
at least 32px with downward speed of 0.65px/ms. A clear upward reversal overrides
the distance decision. Velocity uses the most recent same-direction movement
within 80ms and expires after an 80ms hold, so an earlier downward flick cannot
override a later upward correction.

A rejected or cancelled pull returns with the existing glass release's unit-mass
spring parameters, stiffness 230 and damping 31. Its position samples include
release velocity and run through native Web Animations; its 600ms sample window
includes the settling tail. Re-grabbing pauses that animation at the visible
position. A successful pull reuses the existing thumbnail return transition.
Reduced motion retains direct pointer movement and background fading, omits
scaling, and settles immediately on release. These thresholds and physics are
Lenso Web decisions, not measurements of Apple's native implementation.

The sample library has 24 mixed portrait, city, food, interior and landscape
photographs. The title capsule uses descriptive labels and actual pixel
dimensions because capture metadata is unavailable. Glass controls use 44px
targets. During a pull, viewer controls fade earlier than the background so the
viewer and library headings do not compete. The source grid scrolls beneath a
sticky heading and remains at its previous position when the viewer closes.
Native iOS gesture calibration remains outside this pass.

## Paging, image zoom and gesture ownership

At the fitted size, an eight-pixel direction decision assigns each single-pointer
gesture to horizontal paging or downward dismissal. Horizontal intent stays
horizontal until release. Paging uses 22% of the viewport width, or at least 24px
with 0.55px/ms velocity, and rejects a clear reversal. First/last-photo edges
resist with a 0.22 travel factor. Adjacent images are fitted independently and
separated by 12px. Two neighbors on each side preserve visible content during
an interrupted consecutive page. Selection commits at release; a layout effect
rebases the incoming page before paint. Re-grabbing reads the visible animation
transform, while each new swipe is judged by its own displacement.

Double click or touch double tap toggles between the fitted image and 3× zoom,
anchored to the tapped image point and clamped to the image bounds. Pinch uses
the ratio of two-pointer distance and the moving midpoint, preserving the image
point beneath the fingers. The settled range is 1× to 4×, with bounded resistance
outside it. A second pointer takes over an active dismissal at its visible pose.
Lifting one finger rebases the remaining finger into a pan without changing the
visible transform. Only the final release settles the image. A zoomed single
finger pans instead of changing photos or closing the viewer.

Pan bounds use the fitted photo size, not its full-size CSS wrapper. Release
projects pan velocity using the existing spring's damping/stiffness ratio and
clamps its destination. Pan, zoom and page settlement reuse the unit-mass 230/31
spring through transform-only Web Animations with a 600ms settling tail. An
interrupted animation is read before cancellation; a tap that interrupts settling
resumes its destination. Closing from a zoomed image carries the visible zoom and
translation into the existing source-tile transition.

Ctrl-wheel trackpad pinch is intercepted only over the photo and scales about
the event location. A non-passive listener is attached through the stage's ref,
including when its portal mounts after the parent effect. Resize clamps the
current image into the new stage dimensions. Photo options provide Zoom In and
Reset Zoom for keyboard users; plus zooms, zero/minus resets, and arrow keys pan
when zoomed. At the fitted size, arrows continue to change photos. UI SDK retains
modal, toolbar, popover and focus ownership. Reduced motion keeps direct gesture
tracking and applies final zoom/page positions without animated settlement.

These thresholds and limits are Web decisions, not measured Apple parameters.

## Glass continuity during photo transitions

Fade each viewer glass surface and the filmstrip individually. Keep their shared
content ancestor at opacity 1 during opening, closing, dragging and spring return.
An ancestor opacity below 1 establishes a backdrop root, so descendant backdrop
filters cannot sample the scene behind that ancestor. This previously rendered
the controls as uniform gray until the opening animation completed. Per-surface
opacity preserves the same timing and the live glass backdrop throughout.

Reference: [Filter Effects Level 2, Backdrop Root](https://drafts.csswg.org/filter-effects-2/#BackdropRoot).
The page uses its existing Lenso materials; no fallback palette or glass renderer
was changed for this correction.

## Immersive viewing, information and editing

Additional primary references inspected November 4, 2026:

- [View photos, iOS 27](https://support.apple.com/en-au/guide/iphone/iph3d267610/27/ios/27): tap to hide and restore controls, and browse from the filmstrip.
- [Edit photos, iOS 27](https://support.apple.com/en-ca/guide/iphone/iphb08064d57/27/ios/27): the editing entry point and light/color adjustment workflow.
- [Photo information, iOS 27](https://support.apple.com/en-au/guide/iphone/iph0edb9c18f/27/ios/27): inspect available image information and captions.
- [Library filtering, iOS 27](https://support.apple.com/en-ie/guide/iphone/iph2e66e2f2c/27/ios/27): filtered library categories and removing filters.

A single tap waits for the existing 280ms double-tap window before switching to
black, edge-to-edge viewing. Double tap cancels that pending action. Hidden
controls leave layout instead of only inheriting visibility, which also removes
the glass renderer's externally painted surfaces. A keyboard-focusable Show Photo
Controls action appears on focus. Modal naming, Escape and browser modifier-key
shortcuts remain available. Stage resizing reuses the fitted-image bounds logic.

Information now uses Lenso Sheet rather than a tiny popover. Its 55% and expanded
snap positions keep the photo in context. Captions are editable, kept in demo
state and included in search. Pixel dimensions, megapixels, MIME type and actual
file bytes come from the image; missing capture/camera/location data is explicitly
unavailable. No simulated map, capture date, face recognition or camera model is
presented as real metadata.

The viewer's central group has Favorite, Information and Edit controls. The
editor uses a dark canvas, a single yellow editing accent, 44px header actions,
three adjustment controls and working Original/Vivid/Mono previews. Exposure,
contrast and saturation use browser filter operations, not Apple's image engine.
The slider follows the native Lenso Slider part contract. Adjust and Filters keep
a stable controls height. Compare or holding the image previews the original;
Reset clears the draft. Cancel and Escape discard the draft.

Done renders a JPEG at the source pixel dimensions, using the same filter
expression as the preview. The result is held as an object URL and propagated to
the grid, viewer, filmstrip, transition image and download link. Duplicate saves
are guarded while rendering. Canceling during rendering ignores the eventual
result. Save errors are shown with the draft intact for retry. Replacing or
reverting an edit revokes its previous URL, and leaving the demo releases its
URLs. Revert to Original requires confirmation; its dialog retains its content
during exit rather than flashing the next action's label.

The Edited filter and pinned collection use actual saved edit state. Counts
handle the singular case and empty filtered libraries use a readable ordinary
header. Edited exports can be downloaded; copying an image link explicitly uses
the original stable sample URL, not the temporary object URL. Edits and captions
are local to this mounted demo and reset on reload. There is no account, iCloud,
Photos permission integration, full crop/retouch/AI/video engine or claim of
complete native parity. Those are outside the verified Web demonstration.

## Physical-device navigation refinement, November 5, 2026

Observed the user's iPhone 15 Pro Max on iOS 27.2 through iphone-use. Expanded
Library/Collections navigation is content-sized, with Search independently aligned
to the trailing edge. Browsing toward earlier items revealed a collapsed Library
icon, a central Year/Month/All picker, and separate Search. The generic TabBar
continues to own only destination navigation and minimization.

The demo now starts at the end of its existing sample sequence and minimizes when
scroll position decreases. Returning toward the end expands navigation. A controlled
minimized state coordinates the page-owned date picker without changing TabBar's API.
The same picker selects working year/month overview cards and drills back into All.
These samples were acquired on November 4, 2026; overviews explicitly group by date
added. No capture dates or additional years of photo history are invented. All
samples therefore belong to one real acquisition month and year.

The compact destination group is 184px wide, shrinking as needed. The date toolbar
uses the space between the collapsed destination and Search, with an explicit
selected state. Its native Toolbar keyboard contract remains intact. Photo
opening, dismissal, selection and editing retain their existing owners.

## Sort/filter and selection pass, November 5, 2026

Physical-device observations confirmed the sort/filter menu's top date choices,
primary filters, Media Types and View Options submenus. Selection replaces the
right-side Select action with a Filter/More group and separate Cancel control.
Its bottom actions are Share, selected-count review and Delete. Unavailable
selection actions are disabled at their actual Menu/Popover trigger owners,
not only on a composed render child.

The demo supports all/favorites/edited filters and explicit empty results for
shared, self-shot, unfiled, video and screenshot categories absent from the sample
library. Media Types has Photos, Videos and Screenshots. Date Added is the only
available sort because these assets have no capture timestamps; Date Captured is
disabled with an explanation. View Options owns two grid densities, a justified
aspect-ratio grid and the demo's appearance switch. The aspect-ratio grid arranges
three images per row (two when enlarged), using each image's real width/height.

Selection supports single toggles, Shift-click ranges, Ctrl/Command+A, count
review, deselection from the review sheet, bulk favorites, additive membership in
existing sample albums, sharing and confirmation-backed deletion with batch Undo.
Sharing offers individual real downloads and copying image URLs; edited images
copy original URLs instead of ephemeral blob URLs. It is a browser implementation,
not the native iOS share sheet. Selection is cleared when its filter/context changes;
Cancel restores focus to Select, or Filter when Select is unavailable. Input fields
and portalled menus/dialogs retain their own keyboard handling.

Native duplicate/hide, camera metadata adjustment, face recognition, iCloud and
system sharing services are outside this sample's data model. The demo does not
present inactive commands pretending to perform those operations. Physical-device
inspection was stopped and ownership released when the foreground app changed.

## Selection continuity and menu geometry, November 5, 2026

The header keeps one Filter group and one Select/Cancel button mounted across
selection states. Pointer activation measures the current rendered rectangles and
animates transforms to the new layout over 240ms using the existing
`--lenso-motion-ease-out-quart` token. Foreground counter-transforms protect glyph
proportions; label/icon transitions and the More slot run independently. The glass
surfaces themselves do not crossfade through a newly mounted gray placeholder.
Reversing selection captures the in-flight pose before cancelling the previous
animations. Geometry animation is skipped for keyboard activation and reduced
motion; animation cleanup cancels outstanding work on unmount. The newly mounted
bottom controls receive a short 180ms translation, without changing their material
opacity. These are Web timing choices, not measured Apple timings.

A shared Menu.Group defect had left its RadioGroup at intrinsic width. Its children
now stretch across the available menu content area. This fixes item hit regions and
the moving highlight plate together, while retaining native Menu keyboard and
selection contracts. Photos keeps its two-column sort header separate from the
full-width filter rows, aligns the section heading with the icon column and opens
its popup over the trigger, as in the observed native arrangement. Unavailable
capture sorting has a concise inline label instead of a large explanatory block.

## On-device motion comparison, November 5, 2026

A fresh iphone-use session inspected Photos on iOS 27.2. Navigation-only actions
entered and exited selection, opened Filter and dismissed it outside the popup.
The observed header keeps Filter while exposing More in the same group; Cancel
becomes a separate circular control. The menu expands from the Filter location,
reveals its two-column sort header and full-width icon rows, and contracts back
on dismissal. The local recording has variable frame intervals and does not
establish Apple's exact timing or spring constants. No photos or preferences on
the phone were changed; the library was restored and the owner lease released.

Selection foreground compensation now samples the reciprocal shell scale and
screen-space centre path together. This preserves both icon proportions and
position during the entire transition, including a captured in-flight reversal.
Browser samples at 0, 60, 120, 180 and 240ms measured a 22px icon between 22px and
22.006px wide. Endpoint-only counter-scaling had distorted its intermediate pose.

Photos sets the internal `--lg-menu-content-start-scale` presentation variable to
`.92`, allowing content to reveal through the expanding glass clip near reading
size. Other menus retain the existing `.5` default. UI SDK continues to own
open state, selection, dismissal, focus and unmount. Media Types uses the same
icon/label columns as its neighboring filter rows.

## Appearance changes during menu motion, November 5, 2026

The menu's foreground and portal theme updated before its asynchronously encoded
SVG lens. An observed light-to-dark change retained the old light filter for
about 363ms, including a reopen, before replacing it with the dark lens. This
was an appearance mismatch rather than a missing menu transition.

Glass now installs the existing synchronous material color-transfer recipe at
attachment and on appearance changes. It contains no image inputs, so the current
appearance is available without waiting for optical map encoding/decoding. The
fully decoded geometry replaces this temporary face afterward; generation checks
still reject obsolete work. React attaches the runtime in a layout effect so the
initial face is ready before paint. Both temporary and final filters are cleaned
up with their consumer. Geometry/shadow detail can finish asynchronously; the
color transfer is already in the current appearance throughout menu motion.

A cold-renderer DOM regression holds animation work pending while exercising
light/dark/light/dark updates and cleanup. Actual browser checks also delayed
image decoding by 800ms: two 1800-frame traces produced 3628 menu-material
samples, including 249 samples awaiting optical images and 27 closing samples,
with no old-appearance color transfer. These are frame-state observations, not
an FPS benchmark or a substitute for native WebKit/device acceptance. Test
instrumentation was removed and the normal preview reloaded afterward.

## Drag selection and editing, November 6, 2026

Drag selection now uses an anchored range with an initial-selection snapshot,
retraction, deselection and edge scrolling. The editor now composes the existing
Tabs, Toolbar, Menu, Slider and dialog controls around Adjust, Filters and Crop.
Relative rulers, gesture history, dirty-exit confirmation, crop geometry and
actual JPEG export replace the earlier minimal editor. Edited output dimensions
are propagated back into the viewer.

Native-processing and touch-platform differences remain; this implementation
does not establish full iOS parity.

## Detail options and discard confirmation, November 6, 2026

The detail overflow now uses the existing morphing Menu rather than a Popover.
Its action row, separators and album/information submenus follow a fresh native
inspection. Discarding edits now uses a compact, undimmed ActionSheet near Cancel,
with one destructive action and outside/Escape dismissal that retains the draft.

## Editor appearance inheritance, November 6, 2026

The editor now inherits the surrounding Photos appearance. Removed its forced
dark ThemeScope and replaced fixed workspace/control colors with semantic theme
variables. Normal and crop workspaces, menus and discard confirmation therefore
follow light/dark appearance together without losing a draft.
