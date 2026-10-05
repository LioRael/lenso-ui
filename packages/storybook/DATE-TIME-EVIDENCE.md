# Date and time regression coverage

```sh
pnpm --filter @lenso/storybook test:browser date
```

Uses the shared production artifact to check date/time field and picker
composition, contextual supporting labels, required/invalid/disabled feedback,
keyboard segment editing, locale/model propagation, form values, popup focus,
both themes and responsive geometry. React Aria owns these contextual models.

Source inventory and snippets are not runnable coverage. Physical mobile
keyboards, browser autofill, assistive-technology sessions and complete
source pixel parity are not certified by this suite.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
