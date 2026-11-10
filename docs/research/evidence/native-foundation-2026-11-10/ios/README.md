# Native foundation catalog: iOS runtime receipt

Verified the actual Expo application `dev.lenso.nativeexample` on the iPhone 17 Pro Simulator, iOS 26.5. This is the first expanded foundation batch, not completion of the 99-family native goal.

## Evidence boundary

- Full native catalog build4 succeeded before installation, including the real UIKit ChoiceView module and safe-area native dependency. Parent build log: `/tmp/lenso-native-catalog-ios-build4.log`.
- `remaining-final/remaining1-provenance.json` records identical installed/build hashes for both the actual application debug library and the active CatalogQA XCTest binary, plus fixture source hash. Metro project URL is `http://127.0.0.1:8085`, launched through Expo's supported `--initialUrl` argument.
- `partial-final6/` is deliberately a partial scenario, not an overall passing test. Its assertions completed the core sections below; it stopped at an ambiguous temporary ScrollView selector while exposing Search with its keyboard present.
- `remaining-final/` contains two passing fresh-scene scenarios, zero failures, 115.063 seconds, completing held Search and held selection/system controls plus visual review. The selector explicitly excludes the keyboard predictions toolbar's separate ScrollView.

## Observable coverage

| Area                              | Verified behavior                                                                                                                                                             | Receipt                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Actions                           | Save callback exactly once; disabled action and loading action ignore actual center-coordinate touches; loading restores interactive callback                                 | partial-final6                                    |
| Native ref and caller focus style | Focus name invokes native ref, displays keyboard and caret; caller StyleX focus border visibly blue                                                                           | partial-final6/catalog-forwarded-ref-focus        |
| Fields                            | Name Ada to Grace; real UITextView software-key edit with matching owner text; native SearchField glass submit; readonly Reference and disabled Unavailable retained          | partial-final6                                    |
| Validation                        | Enter a value is initially present, typing ok clears error and updates native value                                                                                           | partial-final6/catalog-fields-accepted            |
| Selection acceptance              | Checkbox, radio and toggle update both native selected state and owner values                                                                                                 | partial-final6/catalog-choices-accepted           |
| Disabled groups                   | All native selection descendants expose disabled AX, including Email updates with child disabled=false; actual disabled Email touch preserves selected state and owner values | partial-final6/catalog-parent-disabled            |
| Segmented control                 | Actual UISegmentedControl selects Business; disabled Unavailable segment ignores direct touch                                                                                 | partial-final6                                    |
| Stepper                           | Actual UIStepper accepts 2 to 3; further max touch retains 3; decrements to 1; further min touch retains 1; restores 2                                                        | partial-final6/catalog-stepper-_-bound-_          |
| Controlled rejection              | Held Name and Notes restore owner value; held Search remains glass after native z input proposal                                                                              | partial-final6 plus remaining-final/held-search-* |
| Controlled selection rejection    | Held checkbox/radio/toggle, segmented selection and Stepper retain original native and owner values after real touches                                                        | remaining-final/held-choices-system               |
| Appearance and navigation         | Dark fields, choices, segmented control, Stepper, content/feedback; caller StyleX orange rendered in light and dark; restores light and returns to original Glass screen      | remaining-final                                   |

`pixel-style-receipts.json` records exact caller RGB evidence using observed AX title/input frames: focus blue and caller orange pass. Raw unedited screenshots and AX hierarchies accompany captures. The parent source/build hash index binds these observations to the retained checkout source; final callback hashes are also recorded in `delivery-regression/`.

## Findings resolved during verification

The fixture originally scrolled underneath the status area; current main scroll viewport begins at y62 and excludes the bottom safe area. Ordinary native UIButton and selection buttons now expose 44-point frames. The platform UIStepper and its native children retain 32-point AX frames inside the 44-point host; this receipt does not claim native Stepper descendants became 44 points.

A real iOS disabled-selection AX bug was found: manually replacing UIButton accessibilityTraits removed its notEnabled state while native/owner event guards still blocked touches. Removing the manual assignment restored native disabled and selected semantics; the repaired runtime passes.

Native Stepper bound behavior is verified through value clamping under repeated touches. Its native Increment/Decrement AX children remain enabled at bounds on this runtime, so no disabled-at-bound state is claimed.

## Automation and coverage limits

RN multiline TextView can show a caret and accept actual software-key input while XCTest element.typeText rejects its missing keyboard-focus AX flag. Direct observed software-key taps prove native editing; this is not VoiceOver acceptance. Earlier failed driver attempts are preserved as partial or diagnostic evidence, never counted as passing full scenarios.

Simulator-only: physical iPhone, VoiceOver, dynamic type, old OS fallback, release performance and the remaining component families are not verified here. Existing Glass acceptance remains separately recorded in the earlier native-glass evidence; this batch checks returning to that actual screen, not repeating its complete gesture suite.

## Final delivery callback regression

After callback stabilization in use-value.ts and selection.tsx, `delivery-regression/` supplies an additional passing actual native runtime scenario: 1 test, zero failures, 85.084 seconds. Accepted and held choices/system controls plus Glass Switch/Slider pass; exact final source and installed-binary hashes are recorded there. Fields were not repeated for this callback-only change.
