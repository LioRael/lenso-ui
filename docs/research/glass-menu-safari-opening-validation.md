# Safari Menu opening investigation

Date: 2026-11-06

## Status

Opening performance is **not accepted as fixed**. The final frozen production candidate recorded 74–104 ms maximum frame intervals, with an 18 ms p95 in each four-second sample. These remain long frames. The previous 127–156 ms spike class must not be described as eliminated on this evidence, and the measurements are not a controlled before/after speedup benchmark.

The shared-core root popup still activates and retains the reviewed iOS/iPadOS appearance. This pass does not change the optical algorithm or claim submenu shared-core coverage.

## Changes retained

- Resolve and validate an explicit live backdrop owner before starting the legacy CSS backdrop-copy path. An accepted owner no longer starts a second background capture. A declined/invalid owner retains the ordinary fallback.
- Initialize an owned live Safari surface after its first IntersectionObserver delivery. Detaching before delivery cancels initialization. Native material remains available while the owned output prepares.
- After hydration, mount closed API property tables only when their native disclosure opens. Preserve complete server/no-JavaScript content and compact native Find text. The Menu API region fell from thousands of nodes to 483 in the measured closed state. The native disclosure, summary anchors and property tables remain the visible interface.
- Give the API region content visibility and intrinsic sizing.
- Subscribe to live story arguments inside the preview and source components, rather than subscribing the complete playground shell. Argument controls retain their individual subscriptions and synchronous updates.

## Causal evidence and limits

The initial detailed Safari probe captured a 102 ms `getImageData` operation from the independent legacy backdrop atlas while an owned Menu capture was also registered. The ownership regression failed before the ownership fix and passed afterward. Subsequent traces did not repeat that duplicate readback.

After eliminating the duplicate capture, traces still showed expensive synchronous style/layout resolution. With owned-material setup deferred, a 31–45 ms `getBoundingClientRect` read in Base UI's InternalBackdrop rendered cutout was a prominent remaining cost; click dispatch could exceed 50 ms overall. Moving the first material style read alone did not eliminate that work.

A diagnostic page retaining only the playground recorded a 46 ms maximum and an 11 ms cutout read. This establishes that the surrounding document contributes work; it is not a shipping result. Source-node removal, content visibility on examples, layout containment, temporary filter removal, a pre-existing page scroll lock and portal variable deduplication did not establish a sufficient, repeatable fix. Those diagnostic alterations were not retained. Portal theme inheritance and Base UI modal behavior were preserved.

The live development server repeatedly rebuilt shared packages and briefly served incomplete styles. Later live samples and a sample with Web Inspector shrinking the viewport were rejected. Production measurements therefore used a frozen checkout at `/tmp/lenso-menu-opening-frozen`, built for the English/Chinese Menu, GlassButton and Toolbar routes plus the automatically generated root/404 pages. The static preview has no HMR and is served on port 4302.

Background compilation still affected the machine. The existing development server was briefly suspended with automatic restoration for selected measurements; it was not terminated. A 643 ms sample was rejected as contaminated. The 104 ms fresh-page sample occurred after its suspension window had ended, so it must not be labeled an idle-machine result. Final observations are:

| Sample, UTC | Conditions                                                  | Maximum frame |   p95 | Owned shared core |
| ----------- | ----------------------------------------------------------- | ------------: | ----: | ----------------- |
| 15:19:50    | Light reopening, development server suspended               |         81 ms | 18 ms | yes               |
| 15:20:48    | Light fresh page, background development compilation active |        104 ms | 18 ms | yes               |
| 15:37:15    | Dark opening, development server suspended                  |         74 ms | 18 ms | yes               |

Each probe sampled requestAnimationFrame intervals for four seconds around a real native click. No accessibility reads, screenshots or intentional builds ran inside those final sampling windows. The probe is observational, not a browser profiler; three samples do not establish a broad performance distribution. The shared output appeared approximately 1.0–1.24 seconds after sampling began; native material paints before that handoff.

The next unresolved work is to isolate and reduce the synchronous native popup mounting/positioning cost with a stable production baseline. No native interaction was replaced or disabled to obtain a lower number.

## Browser behavior verified

Actual Safari 27.2 application, 1512 × 778 CSS-pixel viewport, DPR 2:

- Light/dark root popup appearance and rounded material boundary.
- Owned shared-core marker after opening.
- Keyboard navigation into Sort by, selection focus on Name, return to the root menu, Edit activation and focus restoration to Actions.
- Controlled `open` argument follows activation and dismissal.
- Native Find for `onAuxClickCapture` opens the inherited-property disclosure and reveals the actual table row. Safari reported six matches.
- Final ordinary page has no diagnostic overlay; the original light appearance was restored.

## Verification

- Affected formatting and lint checks passed.
- Glass, React and documentation source typechecks passed (58, 249 and 2,245 files respectively).
- Glass unit regressions: 25 passed.
- Backdrop ownership/cancellation DOM regressions: 3 passed. Accepted and declined owners are distinguished; disposal before visibility cannot initialize a stale surface.
- Documentation API DOM regression: 1 passed, 10 assertions. It covers server content, closed-table removal, reopening and retained Find text/summary anchors.
- Menu/Toolbar, submenu-title and portal-theme DOM regressions: 7 passed.
- Installed-consumer package regression passed after retrying an incomplete shared build output. That first failure was a missing packaged third-party notice during concurrent output regeneration, not a successful check.
- Frozen production build completed for eight scoped pages. This is not a full-site production/static-export check.
- The generated StyleX artifact regression passed against that frozen production output.

DOM tests establish lifecycle and semantics, not browser rendering or frame timing. Mobile Safari, other browsers, all material variants and full-site acceptance were not run in this pass. No release, deployment, landing or publication was performed.

## Evidence

Artifacts: `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1afcc-7814-7cd3-a626-6dd7915f00d9/glass-core/menu-safari-opening/`.

- `reports.jsonl`: exploratory and rejected samples as well as the candidate observations. Do not aggregate this file indiscriminately.
- `candidate-reports.json`: the final three observations listed above.
- `lean-probe.js` and `detailed-probe.js`: temporary instrumentation retained outside application source.
- `light-menu.png`: final ordinary page without diagnostics.
- `dark-menu.png`: dark popup with the 74 ms result displayed.

The temporary application loader and public diagnostic script were removed. The frozen static preview remains available for review at `http://127.0.0.1:4302/en/docs/react/components/menu`.
