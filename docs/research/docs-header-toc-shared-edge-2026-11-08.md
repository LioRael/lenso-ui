# Shared header and narrow TOC scroll edge

The shared header/TOC ownership remains current. The later
[physical iOS hard-edge comparison](hard-scroll-edge-physical-device-2026-11-08.md)
supersedes this report's MyGo blur/fill recipe and 7% dark hairline. It found the
macOS-derived recipe less accurate overall on the tested iPhone and replaced
it with measured light/dark parameters.

The shared ownership and geometry below remain current. The initial soft variant
was subsequently replaced with hard: its fade left underlying article text too
visible behind the expanded TOC. Header and TOC still use one edge together.

The narrow TOC now renders into a header-owned slot through a React portal. It
retains the article's Fumadocs heading context, while the header's existing single
soft edge covers the combined bounds. The TOC trigger and expanded contents use
transparent surfaces there. Standalone article TOCs retain their existing fallback
placement and surface. Desktop TOCs remain in the right column.

No consumer migration is required for `DocumentationSiteLayout` and
`DocumentationArticle`: the layout supplies the slot automatically.

Verified against the hot-reloading docs preview on port 3000:

- Chromium and WebKit at 390, 1024 and 1440 CSS pixels: one header edge, equal
  header/edge bounds when collapsed and expanded, no horizontal overflow.
- Narrow header heights are 96px (390px viewport) and 104px (1024px viewport),
  including the 40px TOC trigger. Opening grows the same edge with the header.
- Anchor selection closes the TOC; the Usage heading lands below the header.
- Dark appearance with reduced motion: keyboard activation and resizing between
  narrow and desktop layouts preserve the TOC's responsive visibility.
- Reviewed Chromium screenshots of the expanded light TOC and collapsed dark TOC.
  Headless WebKit geometry checks do not establish native Safari blur appearance.
- Affected format/lint, docs package build, docs and docs app typechecks passed.

This is development verification, not production or native Safari acceptance.

## Hard variant follow-up

Repeated the six Chromium/WebKit viewport geometry and anchor-dismissal checks
after switching to hard; all passed. Reviewed expanded light/dark Chromium
captures over scrolled article controls. The shared backdrop uses the existing
hard material (3px blur, 85% white / 55% black fill), with no TOC-local layer.
Format and lint passed. The follow-up app typecheck is blocked by an unrelated
`home-showcase.tsx:95` `overflowLabel` prop error; it is not a passing check for
this revision. No production or native Safari acceptance was performed.

## Hard-edge hairline follow-up

Checked the current [MyGo ScrollEdge source](https://github.com/egoist/mygo/blob/main/plugins/glass/edge.go).
Its hard edge includes a content-facing outer hairline: half a DIP, black at
10% in light mode and white at 7% in dark mode. The shared Lenso hard variant
now includes this line. At DPR 1 it paints 1 CSS pixel at half opacity; at DPR 2
and above it paints 0.5 CSS pixels at full opacity. This is a Web approximation
of the reference's scale-aware line, not a complete optical calibration of its
blur or color matrices. The previous Lenso blur and fill remain unchanged.

Chromium and WebKit at 390px, DPR 1/2 and light/dark appearance verified the
line's dimensions, color, opacity, position at the combined expanded header's
268px boundary, one shared edge, and hidden material at scroll rest. Reviewed
Chromium DPR 2 screenshots in both appearances. Tokens build, tokens/UI
typechecks, eight existing tokens tests, and affected format/lint passed.
The initial UI typecheck used stale tokens declarations; it passed after the
tokens build. No full-site or native Safari optical acceptance is claimed.

Existing hard-edge consumers receive the hairline automatically; no prop or
consumer migration is required. Soft edges do not render it.

## Hard material and Safari clipping follow-up

This section supersedes the earlier unchanged-blur/fill and outside-line notes.
The hard recipe now follows MyGo's 6.4px blur, 1.25 content saturation and +0.03
channel offset. The background uses the current page's primary background,
0.947 saturation and +0.03 offset, clamped before mixing at 82.45%. A CSS filter
chain approximates the content matrix; intermediate clamping and browser blur
kernels prevent a universal pixel-parity claim. MyGo's default dark background
is #18181b; Lenso continues to use its own theme background with the same recipe.
Soft-edge tints have an independent token retaining their earlier appearance.

Actual desktop Safari on the port 3000 Menu page showed the earlier outside
hairline missing. Moving the hairline inside the material bounds made it
visible along the header bottom. The unfiltered owner now holds separate
frosted `::before` paint and `::after` hairline; each follows scroll visibility.
No new independent TOC material was introduced. The line remains deliberately
faint and the entire scroll edge remains hidden at scroll rest.

Chromium screenshot pixel comparisons against an independently calculated
MyGo tone formula gave these RGB values over uniform rgb(80,120,160) content:

| Background            | Web screenshot | Formula     |
| --------------------- | -------------- | ----------- |
| White                 | 224,233,242    | 224,233,242 |
| Black                 | 21,30,39       | 20,29,38    |
| MyGo dark             | 40,49,61       | 40,49,60    |
| Colored rgb(32,64,96) | 48,81,116      | 48,82,115   |

The first comparison exposed unclamped relative-color channels producing an
overbright white fill; the final recipe clamps them. These uniform-patch checks
verify color mixing, not Gaussian kernel equivalence or native matched images.
On the live Button page, Chromium light/dark at DPR 1/2 verified one shared
expanded edge, its 268px height, inside line geometry and a measurable line in
screenshot comparisons with/without the hairline (peak mean channel difference
13/25.08 light and 9/16.15 dark). Screenshots were reviewed in both appearances.

Headless WebKit's uniform-patch output corresponds to the unfiltered content
mixed with the correct fill; it does not paint the backdrop color filters in
this environment, consistent with the earlier native-blur control limitation.
Its pixel output is not accepted as optical parity. Actual Safari confirmed
the visible hairline and frosted header in light appearance; native Safari dark
and narrow TOC optical comparison remain unverified.

Final tokens build, tokens/UI typechecks, eight existing tokens tests and
affected format/lint passed. No full-site production acceptance was performed.
No consumer prop changes are required; existing hard edges receive the revised
material. Overrides of the hard tint no longer implicitly change bundled soft
tints; use `--material-edge-tint` for a soft-edge override.
