# Action regression coverage

```sh
pnpm --filter @lenso/storybook test:browser actions
```

Checks production Button, ButtonGroup, CloseButton, ToggleButton,
ToggleButtonGroup and Toolbar compositions: keyboard/roving focus,
loading activation, disabled overrides, independent controlled selection,
render composition and source geometry in both themes.

Source export matching is not live behavior proof. Chromium coverage does not
establish every RTL keyboard policy, physical touch interaction, screen-reader
output, upstream animation curve or complete pixel parity.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
