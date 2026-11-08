# Design guidance review

Reviewed 2026-11-04. The source reads below informed documentation changes;
this work does not itself establish visual acceptance of the component library.

## Vercel reference

[design.md](https://vercel.com/design.md) and
[design.dark.md](https://vercel.com/design.dark.md) returned byte-identical content
when fetched. Their SHA-256 was
`3af49d9dcb22463f0926d006ad67bbcefa32d5a2185f81c7754c26b5bba4020d`.
They currently describe the same report-website workflow, not separate theme
contracts. Recheck the URLs before relying on that observation later.

The useful mechanism is an explicit order of decisions: understand the reader's
job, establish evidence and its limits, choose composition, apply the existing
visual system, then inspect and revise. Priority rules resolve conflicts.
Concrete checks cover alignment, shared geometry, spacing ownership and useful
interactions. This makes the document operational rather than a list of values.

Lenso adopts that document-writing approach. Its own audience, component
contracts and approved design decisions remain the basis of its rules. Vercel's
report branding, CSS API, logos, typography, effect restrictions and theme-switch
policy do not become Lenso requirements. No Vercel assets or stylesheet were
added. The source documents were read as references, not executed as skills.

## Project changes

- `DESIGN.md` now defines decisions and conflict resolution before visual detail.
- `docs/design/component-conventions.md` retains approved form, material, focus
  and sidebar implementation decisions moved out of the main contract.
- `docs/design/apple-guidance.md` maps twelve primary HIG topics to their Web
  application, checks and platform limits.
- Existing design and component skills reach these references by task. They
  retain the source, integration and rendering workflows already in use.
- The authored design-principles page explains the consumer-facing choices.
- Migration guidance points to the current focus decision, retiring the earlier
  blue-underline treatment.

The existing AGENTS.md already directs contributors to DESIGN.md and these
skills. Its routing remains sufficient and was not expanded.

## Acceptance of the documentation change

Local-link validation checked 12 design, skill and migration documents with no
missing targets. Affected formatting and docs application/script typechecks
passed. The existing docs regression suite passed 91 tests across 18 files.
Content generation completed, and the generated contract round-tripped 218
Markdown documents, 1240 example graphs and 92 style maps.

No UI implementation, dependency, theme, publication or landing is part of this
change. Appearance and behavioral acceptance remain task-specific browser work.
