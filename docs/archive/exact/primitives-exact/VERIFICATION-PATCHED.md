> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

> Historical research only. These results require a modified SDK and do not
> establish support on unmodified Exact. See [the upstream baseline](VERIFICATION.md).

# Platform verification

Recorded 2026-11-11 against Expo Exact
`956ae33a35ffa5313d7be3cebc55ed84f9480e0a`, with the four Host patches and the compiler relationship patch
listed below. These results apply to the patched checkout.

## Shared tests and native observations

Every host receives the same `example/app.test.contract`: seventeen tests, no
host-specific skips. The copied consumer imports only distributable files.
Nested Dialog checks are now in the default suite; the separate experimental
stack file/flag have been removed. The suite covers values/state, disclosure,
horizontal/vertical Tabs, keyboard, dialogs/menus, Tooltip timing/cleanup and
two-level Dialog Escape, explicit close and reopen, plus four-level unwind,
removed child/page invokers, active subtree removal, route push/back and source
route disposal. Both Apple runs explicitly select platform chrome and sheets.

| Surface                            | Shared agent suite    | Additional evidence                                                                                               |
| ---------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Chrome 156.0.8078.4                | 17/17                 | Chromium browser assertions; real CDP AX descriptions, roles, states, hidden content, tooltip and nested modality |
| Playwright WebKit 27.2             | 17/17                 | Same browser keyboard, focus, placement and relationship assertions                                               |
| macOS 27.2 / AppKit                | 17/17                 | Native AX isolation and current responder checks: four levels, invoker/subtree removal and navigation             |
| iOS 26.5 / iPhone 17 Pro Simulator | 17/17                 | Native AX isolation and current responder checks: four levels, invoker/subtree removal and navigation             |
| Linux host on macOS                | Previous fixture: 6/7 | Not rerun for Tooltip/nested Dialog; not Linux OS acceptance                                                      |
| Linux desktop / AT-SPI             | Not run               | Retained environment and upstream accessibility gaps                                                              |

Browser assertions now include parent programmatic-focus rejection, nested
Escape, explicit close, reopen, focus return at both levels, and removing the
Host inert gate after close. A native Contract dialog fixture changes authored
`inert` while covered: setting it false cannot unlock the background; setting it
true persists after uncovering. A cancelled opening leaves its parent live.
These checks run on both engines, not a DOM simulation.

Chrome CDP and Apple AX checks use `test/accessibility.mjs`: four active levels,
each surviving scope after close, removed invokers, subtree removal, departing
routes and navigation back. Fresh sessions isolate destructive cases. Native
checks compare the current logical responder against live node IDs; browser
checks inspect `document.activeElement`, including delayed restoration. The
shared Contract observes bubbled focus events across the authored hierarchy. The Chrome observation explicitly
confirms the parent is inert. A diagnostic regression based on that observation
also verifies that modal inert escape never suppresses `aria-hidden` findings.
UIKit does not claim a DOM-style focus property or spoken reading order.

The compiler probes include four API regressions: all six supported text modes compile, Input rejects `type="checkbox"`
with `type-prop`, disabled close controls compile through the Dialog/Popover
subpaths, and the retired root `TooltipIntent` import is rejected with
`contract-use-unknown`. The eight existing probes retain their results: invalid orientation is
`type-prop`, child timers are `type-child-resource`, computed waits are
`lower-timer-literal`; the complete Tooltip root connection compiles. The additional [compiler relationship probes](COMPILER.md) reject unnamed/empty
Dialogs, missing command/ARIA targets, wrong target kinds and disjoint branches;
correct expanded compositions compile. Dynamic cases are runtime obligations.
Competing invocations remain an accepted compiler gap.

## API consolidation regression

The supported API and its private v0.1 migration are in [API.md](API.md).
Disabled close controls are observed in the shared suite; Chromium/WebKit also
attempt programmatic clicks and require their overlays to stay open.

The focused review commands were run against the complete patched SDK:

| Change               | Focused run       | Additional check                                         |
| -------------------- | ----------------- | -------------------------------------------------------- |
| native-accessibility | AppKit 4/4        | Base native AX scope                                     |
| agent-dialog-escape  | iOS Simulator 3/3 | Recognized key and normal command paths                  |
| nested-dialogs       | Chrome 2/2        | Nested CDP AX and Chromium/WebKit browser checks         |
| dialog-lifecycle     | Chrome 6/6        | Full lifecycle CDP AX and Chromium/WebKit browser checks |

