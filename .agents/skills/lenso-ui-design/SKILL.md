---
name: lenso-ui-design
description: Design Lenso UI pages, reconstruct a visual reference, or revise unsatisfactory appearance using a shared visual specification, bounded agent handoffs and rendered comparison.
---

# Design Lenso UI pages

Use the sibling [Lenso UI workflow](../lenso-ui/SKILL.md) for version and component
contracts. This workflow owns visual decisions and their evidence, not another
component catalog or theme engine.

This is a first-party Lenso extension, not an upstream HeroUI aesthetic skill.
It is distributed under the accompanying [MIT license](LICENSE.txt).

## 1. Establish the visual target

Read the project's design authority and inspect the current rendered screen.
For a source-faithful task, capture the actual reference at the intended viewport
and state, and identify its source revision. Separate available source from
remote/commercial demos; component documentation does not supply their design.
Read [reference.md](references/reference.md) for the evidence boundary.

For an original page, settle its subject, audience, primary operation and visual
direction with the user. Use an existing approved sibling screen when possible.
If the reference or direction is missing, request that specific input or label
the result an exploratory draft; do not call it source parity.

**Complete when:** the target, reference availability, viewport and important
states are explicit and the agent can explain the intended reading order.

## 2. Specify before distributing work

Record the screen's frame/sidebar/content widths, spacing groups, typography
hierarchy, surfaces, semantic color roles, radius roles and key states. Describe
how content changes at narrow widths. Use queried Lenso parts and theme variables
for implementation; design observations are not new global tokens.

For multiple pages, choose one design owner and one shared specification.
Implement one representative screen and inspect it before extending the pattern.
Read [handoff.md](references/handoff.md) before delegating presentation.

**Complete when:** layout and visual choices are settled enough that another
agent can implement without independently inventing a different design.

## 3. Implement a vertical visual slice

Build the representative frame with meaningful content and its primary
interaction. Render it through the real application CSS pipeline. Inspect its
screenshot at the agreed viewport before expanding the feature list or handing
off sibling pages.

Keep a reference's hierarchy and density when replacing source components with
native Lenso parts. Keep demonstration data/actions explicitly local when there
is no backend. Decorative assets, motion and extra controls need a purpose;
use actual design evidence rather than generic filler.

When revising a design the user rejected, or proposing a different direction,
show the representative rendering and obtain the user's approval before
expanding the design to sibling pages.

**Complete when:** the representative screen is visually reviewed against the
target, discrepancies are resolved or explicitly accepted, and its primary
interaction works.

## 4. Compare and deliver

Follow [review.md](references/review.md). Validate behavior and appearance as
separate axes. A successful build, empty lint report or functional browser suite
does not approve spacing, density, typography or composition.

**Complete when:** all affected pages and important states have current rendered
evidence, visual differences are addressed, and the report distinguishes passing
checks, visual decisions, known limitations and unavailable evidence.
