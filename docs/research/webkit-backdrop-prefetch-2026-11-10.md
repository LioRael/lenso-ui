# WebKit backdrop preparation and dirty lenses — 2026-11-10

## Implementation

This extends the static CSS paint cache described in
[the first investigation](webkit-backdrop-cache-2026-11-10.md).

When movement approaches within 32 CSS pixels of a retained region's edge, the
atlas schedules another capture after the current update's microtasks. Its region
has the same 96 CSS pixel overscan, biased 48 pixels toward movement. There is
one pending capture. The current region remains usable while it prepares; a ready
region is adopted only if it covers the requested input and matches the source
revision. Direction reversals, source changes and disposal release obsolete work.
Preparation failure preserves the existing synchronous capture fallback. Fast
jumps or a capture that is not ready before the boundary still use that fallback.
This moves preparation out of the update path; it does not move DOM/SVG work to
a worker or eliminate its main-thread cost.

The active and preparing canvases together remain within the original 16 MiB
retained-pixel budget. Near the limit, preparation is skipped and existing capture
behavior is preserved. The dimension limit is unchanged. Browser decoded images,
optical textures and output surfaces are additional allocations.

The atlas also compares each lens's source position against its last submitted
position. Only changed indices are packed into the next input atlas and passed
to the existing renderer. A source revision updates all lenses. Replacing a cache
region without changing source content does not redraw stationary lenses. The
existing renderer already supports packed dirty indices; its API did not change.

No consumer imports, props or styles need migration. This does not expand static
paint eligibility to text, video, Canvas or arbitrary page snapshots. Fractional
physical-pixel offsets, scale changes and unsupported paint keep their old path.

## Regression and comparison

With docs development running:

```sh
bun run --filter @lenso/ui-docs test:backdrop-prefetch
bun run --filter @lenso/ui-docs test:backdrop-cache
```

The new browser check covers:

- 120 vertical movements of 8 CSS pixels, across repeated cache boundaries.
- Moving one of 11 lenses, including dirty pixels packed from a later atlas row;
  its pixels match a fresh single-lens capture within 1/255 per channel.
- Held image decoding: preparation starts inside the current region; after it
  completes, crossing the old boundary does not await a newly held decode.
- An old source revision held in flight while a new revision is displayed,
  followed by reversal, without old pixels replacing the new source.
- Disposal before scheduled preparation runs, and rejected preparation followed
  by a successful fallback capture.
- Three real shared-core output canvases: moving the middle lens 96 times updates
  it 96 times while its two stationary neighbors receive no drawImage calls.

The first capture is reported separately. Steady input timings exclude it, and
frame-interval samples exclude the interval containing it. Presentation timing
ends when the target canvas's drawImage returns, not physical screen scanout.
Completion wakes the driver directly, avoiding an extra frame introduced by
polling. Intervals over 25 ms are reported as long frames, not asserted as a
portable timing limit. Input decode counts on the active update path are also
reported; delayed-decode tests establish the preparation behavior independently
of machine speed.

`BASELINE_MODULE` can select a saved pre-change `gpu-capture.ts` through the same
Vite server, without modifying runtime source. Interception matches URL pathnames,
including Vite timestamp queries. The baseline asserts 96 redraws in every output;
the candidate asserts [0, 96, 0]. This prevents mixed baseline/candidate imports
from silently validating an invalid comparison. `ENGINE=webkit` selects WebKit.
The snapshot for this investigation retains the previous cache implementation,
without the two optimizations in this follow-up, at
`output/playwright/backdrop-prefetch-2026-11-10/baseline.ts` (untracked).

## Local WebKit results

Three alternating baseline/candidate pairs ran sequentially without concurrent
builds or browser checks. Per-run values, in milliseconds where applicable:

| Metric                                                       | Previous cache | Preparation + dirty lenses |
| ------------------------------------------------------------ | -------------- | -------------------------- |
| Captures awaited on the active path, including first capture | 10 / 10 / 10   | 1 / 1 / 1                  |
| Total completed captures                                     | 10 / 10 / 10   | 9 / 9 / 9                  |
| Steady input preparation p95                                 | 4 / 4 / 4      | 1 / 1 / 1                  |
| Steady input preparation maximum                             | 5 / 16 / 15    | 1 / 4 / 3                  |
| Input-loop intervals over 25 ms                              | 1 / 1 / 2      | 0 / 0 / 1                  |
| Input-loop maximum frame interval                            | 27 / 26 / 28   | 23 / 21 / 26               |
| Presentation redraws: left / moving / right                  | 96 / 96 / 96   | 0 / 96 / 0                 |
| Translation to canvas submission p95                         | 4 / 3 / 2      | 2 / 2 / 2                  |
| Translation to canvas submission maximum                     | 12 / 9 / 8     | 3 / 2 / 16                 |
| Presentation-loop intervals over 25 ms                       | 1 / 0 / 1      | 1 / 1 / 1                  |
| Presentation-loop maximum frame interval                     | 27 / 25 / 34   | 27 / 32 / 27               |

The stable improvements are fewer captures awaited during movement and fewer
stationary outputs redrawn. Input preparation tails improve in this fixture.
End-to-end canvas submission and long frames remain noisy: one candidate run has
a 16 ms submission outlier, larger than its baseline. These results do not
establish consistently lower total worst-case latency or a fixed frame rate.
Cold capture time also varies and is not claimed to improve. The three candidate
cold samples were 15 / 19 / 23 ms versus baseline 36 / 15 / 18 ms.
Raw local logs are in the same untracked investigation directory.

## Validation and limits

Both maintained cache checks pass in WebKit and Chromium, including their pixel,
invalidation, fallback and presentation checks. Existing moving material
preferences checks cover both appearances, Menu/Select/cascading Menu, close and
focus restoration. The WebKit pending Canvas/navigation regression also passes.
Affected formatting, lint, Glass typecheck, all 83 Glass tests and package build pass.
The bundler reports its existing use-client directive warnings.

No real Safari or physical iPhone was tested. Translation is driven through the
same DOM geometry path used by dragging; pointer and touch recognition are not
measured. Chromium headless shared-core presentation is substantially slower in
this environment and is used here for correctness, not a performance claim.
These checks do not establish full material visual acceptance, fast fling behavior
on a device, or production docs/build delivery. No API or delivery integration
changed, so a production docs build is outside this internal sampling check.
