# TabBar minimization: native study and continuity repair

## Reference quality

Reference device: iPhone 15 Pro Max, iOS 27.2, connected by USB. Apple Music
and Photos were operated on the physical device. The first, approximately
20 fps recordings were insufficient to establish the transition and were
rejected as the basis for implementation.

The subsequent captures subscribed to the daemon's quality H.264 stream,
preserving each original presentation timestamp. This requests up to 60 fps;
it does **not** establish a sustained 60 fps capture. Unchanged-screen skipping
also makes whole-file average frame rates misleading. No interpolated frames
were used to claim additional reference detail.

| Capture                                     | Encoded frames | Median dynamic interval | 90th-percentile dynamic interval |
| ------------------------------------------- | -------------: | ----------------------: | -------------------------------: |
| Music quality                               |            566 |                21.05 ms |                         26.19 ms |
| Photos contraction                          |             97 |                22.59 ms |                         32.83 ms |
| Photos expansion and subsequent interaction |          1,182 |                24.33 ms |                         45.08 ms |

Dynamic intervals here exclude gaps of 100 ms or more, including skipped
static screens. These numbers describe capture delivery, not the phone's
display refresh rate. The timestamped Photos sheets preserve the original
intervals and separate contiguous bursts. Music's mini-player reflows as part
of its own composition; it is not part of the TabBar component contract.

Observed relationships used for the Web interpretation:

- The current destination remains visible as the bar changes shape.
- Secondary destinations, labels and the selected background do not disappear
  through a single layout replacement. Their visibility changes ahead of the
  final contracted geometry; expansion brings them back later in the morph.
- The selected icon moves into the compact control while its glass surface
  remains spatially continuous.
- Press feedback and the shape transition are distinguishable phases.

The Web spring uses stiffness 400 and damping 40, with an earlier content fade.
These are implementation choices informed by the captures, not recovered
Apple constants or a numerical fit to a native animation model.

## Implementation

`tab-bar-minimize.ts` keeps the expanded row measurable and drives group size,
content visibility and current-icon translation through one persistent spring.
Retargeting retains its position and velocity. Measurements use fractional
rendered bounds and compensate for elastic scale. Root resizing, destination
content changes and separate-group insertion/removal refresh the expanded size.
The existing StyleX maps consume owned runtime variables; caller inline
dimensions are not overwritten.

The indicator, highlight and destination row stay mounted across minimize and
expand. Geometry variables do not rebuild the cloned label optics every frame.
Collapsed links remain inert and hidden from accessibility navigation; focus
moves to the expand button and returns to the current destination. Reduced
motion settles immediately, including when the preference changes mid-motion.
CSS also provides the initial collapsed presentation before measurement.

Rendered intermediate frames exposed a second, shared material defect: a
foreground rim bitmap was still stretched from a circle into an ellipse even
though the decoded background filter already had resize protection. The shared
material style now suspends the foreground bitmap while
`data-material-resizing` is present and uses the current CSS contour. Exact
foreground optics return after the surface settles. Material recipes, tint and
transparency were not changed.

No public component props changed. Consumers need no migration. Collapsed
destinations now remain in the DOM as inert content; integrations must not use
their removal as an application-state signal. Primitives source was not edited.

## Rendered verification

Application: maintained Docs development workflow, `/en/docs/react/components/tab-bar`,
English, LTR unless specified. The preview is at `http://127.0.0.1:3000`.

| Engine and state         | Frame samples | Result                                             |
| ------------------------ | ------------: | -------------------------------------------------- |
| Chromium, light, 1,000px |           206 | Current icon visible, indicator identity retained  |
| Chromium, light, 390px   |           207 | Same; collapsed icon at x=10px inside a 44px group |
| Chromium, dark, 1,000px  |           175 | Same                                               |
| Chromium, dark, 390px    |           175 | Same                                               |
| WebKit, light, 1,000px   |            71 | Same                                               |
| WebKit, light, 390px     |            75 | Same                                               |
| WebKit, dark, 1,000px    |            75 | Same                                               |
| WebKit, dark, 390px      |            75 | Same                                               |

