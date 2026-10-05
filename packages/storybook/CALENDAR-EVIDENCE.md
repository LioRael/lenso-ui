# Calendar regression coverage

```sh
pnpm --filter @lenso/storybook test:browser calendar
```

Checks Calendar and RangeCalendar production stories, native date selection,
locale/week conventions, constrained dates, keyboard navigation, multi-month
overflow, both themes and responsive geometry. Stories and package models use
the normal workspace dependency graph, not scratch-linked model copies.

Rendered source comparison, every locale/calendar system, device touch input,
screen-reader behavior and complete pixel parity are outside this proof.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
