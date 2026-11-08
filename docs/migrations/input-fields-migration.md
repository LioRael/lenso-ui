# Content fields and floating input shells

Input and TextArea now default to ordinary content-layer form surfaces. They
only enable backdrop sampling and refraction when `glass` is explicitly true. TextField.Input composes the
same Input implementation, with an optional clear button. Fieldset.Group owns
the shared background and outer corners; rows own separators. Interior Input,
TextArea and ordinary InputGroup surfaces are transparent.

Grouped text editing uses the native caret and selection without an input-row
focus ring. Clear buttons retain their keyboard focus indicator. Standalone
fields and floating input shells retain their existing focus outlines; invalid
fields retain their error edges. See [component conventions](../design/component-conventions.md)
for the current grouped-row keyboard cue. TextField.Group is a deprecated
compatibility entry.

InputGroup now defaults to an ordinary form surface. To retain a floating
glass input, change `<InputGroup>` to `<InputGroup glass>` and use
`InputGroup.Input` or `InputGroup.TextArea` inside it. Standalone Input and TextArea also accept `glass`; use the group composition
when the shell includes adornments. The shell owns the material and focus/error presentation. Do not
apply a second glass material to the inner control or its action buttons.

Both content fields use 17px type and a shared 26px corner radius. Single-line
content fields have a 52px height; multiline fields use a 112px minimum height
and 16px vertical padding. Grouped rows have square interior corners. Floating
single-line glass shells retain capsule geometry, while multiline shells use a
stable 26px radius. Revisit consumer overrides that assumed the old 44px Input
height, glass shadows or the old TextArea content-radius token.

The `primary` and `secondary` field variants remain ordinary fill choices.
Input and TextArea both accept `elastic`; it defaults to false and does not
enable glass. TextField.Input applies these effects to its outer shell so the
input and clear button move together.
Native values, refs, selection, events and Base UI field registration are
preserved. No GlassInput or GlassTextArea export is introduced. Tabs.glass and
the separate Button / GlassButton APIs are unchanged.

Validation evidence and visual scope are reported with the change; simulated
DOM checks do not establish browser appearance or native Apple equivalence.

```tsx
<Input glass elastic placeholder="Search" />
<TextArea glass elastic rows={4} placeholder="Write a note" />
```

Avoid glass fields inside an ordinary grouped form. InputGroup accepts `glass` and `elastic` on its outer shell. Its Input and
TextArea parts stay plain; InputGroup.TextArea does not accept a second
`glass` or `elastic` layer.

Elastic text controls use press enlargement and spring return. Native editing
owns drag selection, scrolling and textarea resizing; these gestures no longer
move or stretch the text surface at the same time. Ordinary button dragging
retains its deformation behavior.