The Chromium cohort includes 726 resize/microtask observations of transitional
material contours. None used the foreground bitmap or a zero-radius bitmap
contour while resizing. Saved intermediate screenshots were inspected in both
appearances: the previously visible stretched ellipse did not recur. WebKit
uses its supported material fallback and reported no page-script errors.

The first WebKit attempt used a CLI expecting an unavailable browser revision.
Verification then used the repository's installed Playwright 1.64.1 and its
already installed matching WebKit. Checks wait for component layout effects;
SSR markup alone does not establish interactive readiness.

Additional browser checks:

- Home, Library, Recent, Favorites and Search each update the preview destination.
- RTL reversal at 70ms intervals: 69 sampled frames retain the current icon and
  indicator; the final state is expanded.
- Tablet layout contracts to 44px and centers the revealed icon at x=10px.
- Keyboard Enter on the expand control restores focus to Library.
- Reduced motion produces a settled 44px control without intermediate motion.
- Enabling reduced motion during contraction settles the active spring.
- Removing Search gives the main group the full 400px root; restoring it gives
  groups of 330px and 54px.

Evidence: `output/playwright/tabbar-minimize/`. `light-accepted-frame-sheet.png`
and `dark-accepted-frame-sheet.png` show the corrected Chromium intermediate
frames. `webkit-*` files contain the matching WebKit captures. Native `.h264`
files and timestamp JSON retain the denser references. Earlier sheets are
investigation artifacts, not final acceptance.

## Checks and limits

- Affected formatting and oxlint: passed.
- UI, tokens and testing package typechecks: passed.
- Interaction source boundaries: passed.
- Focused TabBar, glass-preference, resizable-filter and material-appearance
  cohort: 12 passed, 0 failed.
- The added regression catches optical-layer remounts, destination removal,
  inaccessible collapsed content and lost expand/restore focus. The previous
  scroll fixture had no groups and could not catch these failures.
- An additional broader component run exposed a separately reproducible
  `elastic text editing keeps press feedback without drag deformation` failure
  in `components.dom.test.tsx:58` (expected press scale greater than 1, got 1).
  Running that file alone also fails. This work does not claim a clean full suite.

The native reference still has variable capture intervals. This is a bounded
Web interpretation with physical-device reference study and desktop Chromium /
WebKit rendering checks, not native shader parity, 120 Hz acceptance, an iPhone
Safari implementation test, a full-site audit or an unconditional no-flash
guarantee. Larger text, all custom themes and forced-colors were not re-audited.
No production-specific integration changed; no full production site build,
landing, publication or deployment was performed.

## Follow-up: outer silhouette and global appearance

The user subsequently supplied a colored-backdrop contraction frame with an
extra squared silhouette outside the compact circle. The earlier flat-backdrop
cohort did not establish absence of this artifact. The TabBar material now clips
its complete output to the current capsule, with a 1px allowance for its rim.
This constrains native SVG backdrop output as well as the CSS contour; resizing
the filter region alone does not enforce that visible boundary. The overflow
clip applies only to the native filtered lens, not copied or hoisted material
fallbacks, whose backdrop ownership and clipping are preserved.

Follow-up development checks on `/en/photos` used 430 by 430 viewports.
Chromium (54 frames) retained the rounded overflow clip through contraction;
WebKit (51 frames) retained its existing fallback path. Both ended at 44px.
Intermediate screenshots were inspected;
no exterior squared silhouette appeared in this bounded replay. The focused
12-test cohort, affected format/lint and tokens typecheck passed again.

Global appearance was checked separately from clipping. Actual persisted global
settings of 0 and 1 reached both TabBar groups: clear produced clarity 1 and
approximately 1.3px blur; tinted produced clarity 0, 15.3px blur and the existing
96%-alpha light endpoint wash. Colored-backdrop screenshots visibly differ.
This did not reproduce a general failure to inherit the global setting.
The current-destination emphasis is a separate layer and is not the whole
control's opacity. No transparency formula was changed in this follow-up.

