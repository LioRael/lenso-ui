# Lenso Native example

An Expo development-build fixture for `@lenso/ui-native`. See
[the package README](../../packages/ui-native/README.md) for setup and platform limits.

Run `bun run --filter @lenso/native-example ios` or the equivalent `android`
script from the root. Both compile the custom Expo module; Expo Go is insufficient.
The Metro configuration resolves React and React Strict DOM from this app, preserving native export conditions. RSD must share one variable registry and theme context across the application and component package; duplicate peer-resolved copies can silently lose token styles.

Keep this example's React 19.3.0 and TypeScript 6.0.3 pins separate from the Web
workspace catalog. They preserve the Expo 58 stack used for native acceptance.
Rebuild the iOS development host when changing the native module; Metro reload is
only sufficient for JavaScript changes.

See the [native delivery record](../../docs/research/native-source-delivery-2026-11-10.md)
for full-build receipts, retained simulator screenshots and acceptance limits.

The [foundation delivery report](../../docs/research/native-foundation-2026-11-10.md)
records this catalog's build and interaction evidence. Rebuild both native hosts
for the added SafeArea module and iOS control registrations.

**Open native catalog** exercises the expanded button/input/selection and system
control adapters. Use **Hold values** to reject controlled proposals, **Disable
groups** to verify inherited group disablement, and the appearance/loading actions
to exercise those states. The full migration inventory is in
`docs/design/native-component-coverage.json`; this screen does not represent the
unfinished navigation, overlay, collection, date/time or color families.

Try changing Switch and Slider values, then enable **Hold controlled values** and
repeat. The displayed value and the control should retain the owner value. Toggle
appearance and transparency, scroll the backdrop, and press Continue to exercise
native callbacks and material updates.
