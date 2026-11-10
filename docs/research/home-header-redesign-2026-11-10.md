# Product-first Liquid Glass homepage

## Direction

The owner requested a bolder Apple-inspired introduction while retaining the
full-screen photograph, separate brand/navigation surfaces, controls near the
viewport edges, centered landscape tabs and navigation that follows the full page.
Energy 3, rhythm 2, motion 2: a strong product headline, purposeful optical controls
and direct press feedback without added entrance choreography.

Two arrangements were considered: keep the photo as a gallery with the product
introduction below it, or put the product introduction directly over the live
background. The second makes the library and its documentation available in the
first useful view. The background remains interactive rather than becoming a
promotional illustration.

[Apple's materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials)
describes a distinct navigation/control layer above content. Lenso applies that
principle here; the composition and CSS dimensions below are local design choices,
not native rendering or pixel-parity claims.

- A centered, large two-line title supplies the focal point. A short description
  and actual documentation/components links sit directly below it.
- Both central actions use ordinary Button. The primary action retains Lenso's
  semantic tint; the secondary uses an opaque semantic content surface, not glass.
- Brand and main navigation remain independent Glass surfaces, separated by 16px.
  Their 56px desktop height is quieter than the preceding large capsules. The
  wordmark's UI suffix no longer has a separate box.
- Desktop utilities are search, one appearance/language popover, and repository.
  Language, presets and light/dark/system selection remain inside that native
  panel. The documentation header's shared utility components are unchanged.
- The landscape caption becomes a small bottom-left detail from 1024px; the
  favorite action moves to the bottom-right from 768px. Narrow views omit those
  secondary photo controls to reserve space for the product and landscape tabs.
- Tabs stay centered. Their positioned container is only as wide as the control,
  so its transparent overflow row cannot intercept the favorite button.
- The scene remains edge-to-edge at 100svh. Header and overlays retain 16px phone
  and 24px wider-screen edge guides. The header stays fixed and inherits the page
  appearance when the photo passes its boundary.
- A short-height layout reduces title scale and spacing and omits the technical
  eyebrow, keeping the title, actions and bottom tabs separate in landscape.

## Development evidence

Reviewed at `http://127.0.0.1:3000`. Captures are in
`output/playwright/home-editorial/`. Directly inspected English/Chinese desktop,
Chinese phone and English 320px phone captures.

| Check                       | Scope and result                                                                                                                                                                                                             |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout                      | Chromium/WebKit, English/Chinese, light/dark, 320×568, 390×844, 844×390, 1024×768, 1440×1000, 1920×1080: 48 combinations passed viewport coverage, no horizontal overflow, title centering and header/title/tab separation   |
| Preferences                 | Desktop appearance/language popover opened; both page appearances selected and dismissed with Escape                                                                                                                         |
| Navigation                  | Search opened/dismissed, mobile menu keyboard focus returned, native wheel scrolling reached the footer with persistent navigation, documentation CTA loaded                                                                 |
| Component and photo actions | Nested language switch and preset-panel opening, components CTA, favorite activation and elastic/reduced-motion behavior checked in both engines                                                                             |
| Maintained regression       | Homepage first-paint/backdrop regression passed in Chromium/WebKit; added favorite on/off activation because existing coverage did not catch an invisible full-width tab row intercepting the newly corner-positioned action |
| Source                      | Affected format/lint and documentation typechecks passed                                                                                                                                                                     |

Scoped delivery review:

- Structure PASS: the product and real entry points appear in the first viewport;
  geometry checks cover the two languages and short/narrow layouts.
- Purpose PASS: typography owns the main hierarchy; glass is used for floating
  navigation/actions and the existing anchored preferences panel.
- Identity PASS: the full-screen live backdrop, separate optical navigation and
  product typography form one composition, with secondary photo text reduced.
- Interaction PASS: native controls, nested preferences, both entry points,
  favorite hit testing, reduced motion and the maintained regression were checked.

## Selection material correction

The lifted Tabs/SegmentedControl knob was independently copying the page's marked
photo. In WebKit this exposed sharp photo detail through the selected segment,
bypassing the track's existing material. Its refraction span now establishes a
local live-backdrop boundary: the knob sees the composited track while its own
material, label refraction and native selection behavior remain in place.

Before/after held-state captures in Chromium and WebKit are in
`output/playwright/home-tabs-material/`. Both now retain the processed track
instead of displaying a fresh photo copy. The central actions were verified as
ordinary buttons, retaining their documentation/component destinations.

The homepage regression now holds the selected tab and rejects page-photo images
inside its refraction layer; previous coverage inspected resting/returning states
only. It also checks that both central links use ordinary button material.
That regression passed in both engines. The shared segmented-section browser
check passed both engines/appearances, including press/drag/settle, keyboard,
RTL, narrow layout, ordinary/glass variants and native radio/tab semantics.
Eight targeted Tabs/SegmentedControl DOM tests and affected format, lint and
UI/docs typechecks also passed. No public API or preserved primitive changed.

This is development evidence. Full contrast auditing, screen-reader operation,
real iPhone/Safari, RTL, browser zoom, all presets, production acceptance and
unrelated concurrent checkout changes remain outside this review.
