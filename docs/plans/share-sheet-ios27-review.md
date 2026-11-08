# ShareSheet iOS 27 reference review

Reference: `lenso-apple-ios-ipados27-source-20261027.fig`, downloaded locally.
The canvas was decoded directly for this review on 2026-11-03.

## Source measurements

- Activity View `13112:5166`: width 402, horizontal padding 16, section gap 20.
- Action Group `13112:5173`: width 370, effective radius 26, secondary fill
  (light appearance: RGB 120/120/128 at 16% opacity).
- Action `126:58332`: minimum height 52, horizontal padding 16, leading
  symbol region 32, symbol-to-title gap 8, title 17/22. The separator starts
  at the title, 56 points from the row edge.
- Header `5591:68049`: thumbnail 64 with radius 16, title 16/20,
  subtitle 16/20, title-to-subtitle gap 1. Its optional menus account for
  the source's taller header; the web header grows with its actual content.
- Contacts and apps retain 66-point targets with 25.333-point spacing.

## Composition and consumer changes

ShareSheet actions already compose List, List.Item and List.Action. The demo
now also uses List.Leading, List.Content and List.Title, with leading icons.
The ShareSheet-specific group fill, separator inset and spacing follow the
reference without changing generic List styling.

ShareSheet now defaults to a single fully open snap point `[1]`, so its
intrinsic-height content stays visible. Consumers that need partial stops can
still pass `snapPoints` explicitly. Action children should use the List parts
as shown in the maintained Story; custom trailing accessories remain possible.

## Verification

UI, tokens and docs typechecks, affected formatting and lint passed. The
existing component DOM suite passed 10 tests. Live Chromium review covered
light and dark desktop appearance (1280×720), dark narrow geometry (390×844),
52px action rows, 56px separator inset, copy/save handlers and Escape focus
restoration. Desktop popup settled entirely inside the viewport after opening.

The local file supplied geometry, hierarchy and paint values; a matching
rendered Figma frame was not captured. Sample artwork and fonts differ, so
this is not a pixel-parity claim. WebKit, narrow light appearance, touch swipes
and production acceptance were not checked in this pass.

## Native render investigation

The follow-up inspected the downloaded archive rather than treating decoded
geometry as a Figma screenshot. Its `canvas.fig` contains 37,698 node records.
The four action instances in `13112:5173` reference `126:58332`; their text
overrides are Add to Favorites, Add to Quick Note, Find on Page and Add to
Home Screen. Their derived layout retains the 52-point rows, 32-point leading
region and title origin at 56. The maintained Story has different content.

The archive's tall embedded bitmaps were inspected; they are wallpapers, not
rendered Activity View frames. The archive thumbnail is a document preview,
not a full-resolution ShareSheet export. The archive does not supply the
required matching reference PNG through these assets.

The local Figma desktop file and its home screen remained in a blank/loading
state, including after a local-file open attempt and a file-tab reload.
The desktop MCP endpoint was not listening. An HTTPS request to Figma's public
website succeeded, which does not establish that the editor can load.

No native reference render or pixel-difference percentage was produced.
Parameter verification above remains valid, but pixel comparison remains
uncompleted. No additional style changes were made on the basis of a
reconstructed image.

## Native reference recovered

The desktop accessibility tree subsequently exposed the owning file key,
`PUcXplzG6sQoXpLMdKJS0T`. Figma MCP exported Activity View `13112:5166` as
a 402×1044 PNG. The downloaded local node is 402×984, so this online render
is useful visual evidence but does not establish exact parity with the
downloaded revision. The subsequent metadata request hit the account's MCP
plan limit.

The real image revealed a mistake in the initial parameter extraction:
`rectangleCornerRadiiIndependent` is true on both action groups. All four
per-corner values are 26; the retained generic `cornerRadius: 10` is inactive.
The implementation now uses 26. Header and target insets also account for
the Activity View's outer 16-point inset plus nested padding (16 in the header,
15 in target rows), producing thumbnail/title starts at 32/112 and target
starts at 31 relative to the sheet. Target separators are inset with the rows.

The native reference PNG is stored with the chat's visualization artifacts as
`share-sheet/figma-reference.png`. No aggregate pixel-diff score is reported:
the local and online revisions and the Story's content differ.

After restarting the unresponsive docs development preview, live Chromium
at 1280×720 verified the corrected thumbnail origin (32,32), title x=112,
first target x=31, 370px action-group width, 26px radius and 52px rows.
Light and dark screenshots were visually inspected, and Copy link plus Escape
focus restoration passed again. Affected tokens typecheck, lint and formatting
passed; the existing component DOM suite passed all 10 tests. These final
inset changes have not yet been reviewed in WebKit or narrow layouts.

## Full-content follow-up

The maintained Story now exercises all three horizontal rows (contacts, apps,
and circular quick actions), a four-row action group and a two-row secondary
group. Contacts compose Avatar fallbacks; actions continue to compose List
parts. Demo handlers only update the local status.

This exposed an actual overflow defect: the flex-column body compressed target
and action groups instead of scrolling. The four-row group collapsed from 208px
to about 116px and clipped the remaining buttons. Target and action groups now
disable flex shrinking. The same live browser then measured groups at 118px,
105px, 121px, 208px and 104px, with body scrollHeight 792px versus clientHeight
522px at 1280×720. The slight differences in target-row heights from the design
allow the complete labels to fit instead of clipping the source's text frames.

Chromium checks also covered 390×844 dark and 320×568 light viewports. All six
action rows remained 52px; the popup stayed within the viewport, Print was
reachable and updated the status, and Escape restored trigger focus. Reduced
motion at 320×568 produced a zero-duration popup transition. The temporary
viewport and media overrides were reset. Docs and tokens typechecks plus
affected lint/format passed. WebKit and a same-content/revision image diff
remain unverified; the full-header optional collaboration menus are not part
of this photo-sharing Story.
