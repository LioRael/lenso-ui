# Form workflow regression coverage

```sh
pnpm --filter @lenso/storybook test:browser form
```

Covers live SearchField, NumberField and InputOTP source compositions: clipboard
paste/truncation, native FormData, errors, loading/reset, localized parsing,
refs, keyboard bounds, disabled controls, mobile geometry and reduced motion.
Form and invalid-outline contracts run as `Local/Contracts` stories in the same
production artifact, not separately built applications.

The proof records invalid SearchField/NumberField outline discrepancies
separately from native workflow assertions. Do not interpret recorded gaps as
passing visual parity. Resend/backup-code reference links have no backend
workflow. Cross-browser autofill, RTL and complete pixel parity are not proved.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
