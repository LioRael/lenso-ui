# Liquid Glass homepage header

## Direction and decisions

This is the component library's introduction for React developers. Keep Lenso's
existing type, semantic colors and working examples. The owner requested a bolder
header expressing Lenso's own Liquid Glass. Energy 3, rhythm 2, motion 2:
full-viewport photography, independent optical surfaces and direct press feedback.

Two arrangements were considered: floating glass over the plain page, or
navigation over the existing live photo example. The latter puts real content
behind the material, making its optical behavior visible immediately. The
example remains interactive. The title and supporting actions follow it.
The owner then chose edge-to-edge first-screen photography and explicitly
requested that the brand and main navigation remain separate.

- The wordmark has stronger type and a small UI suffix to distinguish the name
  from navigation without adding an unrelated symbol.
- Brand and navigation are independent `Glass` surfaces with a 16px gap.
  No fusion container surrounds them, including during press deformation.
  Both use elastic feedback while links keep native semantics.
  Search, language, appearance and repository retain their established order
  and individual action materials, without another glass surface around them.
- The header stays fixed across the full page, including the article and footer.
  It uses a dark `ThemeScope` over photography and inherits the page appearance
  below it. IntersectionObserver tracks the photo boundary; a desktop breakpoint
  change updates the measured header height and closes the mobile popup.
  This replaces the earlier photo-boundary restriction; there is no scroll listener.
- The scene is edge-to-edge, without a card radius, outer gutter or shadow.
  The page owns a `100svh` scene height for the photo;
  the small viewport unit keeps the scene stable with mobile browser chrome.
  The article below retains its 1440px maximum frame and ordinary gutters.
- Title scale establishes the focal point. The introduction and documentation
  links form a supporting group beside it on wide screens.
- The existing photo example supplies a live optical backdrop rather than
  introducing a new promotional image.
- Mobile navigation uses native Popover and its anchored panel material, with
  a title, vertical destinations and a separate preferences group. It dismisses
  with Escape, restores focus and closes when resized into desktop layout.
- The example's inset tab container uses automatic width so its existing 100%
  width cannot extend beyond the trailing inset and clip the control.
- Header and photo overlays use viewport-edge guides: 16px on phones and 24px
  from 768px, without the article's maximum-width cap. Brand/navigation surfaces
  start 16px below the top edge. Mobile menu placement follows the same guide.
- Landscape switching stays centered at the bottom. On wide screens the photo
  caption moves to the bottom-left edge; below 1280px it stays above the tab row
  so the caption and centered control cannot collide.

## Development verification

Reviewed against the existing hot-reloading server at `http://127.0.0.1:3000`.
This is development evidence, not a production build or release acceptance.

| Coverage                                                                                                    | Result                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Chromium and WebKit, English/Chinese, light/dark; 320×568, 390×844, 844×390, 1024×768, 1440×1000, 1920×1080 | 48 combinations checked exact viewport coverage, no document overflow, independent glass surfaces, 16px desktop gap and tab containment      |
| Search and appearance popup                                                                                 | Verified in the preceding header iteration; unchanged in the fullscreen adjustment                                                           |
| Language                                                                                                    | Verified in the preceding header iteration; unchanged in the fullscreen adjustment                                                           |
| Mobile navigation                                                                                           | Enter/Escape checked in both engines; focus restoration, resize dismissal and destination navigation also passed in the preceding iteration  |
| Main navigation                                                                                             | Docs and Agent tools loaded through keyboard activation in both engines                                                                      |
| Optical interaction                                                                                         | Independent surfaces; measured press enlargement; reduced motion suppressed enlargement in both engines                                      |
| Scroll                                                                                                      | Native wheel scrolling reached the footer in both page appearances; header stayed at viewport top and search remained usable in both engines |
| Landscape switching                                                                                         | Viewport centering and edge-aligned header controls checked across the 48 layout combinations; tabs remained inside the viewport             |
| Existing homepage regression                                                                                | Both engines passed first-paint geometry and returning-photo backdrop checks                                                                 |
| Source checks                                                                                               | Affected formatting, lint, docs and docs-script typechecks passed                                                                            |

Desktop and mobile captures for both languages and appearances are available
locally in `output/playwright/home-header-fullscreen/`. Inspected desktop light/dark,
Chinese desktop and mobile, and English mobile captures directly.
The same folder includes `footer-light.png` and `footer-dark.png`, showing
persistent navigation over the lower page. The light capture was also inspected
after optical rendering settled.

Scoped delivery review:

- Structure PASS: existing destinations and real content retained; 48 layout
  combinations had no document overflow or clipped example tabs.
- Purpose PASS: surfaces group navigation and separate optical controls from
  photo content; typography and frame choices have the reasons recorded above.
- Identity PASS: independent glass silhouettes, full-viewport photography and
  real press enlargement put Lenso's material behavior in its navigation.
- Interaction PASS: native destination links, mobile popup keyboard operation,
  independent press/reduced motion and the existing example regression passed
  in both engines. Prior utility-control evidence is identified above.

No shared component implementation was changed for this header. Concurrent
unrelated checkout edits remain outside this work. This review does not establish a full contrast
audit, screen-reader testing, real Safari/iPhone behavior, RTL, browser zoom,
all theme presets or production acceptance.
