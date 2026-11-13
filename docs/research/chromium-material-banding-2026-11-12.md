# Chromium dark material banding

The dark SVG tone graph rounded a centred chroma signal around `0.5` through
separate multiplication and offset images. On Chromium, a monotonically
increasing neutral input could consequently produce alternating brighter and
darker output. Blurred text and controls exposed those reversals as contours.

The fix evaluates `(colour - neutral) * gain + neutral` in one arithmetic
primitive, with `neutral = 128 / 255`. The final reconstruction subtracts twice
that neutral. This preserves the intended algebra while giving neutral pixels
an exactly representable intermediate value. The offset lookup and separate
scaled image are removed. The two-stage optics/material split from PR #67 and
its materialized optics input remain in place; refraction and blur parameters
are unchanged.

## Verification

Run the new browser regression against the development docs server:

```sh
DOCS_URL=http://127.0.0.1:4318 bun run --filter @lenso/ui-docs test:material-tone-banding
```

The test renders the actual SVG tone implementation over neutral ramps and
compares pixels with the shared CPU tone model. Uniform RGB/alpha samples in
`material-tone-alpha.mjs` did not catch the alternating output between samples.

Before the fix, the new test failed on Chromium DPR 1, small material, with
maximum error 3.976/255 and accumulated downward steps of 35. After the fix,
Chromium DPR 1 and 2, both material sizes, had maximum error 0.988/255 and zero
downward steps. WebKit DPR 1 and 2 also had zero downward steps; its raster
samples required the existing alpha suite's 8/255 colour tolerance (observed
maximum 5.647/255).

The existing colour/coverage browser test passed on Chromium and WebKit at DPR
1, 2 and 3. The search material test passed Chromium light/dark material pixels,
backdrop ownership, keyboard navigation and focus restoration. WebKit passed
ownership and interaction checks; its native blur reference was not painted by
the automation backend, so that run does not establish WebKit blur pixel parity.
Local browser execution used installed Google Chrome and the existing WebKit
2370 runtime through an invocation-local Playwright launch override; the
installed Playwright package requested browser revisions absent from the host.

The Glass build, typecheck, unit/DOM suites and affected format/lint checks
passed. This is local development validation, not production or landing CI.

## Rendering cost: interleaved browser measurements

A dedicated follow-up replaced screenshot timings with continuous animation.
Both variants use the same frozen backdrop and SVG optics taken from the
production search panel at PR #67 (`00bc7f30`). The fixed variant changes only
the dark material primitives to match this patch. The filter remains a two-URL
optics/material chain: the measured material stage has 10 primitives before
and 8 afterwards.

Environment: Google Chrome 156.0.8078.48, ANGLE Metal on Apple M2 Pro, macOS,
1400 × 1000 viewport, DPR 2. Each surface is 640 × 460 CSS pixels. The background
moves identically under either one surface or four surfaces. This isolates the
native backdrop-filter workload; it does not measure React, menu opening,
search requests, or the complete live documentation application.

The primary measurement has no screenshots or tracing inside the timed region.
There are eight paired rounds per scene, with PR/fix order alternating between
rounds, a fresh browser process for each pair, 700 ms warmup per sample and
3500 ms of measured animation. FPS is delivered requestAnimationFrame callbacks
divided by measured elapsed time, not a hardware display-presentation counter.
All completed samples are retained. An earlier incomplete browser run is kept
separately and excluded from the completed cohort. Other workloads were active
on the host, so paired uncertainty is reported rather than assuming an idle
machine.

| Scene                                    |   PR #67 |    Fixed |    Change |
| ---------------------------------------- | -------: | -------: | --------: |
| One surface, aggregate animation FPS     |   42.367 |   42.803 |    +1.03% |
| Four surfaces, aggregate animation FPS   |   11.740 |   11.790 |    +0.42% |
| One surface, pooled P95 frame interval   |  33.4 ms |  33.4 ms | unchanged |
| Four surfaces, pooled P95 frame interval | 116.7 ms | 100.1 ms |    −14.2% |

A paired bootstrap (20,000 resamples, seed 67, preserving each PR/fix pair)
gives a 95% interval for the aggregate FPS change of −6.39% to +10.84% for one
surface, and −5.75% to +7.41% for four surfaces. Neither interval establishes a
speedup or regression; neither proves exact performance equivalence.

A separate trace cohort has three paired rounds per scene, with 2500 ms
measurement windows. The mean `MainFrame.Draw` event duration changes from
10.206 to 9.941 ms per draw for one surface (−2.60%), and from 41.378 to
40.542 ms for four surfaces (−2.02%). These are compositor-thread wall durations,
including waits, not GPU hardware execution timings. Trace-derived animation
FPS changes were +2.76% and −1.04% in the one/four-surface cohorts respectively;
the trace cohort is diagnostic and is not pooled into the primary results.

The measured result is approximately unchanged throughput with slightly lower
mean compositor draw durations. There is no demonstrated loss of PR #67's
optimization in these fixtures, but a small difference remains unresolved by
this sample size and host variability.

The local evidence directory `/tmp/lenso-glass-banding-evidence` contains the
frozen `filter-fixture.json` and `background.png`, `benchmark.mjs`,
`animation-results.json`, `trace-results.json`, raw Chrome traces,
`summarize.py`, and `summary.txt`.

```sh
BENCH_ROUNDS=8 BENCH_DURATION=3500 BENCH_TRACE=0 node /tmp/lenso-glass-banding-evidence/benchmark.mjs
BENCH_ROUNDS=3 BENCH_DURATION=2500 node /tmp/lenso-glass-banding-evidence/benchmark.mjs
python3 /tmp/lenso-glass-banding-evidence/summarize.py
```
