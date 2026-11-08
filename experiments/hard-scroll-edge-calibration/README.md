# Physical iOS hard scroll-edge comparison

An isolated UIKit / WKWebView comparison on a physical device. This is not a
public component or production screen. It reuses the synthetic pattern and
held-out public-photo quilt from `../scroll-edge-calibration` through symlinks.

`Native` uses public `UIScrollView.topEdgeEffect.style = .hard` and
`UIScrollEdgeElementContainerInteraction`. `Previous` is the former 3px blur
with 85% white / 55% black fill. `MyGo` snapshots the macOS-derived 6.4px,
82.45% recipe that prompted this comparison. `Trial` reads the current shared
hard-edge filter and theme paint from Lenso source.

The image is 430 × 1800 points/CSS pixels. The native and Web top bars are
96 points high and share the same native title. Automatic safe-area adjustments
are disabled. Native content inset is 96 points, so Y 0 is beyond the resting
position of -96 and shows the full material. Footer receipts report actual
scroll offsets; Web receipts also report viewport width and DPR.

Run `bun experiments/hard-scroll-edge-calibration/generate.ts` at the repository
root before building. Generate the Xcode project with `xcodegen generate` in
this directory (or stage the Swift, project spec, generated HTML and resolved
PNG resources outside the checkout). Build `ScrollEdgeProbe` for the intended
physical iPhone with an existing authorized development profile and DerivedData
outside the checkout. Its bundle ID intentionally replaces the earlier local
soft probe; it does not replace a product app. No signing identity is embedded.

For Pattern, capture Native / Previous / MyGo / Trial at Y 0, 128 and 384 in
each appearance. For Photo, use Y 128 in each appearance. Confirm the settled
receipt before each full-resolution screenshot. The measured device was an
iPhone 15 Pro Max, iOS 27.2, 430 × 932 points, DPR 3.

Store screenshots as `{pattern|photo}-{native|previous|mygo|trial}-{0|1}-{y}.png`
under `output/hard-scroll-edge-device`, where 0/1 is light/dark. Then run
`python3 experiments/hard-scroll-edge-calibration/analyze.py`. It measures the
top 96 points, rejects mismatched/contaminated captures using an unfiltered
control region, and exports numeric results plus equally scaled comparisons.

The recorded physical-device trial used 4.5px blur in both appearances: light brightness 1.1 with
50% background fill; dark saturation 1.15 with 59% fill and the primary
background raised by 10/255. Pattern Y 0 and 128 guided the selection; Y 384
repeats Y 0's pattern phase. The photo quilt was held out from fitting. The
hairline uses 10% black/white and paints inside the bounds to avoid Safari
clipping. This is a calibrated Web approximation for the measured composition,
not a native shader reconstruction or a guarantee for other backgrounds,
devices, OS versions, bar sizes, or accessibility preferences.

The later user-requested light correction removes brightness and fill to
preserve the actual backdrop color. `Trial` reads current source, so newly
generated fixtures use that correction; the earlier captured metrics describe
the recorded trial above and must not be reported as the current light result.

See `docs/research/hard-scroll-edge-physical-device-2026-11-08.md` for the
results and verification limits. MyGo attribution remains in
`THIRD_PARTY_NOTICES.md` for the retained benchmark and hairline reference.

## Saved local replay

The user-authorized `recheck.flow.json` is installed locally as
`lenso/hard-scroll-edge-recheck` and has been validated and replayed on the
measured phone. Run it with `iphone-use-mcp flow run lenso/hard-scroll-edge-recheck`.
It cycles Native / MyGo / Trial at Pattern Y 128 in light then dark appearance,
checking the settled receipts. Its 24 steps are a navigation smoke check;
capture individual frames separately for numeric optical comparison. The flow
was not published to a public registry.
