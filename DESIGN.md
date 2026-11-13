# Lenso UI design

Lenso UI helps people read, choose and edit with familiar controls. Its visual
language follows Apple-inspired grouped content, semantic color and purposeful
materials, with native Web interaction. Quality should be visible in clear
relationships, predictable behavior and careful alignment.

This file is the design decision contract. Read the relevant
[component conventions](docs/design/component-conventions.md) for implementation
details and [Apple guidance](docs/design/apple-guidance.md) for source principles
and platform boundaries. Current source and public exports establish what exists;
this document establishes what a change should achieve.

## Resolve competing requirements

Protect these in order:

1. The user's intended task, real content and explicit constraints.
2. Usability: native editing, accessible semantics, readable content and
   keyboard operation.
3. Information hierarchy: what matters now, what belongs together and what
   remains available on demand.
4. Shared component contracts, semantic tokens and material ownership.
5. Visual refinement: alignment, rhythm, optical balance and motion.

When a rule conflicts with a task, resolve the specific conflict in context.
Identify a new convention as a Lenso decision and record its reason. A prettier
state that loses input, obscures an error or breaks navigation is unfinished.

## Establish the task before the layout

Read the existing screen and its real content. Identify who uses it, their
primary task, the next action and the information they need to act confidently.
For a small correction, use the established direction and fix the owning rule.
For a new page or a substantial redesign, compare two structural arrangements
when the content supports a real choice, then select the clearer one.

The first useful view should expose the work: an example to try, settings to
edit, a collection to browse or a comparison to understand. Keep supporting
explanation close enough to help, and let detailed API/reference material follow
the primary task. Use actual labels and realistic content lengths while composing.

## Make relationships visible

Establish shared leading edges and text baselines before tuning individual
margins. Related labels, items and icons use a deliberate alignment guide;
indentation represents a real child relationship. Measure their rendered bounds
when alignment is the issue. Correct the parent grid, inherited padding or icon
slot that owns the mismatch.

Give each gap one owner. Space within a field or section is smaller than space
between independent groups. Equal peers share tracks, type roles and alignment.
When one column is mostly empty and another becomes long, rebalance or stack the
layout. Readable text and usable controls take precedence over preserving columns.

Use typography and spacing to establish hierarchy. Choose readable text roles,
consistent peer weights and sufficient measure for translated labels. Reflow for
larger text and narrow widths. Keep precise tables useful for lookup: align
headers with their cells, align comparable numeric values and show units.

## Assign each surface a job

Distinguish page background, grouped content, editing controls and floating
navigation. Choose their semantic roles before their appearance. A group owns
its background and outer corners; its rows and inner controls compose within
that surface. Add another container only when it establishes a separate task,
interaction or content boundary.

Content fields use the ordinary form surface. Glass belongs to controls or
navigation whose floating role needs that separation. Reuse the existing
material recipe; evaluate legibility over the actual backdrop. Shared geometry
or a shared group does not automatically imply one continuous optical surface.

Color indicates interaction, hierarchy or status. Use semantic roles in both
appearances. Preserve the meaning of invalid, selected, pressed and focused
states independently. Keep error text associated with its field and readable
when the field is focused.

## Preserve familiar interaction

Use the component's public parts and native UI SDK contracts. Date, time and
color families retain their native value models. Preserve labels, refs, native
props, event ownership and focus restoration. A composition is complete when
its controls work with the expected input methods.

Text editing keeps the caret, selection, paste, scrolling and resizing. Pointer
editing stays visually quiet. Keyboard navigation keeps a visible location cue;
its exact grouped and standalone treatments live in the component conventions.
Focus, hover and selection serve different purposes.

Keep transitions tied to a state change, spatial relationship or direct
manipulation. Editing remains stationary by default. Reduced motion retains a
complete interaction. A smaller effect is useful only if feedback remains clear.

## Review the rendered result

Inspect in this order and repair the highest-impact shared defect first:

1. **Task:** the primary content or action is immediately useful.
2. **Structure:** groups, reading order and responsive arrangement fit the content.
3. **Alignment:** edges, baselines, icon slots and peer tracks agree.
4. **Hierarchy:** type, spacing, semantic color and materials clarify priorities.
5. **Interaction:** labels, editing, keyboard navigation, overlays and error
   recovery work without conflicting indicators.
6. **Adaptation:** the affected light/dark, narrow/desktop, larger-text and
   reduced-motion states retain meaning and usability.

Run the affected checks defined in [CONTRIBUTING.md](CONTRIBUTING.md). Render
representative states in the actual application; DOM tests do not establish
layout. Use matching captures for reference comparisons. Report the changed
behavior, checks performed and material gaps; distinguish source review, browser
observation and production acceptance.

Fix the owning shared rule when several components exhibit the same defect.
Keep evidence proportional to the change. Readable screenshots and measured
geometry support a review; a checklist alone does not establish visual quality.

## Maintain the contract

Keep exact component rules in one [reference](docs/design/component-conventions.md).
Keep external sources and their Web interpretation in the
[guidance map](docs/design/apple-guidance.md). Update both the owning source and
its convention when an approved decision changes. Mark old experiment reports
as historical when they disagree with the current contract.

Lenso implements a Web interpretation, not a native Apple rendering guarantee.
Preserve copyright and license notices for retained adaptations; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
