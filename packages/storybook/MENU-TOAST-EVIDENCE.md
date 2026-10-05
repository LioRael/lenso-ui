# Menu and toast regression coverage

```sh
pnpm --filter @lenso/storybook test:browser menu-toast
```

The runner's suite name is `menu-toast` when selecting this proof alone.
Checks menu keyboard/submenu focus, controlled state, press-and-hold
cancellation, native toast queue/update/removal, selected async workflows,
Portal/theme behavior and mobile toast geometry against the shared artifact.

Native Toast uses F6 focus navigation, not HeroUI's configurable Alt+T contract.
The proof checks F6 and Shift+Tab without a document hotkey shim. Not every
random/async branch, pending-hold disabled transition, physical touch gesture,
RTL placement or upstream pixel baseline is certified.

Sources are adapted from HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
