# Native component foundation expansion — 2026-11-10

This source delivery is a foundation milestone toward the full-library native goal. The baseline contains
99 Web component families. The [inventory](../design/native-component-coverage.json)
retains missing families and specific gaps; exposing 37 partial adapters is not
completion of the library or equivalence of their public APIs.

## Implemented foundation

- Ordinary Button uses UIKit configuration on iOS and Lenso Pressable on Android,
  with real disabled/loading behavior. Existing GlassButton remains a native Glass
  control. Ordinary grouped content does not acquire Glass as decoration.
- Stepper hosts UIStepper, preserving its finite bounded values and positive step;
  unlike Slider, it does not quantize off-grid owner values. SegmentedControl hosts
  UISegmentedControl and uses stable unique keys rather than label/index identity.
- Checkbox/Radio/ToggleButton use UIKit selection buttons on iOS and Lenso choice
  controls on Android. Groups own single/multiple values and inherit disabled or
  readOnly flags; an explicit child `disabled={false}` cannot override its group.
- Input/Textarea/SearchField use React Native's actual platform text editing.
  TextField supplies label, description and live error presentation. Caller refs
  compose with the RSD bridge, including React 19 ref cleanup; selection and focus
  callbacks preserve both owners. Caller color props and StyleX remain composable.
- Content composition includes Typography/Heading/Paragraph/Code, labels,
  descriptions, surfaces/cards, dividers, static tags/badges, alerts/empty states,
  loading placeholders and native ActivityIndicator. Detailed variant, compound and
  interaction gaps remain listed per family.

The catalog fixture uses the SDK 58-compatible `react-native-safe-area-context`
5.11.1, actual safe-area offsets for keyboard avoidance, and theme-aware status-bar
text. This adds a native dependency to the example: rebuild the development host
rather than reloading JavaScript into the old host.

## Native runtime corrections

1. UIKit selection buttons originally blocked disabled touches but still reported
   enabled in AX. Assigning a manual traits list masked UIKit's disabled trait.
   Removing that assignment lets `UIButton.isSelected` / `isEnabled` own AX state.
2. Android ToggleButton originally reported selected without checked. The native
   toggle role requires [checked state](https://reactnative.dev/docs/accessibility);
   the adapter now reports the actual checked value.
3. New ordinary/selection buttons now have measured 44-point native frames. The
   genuine UIStepper and its native AX children retain UIKit's 32-point intrinsic
   geometry despite a 44-point outer host; no private child scaling was introduced.
4. Safe-area and keyboard viewport handling prevent catalog content from being
   drawn beneath the status bar or software keyboard. Programmatic input focus
   preserves the caller's StyleX focus border and native editing.

## Verification boundaries

The actual iOS Debug application was rebuilt with the real Expo/Lenso/SafeArea
modules. Android's complete arm64 Debug application also rebuilt successfully
(353 executed tasks), using the earlier invocation-local installed-toolchain
workaround. The AGP compile-SDK warning remains visible; default Expo SDK component
downloads, Release and other architectures are not established by that build.

Static verification includes package/example type checks, affected formatting and
lint, generated material/theme consistency and nine maintained tests. The new
numeric tests catch stepper bounds/off-grid behavior and immutable selection
proposals absent from Slider coverage. The inventory test catches dropped families;
it does not establish component functionality.

Versioned [evidence](evidence/native-foundation-2026-11-10/README.md) retains compact
build logs, actual screenshots, accessibility captures, QA sources, source hashes
and matching installed/built binary hashes. The original larger investigation
outputs remain ignored in `output/native-catalog-2026-11-10/`.

| Cohort                                | Result and boundary                                                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| iOS full native Debug build           | Build4 succeeded; real Expo/Lenso/SafeArea modules on iPhone 17 Pro, iOS 26.5 Simulator                                                                                                                 |
| Android full native arm64 Debug build | Succeeded, 353 executed tasks; installed APK hash matches build, Android 14 Pixel 3a emulator                                                                                                           |
| iOS fields/actions                    | Scoped assertions passed for editing/search, readonly/disabled/loading, native focus/ref and live validation; containing final6 scenario later stopped on a driver selector, not an overall passing run |
| iOS completed appearance/held search  | Two scenarios passed, zero failures; held search/choices/system controls and light/dark/caller StyleX                                                                                                   |
| iOS final callback regression         | One scenario passed, zero failures, 85.084 seconds; accepted/held choices, segments, Stepper, actual Glass Switch and Slider, owner/native agreement                                                    |
| Android final interaction             | 26 assertions passed after final callback stabilization; actions, fields/search, accepted/held choices, segment disablement, Stepper bounds, inherited disablement, dark appearance and Glass return    |
| JS/Hermes exports                     | Both iOS and Android production bundles exported; bundling proof, not Release application builds                                                                                                        |
| Maintained static checks              | Nine tests, 128 assertions; package/example typechecks, generation consistency, format/lint, interaction boundary check and frozen install                                                              |
| React Doctor                          | Full native package 92/100, existing generator array-lookup warning only; introduced context warning resolved; example scan 100/100                                                                     |

Final callback stabilization preserves current owner values/callbacks while avoiding
unnecessary selection context replacement. A post-change actual native regression
covers acceptance and rejection, including the shared hook's existing Glass users.
Repository candidate CI is a separate exact-SHA gate; it does not rebuild mobile apps.

The iOS multiline UITextView displayed a caret/keyboard and accepted actual software
key touches even when XCTest did not expose its keyboard-focused flag. Tests use
observed keyboard keys and verify both native and owner text. A keyboard predictions
toolbar is itself a ScrollView; the driver selects the actual large catalog viewport
instead of `scrollViews.firstMatch`. These automation findings do not establish a
VoiceOver defect or screen-reader acceptance. Android drivers likewise derive
visible bounds from the actual viewport and avoid flings that skip a short field.

## Remaining full-library work

All added families remain partial. Compound forms/validation, indeterminate choices,
single-mode toggle groups, group option propagation, refs/variants for remaining
controls, complete keyboard/screen-reader operation and wider layout/locale coverage
remain open. Navigation, overlays, collections, date/time/color families and advanced
feedback are still missing. Native iOS Glass's cyan prominent title remains recorded
in the earlier investigation; this expansion does not claim to fix that material.

## Consumer migration and delivery

The package remains private and source-only. New exports are additive; this is a
native API using onPress/native refs, not a Web import-path replacement. Existing
Web Base UI contracts and preserved primitives are unchanged. Rebuild the Expo
development client for new UIKit view registrations and the SafeArea dependency;
a Metro reload alone cannot install native modules. The example retains the Expo
58 React 19.3.0 / TypeScript 6.0.3 pins independently of the newer Web catalog.

No npm publication, release tag, app distribution or manual deployment is part of
this source delivery. Existing main documentation automation is a separate Web
workflow. Physical devices, Release, screen readers, larger text, RTL/locales,
old-OS fallback and release performance remain unverified. The inventory records
37 partial families and 62 missing families, with no complete-family claims.
This foundation milestone does not complete the full-library native goal.
