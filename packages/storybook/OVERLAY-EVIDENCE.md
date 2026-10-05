# Overlay regression coverage

```sh
pnpm --filter @lenso/storybook test:browser overlay
```

Checks Modal, AlertDialog, Drawer, Popover and Tooltip production compositions:
keyboard dismissal, focus containment/restoration, controlled policies,
custom Portal containers, transformed-host clipping, scrolling, placement,
arrow geometry, responsive geometry and both themes.

Base UI owns native dismissal: ordinary AlertDialog Escape behavior is not
normalized to upstream React Aria defaults. Explicit blocked Escape/outside
press cases are tested separately. Mobile geometry is not physical touch/swipe
or virtual-keyboard proof. The placement matrix, nested stacking contexts,
every pointer device and complete pixel/motion parity are not exhaustive.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