These are focused subsets of the same seventeen tests, not extra independent
coverage counts. Every cumulative patch checkpoint also passes apply and
reverse checks. Regressions require byte-for-byte SDK equality; receipts record
the base, checkpoint and patch hashes. Individual prefix builds were not run.

## Compiler relationship follow-up

The [compiler patch](COMPILER.md) adds an expanded-root analysis pass. All 26
package probes match their expected outcomes, including native empty invoker
targets, one deferred dynamic case and one accepted invocation-conflict gap.
The imported empty-label diagnostic points to the caller's argument.

The complete Contract SDK default suite passes: **2,733 passed, 0 failed,
10 existing ignored**, across 16 targets, with no test filters or new ignores:

```sh
CARGO_INCREMENTAL=0 CARGO_PROFILE_TEST_DEBUG=0 CARGO_PROFILE_TEST_CODEGEN_UNITS=256 CARGO_BUILD_JOBS=1 \
  cargo test -p contract -p contract-analyze --tests --no-fail-fast
```

These invocation-local settings bound compilation memory without changing
optimization level or assertions. The focused relationship target contributes
65 of these tests: five new grouped graph tests and 60 existing alert/menu,
geometry and top-layer tests moved out of the large integration target, without
duplication. The source sweep passes 132 app roots and 159 imported sources.
This is the complete default suite for the two named Contract SDK packages;
it is not an all-workspace, all-features or native-platform acceptance claim.

The initial full run exposed an actual compatibility regression: empty
`commandfor` and `popovertarget` deliberately mean unbound/no-op in Exact. That
behavior is preserved; whitespace-only/multiple IDs and missing nonempty targets
still fail. Existing role/layout/warning fixtures now provide valid names and
reference nodes while retaining their original assertions. The SDK harness,
document reader, native fixture and orientation fixture now name their dialogs;
the reader links its visible dynamic headings with `aria-labelledby`.

All **seven existing async checks pass** when invoked separately: five
TypeScript checks, the no-tells documentation check, and every starter pattern's
real browser tests. Two pre-existing validation inputs were corrected: the
yielding guide snippet is self-contained, and a provider fixture accepts the
storage API's existing JPEG/PNG union. No storage declaration or negative
provider assertion changed. The site pattern requires `API_BASE_URL` pointing
at an unused local `http://127.0.0.1:<port>`; Exact starts its own fixture server.
An unset value prevents its build; an external placeholder does not provide the
local API the tests need. The successful run used `http://127.0.0.1:61976`.

Thus **2,740 tests were executed successfully** across the default and async
runs. The default suite's ten ignored markers remain unchanged; seven were
explicitly exercised afterward. Three remaining ignored tests are
manual/benchmark probes: `stack_depth::probe_view_pass_on_a_small_stack`,
`tamber::wide_mark_cost`, and
`tamber_serve_slots::the_slot_check_alone_on_the_clone_with_the_real_packages`.

The rebuilt final compiler passes the official `difftest quick` using pinned
Lean **4.34.1**: **587 corpus cases, 40 random cases, 8 lowering cases**; seed
`8265107218640133315`. Lowering records 1,347 agreeing runs and 97 identical
bodies, with zero divergence, mismatched bodies, compile/boot refusals or
undecoded bodies. Expected negative property outcomes in the corpus remain
expected. This is the official quick differential scope, not the async lane's
full semantic sweep.

The archive's missing pinned fonts, sounds, design files, TypeScript/editor
inputs and semantic sources were restored byte-for-byte from the original
commit; these originals are not patch changes. A separate temporary Git
directory backed by the pinned objects supplies the real base/working diff to
`difftest quick`; absent archive files are sparse. No SDK source was rewritten
to establish that comparison. The verified official Lean archive has SHA-256
`65f22a4f047738ec742667b3247e836a86ebf06eabc12655c3dee00637e37866`.

All five patches pass cumulative apply/reverse checks, and all 39 reconstructed
SDK files match the tested SDK byte-for-byte. The four Host patches are unchanged.
Standard pinned-toolchain `cargo check` and `cargo clippy` pass for
`contract`/`contract-analyze` with `--all-targets --keep-going` (Clippy uses
`-D warnings`); workspace `cargo fmt --check` also passes after restoring the
archive's missing original Rust modules. Package TypeScript, lint and format
checks pass. No accelerator result substitutes for standard Rust validation.
`cargo doc -p contract-analyze --no-deps` succeeds with two pre-existing private
intra-doc-link warnings in unchanged `shortcuts.rs`; these are documentation
warnings, not test failures.

