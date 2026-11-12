> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Browser screenshots and glass acceptance

Behavior, computed styles and optical rendering have different proof boundaries.
Before using a screenshot to judge glass, verify that its capture backend
actually includes compositor backdrop filters.

## Reproducible capture gate

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright bun run --cwd packages/ui-exact test:glass-capture
```

`TEST_BROWSER=chromium` or `TEST_BROWSER=webkit` selects one engine. This check
uses an isolated page with black/white 8 px stripes behind a plain 15 px backdrop
blur. It captures the filtered and unfiltered states, decodes their PNG pixels
and measures the central stripe range. The unfiltered range must exceed 200;
the filtered range must be less than 20% of it. The probe checks pixels rather
than CSS declarations, which can report support while capture omits the effect.

The command fails when a selected backend cannot capture blur. It writes paired
PNGs and a JSON report under `.cache/acceptance/`. Eligibility is a prerequisite
for rendered review, not a claim of optical parity. A backend that passes the
probe still needs component-specific screenshots and acceptance.

`test:browser` includes the same probe and records `visualCapture` per engine in
its consumer receipt. Its interaction/style suite can pass while the separate
`glassScreenshotGate` remains `not-qualified`. The console explicitly identifies
that condition. Never promote behavior, recipe equality or a supported CSS
property to glass screenshot acceptance.

## Current local observation

On the current macOS Playwright 1.64.1 installation:

- Chromium 156 screenshots capture the plain blur probe.
- WebKit 27.2 `page.screenshot()` omits backdrop blur, in both headless and headed
  runs. The unfiltered stripes remain visible in the captured PNG.
- A native-window capture of that same headed WebKit page shows the stripes
  correctly blurred. A native capture of the compiled Exact AlertDialog also
  shows its dark medium material blurring the page beneath it.

The paired AlertDialog captures are retained in `.cache/acceptance/` as
`webkit-alert-dialog-dark-390-native.png` and
`webkit-alert-dialog-dark-390-playwright.png`. The native image includes window
chrome and uses display pixel density; it is not interchangeable with a cropped
Playwright image or a pixel-parity baseline. This was one inspected dark 390 px
window, not a native-capture sweep across every variant.

The prior conclusion that the dark AlertDialog panel itself was too transparent
came from the incomplete Playwright image. That image is insufficient to prove
a material defect. Native-window review supersedes that specific diagnosis;
exact optical parity, native capture coverage and real Safari/iPhone/performance
acceptance remain open. No runtime opacity, blur, DOM ownership or native dialog
behavior was changed to accommodate the screenshot.

Playwright has historical upstream reports about WebKit screenshots omitting
visible filter effects: [issue 28363](https://github.com/microsoft/playwright/issues/28363).
That report is context; the local paired probe and native-window observation are
the evidence for this installation.
