# Exact SDK review series

Base: `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. These are local, unpublished
patches: four Host fixes and an independent compiler change. The primitive package never applies them during installation or tests.
[series.json](series.json) owns the order, direct dependencies, supported hosts
and named regressions. No Linux OS or AT-SPI acceptance is added here.

## 1. Native accessibility projection

[exact-native-accessibility.patch](exact-native-accessibility.patch) fixes
AppKit's button cell dropping authored role/pressed/selected/expanded state, tab
projection, and the agent's switch/tab normalization. This is observable native
AX behavior; the observer is not allowed to manufacture an exposed control.
It does not change Dialog lifecycle or keyboard cancellation.

Regression: controlled values, native alert commands and both Tab orientations,
plus the `base` AX scope (names, descriptions, roles, states, hidden content and
single-modal isolation). Before the fix, the corresponding native AX role/state
assertions fail. The shared agent state checks alone are insufficient.

```sh
bun run test:host-patches regress native-accessibility macos
```

## 2. Recognized iOS Escape

[exact-agent-dialog-escape.patch](exact-agent-dialog-escape.patch) routes an
unprevented, non-repeated recognized Escape key to the existing menu/sheet
cancel path. It changes agent input delivery, not UIKit hardware-key handling.
It has no source dependency on patch 1.

Regression: keyboard open/Escape, nested child cancellation followed by parent
activation, and normal close/confirm commands. Without this routing, recognized
Escape leaves the sheet open and subsequent background activation is blocked.
No AX suite is attached to this input-only patch.

```sh
bun run test:host-patches regress agent-dialog-escape ios
```

## 3. Covered modal isolation

[exact-nested-dialogs.patch](exact-nested-dialogs.patch) makes AppKit respect its
existing AX-hidden flag and gives WebKit an explicit gate on covered dialogs.
The Web setters preserve author-owned inert independently; runtime staging
includes the shared modality module. AX diagnostics honor an observed modal's
escape from inert ancestors, while retaining the `aria-hidden` diagnostic.
Patch 1 precedes it for Apple AX acceptance and shared agent-file review;
patch 2 supplies recognized Escape for the iOS regressions.

Regression: two-level Escape, close/reopen, parent activation and invoker return;
`nested` AX scope checks only the active modal is exposed. On Web the runner also
runs Chromium/WebKit browser assertions for programmatic-focus rejection,
authored inert changes and canceled openings. It excludes the later lifecycle
cases. A real Chrome AX observation is also mutated to prove the independent
`aria-hidden` diagnostic remains active. Earlier failures were a leaked AppKit
outer Dialog element and WebKit focus trapped on the covered parent.

```sh
bun run test:host-patches regress nested-dialogs web
bun run test:host-patches regress nested-dialogs macos
bun run test:host-patches regress nested-dialogs ios
```

## 4. Dialog and route lifetime

[exact-dialog-lifecycle.patch](exact-dialog-lifecycle.patch) builds on patch 3's
modality module. It retires dialogs owned by departed authored routes, validates
restoration targets, waits for UIKit dismissal completion, follows the authored
sheet parent for focus events, and fills an empty navigation focus scope.
The modal tree never becomes application-owned boolean state.

Regression: four-level unwind, removed child/page invokers, removing two active
modal surfaces together, navigation push/back and source route disposal. The
`lifecycle` AX scope checks background/retired surface isolation plus the actual
native responder. Web additionally checks `document.activeElement` in both
engines and preserves destination focus after delayed dismissal. Before the
fixes these cases exposed missing fallback, stale route ownership, restoration
before UIKit dismissal, and empty focus on returning to the page.

```sh
bun run test:host-patches regress dialog-lifecycle web
bun run test:host-patches regress dialog-lifecycle macos
bun run test:host-patches regress dialog-lifecycle ios
```

## 5. Static command, ARIA and Dialog relationships

[exact-compiler-relationships.patch](exact-compiler-relationships.patch) adds the
expanded-view graph pass in `contract-analyze`, wires it into `check_all`, and
adds a focused compiler test target. Its source diff is independent of the four
Host patches. [COMPILER.md](../COMPILER.md) lists diagnostics, positive/negative
cases and dynamic boundaries. It changes the compiler, not primitive runtime
state or platform presentation.

```sh
bun run test:host-patches regress compiler-relationships compiler
# In Exact, using its pinned toolchain:
cargo test -p contract --test relationships --no-fail-fast
```

The compiler regression command verifies the selected SDK checkpoint and then
runs the actual compiler probes, not an agent/OS test. Native Dialog behavior
still depends on the preceding Host fixes. The focused Rust target also groups
existing alert/menu, geometry and top-layer tests without duplicating them in
the large integration target. The patch also migrates existing relationship
fixtures and names the affected SDK app dialogs. Full validation additionally
corrects two pre-existing async input errors: the yielding guide example is
self-contained, and a provider fixture accepts the existing JPEG/PNG result
union. No storage API or negative type assertion is changed.

## Run and review

Run from `packages/primitives-exact`, with `EXACT_ROOT` pointing at the built SDK.
Use Exact's pinned Rust toolchain, existing Bun/native SDKs and Playwright as in
[VERIFICATION.md](../VERIFICATION.md). Select a dedicated iOS simulator using
`EXACT_SIM`. Nothing installs dependencies, changes the checkout or publishes.

```sh
export EXACT_ROOT=/absolute/path/to/exact
bun run test:host-patches check
```

The check reads pinned Git objects from that checkout, recreates changed files
under an isolated temporary Git root, then applies/checks/reverse-checks each
patch in sequence. Each checkpoint is independently checked before the next
patch. It removes the temporary directory on completion. For an archive without
Git history, set `EXACT_BASE_GIT` to a local repository containing the pinned
commit; source and object-store paths may be different.

A focused `regress` command first checks that all reconstructed files match the
SDK byte-for-byte, then extracts a Host change's named tests from the one shared Contract
suite. The compiler change runs `test:contracts` instead. It runs the same fixture and real agent, not a second test implementation.
The default checkpoint is the complete series. For a prefix review, prepare an
SDK containing exactly that prefix and set `EXACT_PATCH_THROUGH` to its last
change ID. Source dependencies and any earlier fixes needed for that host's
acceptance still apply. A focused pass on the complete series is not proof that
an isolated patch works without its declared prerequisites.

New receipts are written to `.cache/host-patches/<change>-<host>.json` only after
all selected checks pass. They include the base, checkpoint and patch hashes.
AX scopes use separate evidence names so a focused pass cannot overwrite a full
lifecycle receipt. `series.json` in that cache records applicability only; it is
not a platform acceptance result. Full acceptance remains the seventeen shared
tests plus the browser/native observations in the verification report.

Linux remains the earlier windowless menu failure and missing AT-SPI tree.
VoiceOver speech, physical hardware input, arbitrary modal depth and interactive
navigation cancellation are outside the recorded acceptance.