The platform table above records the preceding API/Host acceptance. The earlier
compiler follow-up reran the copied Web consumer and all seventeen Chrome agent
tests. This full-SDK follow-up does not claim fresh Apple/WebKit runtime
acceptance or Linux OS/AT-SPI validation. Compiler analysis does not change code
generation or supply Host accessibility behavior.

## Required Exact fixes

[Per-change review and regression commands](patches/README.md) and
[the series manifest](patches/series.json) make the four Host boundaries and independent compiler change explicit.
`research:host-patches check` checks each cumulative checkpoint; `regress <id> <host>`
also verifies the SDK bytes and runs the named shared tests plus the relevant
AX/browser scope. A focused receipt is distinct from full platform acceptance.

| Patch                                                                            | Responsibility                                                                                                                      | Needed for                                    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [exact-native-accessibility.patch](patches/exact-native-accessibility.patch)     | AppKit button-cell roles/states, tab mappings and switch/tab observation                                                            | Existing AppKit primitive AX acceptance       |
| [exact-agent-dialog-escape.patch](patches/exact-agent-dialog-escape.patch)       | iOS agent recognized Escape uses the existing alert/sheet cancel path                                                               | Observable iOS Dialog Escape in agent tests   |
| [exact-nested-dialogs.patch](patches/exact-nested-dialogs.patch)                 | AppKit hidden-element exposure, Web modal inert lifecycle, authored inert preservation, runtime staging, modal-aware AX diagnostics | Nested Dialog focus and AX acceptance         |
| [exact-dialog-lifecycle.patch](patches/exact-dialog-lifecycle.patch)             | Authored route lifetime, eligible focus fallback, UIKit dismissal completion, focus event propagation and empty navigation focus    | Four-level, removal and navigation acceptance |
| [exact-compiler-relationships.patch](patches/exact-compiler-relationships.patch) | Static command identity/kind, ARIA ID lists and Dialog name sources after expansion                                                 | Compile-time composition diagnostics          |

The third patch changes seven SDK files:

- `host/apple/Sources/ExactKit/Mac/NodeViewMac.swift`: respect
  `accessibilityHiddenWritten` in `isAccessibilityElement()`. The Host already
  hid the covered sheet, but its override still exposed the outer Dialog itself.
  The observer and its outside-modal assertion remain intact.
- `host/web/dialog-modality.js`: apply inert to lower open Dialogs by opening
  order. Release the parent in closing `beforetoggle`, before browser focus
  restoration. Apply completed openings on `toggle`; a microtask inside
  `beforetoggle` is too early and can re-lock the parent during native close.
- `host/web/navigation.js`: project the gate after app tree updates and retain
  it alongside route inertness; re-export the existing `modalLayers` API.
- `host/web-js/rt.js` and `host/web/glue.js`: combine authored inert with the
  modal gate, preserving an author's latest value through stack transitions.
- `host/web-js/glue.mjs`: stage the shared modality module with runtime inputs.
- `scripts/agent-ax.mjs`: honor inert escape above an actually observed modal
  boundary. The modal's own inert and all `aria-hidden` checks remain effective.

WebKit's failure was reproduced with a minimal native HTML button-command
stack as well as the Exact fixture. The correction uses native inert and Dialog
lifecycle events; it adds no custom focus trap, React mechanism, Contract syntax
or library-owned modal boolean. The extracted Host module keeps existing source
files under Exact's 1,500-line limit.

The fourth patch, [exact-dialog-lifecycle.patch](patches/exact-dialog-lifecycle.patch),
adds lifecycle handling in nine SDK files:

- Web modality tracks each opening's invoker and authored route. Removed or
  inactive routes retire their modal stack. Closing with a missing invoker
  chooses an eligible target in the surviving modal or selected page; it never
  overrides an eligible destination focus. Navigation projects route gates
  before reconciling modal ownership.
- AppKit `SheetsMac.swift` retires descendants even in painted mode.
  `DialogsMac.swift` detects inactive authored routes and provides a current
  route/autofocus fallback when the invoker is gone. `NavigationMac.swift`
  restores an arriving route scope only when no live control retains focus.
