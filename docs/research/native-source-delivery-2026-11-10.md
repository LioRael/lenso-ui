# Native source delivery — 2026-11-10

This follow-up supersedes the earlier source-only delivery boundary. The private
`@lenso/ui-native` slice and Expo fixture now have full native Debug build and
simulator interaction evidence. They remain source packages, not published npm
packages or distributed mobile applications.

## Delivered changes

- React/RSD resolve to one application runtime while preserving native exports;
  semantic themes and compatibility-bridge state props reach their native hosts.
- Explicit vertical layout and root dimensions correct collapsed fixture controls
  and remove the RSD/non-RSD flex warning. The heading protects its description
  from the deliberately oversized backdrop labels.
- A scoped iOS appearance host propagates dark traits into fused system Glass.
  Buttons, switches and sliders remain real UIKit controls. Button color handling
  follows the upstream native preset; ordinary tinted titles use UIKit attributes.
- Android keeps gesture ownership across controlled renders and committed callback
  updates. Resting switch/slider thumbs are white; held thumbs retain clear lenses.
- The custom Android module includes its manifest and ignores generated build data.
  Attribution and adaptation notices accompany the retained native implementation.

The original package/module scaffolding is already on the base branch; this
candidate contains the runtime corrections and the completed validation record.
Web Base UI interaction ownership and `packages/primitives` source/API are unchanged.
Native Menu, Sheet, TabBar, iOS custom rendering and package publication remain out
of scope.

## Build and runtime receipts

| Proof                             | Result and boundary                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| iOS full application              | Debug `BUILD SUCCEEDED`; real ExpoModulesCore/Lenso module, installed on iPhone 17 Pro / iOS 26.5 simulator                                                                                |
| Android full application          | Debug arm64 `BUILD SUCCESSFUL`, 331 tasks; installed on Pixel 3a Android 14 emulator                                                                                                       |
| iOS comprehensive interactions    | Actual UIKit accepted/rejected controlled switch/slider updates, JS/native slider value agreement, one button callback, independent backdrop scroll, appearance and opacity changes        |
| iOS final retained button version | Rebuilt native host; authoritative `final-default-sanity3` passed one test with zero failures, Actions 1 → 2 and light/dark/opaque/restore; installed app/runner hashes match their builds |
| Android interactions              | Accepted/rejected controlled values, one callback, appearance/opacity, independent foreground/backdrop scrolling; glass pixels change when only backdrop moves                             |
| Static/source checks              | Affected format/lint, native/example typechecks, generated source consistency and four numeric slider tests                                                                                |
| iOS title investigation           | 12 standalone UIKit configurations; cyan prominent title reproduced without React Native, while alternate Glass styles render white but change the prominent material                      |

The native receipts are historical runs of the source snapshot recorded by
SHA256 in the [evidence manifest](evidence/native-glass-2026-11-10/manifest.json).
They are separate from the signed candidate's repository CI gate; do not describe
candidate CI as rebuilding iOS/Android. Expo JS/Hermes exports validate bundling,
not native linkage or touch operation.

## Retained evidence

The [evidence index](evidence/native-glass-2026-11-10/README.md) provides local,
versioned screenshots, interaction source/logs, accessibility captures, pixel
matrices, native binary hashes and compact build receipts. Large binary outputs,
full build logs and intermediate failed experiments remain in the original ignored
output directory; their relevant digests and failure exclusions are documented.

- [Full build/runtime report](native-glass-runtime-validation-2026-11-10.md)
- [iOS button-color investigation](ios-glass-button-color-2026-11-10.md)
- [Initial implementation checkpoint](native-glass-implementation-2026-11-10.md), retained as historical context

## Adoption notes and remaining limits

The example restores Expo 58's React 19.3.0 and its accepted TypeScript 6.0.3 pin
separately from the newer Web catalog. A later dependency refresh had changed the
native React declaration; this follow-up restores the tested Expo stack. The Web
catalog is unchanged. Use the example Metro singleton resolver when consuming the
workspace package. Rebuild the iOS host for the added AppearanceView; a JavaScript
reload cannot register new native views. Existing public native props are unchanged.

Android acceptance used invocation-local Maven recovery plus the installed
SDK 37.2 / NDK 30 / CMake 4.1.2 toolchain because older default components could
not be downloaded reliably. AGP's compile-SDK warning was retained. This is not
acceptance of the unmodified Expo default toolchain or other architectures.

The prominent iOS Glass title remains cyan on the tested iOS 26.5 simulator.
No custom title overlay, private UIKit manipulation or replacement material was
adopted. Do not call it fixed, universally unavoidable, or proven on a real iPhone.
Physical devices, Release builds/distribution, VoiceOver/TalkBack, larger text,
old-OS fallbacks, cancellation callback counts and performance remain unverified.

This delivery authorizes source landing only. It does not publish packages,
create release tags or distribute mobile apps. Any automatic docs deployment from
main is the existing Web documentation workflow, not native-app delivery.
