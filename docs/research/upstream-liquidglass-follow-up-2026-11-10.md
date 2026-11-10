# Liquidglass interaction follow-up — 2026-11-10

## Scope and decision

Reviewed upstream main through [a2d2648](https://github.com/onlymoein/liquidglass/commit/a2d26488ce8656901d088d10a69ec4e82fca37f4).
Adopt the tap/drag spring distinction from [33ade2a](https://github.com/onlymoein/liquidglass/commit/33ade2a251d0125577249380a746df6859b2d8e3)
and the held foreground rim response from [ae8d914](https://github.com/onlymoein/liquidglass/commit/ae8d914020cad1d6aef33f965881bce7e11f2e0c).
Retain Base UI 1.9.0 Sheet arbitration instead of the custom handoff introduced
in [d21820c](https://github.com/onlymoein/liquidglass/commit/d21820cab70e5e46add8992baf2d1c8af0bb3db7).

The upstream spring and jelly parameters are described there as chosen by eye.
This work compares that source reference with our browser baseline and candidate;
it does not establish native iOS parity or a live upstream pixel match.

## Comparison

The docs development server at `http://127.0.0.1:4310` served the workspace source.
Baseline captures were made before the source changes. The comparison fixture
uses public TabBar, GlassButton, Sheet and Slider parts.

| Concern                                        | Baseline                                                                  | Candidate / retained behavior                                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| TabBar quick tap                               | Peak normalized travel about 1.000–1.007; practically no rebound          | Peak about 1.046, then settles at the selected destination                                                   |
| TabBar layout notification during press        | A 0.016px flex-width change could call instant positioning in mid-flight  | Target differences below 0.1px do not interrupt the slide; real resizing still repositions                   |
| Stationary GlassButton held by keyboard        | Surface wash changes, foreground rim image stays unchanged                | Foreground rim light increases; release/cancel restores the exact resting image and backdrop filter identity |
| Partial Sheet, upward touch on scrollable body | Body scrolls, Sheet stays at its detent                                   | Retained Base UI contract; differs from upstream's expand-first behavior                                     |
| Full Sheet, downward touch with scroll offset  | Content consumes the drag while the Sheet stays still                     | Retained and checked                                                                                         |
| Full Sheet, downward touch at scroll edge      | Body can start the Sheet drag; canceled touch retains its accepted detent | Retained and checked                                                                                         |

The foreground update uses the existing synchronous rim renderer. It changes
foreground clarity only while held, without refitting optical fields or updating
the consumer's material preference. Fused contours remain under their shared
owner. Existing velocity-based deformation remains unchanged.

## Regression evidence

The new maintained check is:

```sh
DOCS_URL=http://127.0.0.1:4310 bun run --filter @lenso/ui-docs test:upstream-glass
```

`BASELINE=1` reports the comparison without enforcing the two adopted visual
changes. `CAPTURE_DIR` optionally saves investigation
captures; the normal regression retains no screenshots.

The check covers Chromium and WebKit, light/dark, a 390×844 touch-capable viewport,
keyboard activation, rapid interruption, reduced motion, disabled controls, press
cancellation and restoration of the filter and rim. A 1100×900 RTL follow-up checks
keyboard-selected destination geometry. Chromium CDP touch input checks native
Sheet body scrolling, downward arbitration, cancellation, horizontal scrolling
and Slider value ownership; text editing and Escape/focus return run in both
engines. Chromium additionally checks forced-colors suppression of the rim.

Package build, affected format/lint/type checks and existing Glass/UI tests are
required alongside this browser check. The existing TabBar motion check covers
390/590px light/dark optical continuity and desktop minimization/focus in both
engines. The existing elastic check exercises repeated mouse/touch presses and
native activation; it mounts the real size demo and a public GlassToggleButton
in the fixture to avoid depending on deferred article layout.

Validation completed successfully: the new browser check, existing TabBar motion
and glass elastic browser checks, all Glass tests (83) and UI tests (108),
Glass/UI/docs typechecks, affected formatting and lint, interaction-boundary
checks, and the package build. The isolated 390px/4× CPU TabBar budget check
passed with 72 geometry reads against a limit of 200. This is a bounded local
regression result, not a device FPS claim. React Doctor's changed-source scan
reported 100/100 with no findings.

Investigation screenshots are under
`output/playwright/upstream-glass-2026-11-10/{baseline,candidate}/` (untracked).
The rim screenshots were visually inspected. Motion acceptance also uses sampled
rendered transforms. Reach-time samples include browser scheduling and test input
overhead and are not performance benchmarks.

No physical iPhone, real Safari or Android device was tested. WebKit touch
arbitration is not established by the Chromium CDP touch checks. No production
docs build, publication or deployment is claimed.

## Consumer migration

No imports, props, Base UI contracts or application code need to change. TabBar
selection now has a mild rebound; direct manipulation keeps the stiff spring.
Glass press lighting remains available with `elastic={false}` and with reduced
motion. Sheet consumers keep their existing detents and native body scrolling;
the upstream expand-before-scroll handoff is intentionally not added.
