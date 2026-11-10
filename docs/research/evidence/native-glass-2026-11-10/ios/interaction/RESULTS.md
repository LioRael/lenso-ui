# iOS native acceptance — 2026-11-10

Actual installed Expo development build on iPhone 17 Pro / iOS 26.5 simulator.
The final binary includes the native UIKit AppearanceView host and explicit white
prominent-button base foreground. The app was opened through its remembered Metro
project at 127.0.0.1:8084; this is not a stub or shader-only probe.

`NativeQATests.testNativeAcceptance` passed in 38.128 seconds, zero failures.
The XCTest runner physically operated the actual native controls.

- Native Notifications UISwitch changed from on to off after accepted input.
- UISlider accepted a drag: JS owner label became `Level 81`, native AX value `81%`.
- Continue produced one callback, changing `Actions 0` to `Actions 1`.
- With controlled values held, a switch tap and slider drag both retained owner values;
  the native slider AX value also retained the accepted value.
- A gesture in the exposed backdrop edge moved Background 1 while the foreground
  platform-description frame remained fixed.
- Light/dark and reduced-transparency/restore controls updated their labels and
  visible surfaces. Dark opaque panes are solid and separated; restoring transparency
  recreates the fused dark native material.

Visual findings fixed during this work:

1. Explicit vertical flex directions fixed collapsed horizontal fixture layout.
2. A singleton RSD runtime fixed missing semantic fills and default-black text.
3. UIKit appearance inheritance fixed light native fused material under dark mode.
4. The heading's semantic opaque background protects its text from backdrop labels.

The final ordinary card has the correct opaque semantic fill. Native Glass fusion
and dark appearance are visible, with readable foreground labels. No LogBox appears
in the final snapshots. The prominent UIKit glass button still composites its title
as cyan over blue even with a white base foreground; its opaque `.filled` fallback
renders white. A representative title/background pixel pair in the final light PNG
is RGB(139,255,255) / RGB(0,128,243), approximately 3.32:1 local contrast. This remains
an observed native material/color limit, not a claim that explicit-white changed the
glass title to white.

Screenshots and AX hierarchies have readable `acceptance-*` filenames alongside the
original xcresult attachment manifest. `test.log` contains the actual assertion run;
`NativeQA.swift` contains its source. Prior launcher/tooling and before-fix evidence
are separate directories. The underlying result bundle remains at
`/tmp/lenso-native-ios-qa/lenso-acceptance2.xcresult`.

Limits: simulator only; no real iPhone, VoiceOver session, performance profiling,
old-OS fallback, dynamic type, multi-window, callback-end/cancel counting, or full
cross-platform pixel equivalence acceptance was performed. Native AX roles and labels
were inspected, but that does not substitute for VoiceOver. The fixture fits this
viewport, so this run checks independent background scrolling rather than asserting
foreground scroll displacement where no overflow exists.
