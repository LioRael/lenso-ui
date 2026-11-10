# Native Glass implementation slice — 2026-11-10

For subsequent full native build and runtime results, see [runtime validation](native-glass-runtime-validation-2026-11-10.md). The build blockers below describe the initial implementation checkpoint.

## Result and scope

Added the private `@lenso/ui-native` source package and an Expo development-build
example. The first slice contains Backdrop, Glass, GlassGroup, GlassButton, Switch,
Slider, shared semantic themes and accessibility preference handling.

At this initial checkpoint, complete Expo native builds and native interaction
acceptance had **not passed**. The probe results below did not establish a verified
running Expo application. No release, commit, push or Space edit was performed at
that checkpoint. Subsequent full-app evidence is in the linked runtime report.

## Platform ownership

- iOS Glass and fusion use `expo-glass-effect` system views. Buttons use UIKit's
  glass configurations on iOS 26+, and Switch/Slider host actual UIKit controls.
- Android uses explicit backdrop IDs, RenderNode replay, RenderEffect blur and
  AGSL. API 33+ supports refraction/fusion, API 31–32 has blur only, and older
  systems or unavailable captures use a translucent fallback.
- Reduced transparency makes surfaces opaque. Custom press motion observes reduced
  motion. UIKit retains native system behavior.
- Web components continue to use Base UI. Existing primitive source and API have
  no changes from this slice. The only shared Web motion change extracts existing,
  unchanged press coefficients into a pure model.
- RSD resolves compatible StyleX declarations and themes on native hosts. The bridge
  forwards native state handlers, rather than discarding everything except style.
  Generated semantic colors come from the existing Apple color data; generated
  Android tone functions use the existing Lenso material tables. Existing compiled
  Web classes and DOM behavior cannot be passed into this adapter unchanged.

This implements automatic platform selection. iOS custom rendering, native TabBar,
Menu and Sheet, a published native distribution, and broad cross-platform API parity
remain outside this first slice. The prior Space architecture remains unchanged.

## Adaptation decisions

Retained MIT native source from `onlymoein/liquidglass` commit
`a2d26488ce8656901d088d10a69ec4e82fca37f4`, with package and root notices.

Changes include explicit source ownership, rejection of recursive capture,
source rebinding, shader caching, detach cleanup, floating-point geometry keys,
compatible group membership and corrected shadow call signatures. Rotated,
nonuniformly scaled, tinted, lens or incompatible group children draw individually.
Custom fusion has a limit of eight direct members. A group uses a smooth union;
its spacing controls the blend, and a visible neck also depends on the actual gap.
The example uses an eight-point gap with a twenty-point blend.

Android panes and groups use Lenso's Snell model and generated tone calibration;
lens thumbs preserve clear sampling. Upstream rim/continuous-corner geometry remains
part of the candidate. This is not a claim of pixel equivalence with Web or Apple.

UIKit measurement emits changed intrinsic sizes without an unbounded retry loop.
Switch and Slider restore authoritative values when a controlled owner rejects a
proposal. Slider cancellation does not commit; accessibility proposals restore the
owner value when not tracking. The Android slider keeps one PanResponder across controlled-value renders, with callbacks refreshed after commit. It preserves vertical-scroll intent
until horizontal drag recognition and avoids a duplicate end callback after a drag
returns to its origin. These behavior changes still require actual Expo interaction
verification.

## Verification performed

| Check                               | Result                       | Coverage                                                                                                            |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Native package typecheck            | Passed                       | Both platform source files                                                                                          |
| Example typecheck                   | Passed                       | Platform import resolution and example API                                                                          |
| Affected oxfmt / oxlint             | Passed                       | New TS/JS/JSON/Markdown source                                                                                      |
| Material/theme generation check     | Passed                       | Outputs match current shared input data                                                                             |
| Slider value tests                  | 4 passed                     | Relative step origin, overshoot, incomplete final step, continuous values, invalid public values                    |
| Expo dependency compatibility       | Passed                       | Expo 58 pins; example TypeScript 6.0.3, Web catalog retained                                                        |
| Expo autolinking                    | Passed                       | Apple pod/module and Android module discovery                                                                       |
| iOS / Android JS exports            | Passed                       | Separate Hermes bundles; not native linkage or rendering                                                            |
| Web Glass typecheck / package build | Passed                       | Shared press-model extraction remains buildable                                                                     |
| Web Glass tests                     | 83 passed                    | 37 logic and 46 DOM tests; not browser layout                                                                       |
| Repository interaction boundaries   | Passed                       | Existing boundary check                                                                                             |
| Android shader probe                | Passed                       | Both complete AGSL shaders constructed, all numeric uniforms bound and drawn on Android 14 emulator                 |
| Android view probe                  | Passed within stated harness | Rendering views compiled against Android SDK; backdrop replay, dark update, detach/re-attach and subsequent drawing |
| UIKit control SDK API check         | Passed within stated harness | ControlView.swift checked against iOS simulator SDK with minimal Expo declarations                                  |

Focused React Doctor scans scored the native package 92/100 and example 100/100.
The remaining package warning targets repeated lookups in the small, one-off theme
generator; it is not a native rendering hot path. The broad changed-source scan
excluded the new untracked packages and reported an unrelated homepage effect
cleanup finding; that concurrent homepage code was left untouched. Full focused
scans supplied native source coverage. These static scores are not runtime evidence.

The Android view harness substitutes only Expo's LinearLayout base and AppContext,
and an annotation. It runs the actual seven rendering Kotlin files. It does **not**
compile the module registration DSL or exercise Expo/Fabric/JavaScript integration.
The Swift API harness substitutes ExpoView and EventDispatcher declarations; it is
not a full ExpoModulesCore build and does not validate the module DSL or touch behavior.

Evidence is in ignored `output/native-glass-2026-11-10/`: probe sources/APKs,
screenshots, logcat records and build/export logs. The shader probe is deliberately
separate from the full native-view probe, and neither is the Expo example.

## Native build blockers

The host's default JDK 27 fails Gradle semantic analysis. A temporary JDK 17 was
extracted under `/tmp/lenso-native-jdk`, without changing global configuration.
Gradle does not inherit the shell's proxy settings; a second invocation supplied
those settings only for that build. Bootstrap compilation then progressed, but
failed downloading Kotlin 2.2.21 build-tools dependencies from Maven Central with
`Remote host terminated the handshake`. No Android app APK was produced.

CocoaPods stopped while downloading the React Native 0.88.1 prebuilt dependencies
from `repo.reactnative.dev` (`Transferred a partial file`). Three additional bounded
resume attempts also timed out; the partial archive is kept outside the Pods cache.
No iOS native build or simulator launch was completed.

The temporary Android emulator was used only for the probes. Native Expo touch
behavior, rejected controlled values, vertical scroll arbitration, actual StyleX
pseudo-states, VoiceOver/TalkBack, old-OS fallbacks, independently composed video or
WebView capture, real-device performance, and native visual parity remain unverified.

## Next acceptance step

Restore reliable dependency downloads, complete the standard Expo development
builds, and operate the example on both platforms. Exercise its controlled-value
lock, appearance and transparency controls. Scroll the foreground; use the exposed
side edges to scroll the backdrop independently. Verify repeated source replacement,
fusion, release/cancel, and accessibility operation before expanding the component set.
