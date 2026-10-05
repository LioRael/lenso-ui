# Navigation regression coverage

```sh
pnpm --filter @lenso/storybook test:browser navigation
```

Consumes the shared production Storybook artifact. Covers accordion/disclosure
state, roving focus, anchor semantics, controlled pagination, overflow scrolling,
measured tab indicators, responsive geometry and both themes.
`Local/Contracts/Navigation` additionally checks refs, render composition,
state-dependent styles, dynamic StyleX and manual RTL tab activation.

Known limitation: a styled Button rendered by Disclosure.Trigger can replace
the parent dynamic width class. The proof reports this discrepancy rather than
claiming the composed width passes. The direct native trigger must still compute
280px and preserve its style callback. This is not full upstream pixel parity.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
