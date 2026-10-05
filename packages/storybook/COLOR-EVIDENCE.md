# Color regression coverage

```sh
pnpm --filter @lenso/storybook test:browser color
```

Checks ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch and
ColorSwatchPicker production compositions: contextual propagation, native
forms, keyboard input, required/invalid/disabled feedback, scoped portal
themes and both themes. React Aria owns the color models.

Source export checks are provenance, not visual proof. The suite does not
certify every color space, screen-reader workflow, browser or full pixel parity.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
