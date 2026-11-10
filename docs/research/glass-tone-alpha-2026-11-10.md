# Backdrop tone alpha correction

The homepage comparison initially suggested that WebKit omitted part of the
material. Controlled gray input did not support that conclusion: both engines
used tint 0.5, blur 15.3px and the dark fitted transfer. Photographic input instead
exposed opaque black bands in Chromium, with a smaller dark strip near the top
of the WebKit copy. The old Chromium appearance was an invalid visual baseline.

The dark SVG tone graph computes luminance, chroma gain and offset using
arithmetic composites. Those operations also transform alpha. Partially covered
input from blur therefore corrupts the RGB calculation; a later negative offset
can collapse the result to black. Normalize input alpha before the fitted RGB
calculation. This graph renders a backdrop material; the existing lens clip
owns coverage of the finished face. Light/linear transfer and preference values
remain unchanged.

An exploratory expansion of the filter region helped one ordinary-density
capture but did not fix double-density input. That change was removed: the
final correction retains the original sampling regions and optical maps.

## Evidence

- New rendered regression: `test:material-tone-alpha`, against the docs dev URL.
  It compares four input coverages (0.25, 0.5, 0.75, 1) with the CPU RGB reference,
  at both control-size endpoints and clarity 0, 0.5, 1.
- Chromium and WebKit pass at DPR 1, 2 and 3 (72 sampled colors per engine).
  Bypassing only alpha normalization reproduces a failure: the first Chromium
  sample is [125,120,102] rather than approximately [55,140,196].
- Header screenshots inspected at all three densities; Alpine/Forest and
  scrolling out of the hero inspected at DPR 2 in both engines. The black bands
  disappear without adding a homepage or browser-specific tint.
- Existing homepage first-paint, photo-return, ordinary CTA and selection
  regressions pass in both engines.
- Glass typecheck, 83 package tests, build and affected format/lint pass.
  Build retains existing React directive warnings.

Browser checks used the retained Playwright 1.64.1 package and its installed
matching Chromium/WebKit binaries; the current 1.65 package's matching browser
binaries were unavailable. No dependency or browser installation was performed.
Temporary import-only test copies were removed after the run.

Screenshots are local evidence under `output/playwright/home-glass-engines/`.
This is desktop Playwright WebKit, not native Safari, an embedded WKWebView or
a physical iPhone acceptance. The previously reported purple language-menu
stripe remains unconfirmed and is not claimed fixed by this correction.

No consumer migration or new public API is required. No production docs build,
landing or publication was performed. The temporary preview remains on port
4320 while the normal 3000 preview is unavailable.
