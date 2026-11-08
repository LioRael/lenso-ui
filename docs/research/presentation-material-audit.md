# Presentation material audit

Date: 2026-11-08

## Evidence and selection

The canonical [material map](../design/presentation-materials.md) records the
current reference IDs and separates native evidence from Lenso mappings. The
local `lenso-apple-ios-ipados27-source-20261027.fig` archive was decoded read-only.

Alert example `13159:44659`, ActionSheet examples `12740:35185` / `12740:37603`
and medium Sheet `12887:15603` resolve to Glass Effect `10411:18582` (GLASS,
radius 16, refraction intensity about .7, refraction radius 30). Popover
`61:65422` uses Thick master `510:79108` for both body and arrow. Sheet - iPad
`5719:30145` has an opaque fill; iPhone Activity View `13112:5166` also has an
opaque body. These facts support distinct material families rather than a rule
that every overlay, content panel or modal interaction uses the same surface.

Modal and side Drawer remain explicit Lenso content-frame mappings. Tooltip is
a Web extension of the anchored/frosted role; this file contains no Tooltip
master. Existing Menu material calibration is retained. Desktop ShareSheet's
unanchored layout does not reproduce the native iPad Activity View's Popover;
that presentation gap is recorded rather than hidden by a material-only change.

## Implementation

Existing recipes are selected in one internal presentation-role map. Compact
AlertDialog/ActionSheet/Menu panels share Medium Glass. The partially presented
Sheet uses that same existing recipe; Sheet state and responsive CSS continue
owning the transition to solid content. Glass tint preferences apply to Glass
recipes; they do not convert solid or Thick surfaces into Liquid Glass.

The concrete remaining anchored mismatch was Tooltip: its body was painted
outside the popup while its default arrow used a separate clipped material.
Popover's corrected local silhouette is now an internal AnchoredMaterial shared
by both families. It samples one backdrop for body and arrow, retains each
family's curve, normalizes native placement/rotation into local coordinates and
follows the popup during zoom and resize. Custom arrow content stays caller-owned.
The helper is internal, not another public component or a new material prop.

Toast retains Small Glass for its ordinary glass variant and Medium Glass for
pill; Notification retains Clear Glass. Those choices now use the same selector
map. Stale documentation calling ordinary glass Toast Clear has been corrected.

The earlier blanket statement that content panels are solid has been replaced
with a reference/state map. Documentation pages show the same selection table
and distinguish panel material from the backdrop and from separate navigation
controls on a solid frame.

## Verification and limits

`bun run --filter @lenso/ui-docs test:anchored-material` covers both families, both appearances, four physical
sides and CSS zoom 100%, 125%, 150%, 200%, then 100%. A controlled Tooltip keeps
geometry mounted when zoom moves its trigger; native Escape still dismisses it.
Popover additionally checks focus return, and its Chromium pixel check verifies
body/arrow color continuity and blur over colored stripes. Both families exercise
increased-contrast opaque fallback. Geometry checks suppress full-document development reloads in their own browser
page so concurrent workspace edits cannot replace the fixture midway through a
measurement. Normal style updates remain enabled; these checks do not claim HMR
acceptance. Existing Tooltip DOM coverage also verifies
custom arrows, content and native dismissal.

The panel browser check covers Chromium/WebKit at 1440, 390 and 320px in both
appearances, plus RTL, scrolling, touch dismissal in Chromium, native alertdialog
semantics, full-screen overrides and Sheet composition. Its Sheet case now also
verifies partial mobile Glass, solid desktop presentation and solid expanded
mobile presentation. Documentation projection tests pass nine cases. Token/UI
builds and UI/docs/styles typechecks pass after refreshing package declarations.
The current whole-package installed-consumer check fails on root/subpath export
identity for SwipeActions; this pass does not modify SwipeActions. An earlier
InputOTP declaration mismatch came from separate workspace edits; its source
was not changed in this pass.

Automated WebKit does not paint native backdrop blur even in an unmasked native
control case, so its geometry/semantics coverage is separate from Chromium pixel
coverage. Browser toolbar zoom, real Safari/iOS, OS virtual keyboards, exact
Figma pixel parity and deployment/landing were not validated. The changed-scope
React Doctor scan reports existing broad diagnostics and is not a clean-project
or baseline-regression claim.
