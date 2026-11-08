# Toolbar menu source and press arbitration

November 6, 2026. Scope: shared Menu/Toolbar composition and the Photos header's
Filter and selection More menus. Native reference: iPhone 15 Pro Max, iOS 27.2,
light appearance. Browser receipt: Chromium Docs dev preview, 589 × 795.

## Component boundary

Toolbar already owns joined glass geometry and elastic presentation. It now marks
each owning glass surface internally. Menu resolves the nearest owning surface
when morphing, using it for source geometry, popup anchoring and temporary masking.
The actual trigger remains separate and owns native activation and focus. A joined
group therefore morphs as a whole from either entry. Detached members retain
individual sources. `morphTrigger={false}` keeps its anchored behavior.

This adds no public component or prop and no Photos-specific animation controller.
The Photos menus remove their hardcoded offsets and use Menu's normal placement.
The composition is documented in Toolbar's API note and component conventions.

Native Photos was inspected with selection active: Filter and More both replace
the same complete joined capsule, while Cancel remains separate. No native menu
action was selected. A sample was temporarily selected to enable More. The phone
changed applications during attempted navigation cleanup, so further actions
stopped and the owner lease was released; restoration of selection was not verified.
No photo was edited, saved, copied, hidden or deleted on the phone.

## Activation and disabled feedback

Base UI normally opens Menu on mousedown. Lenso now prevents that early pointer
handler, retaining native click activation on release. A native gesture observer
tracks the pointer and suppresses the trailing click after at least 8px of travel,
even if it returns to its starting point. Pointer cancellation, blur and cleanup
remove the observer. Keyboard and assistive clicks remain available. Eight pixels
is a chosen Web threshold, not a measured iOS constant.

Toolbar's shared press surface no longer rejects input merely because a member
is disabled. The member remains disabled through Base UI: it cannot activate or
open a menu. Pending/loading controls and explicit elastic opt-outs keep their
feedback restrictions. This correction is for disabled members of an enabled
shared toolbar; it does not change every disabled GlassButton's behavior.

## Overlapping closing menus

Rapidly closing one menu and opening another exposed a source-ownership bug.
The first menu's cleanup restored `opacity` on their shared group after the new
menu had hidden it. The computed source opacity became 1 even though the new
menu's presentation variable was 0.

The shared presentation controller now gives each source mask an owner. Only its
current owner may update or restore source visibility. The final owner restores
the original inline opacity, including a caller's non-default value. This also
protects the existing Select presentation path without changing its activation.

## Evidence

| Check                               | Observed result                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actual mouse press held down        | Filter remained collapsed before release                                                                                                           |
| Drag 50px and return before release | Filter remained collapsed during movement and after release                                                                                        |
| Disabled More held down             | `aria-disabled=true`, `aria-expanded=false`, shared `data-lenso-pressed=true`; scale observed at 1.0492258 on both axes                            |
| Joined Filter source                | Group width 88px; first recorded shell scale approximately .3585 × .0920 for the 250px menu, rather than a single 44px button                      |
| Popup alignment                     | Filter and More popup right edge = source group right edge = 519px; Filter top 30.5px vs group top 30.695px                                        |
| Source hiding                       | Whole group opacity 0 while either menu is open; both member controls disappear together                                                           |
| Rapid cross-menu opening            | Before fix, 43 late samples showed source opacity 1 with Filter open; after fix, zero late samples showed source visibility leakage with More open |
| Final close                         | Popup absent, computed group opacity 1 and original inline opacity restored to empty; selection cancelled back to Library                          |
| Focus/input                         | Enter opens either enabled trigger; Escape closes and restores trigger focus; disabled More does not open                                          |

Frame observations establish presentation state, not FPS or Apple's exact timing.
Native screenshots and demo use different photos; there is no pixel-equivalence
claim. Browser touch dispatch and Safari were not qualified in this iteration.
No browser viewport override or persistent page instrumentation was introduced.

Automated checks:

- 19 component DOM regressions pass across general components, toolbar groups,
  glass containers and three new menu/toolbar regressions. The new tests catch
  early opening/returned-endpoint drags, disabled feedback losing its disabled
  semantics, and an old menu unmasking another menu's shared source. DOM tests
  do not establish rendering; browser evidence above covers that boundary.
- 10 Photos regressions pass, 64 assertions.
- UI, testing and Docs typechecks, affected lint/format and interaction-boundary
  checks pass. An initial Docs check overlapped an artifact rebuild and resolved
  JavaScript before declarations existed; after the build completed, the rerun
  passed. That transient output is not treated as source acceptance.
- UI production package build and isolated installed-consumer verification pass,
  covering package exports, types, SSR and production assets. A full production
  Docs build, Safari gate, CI, merge and publication were not performed.
- React Doctor remains 64/100 on the broader dirty tree, with the previously
  reported ThemeScope cleanup error and composition warnings. It is not a clean
  repository qualification.

Artifacts:

- [Filter using the group boundary](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-toolbar-group-filter.png)
- [More using the same boundary](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-toolbar-group-more.png)
- [Opening, switching and closing samples](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-toolbar-morph-evidence.json)

## Scoped antislop gate

Direction: the user-requested native Photos reconstruction, ENERGY 1 / RHYTHM 1 /
MOTION 2. This gate covers shared-source motion and activation; unchanged visual,
copy and theme rules continue under the earlier Photos gates.

- Hard gate PASS, R-03/R-26/R-32/R-35: at the reported viewport, popup placement aligns with the owning group; held/drag/disabled/keyboard states were exercised; no new action or navigation was invented; running browser and test receipts are above.
- Hard gate PASS, R-02/R-17/R-18/R-23/R-24/R-25/R-27/R-28/R-33/R-34/R-36/R-37/R-38: no new UI copy, assets, color treatment, links or claims; source-only changes retain semantic theme/material, error states and native control contracts. This does not requalify every existing page or all platform contrast states.
- Purpose gate PASS: the existing joined glass geometry supplies the menu source; motion explains which group expanded; disabled press feedback expresses physical continuity without enabling the action. No decorative surface or separate demo animation was added.
- Liveliness PASS: the photograph remains the focal point; the existing tool rhythm and accent are retained; input-driven expansion and spring return follow the stated motion dial.
- Craftsmanship PASS, C-1..C-5 and consistency locks: shared ownership is fixed once in Menu/Toolbar; ordinary controls and detached sources retain their boundaries; no template treatment or marketing content added. Limits and measured receipts remain explicit.
