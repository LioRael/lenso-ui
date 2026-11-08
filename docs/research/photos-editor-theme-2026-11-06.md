# Photos editor appearance correction

November 6, 2026. Supersedes the forced-dark-editor limitation in the earlier
[overlay record](photos-overlay-corrections-2026-11-06.md).

The editor incorrectly wrapped itself in `ThemeScope theme="dark"` and hardcoded
black workspaces, white labels and dark tool fills. Removing only the scope would
have left those colors behind. It now inherits the Photos demo's ThemeScope, and
its workspace, crop workspace, labels, tool rings, mode controls, ruler, filter
selection border and crop handles use existing semantic theme variables.

Yellow remains the photographic editing accent. Its button fill uses system
yellow, its foreground is black, and text/indicators mix the accent with the
current primary label for legibility in either appearance. The Original comparison
label retains a white-on-black photographic scrim independently of app appearance.
No shared component API, material recipe or primitives source changed.

## Verification

- Running Docs dev preview, Chromium, 420 × 800: light editor computed white
  background and black foreground; light crop workspace computed `rgb(242,242,247)`.
- While a dirty crop confirmation was open, temporarily changed the owning demo
  scope's appearance attribute from light to dark through developer tooling.
  Confirmation inherited dark, with foreground `rgb(245,245,245)`; the editor
  rendered black workspace and light controls without remounting the draft.
- Opened the editor menu, restored the owner attribute to light, and observed
  the menu inherit light with `rgb(26,26,26)` foreground. The temporary attribute
  change was fully restored; no theme override remains.
- A DOM regression changes the actual React ThemeScope prop light/dark/light
  with the confirmation open. Both editor and confirmation inherit it; after
  Escape, the selected Vivid draft remains selected and Done stays enabled.
- Photos regressions: 10 tests, 64 assertions pass. Affected typecheck, lint,
  format and interaction-boundary checks pass. DOM assertions do not establish
  browser color rendering; the computed-style observations above provide that evidence.
- Discarded the browser's temporary crop edit, reopened a clean light editor,
  restored default viewport and retained the preview. No phone was accessed.

This verifies development output in Chromium. Safari and native color/motion
equivalence are not certified. The broader worktree's previously reported React
Doctor findings remain separate from these focused acceptance checks.

Captures: [light editor](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-theme-light.png),
[dark editor](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-theme-dark.png),
[light confirmation](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-discard-light.png),
[dark confirmation](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-discard-dark.png).

## Incremental antislop gate

Direction remains the requested Photos reconstruction: ENERGY 1 / RHYTHM 1 /
MOTION 2. This gate covers the appearance correction; unchanged rules continue
under the prior scoped overlay gate.

- Hard gate PASS, R-21/R-34: forced dark mode removed; actual light/dark workspace and portalled-overlay styles inspected, and React-prop switching retains a dirty draft.
- Hard gate PASS, R-03/R-25/R-26/R-27/R-32/R-35: geometry and handlers were preserved; primary/secondary labels use the existing appearance tokens; semantic controls, errors and keyboard operation remain intact; running browser and regression evidence recorded above. This is not a whole-app contrast audit.
- Hard gate PASS, R-02/R-17/R-18/R-23/R-24/R-28/R-33/R-36/R-37/R-38: no new interface copy, assets, navigation, marketing claims or unsupported operations; changes live in authored React/StyleX source.
- Purpose gate PASS: primary/secondary backgrounds distinguish normal and crop workspaces; semantic label roles preserve hierarchy; the yellow accent identifies editing state; the Original scrim remains legible over photographic content. No decorative techniques added.
- Liveliness PASS: the photograph remains the focus, tool rhythm and input motion remain unchanged, and the existing editing accent and native visual direction remain consistent with the stated dials.
- Craftsmanship PASS, C-1..C-5 and R-05/R-11/R-15/R-16/R-20/R-29/R-30/R-31: no new layout or copy treatment; the change follows the user's requested theme behavior and existing component contracts, with scoped evidence and explicit platform limits.
