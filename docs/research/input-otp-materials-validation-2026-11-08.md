# InputOTP material redesign validation

Reviewed on 2026-11-08 against the docs development server at
`http://localhost:3000/en/docs/react/components/input-otp`.

The first pass below records the original rounded-rectangle review. The owner
subsequently requested fully rounded Pill slots; the follow-up at the end supersedes
the earlier corner values.

## Design decisions

- Use the existing Lenso content-field and floating-control language for code entry. Energy 1, rhythm 1, motion 1: repeated slots and stationary editing support a short verification task.
- Keep individual native Base UI inputs so typing, paste, selection, focus and form integration retain their established owner.
- Use 52px height and 16px corners to align field height with Input while keeping digit cells distinct from full-width capsule fields.
- Use inherited system typography, 22px medium tabular numerals and centered text for readable, stable digit alignment.
- Ordinary primary uses grouped-secondary fill; secondary uses tertiary fill. Glass takes precedence and uses the existing small action recipe and runtime on each slot. Groups add no optical plane.
- Use intrinsic row width, 8px within-group gaps and 12px around an 8px separator. Narrow viewports use 12px corners and 4px/8px gaps to preserve digit space.
- Keep pointer editing quiet. Keyboard focus uses the shared outline and errors retain their own inset edge, independently of the material.
- The example's tinted background makes ordinary opacity and glass transmission directly comparable without introducing an image asset.

## Browser evidence

Both Chromium and WebKit passed on the same development source:

| Coverage                      | Evidence                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Ordinary, secondary and glass | Shared material profile checked on all three examples; 52px height and 16px desktop corners measured                           |
| Native input                  | Six-digit typing, ArrowLeft focus movement, Backspace and whole-code paste                                                     |
| Focus and error               | Pointer focus without outline; keyboard focus visible; invalid inset edge remains while focused                                |
| Light and dark                | Captures inspected; sampled digit contrast at the example backdrop exceeds 12:1 in both engines                                |
| Desktop and narrow            | 1280px, 390px and 320px viewports; no document or row overflow; digit cells remain at least 20px wide in these nested examples |
| RTL and reduced motion        | Rendered captures with RTL and reduced motion enabled                                                                          |
| Runtime errors                | No page errors during either browser run                                                                                       |

Captures are under `output/playwright/input-otp-2026-11-08/`.
Glass uses the supported WebKit fallback; this does not establish Apple-native optics.
Contrast sampling covers the rendered digit foreground and local backdrop in
these examples, not arbitrary consumer backdrops or a whole-document audit.
RTL editing, real Safari, physical touch devices, screen-reader operation and
production acceptance were not tested.

## Automated checks

- PASS: affected source formatting and oxlint.
- PASS: InputOTP-only typecheck using the repository's React compiler settings.
- PASS: tokens package and docs application/script typechecks.
- PASS: token package build and API documentation generation (95 families on the final refresh).
- The final full content projection was blocked by a concurrently added public family lacking an authored description: `swipe-actions`. OTP projection succeeded earlier; the final global refresh is incomplete. The changed example modules and styles were exercised directly in the dev browser.
- PASS: focus-method DOM regression tests, 3 tests.
- PASS: docs-projection and story-compiler tests, 11 tests.
- The full UI package typecheck initially passed. A subsequent run found 7 implicit event-type errors in concurrently added `swipe-actions.tsx`; no OTP errors were reported. This is not a clean final full-package check.
- Shared component/focus DOM run: 13 passed, 1 failed. The failure is the unmodified elastic text editing drag-deformation assertion at `components.dom.test.tsx:58` (`1` expected to be greater than `1`).
- React Doctor reported 65/100 across the already modified workspace, with no InputOTP findings. Existing findings include theme-scope cleanup and other unrelated components; this is not proof of a workspace score improvement.

## Design delivery gate for the changed OTP surface

- PASS, hard requirements: no overflow at tested widths; native inputs remain operable; keyboard focus and invalid cues stay independent; sampled digit contrast meets AA; no new dead actions or fabricated delivery claims in the changed primary example.
- PASS, visual purpose: ordinary fill identifies editing cells; glass separates floating entry from its backdrop; the example gradient exposes transmission; no new asset or decorative motion was introduced.
- PASS, direction: repeated rounded digit fields, semantic tint, inherited system text and measured spacing follow the existing Lenso form direction at energy/rhythm/motion 1/1/1.
- PASS, reviewed craftsmanship: both materials remain readable in the reviewed appearances and widths, and native editing works in both engines. Broader validation limitations remain explicit above.

## Pill and discoverable Glass follow-up

The owner preferred fully rounded Pill slots. All materials now use a 999px
radius, including narrow viewports; digit size and spacing are unchanged.
The playground Preset menu now exposes Ordinary and Glass directly. Glass is
also available through the root `glass` prop. The previous controls-only
implementation did not provide a sufficiently visible entry point.

The maintained `bun run dev:docs --port 3002` workflow regenerated the content
and started a fresh preview after the shared 3000 server stopped responding.
Affected formatting, lint, token typecheck and story-compiler tests passed.

The follow-up browser run observed the 999px radius on the desktop native input.
The full preset interaction check remains unverified: repeated navigation reloads
and timeouts interrupted the selection step on the shared development setup.
The earlier material and native editing results predate this Pill-only styling
and story preset change.

After waiting for client hydration, the final follow-up passed in Chromium and
WebKit: desktop and 390px inputs use the full Pill radius; selecting
Preset > Glass applies the shared small material. This supersedes the interrupted
selection attempt above. The separate SSR FrameworkProvider error observed during
an intermediate load remains outside this change's validation scope.

## True circular geometry correction

The owner clarified that every digit field must be a circle. A large radius
alone had left a 44×52 ellipse. The current slot uses `aspect-ratio: 1 / 1` and
auto height, retaining full corners while both dimensions shrink together.
Chromium and WebKit both passed geometry checks for every glass slot at
1280px, 390px and 320px viewports. Desktop measures 44×44px; the 320px nested
preview measures 32×32px. The initial ordinary slot was also checked for equal
width and height. Glass selection still applies the shared small material.
Affected formatting, lint and token typecheck passed.
Captures: `chromium-circle-playground.png` and `webkit-circle-playground.png`
in the existing capture directory. This supersedes all Pill/52px-height values
in the historical sections above.
