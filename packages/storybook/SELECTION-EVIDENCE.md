# Selection regression coverage

```sh
pnpm --filter @lenso/storybook test:browser selection
```

Checks Select, ComboBox, Autocomplete and ListBox production compositions:
popup ownership/focus, selection, native required FormData, asynchronous query
races/cursors, offscreen keyboard windowing, both themes and geometry.
Network data/images use genuine captured bytes, not fabricated options.

Source inventory is separate from behavior evidence. Network transport can
block these proofs. Full screen-reader, hardware touch, cross-browser and
complete source pixel-parity coverage is not claimed.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
