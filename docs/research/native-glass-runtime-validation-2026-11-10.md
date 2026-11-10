# Native Glass full-build and runtime validation — 2026-11-10

Versioned screenshots, drivers, pixel matrices and build receipts are indexed in
the [retained evidence](evidence/native-glass-2026-11-10/README.md). Original
`output/` and `/tmp/` paths below describe the historical capture environment.

This report supersedes the build-blocked status of the initial implementation report.

## Full native builds

- iOS Debug: `xcodebuild` completed **BUILD SUCCEEDED**, with the real Expo modules,
  Lenso Swift module and UIKit controls. Installed on iPhone 17 Pro / iOS 26.5.
- Android Debug arm64: Gradle completed **BUILD SUCCESSFUL**, 331 tasks, with the
  real Expo modules and Lenso Kotlin module. Installed on the Android 14 Pixel 3a AVD.

These are complete development applications, not the earlier standalone probes.
Release distribution, physical-device performance and native pixel parity are not
established by these builds.

## Dependency recovery and exact environment

Downloads were recovered using bounded retries, persisted partial files and range
requests. React Native 0.88.1 dependencies/core and Hermes 260318099.0.5 Debug
archives were downloaded from public Maven transport/mirrors and checked against
official `repo.reactnative.dev` SHA1 sidecars. CocoaPods used the documented local
archive environment variables, without replacing package versions or native code.

The iOS invocation used `RCT_USE_LOCAL_RN_DEP`,
`RCT_TESTONLY_RNCORE_TARBALL_PATH` and `HERMES_ENGINE_TARBALL_PATH` for those official
Debug archives. This validates Debug; it does not validate Release archive switching.

Android used an invocation-local Maven cache/proxy with HTTPS upstream transport,
including Aliyun's Maven Central/Google/Gradle mirrors. No global repository or
network configuration was changed. The loopback repository permits HTTP only to
the local cache. Build helper sources and logs are retained in ignored
`output/native-glass-2026-11-10/build-tools/`.

The local Android build used JDK 17.0.21 from `/tmp/lenso-native-jdk`, installed
SDK 37.2, Build Tools 37.0.0, NDK 30.0.16248370 and CMake 4.1.2, selected by the
retained invocation-local Gradle init script. Expo's defaults require additional
older SDK components whose automatic downloads repeatedly failed. AGP 9.2.1 warns
that its tested compile SDK maximum is 37.0; that warning was not suppressed.
The installed-toolchain build and runtime succeeded; this does not establish the
unmodified Expo default toolchain or all Android architectures.

Metro runs offline on port 8084; Android uses `adb reverse tcp:8084 tcp:8084`.
Offline mode avoids Expo CLI startup requests failing on the same network. It does
not substitute a Web rendering surface for the native application.

### Recorded build invocations

These are the historical local commands after Expo prebuild and dependency
recovery, not replacements for the normal example scripts. Paths identify this
capture environment and must be adapted on another host. The recovery/init source
is retained in the evidence directory; default toolchain downloads were not fixed
by changing project SDK settings or disabling TLS.

```sh
# From apps/native-example/ios, after downloading and verifying the archives:
export RCT_USE_LOCAL_RN_DEP=/tmp/lenso-native-rndeps-resume.tar.gz
export RCT_TESTONLY_RNCORE_TARBALL_PATH=/tmp/lenso-native-rncore-debug.tar.gz
export HERMES_ENGINE_TARBALL_PATH=/tmp/lenso-native-hermes-debug.tar.gz
pod install

# From the repository root, using pinned Node/Bun and Xcode:
xcodebuild -workspace apps/native-example/ios/LensoNative.xcworkspace \
  -scheme LensoNative -configuration Debug \
  -destination id=A143ED5B-921E-4FAF-BFA8-084F7D4046FF \
  -derivedDataPath /tmp/lenso-native-ios-build CODE_SIGNING_ALLOWED=NO

# From apps/native-example/android; loopback Maven proxy already running:
JAVA_HOME=/tmp/lenso-native-jdk/jdk-17.0.21+9/Contents/Home \
./gradlew :app:assembleDebug --console=plain --no-daemon \
  -I /tmp/lenso-native-net/repositories.init.gradle \
  -I /tmp/lenso-native-net/installed-toolchain.init.gradle \
  -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=7890 \
  -Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=7890 \
  '-Dhttp.nonProxyHosts=localhost|127.*' \
  -Dorg.gradle.internal.http.connectionTimeout=20000 \
  -Dorg.gradle.internal.http.socketTimeout=660000 \
  -PreactNativeArchitectures=arm64-v8a
```

