# Stacked submenu title continuity

Historical first pass. The subsequent request restores semibold headings with a
continuous weight transition. See [the follow-up motion acceptance](submenu-weight-and-return-2026-11-06.md)
for the current implementation and completed rendered checks.

Status: shared implementation and automated checks complete; rendered motion acceptance pending.

## Observation and scope

The reported defect occurs when a stacked submenu settles after opening: its title appears to flash. The previous shared animation moved an inert copy of the source item, then hid that copy and revealed the actual submenu heading at rest. The copy and heading could have different glyph scaling, weight and compositing. This is a source-level explanation of a discontinuous handoff, not a measured browser before/after result.

On the connected iPhone, Photos > Sort and filter > Display Options showed a heading visually heavier than its rows. No numeric native font weight was established. The user explicitly requested no additional bold weight, so the shared heading now inherits its menu's weight. The phone was returned to the library and its control lease released; no photos were changed.

## Shared change

- `packages/ui/src/utils/interaction/submenu.ts`: animate the actual heading throughout the stacked transition. Remove the copied glyph and end-of-animation element swap. Map source geometry into the popup's local coordinates and converge to the heading's own layout. Allow the moving heading outside the content clip until rest, then restore clipping. Restore inline styles and parent interaction on teardown.
- `packages/tokens/src/components/menu/menu.styles.ts`: inherit heading weight instead of adding semibold. Keep the moving heading above the submenu body.
- `packages/ui/test/submenu-title.dom.test.tsx`: cover real-title continuity through opening, rest, interrupted closing/reopening, final closing and reduced motion. The old copy/reveal implementation fails the visible-real-title checks.

Base UI continues to own focus, dismissal and item semantics. This change applies to shared stacked submenus; cascading menus retain their existing presentation. No Photos-specific workaround or primitive source change was introduced.

## Verification

| Check                                                                                       | Result                                                                                          |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Affected formatting and lint                                                                | Passed                                                                                          |
| Interaction source boundaries                                                               | Passed                                                                                          |
| Tokens build, then UI build                                                                 | Passed                                                                                          |
| UI, testing and Docs typechecks                                                             | Passed                                                                                          |
| Focused submenu, menu/toolbar, component, toolbar group and glass container DOM regressions | 21 passed, 0 failed                                                                             |
| Existing Photos regressions                                                                 | 10 passed, 0 failed                                                                             |
| Installed package consumer exports, types, SSR and production assets                        | 1 passed, 0 failed                                                                              |
| React Doctor                                                                                | Reported repository findings including ThemeScope effect cleanup; not a clean project-wide gate |
| Post-change rendered frame trace                                                            | Blocked; not accepted                                                                           |

DOM tests use controlled geometry and animation frames. They establish element identity, opacity continuity and cleanup, not actual glyph rendering, clipping, contrast or browser layout.

The browser control service repeatedly timed out and ultimately failed initialization with `Timed out waiting for Statsig values`. An earlier working wide viewport used cascading menus, so it is not a valid baseline for this stacked-title defect. No valid post-change frame trace or screenshot was obtained. A temporary viewport override on an agent-created browser tab could not be cleared after the connection failed. The user tab was preserved.

Remaining rendered acceptance: stacked layouts in light/dark, English/Chinese, normal/reduced motion, rapid open/close/reopen, nested return, keyboard focus and sampled final-frame geometry. Do not treat the automated checks as proof that the visible flash is gone.

## Scoped antislop gate

The existing Apple Photos direction is retained. The purpose of motion is to preserve the relationship between a parent item and its child panel; no decorative motion, copy or assets were added.

| Gate                                                                                              | Evidence/status                                                                                                     |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Hard gate: source implementation and real behavior (R-26, R-33)                                   | PASS: shared source edit; existing native Menu ownership retained and focused regressions pass                      |
| Hard gate: rendered resilience, themes, keyboard and click-through (R-03, R-25, R-32, R-34, R-35) | Pending: browser service unavailable; no visual PASS claimed                                                        |
| Purpose gate                                                                                      | PASS for this change: remove title replacement to preserve continuity; no new surface, icon, color, asset or copy   |
| Liveliness                                                                                        | Existing direction retained; no page composition or motion-intensity redesign. Rendered consistency remains pending |
| Craftsmanship and quality locks                                                                   | Source/behavior checks passed; rendered C-4 resilience and C-5 evidence boundary remain explicitly open             |

This is an implementation record with pending visual acceptance, not a completed visual delivery gate.
