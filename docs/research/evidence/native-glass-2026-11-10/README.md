# Native Glass simulator evidence — 2026-11-10

Historical acceptance captures from the actual Expo development application.
These are explicit retained investigation artifacts, not generated test output
that must be committed on every run. The original full output remains ignored.

## Actual applications

| Platform                          | Light                                                 | Dark                                 | Opaque                                             |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------ | -------------------------------------------------- |
| iOS final retained implementation | [Light](ios/final/prominent-final-restored-light.png) | [Dark](ios/final/prominent-dark.png) | [Dark opaque](ios/final/prominent-dark-opaque.png) |
| Android                           | [Light](android/final-light.png)                      | [Dark](android/final-dark.png)       | [Opaque](android/final-opaque.png)                 |

- iOS comprehensive scenario: [results](ios/interaction/RESULTS.md),
  [XCTest source](ios/interaction/NativeQA.swift), [log](ios/interaction/test.log).
  This earlier binary verifies the broad interaction set before the final button
  default-color cleanup; it is not the final binary's color acceptance.
- iOS final retained version: [actual XCTest source](ios/final/NativeQA.swift),
  [authoritative sanity3 log](ios/final/final-default-sanity3.log),
  [installed app/runner hashes](ios/final/installed-provenance.json).
  It checks one callback and appearance/opacity restoration. The stale-label and
  cached standalone-probe sanity attempts are excluded from acceptance.
- Android: [assertions](android/results.json), [historical driver](android/qa.py),
  [final visual driver](android/final-visual.py),
  [held](android/button-held.png) / [released](android/button-released.png),
  [backdrop scroll](android/backdrop-scrolled.png) /
  [foreground scroll](android/foreground-scrolled.png),
  [glass pixel sampling](android/glass-backdrop-sampling.json).
  The native source-map [singleton result](android/rsd-singleton.json) contains
  one RSD native entry.

## Prominent title investigation

- [Seven-case standalone UIKit light](ios/probe/uikit-probe-light.png) /
  [dark](ios/probe/uikit-probe-dark.png),
  [source](ios/probe/Probe.swift), [pixel matrix](ios/probe/matrix.json).
- [Five-case final public-API light](ios/probe2/uikit-probe2-light.png) /
  [dark](ios/probe2/uikit-probe2-dark.png),
  [source](ios/probe2/Probe.swift), [pixel matrix](ios/probe2/matrix.json).
- [Compiler scope input](ios/compiler/attribute-scope.swift) /
  [AST](ios/compiler/attribute-scope.ast) show why explicit UIKit attributes are
  necessary. Correcting that ambiguity alone did not fix the prominent pixels.
- The [pixel classifier](ios/classify-title.py) uses the actual accessibility
  title frame, not a guessed coordinate. Final dark opaque is a positive control.
  It is a color signal, not complete contrast or screen-reader certification.

The prominent title still renders cyan on this iOS 26.5 simulator. Ordinary and
clear Glass styles can render white but change the blue prominent material.
Neither was silently substituted. No physical-device or other-OS comparison is
claimed.

## Build and reproduction boundary

[manifest.json](manifest.json) binds captured source, native binary hashes, retained
files and full original build-log digests. Compact [iOS](build-tools/ios-build-tail.log)
and [Android](build-tools/android-build-tail.log) success receipts are included.
Recovery helper sources, where retained, describe the invocation-local network
and toolchain workaround; they do not alter standard project build configuration.

The QA sources retain the machine paths and device identifiers used for these
historical runs. Adapt them to a running development build, foreground state and
available SDK before reuse; they are not portable one-command CI entrypoints.
Do not count a successful test launch, stale test-runner binary, standalone probe
or numeric unit test as actual Expo UI acceptance.

See the [delivery record](../../native-source-delivery-2026-11-10.md),
[runtime report](../../native-glass-runtime-validation-2026-11-10.md) and
[title investigation](../../ios-glass-button-color-2026-11-10.md) for commands,
environment, toolchain deviations, historical exclusions and remaining scope.

Retained text artifacts normalize trailing whitespace. Manifest file hashes describe
the archived bytes; original full build-log digests describe the raw local logs.