Verified official SHA1 sidecars: RN dependencies Debug
`f2e2291d7c1ba66fab962541810e88236d62c810`, RN core Debug
`9e3d9b5c56451f7452c48b5d70358a38100458b8`, Hermes Debug
`d98ab1b5e1ee4564d9d692edecd00b3994cd43a1`.

## Runtime defects fixed

1. RSD follows CSS flex defaults. Explicit column direction was missing from the
   example's vertical stacks, causing collapsed/offscreen controls. Root sizing
   also used flex under a non-RSD parent, producing a runtime warning. Explicit
   directions and percentage root dimensions corrected the fixture.
2. The app and library resolved two peer-specific RSD copies. Their variable
   registries and theme contexts diverged, making token surfaces transparent and
   losing semantic colors. Metro now resolves React and RSD from the application
   origin while preserving native export conditions.
3. Android resting thumbs sampled their track despite a white background underneath
   the shader. An opaque white tint now applies at rest; held thumbs retain their
   clear refractive lens.
4. iOS grouped glass inherited light UIKit traits even when the RSD theme was dark.
   A scoped native appearance host now supplies the matching UIKit trait to its
   descendants without changing the application's global appearance.
5. The fixture heading now owns an opaque semantic background so the deliberately
   oversized backdrop labels do not obscure its description.

The actual Metro source map contains one native RSD entry. The module path and
sampling evidence are retained in `android/rsd-singleton.json`.

Web Base UI interaction contracts and primitive source were not modified.

## Android interaction evidence

The actual Expo app passed UIAutomator/ADB assertions for accepted switch state,
slider changes (42 to 68), a single button callback, rejected controlled switch and
slider proposals, dark appearance and reduced-transparency toggles. Backdrop scroll
was operated through the exposed edge separately from foreground controls.

AX dumps, screenshots and the runnable acceptance driver are retained under
`output/native-glass-2026-11-10/android/`. These checks do not cover TalkBack,
multitouch, old-OS fallbacks or real-device frame timing.

## iOS interaction evidence

The installed Expo app passed the comprehensive XCTest scenario in 38.128 seconds
with zero failures after the native appearance fix. XCTest operated the actual
UIKit switch, slider and button: accepted input updated both the JS owner and native
AX value (slider 81%), rejected controlled proposals retained their owner values,
and Continue invoked exactly one callback. Backdrop scrolling moved the background
while the foreground frame stayed fixed. Dark/light and reduced-transparency/restore
states were captured. This iOS viewport has no foreground overflow, so foreground
scroll displacement is established by the Android fixture, not this iOS run.

A final focused XCTest run against the latest installed binary passed one test,
zero failures, in 14.610 seconds. Its installed debug-dylib hash matched the rebuilt
app. It reconfirmed the single callback and native light/dark appearance.

Comprehensive results, actual test source, AX hierarchies and exported screenshots
are in `output/native-glass-2026-11-10/ios/final/`; the latest title-color check is
in `ios/title-final/`. The exploratory selector run that discovered zero tests is
excluded from acceptance.

## Visual review and acceptance limits

Both actual applications were reviewed in light, dark and opaque states. Semantic
card fills and labels render correctly; iOS uses fused system Glass and UIKit
controls, while Android uses the Lenso native renderer. Android independent backdrop
scrolling changes pixels inside the glass while foreground control geometry stays
fixed. Android resting thumbs are visible white; held/released button captures are
retained. These are fixture observations, not full cross-platform pixel parity.

The initial iOS prominent Glass button captured cyan over blue, approximately
3.32:1 at one local pixel pair. Calling that a system color limitation was
premature: a follow-up compiler probe established that the attempted white title
transformer selected a SwiftUI attribute instead of the intended UIKit attribute.
See the [focused investigation](ios-glass-button-color-2026-11-10.md) for upstream
comparison, compiler proof and the final rendered result. UIKit Glass remains the
implementation; no private API or custom title overlay was introduced.

Verification is simulator Debug only. Physical devices, Release distribution,
VoiceOver/TalkBack sessions, larger text, old OS fallbacks, multitouch, cancellation
callback counts and performance profiling remain unverified. Native AX inspection
does not substitute for a screen-reader session. The example retains development
client chrome and is a validation fixture rather than a finished product screen.

Affected native/example typechecks, format/lint checks, generated-source checks
and the four existing native slider numeric tests passed. Full native build logs,
dependency recovery helpers and screenshots are retained in the ignored output
directory. No publication or landing is part of this validation.
