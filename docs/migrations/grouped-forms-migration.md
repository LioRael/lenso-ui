# Grouped forms and shared content surfaces

Fieldset.Group is the preferred surface for mixed form sections. Fieldset owns
the section semantics and legend. Group owns the grouped secondary background,
26px outer corners and transparent editing context. TextField and Fieldset.Row
own row layout and 0.5px separators with 16px insets. Form arranges sections with
a 24px gap and does not paint the page background.

## Consumer changes

- Replace FieldGroup with Fieldset.Group. The deprecated alias remains, but
  changes from a spaced stack to a continuous shared surface. Use a plain
  layout container with xstyle for separate standalone controls.
- Replace TextField.Group with Fieldset containing Fieldset.Group. Keep the
  accessible name on Fieldset, preferably through Fieldset.Legend. The legacy
  native fieldset remains available; avoid nesting it in another fieldset.
- TextField defaults to row layout inside a group, and stacked elsewhere.
  Use layout="stacked" for multiline editing or long instructions. Row labels
  stack when the group is at most 360px wide. Use a direct TextField.Label for
  the two-column layout; custom wrappers need their own layout.
- Use Fieldset.Row for non-text settings such as switches, choices and actions.
  Associate their labels explicitly. TextField already supplies row geometry;
  do not wrap it in Fieldset.Row.
- Ordinary Input, TextArea and InputGroup shells are transparent inside groups.
  Remove secondary props added solely to coordinate nested form backgrounds.
- Grouped rows use the current keyboard cue defined in
  [component conventions](../design/component-conventions.md): neutral fill and a
  short leading tint marker. Pointer editing retains the caret without that cue.
  This replaces the earlier focus underline and full-row outline. Auxiliary
  buttons retain individual keyboard targets. Error indicators remain separate,
  with associated error labels and descriptions.
- Accordion joins its parent form group without another background. Expanded
  panels start a separate content context for independent controls.
- List uses the grouped secondary background and 26px corners, matching default
  Surface and form groups. List.Separator is 0.5px; explicit separator composition
  remains supported.
- Accordion's surface variant uses the same background, corners and separator
  recipe. Independent FAQ typography remains unchanged.
- Default Surface supplies the shared 26px corners. It does not set child
  variants or expose SurfaceContext. Secondary remains ordinary secondary
  background; tertiary remains grouped tertiary. These are semantic roles,
  not successive prominence levels.

Use backgroundGroupedPrimary around the settings page. Keep section titles,
descriptions and actions outside Group, and field errors with their field.
Glass remains an explicit floating-control choice. No theme colors are added.

Native Base UI submission, validity, labels, refs, clearing and disabled state
remain owned by their existing components. This web composition follows iOS
grouped forms; it does not claim native pixel identity.
