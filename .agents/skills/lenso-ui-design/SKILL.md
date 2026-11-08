---
name: lenso-ui-design
description: Design or visually review Lenso UI pages, including responsive layout, reference reconstruction and rendered comparison.
---

# Design with Lenso UI

1. Read the project's `DESIGN.md` and inspect the existing surface. Establish
   the audience, primary task, content, visual direction and relevant states.
   For Apple-inspired layout, typography, color, material, motion, forms or
   navigation, read the matching topics in
   `docs/design/apple-guidance.md` in the Lenso UI checkout. Identify which
   decisions come from Apple, which are Lenso conventions and which are verified.
   When a reference is supplied, use [reference.md](references/reference.md).
2. Choose the page's hierarchy, layout, typography, semantic colors, material
   roles and responsive behavior. Establish shared alignment guides and assign
   each gap and surface an owner. For a substantial redesign, compare viable
   structural arrangements before choosing component variants. Resolve actual
   component contracts through
   the sibling [Lenso UI skill](../lenso-ui/SKILL.md); avoid inventing a second
   token system. For grouped forms, focus, materials and docs navigation, read
   `docs/design/component-conventions.md` in the Lenso UI checkout.
   If work is delegated, use [handoff.md](references/handoff.md).
3. Implement a representative slice with real content and a working primary
   interaction. Render it in the actual application and adjust before expanding.
4. Review appearance and behavior separately using [review.md](references/review.md).
   Repair the highest-impact shared defect and render again. Finish when the
   intended task works and no known material defect remains in the reviewed scope.
   Report viewports, states, comparison evidence and any remaining gaps.
