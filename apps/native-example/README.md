# Lenso Native example

An Expo development-build fixture for `@lenso/ui-native`. See
[the package README](../../packages/ui-native/README.md) for setup and platform limits.

Run `bun run --filter @lenso/native-example ios` or the equivalent `android`
script from the root. Both compile the custom Expo module; Expo Go is insufficient.
The Metro configuration resolves React and React Strict DOM from this app, preserving native export conditions. RSD must share one variable registry and theme context across the application and component package; duplicate peer-resolved copies can silently lose token styles.

Try changing Switch and Slider values, then enable **Hold controlled values** and
repeat. The displayed value and the control should retain the owner value. Toggle
appearance and transparency, scroll the backdrop, and press Continue to exercise
native callbacks and material updates.
