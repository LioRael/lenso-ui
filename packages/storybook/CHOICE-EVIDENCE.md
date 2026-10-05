# Choice control regression coverage

```sh
pnpm --filter @lenso/storybook test:browser choice rtl
```

Checks Checkbox, CheckboxGroup, RadioGroup, Switch, SwitchGroup and Slider
production compositions: native forms, individual accessible names, select-all,
controlled state, source geometry and both themes. The `rtl` suite checks
native DirectionProvider slider keyboard reversal and range-thumb geometry
through `Local/Contracts`, without another Vite application build.

Chromium behavior is not Firefox/WebKit coverage, hardware touch evidence,
screen-reader testing or complete pixel parity. Exact source colors do not
imply WCAG AA compliance.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
