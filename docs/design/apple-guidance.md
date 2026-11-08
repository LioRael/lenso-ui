# Apple guidance for Lenso Web

Reviewed 2026-11-04 against Apple's published Human Interface Guidelines.
This is a scoped reading map for the component library and documentation shell,
not a reproduction of the HIG or a claim of complete platform coverage.

## Authority and platform boundaries

Use Apple's guidance for interaction intent, visual relationships and platform
context. Use [DESIGN.md](../../DESIGN.md) to resolve a Lenso design decision and
[component conventions](component-conventions.md) for the current implementation.
Use public exports and owning source for actual props, defaults and geometry.

Identify three kinds of statement in a design discussion:

- **Apple guidance:** cite the relevant HIG page and its platform scope.
- **Lenso decision:** explain the behavior or relationship the project chooses.
- **Verified behavior:** name the implementation and state actually inspected.

Apple points, system fonts, safe areas, native vibrancy and accessibility settings
belong to platform APIs. CSS pixels, browser zoom, Web fonts and media queries
need their own implementation and checks. A 44pt native target is not evidence
that every Web control must have a 44px visible rectangle. Evaluate its complete
hit area, spacing, pointer context and existing component contract.

Browser keyboard access remains a design requirement even when a touch-first
reference has no visible keyboard indicator. The grouped-row marker, standalone
outline, 26px group corners and docs' 24px guide are Lenso choices. The HIG does
not prescribe these exact values. The library's iOS 27 material reference also
does not establish native pixel equivalence or OS feature parity.

## Reading map and application

Read the rows relevant to the change before choosing a component or layout.
The application and review columns are project practices, not quoted HIG rules.

| Topic and primary source                                                                           | Guidance to retain                                                                                                            | Lenso application and review                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Layout](https://developer.apple.com/design/human-interface-guidelines/layout)                     | Align related content; reserve indentation for hierarchy; adapt to available space and text size.                             | Establish shared leading guides and baselines. Measure label, text and icon bounds. Recompose an unbalanced split; check narrow and enlarged-text layouts.                                                     |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography)             | Preserve legibility, hierarchy and accommodation of larger text.                                                              | Use the existing body/type roles. Keep equivalent labels and values consistent. Try longer labels and browser text enlargement before reducing font size.                                                      |
| [Color](https://developer.apple.com/design/human-interface-guidelines/color)                       | Keep meanings consistent across appearances; communicate through more than color alone.                                       | Reuse semantic label, surface, tint and status roles. Pair errors with associated text and invalid semantics. Measure contrast on the actual surface.                                                          |
| [Materials](https://developer.apple.com/design/human-interface-guidelines/materials)               | Choose material for its role; consider backdrop, legibility and accessibility settings.                                       | Separate grouped content from floating controls. Reuse optical profiles and test fallback rendering over real backgrounds. A second glass layer needs a distinct role.                                         |
| [Motion](https://developer.apple.com/design/human-interface-guidelines/motion)                     | Motion should provide useful feedback and remain comfortable.                                                                 | Relate transitions to state and spatial continuity. Check rapid interruption, native editing and reduced motion. Preserve useful feedback when movement is reduced.                                            |
| [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)       | Support readable content, sufficiently sized targets, keyboard access and assistive technologies.                             | Check names, reading order, focus, error association, text enlargement and target spacing. Use actual contrast measurements; record screen-reader or other checks that remain unperformed.                     |
| [Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields)           | Match text entry to the expected content; keep purpose clear; support logical focus order and context-appropriate validation. | Use Input for short text and TextArea for longer text. Retain a persistent label, suitable input type, clear action and native editing. Do not infer universal trailing text alignment from settings examples. |
| [Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data)       | Reduce unnecessary entry; offer suitable choices; support paste and useful validation.                                        | Choose a selector for a bounded set of options. Preserve incomplete input while editing; show actionable errors at a suitable time. Keep Form responsible for submission and recovery.                         |
| [Lists and tables](https://developer.apple.com/design/human-interface-guidelines/lists-and-tables) | Fit row style to content; make grouping and selection understandable; preserve readable content.                              | Use the shared group surface for settings rows. Distinguish navigation, selection and actions. Use a semantic table for comparable records and inspect headers, cells and narrow lookup.                       |
| [Sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)                 | Use concise groups and disclosure to keep hierarchy manageable; choose meaningful symbols.                                    | Align group labels, first-level text and top navigation icons. Preserve real child indentation and current-page feedback. Use the existing narrow-screen drawer and test dismissal and navigation.             |
| [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)                   | Communicate the action clearly; provide press feedback; distinguish the likely action without making every choice prominent.  | Choose ordinary or glass actions by their role. Keep peer targets coherent, labels specific and activation native. Check disabled, pressed, loading and keyboard states.                                       |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)                 | Tabs navigate sections; labels and stable availability preserve orientation.                                                  | TabBar owns app navigation; Tabs owns associated content panels. Toolbar and Button own actions. Check selected state, keyboard movement and overflow independently of animated indicators.                    |

## Use references without losing the task

Choose a native reference with the same job: a settings row, content editor,
navigation sidebar or floating toolbar. Record the platform, appearance, content
and input method. A similar silhouette is not enough to establish a match.

Compare hierarchy, alignment and surface ownership first, then shape and effects.
Match the viewport and state before comparing screenshots. When native behavior
cannot map directly to the Web, explain the intent and test the chosen Web
behavior. Native component screenshots support visual reasoning; they do not
prove accessible Web semantics, keyboard behavior or browser performance.

## Keep the map current

When a task depends on an external rule, revisit its primary page and note any
material change. Update this map only for principles used by the project. Put
approved exact values in the component conventions and update the owning source.
Link experiments as evidence with their tested scope; do not promote an old
screenshot or a passing DOM test into a universal acceptance claim.
