# Unmodified Exact baseline

Recorded 2026-11-11 against **unmodified** Expo Exact
`956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. No local compiler or Host patch is a
package dependency. The package's distributable files exclude `patches/`.
The old modified-SDK results are repository-only historical research in
`VERIFICATION-PATCHED.md`; its 17/17 platform results and full SDK/semantic
runs do not establish this baseline.

## Provenance and scope

The SDK source snapshot is separate from the research checkout. Every present
tracked SDK file is compared with the original Git blob before and after the
run; unexpected Swift/analyzer source additions are also rejected. The current
snapshot verifies 7,849 original files. It is partially hydrated (7,151 tracked
files absent), so this is a primitive consumer baseline, not a complete Exact
workspace/all-features acceptance. Missing sources needed by a build would fail
that build. Original archive symlinks were restored from pinned Git data.

The stock and research SDKs also use separate build directories. An inherited
shared `target` symlink was discovered and separated before final validation;
the collector records the compiler hash and resolved artifact directory. The
modified-source rejection guard was exercised independently. No patches are
applied during the build or tests; no application-side Host workaround is added.

Tests use Rust 1.97.0, Bun 1.4.4 and Playwright 1.64.1 with its already installed
engines. Exact's setup reports Bun 1.4.2 as its pinned version; that tool-version
difference is retained as an environment qualification. Browser test setup must
select matching Playwright/browser versions with `PLAYWRIGHT_MODULE` when the
docs workspace has been upgraded. A missing browser executable is an
infrastructure failure, not a primitive result. Apple builds use the existing
CoreGraphics/CoreImage fallbacks without a Metal toolchain.

## Observed compatibility

Eight named core agent scenarios cover fields, controlled controls/remounting,
disclosure/accordion, both Tabs orientations, explicit Dialog/alert commands,
popover/menu commands and Tooltip timing/cleanup. The original seventeen-test
fixture is retained unchanged; the full run additionally exercises nine
experimental scenarios. Core selection does not erase or xfail those assertions.

| Surface                                      | Core agent          | Complete agent fixture | Independent checks                                               |
| -------------------------------------------- | ------------------- | ---------------------- | ---------------------------------------------------------------- |
| Exact Chrome agent                           | 8/8                 | 13/17                  | Core browser and base CDP AX pass; full focus/AX scope has gaps  |
| Exact WebKit agent                           | 8/8                 | 13/17                  | Core browser passes; covered-parent focus rejection fails        |
| macOS 27.2 / AppKit                          | 8/8                 | 15/17                  | Switch/Tab AX contract and covered-parent modal isolation fail   |
| iOS 27.2 / dedicated iPhone 17 Pro Simulator | 8/8                 | 11/17                  | Base UIKit AX passes; lifecycle AX fails after recognized Escape |
| Linux host on macOS                          | Historical 6/7 only | Not rerun              | No Tooltip/nested Dialog acceptance inferred                     |
| Linux desktop / AT-SPI                       | Not run             | Not run                | Existing environment and upstream AX gaps retained               |

Chromium 156.0.8078.4 and WebKit 27.2 core browser checks use real keyboard
input, field editing/selection, roles/names/ID relationships, inactive-panel
focus rejection, Tooltip timing/placement/activation, single-modal containment
and return, disabled close controls and native menu operation. This is browser
coverage, not a DOM simulation or physical input/screen-reader speech claim.

The strict browser and native AX probes inspect semantics and actual focus,
not a required implementation of the earlier patches. A covered Dialog need
not expose an explicit DOM `inert` attribute if the native modal mechanism
already prevents focus and removes covered controls from AX. Two old assertions
that required that implementation detail were replaced by the retained focus
and native-AX isolation checks. Authored `inert` values still must be
preserved. Every original agent assertion remains unchanged.

## Complete experimental scenario matrix

These are the same nine additional agent scenarios on every surface. A pass in
this state/event matrix does not replace the independent browser/AX checks.

| Additional scenario                   | Chrome | WebKit | AppKit | UIKit |
| ------------------------------------- | ------ | ------ | ------ | ----- |
| Combined keyboard and Dialog Escape   | Pass   | Pass   | Pass   | Fail  |
| Nested Escape and parent activation   | Pass   | Pass   | Pass   | Fail  |
| Nested close/reopen and parent Escape | Pass   | Pass   | Pass   | Fail  |
| Four-level focus notification/unwind  | Pass   | Pass   | Pass   | Fail  |
| Removed child invoker fallback        | Fail   | Fail   | Pass   | Fail  |
| Removed page invoker fallback         | Fail   | Fail   | Fail   | Pass  |
| Active modal subtree removal          | Fail   | Fail   | Pass   | Pass  |
| Push with retained source route       | Fail   | Fail   | Fail   | Fail  |
| Push that disposes the source route   | Pass   | Pass   | Pass   | Pass  |

## Affected and experimental behavior

- **Missing invokers:** removing a child or page Dialog trigger does not satisfy
  the focus fallback assertions in either Web agent.
- **Active subtree removal:** removing the two deepest surfaces does not restore
  the surviving invoker in either Web agent.
- **Navigation:** pushing away from a retained source route leaves stale modal
  ownership/focus in either Web agent. The source-disposal case happens to pass;
  it is still kept in the experimental lifecycle family.
- **Covered-modal isolation:** WebKit permits programmatic focus in the covered
  parent. Agent state tests alone do not detect that failure. Chromium's native
  isolation must not be called broken merely because an explicit `inert` flag
  is absent; its remaining strict browser/AX lifecycle results are recorded by
  the collector.
- **Native roles/state, modal AX and recognized Escape:** AppKit projection and
  iOS agent-delivered Dialog Escape remain independent Host responsibilities.
  AppKit reports the Switch and Tabs as buttons in the initial native snapshot;
  its separate modal probe exposes the covered outer Dialog. iOS does not
  dismiss a Dialog from the agent-recognized Escape path; subsequent background
  activation remains blocked. Hardware-key Escape and VoiceOver speech are not
  inferred from that agent result.
- **Compiler relationships:** stock Exact accepts missing/empty Dialog names,
  missing command/ARIA targets, wrong target kinds and disjoint target branches.
  Combined invocations and dynamic lifetimes remain unproved.

The stock AppKit complete agent run fails the removed-page-invoker and retained
source-route navigation scenarios. Its base AX probe fails `notifications`
(`button` instead of `switch`). The raw native object has role `AXButton` and
subrole `AXSwitch`; this is a common-role/normalization contract gap, not a
claim about spoken output. Both Tabs are also reported as buttons without
selected state; the initially selected Profile tab has native value `0`. The independently scoped modal AX probe
reports `edit-dialog` outside the active child modal. Those are separate from
the passing core state tests.

UIKit passes base AX and single-modal checks. Its independent lifecycle AX
probe reaches four levels, then cannot expose `third-fallback` after agent Escape
because the expected child dismissal did not occur. The complete agent run also
fails focus notifications/restoration during multi-level unwind, removed-child
fallback and retained-source navigation. State-based focus observations and
native current-responder/AX observations are reported separately; neither proves
spoken reading order or hardware keyboard behavior.

The package can supply names, roles, IDs, commands and pure controlled behavior.
It cannot repair a system accessibility projection, native input dispatcher,
modal focus stack or departing route. Those capabilities need an upstream Exact
implementation or a future public API. No particular local patch is prescribed
as the supported solution.

## Compiler baseline

All 26 probes match expected upstream outcomes: seven accepted compositions,
five existing type/lowering refusals, thirteen accepted gaps and one runtime
obligation. The disjoint-branch fixture now uses a valid `column` root so an
unrelated root-region error cannot be counted as relationship checking.
See [COMPILER.md](COMPILER.md) for details. Correct composition still requires
application-owned nonempty names, valid IDs and compatible mounted lifetimes.

## Reproduce and inspect

Use an initialized stock SDK and its platform dependencies. Normal commands
never patch it. The baseline collector writes all phase logs, source proof and
`results.json` under `.cache/upstream/baseline/<requested-hosts>/`. It runs every
phase, records strict failures and returns nonzero if any phase fails. A result
marked `observed` is a completed baseline, not an all-green acceptance receipt.

```sh
EXACT_ROOT=/absolute/path/to/stock-exact bun run test:contracts
EXACT_ROOT=/absolute/path/to/stock-exact bun run test:baseline web
EXACT_ROOT=/absolute/path/to/stock-exact EXACT_SIM=<dedicated-udid> bun run test:baseline macos ios
EXACT_ROOT=/absolute/path/to/stock-exact EXACT_AGENT_SCOPE=all bun run test:agent
EXACT_ROOT=/absolute/path/to/stock-exact bun run test:browser:experimental
```

For a source archive, `EXACT_BASE_GIT` names the local object store containing
the pinned commit. `EXACT_PRIMITIVES_CACHE` isolates another run's artifacts.
Apple agent/AX runs select platform chrome. A dedicated simulator enables
accessibility observation before launch:

```sh
xcrun simctl spawn <dedicated-udid> defaults write com.apple.Accessibility ApplicationAccessibilityEnabled -bool true
```

## Retained limits

Linux retains the earlier windowless menu failure (`Linux does not support
popover presentation`) and missing AT-SPI tree. No Linux OS validation, Docker
repair or Linux menu workaround was attempted. Physical devices, VoiceOver
speech, arbitrary modal depth, interactive navigation cancellation, multiple
navigation roots, RTL/active-tab removal, GPU/canvas, Android, Windows and the
separate Wasm consumer remain outside this acceptance.