Physical-device confirmation used Settings > Liquid Glass on the iOS 27.2
iPhone. Its slider initially read 50%. Photos' TabBar visibly revealed backdrop
detail at 0%, and became more opaque at 100%, including its Search surface.
Settings was restored to 50% and that value was verified before releasing the
phone. This appearance preference is distinct from Accessibility's Reduce
Transparency option. Evidence: `output/playwright/tabbar-followup/`.

## Subsequent residual-contour correction

The user reported both large elliptical and small returning contours after the
overflow correction. That correction was insufficient: it bounded output but
did not prevent the old bitmap's internal optical shape from being stretched.

A repeated physical-size reversal replay produced the visible large ellipse in
saved intermediate screenshots. Of 199 geometry samples, 54 used a decoded
optical field whose aspect ratio differed materially from the current surface.
The foreground rim was already suppressed in those samples, isolating the
remaining ellipse to the stretched optical field rather than the rim bitmap.

The initial repair removed these stretched fields but a stricter regression
still failed on old foreground-rim dimensions during rapid reversals. A class
change can update the material's size-dependent appearance during a morph.
That appearance refresh cleared the resizing flag while retaining the old rim;
the next fit had not yet arrived. The refresh now retains rim suppression for
live geometry until a matching fit is installed.

TabBar now uses the existing `liveGeometry` material lifecycle. During motion it
uses the same synchronous, geometry-independent material transfer and current
CSS contour. It does not scale the old circle/capsule optical bitmap. Exact
geometry returns after settling, and a resize invalidates an in-flight fit.
Unfiltered fallback rims also use the fitted surface's stored dimensions when
deciding whether they are current. Colors, transparency preferences, selection
ownership and the public TabBar props are unchanged.

`apps/docs/test/tab-bar-motion.mjs` exercises warmed, rendered TabBar materials
through timed reversals and checks decoded field/rim dimensions against the
current surface after resize delivery. It failed on the old implementation,
also caught the remaining rim-refresh defect, and now passes. It is included
in the maintained Docs browser check and can run independently with `DOCS_URL`.
It retains no screenshots or reports; investigation captures remain separate.

The final independent matrix passed in Chromium and WebKit, both light/dark
and 390px/590px widths at DPR 2: 1,442 intermediate optical samples across 48 timed
direction changes, covering both the main capsule and separate Search circle.
The original screenshot replay then reported 209 geometry
samples and zero stretched fields; a separate actual-dark replay had 178 samples
and zero stretched fields. Photos owns a local appearance setting: the final
matrix uses its View Options menu and checks the material's computed mode,
rather than treating an OS color-scheme preference as proof of dark rendering.
Glass's 34 unit tests and a 17-test focused
DOM cohort (including Menu/Toolbar, lens geometry and TabBar focus) passed, as
did affected formatting/lint, Glass/UI typechecks and interaction boundaries.
The full general Docs browser suite was not rerun; its new focused regression
was run directly. This supersedes the earlier overflow-only acceptance for
residual contours and retains the other native-parity limits above.

## Scoped antislop delivery gate

- Hard gate PASS: existing navigation and semantic colors retained; all five
  preview destinations, minimize/expand and keyboard focus were exercised.
  Light/dark and narrow layouts were rendered. No new copy, claims, data,
  assets or navigation structure was invented. Contrast tokens are unchanged;
  contrast was not newly measured.
- Purpose gate PASS: retained glass identifies floating navigation; motion
  preserves the relationship between the current destination and compact
  control. No decorative effect was added.
- Liveliness PASS: established Apple-inspired direction is retained. The
  reference informs staged visibility and continuous shape rather than a
  generic fade of the entire navigation.
- Craftsmanship PASS within the recorded scope: current-icon continuity,
  interrupted reversal, shared contour repair, focus, separate-group changes
  and reduced motion have concrete browser or regression evidence above.