- UIKit `KeyEvents.swift` follows the authored sheet parent for focus/key event
  propagation. `DialogSheetIOS.swift` restores only after actual system
  dismissal, avoids intermediate descendant restoration, validates source and
  prior focus against the surviving scope/route, and does not announce a hidden
  source route. `Accessibility.swift` permits arrival autofocus to supersede a
  route placeholder or departed-route responder. `NavigationIOS.swift` supplies
  a route fallback after a completed transition with no current/pending focus.

These are Host responsibilities. The primitive keeps native command targets,
accessible names/descriptions and slots; the application owns route state,
conditional mounting and Tooltip cleanup. No library focus trap or duplicated
modal state is introduced. The compiler still needs command/ARIA edge and
behavior-conflict validation. Static command/ARIA edges and Dialog naming are
now handled by the separate compiler patch, not these lifecycle fixes. No new
Contract keywords are introduced.
The source-disposal probe uses supported `push` plus conditional unmount;
replacing the initial root visit with a sibling is not a supported route operation.

Apply the patches in this order to a clean pinned checkout. The nested patch's
agent diff builds on the first patch's existing normalizations:

```sh
git -C /absolute/path/to/exact apply /absolute/path/to/primitives-exact/patches/exact-native-accessibility.patch
git -C /absolute/path/to/exact apply /absolute/path/to/primitives-exact/patches/exact-agent-dialog-escape.patch
git -C /absolute/path/to/exact apply /absolute/path/to/primitives-exact/patches/exact-nested-dialogs.patch
git -C /absolute/path/to/exact apply /absolute/path/to/primitives-exact/patches/exact-dialog-lifecycle.patch
git -C /absolute/path/to/exact apply /absolute/path/to/primitives-exact/patches/exact-compiler-relationships.patch
```

The harness does not silently patch another checkout. The ordered series is
apply-checked against pinned originals and the reconstructed changed files are
compared byte-for-byte with the tested SDK. Reverse-apply checks also pass.
The series remains local and unpublished.

## Reproduce

Use initialized Exact with pinned Rust 1.97.0, Bun, verified Hermes and the
platform SDK. Compiler probes use `target/debug/contract` unless
`EXACT_CONTRACT_BIN` names another built binary. Local browser tests use
Playwright 1.64.1 and matching engines via `PLAYWRIGHT_MODULE`.

```sh
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:contracts
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:agent
EXACT_ROOT=/absolute/path/to/exact EXACT_WEB_BROWSER=webkit bun run --cwd packages/primitives-exact test:agent
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:browser
EXACT_ROOT=/absolute/path/to/exact bun run --cwd packages/primitives-exact test:native macos
EXACT_ROOT=/absolute/path/to/exact EXACT_SIM=<dedicated-simulator-udid> bun run --cwd packages/primitives-exact test:native ios
```

For Chrome's native AX check, after a Web build/test, from the repository root:

```sh
EXACT_ROOT=/absolute/path/to/exact EXACT_WEB_DIST="$PWD/packages/primitives-exact/.cache/example/dist" bun packages/primitives-exact/test/accessibility.mjs web "$PWD/packages/primitives-exact/.cache/example/app"
```

On a fresh dedicated simulator, enable accessibility observation before launch:

```sh
xcrun simctl spawn <dedicated-simulator-udid> defaults write com.apple.Accessibility ApplicationAccessibilityEnabled -bool true
```

Receipts, observations and run logs are in `.cache/native/evidence`. The standard
receipts include four-level, invoker-removal, subtree-removal and navigation
observations. Earlier failed runs remain historical evidence, not current acceptance.

## Retained limits

Linux's historical failure remains: windowless `tap open-menu` logs
`Linux does not support popover presentation`, leaves the menu hidden and fails
`tap menu-increment`. `presenter/alert.rs::alert_kind` excludes menu roles in
neutral windowless mode. A real desktop shell is needed for that acceptance.
AT-SPI separately remains unavailable (`no AT-SPI tree (LLP 1015 §7)`).

The tested stack reaches four levels; this does not prove arbitrary depth.
Navigation coverage is a retained source route with push/back and a pushed
destination that disposes the source. Interactive navigation cancellation,
multiple navigation roots, disabled/inert invoker mutation, VoiceOver speech,
physical touch/hardware keyboard, RTL/removing an active tab, GPU/canvas, Android
and Windows remain outside these results. The Wasm DOM setter was updated consistently but
has no separate Wasm consumer acceptance. Apple builds use supported
CoreGraphics/CoreImage fallbacks without a Metal toolchain.
