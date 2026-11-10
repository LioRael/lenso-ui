# Expo native example setup — 2026-11-10

## Version decision

Use the stable Expo SDK 58 stack, with explicit app dependencies rather than the
workspace React catalog:

| Package                                  | Pin       |
| ---------------------------------------- | --------- |
| `expo`                                   | `58.0.23` |
| `react` / `react-dom`                    | `19.3.0`  |
| `react-native`                           | `0.88.1`  |
| `react-strict-dom`                       | `0.0.55`  |
| `babel-preset-expo`                      | `58.0.24` |
| `@expo/metro-runtime`                    | `58.0.17` |
| `expo-modules-core` (native module peer) | `58.0.30` |

The published `expo-template-blank@58.0.32` dependencies establish the first three
pins; `expo@58.0.23` establishes the Babel preset and modules-core versions.
`react-strict-dom@0.0.55` accepts React `^19.0.0` and RN `>=0.79.5`.
Its internal StyleX dependencies are `^0.15.4`, distinct from this workspace's
0.19.1. Import `css` and its public types from RSD; do not force its internal
StyleX onto the workspace version.

Sources: published registry metadata for
[Expo](https://registry.npmjs.org/expo/58.0.23),
[blank template](https://registry.npmjs.org/expo-template-blank/58.0.32),
[React Strict DOM](https://registry.npmjs.org/react-strict-dom/0.0.55), and
[Metro runtime](https://registry.npmjs.org/@expo%2fmetro-runtime/58.0.17).

## App configuration

Use `getDefaultConfig(__dirname)` from `expo/metro-config`. SDK 58 detects Bun
workspaces; manual `watchFolders` or resolver path overrides are unnecessary.
Native module resolution is automatically aligned with autolinking in monorepos
since SDK 55. Check that React resolves to one instance in the app, including
through workspace packages. Explicitly listing `react-strict-dom` in
`expo.autolinking.include` can also align its singleton contexts.
[Expo monorepo guide](https://docs.expo.dev/guides/monorepos/),
[autolinking configuration](https://docs.expo.dev/modules/autolinking/).

Configure Babel with `babel-preset-expo`, followed by
`react-strict-dom/babel-preset` with `{platform, dev, debug: dev}` from Expo's
Babel caller. The published preset transforms only `platform === 'web'`; native
styling runs at runtime. For web, configure `react-strict-dom/postcss-plugin`
with narrow globs for app and shared package sources, then `autoprefixer`.
Import a CSS file containing `@react-strict-dom;` and `@expo/metro-runtime` from
the entry. Set `data-layoutconformance="strict"` on the root `html.div`.
TypeScript should extend `expo/tsconfig.base`, use `moduleResolution: "bundler"`,
`customConditions: ["react-native"]`, and native module suffixes.
[Official RSD Expo setup](https://react.github.io/react-strict-dom/learn/setup/).

## Theme API

Define named `css.defineVars` exports in `*.css.ts` files, then apply
`css.createTheme(tokens, overrides)` through the `html` element's `style` array.
The published native declarations export `StyleVars<T>` as StyleX `VarGroup<T>`,
`StyleTheme<V,T>` as `Theme<V,T>`, and `Styles<T>` as `StyleXStyles<T>`.
`css` is typed as the StyleX namespace. Native `defineVars` stores defaults and
returns variable references; native `createTheme` produces an override map.
Native supports custom properties, themes, color-scheme media queries, and
flex layout, but not CSS grid, backdrop-filter, calc, clamp, or CSS animations.
[RSD theming guide](https://react.github.io/react-strict-dom/learn/themes/),
[native CSS compatibility](https://react.github.io/react-strict-dom/api/css/),
[published RSD source archive](https://registry.npmjs.org/react-strict-dom/-/react-strict-dom-0.0.55.tgz).

## Local native module

A workspace module declared as an app `workspace:*` dependency is discovered
recursively. Put `expo-module.config.json` next to its `package.json`, declaring
`platforms: ["apple", "android"]`, `apple.modules` with Swift class names, and
`android.modules` with fully qualified Kotlin class names. Supply the podspec
and Android Gradle source. Alternatively, app-local modules default to
`./modules`. A custom native module requires an app build; Expo Go cannot load
new native code.
[Expo module config](https://docs.expo.dev/modules/module-config/),
[module creation and native rebuild workflow](https://docs.expo.dev/modules/get-started/),
[autolinking search algorithm](https://docs.expo.dev/modules/autolinking/).

Suggested commands from the app directory after creating its files:

```sh
bunx expo install --check
bunx expo-modules-autolinking search
bunx expo-modules-autolinking resolve --platform android
bunx expo-modules-autolinking resolve --platform apple
bunx expo-modules-autolinking verify --verbose
bunx expo export --platform web
bunx expo export --platform android
bunx expo prebuild --platform android --no-install
bunx expo run:android
```

Run `bun install` at the repository root first. Pin direct dependencies in the
app manifest before installation; the commands above do not establish successful
builds until run against the implemented app.

## Local toolchain observations

SDK 58 documents Node 22.13+, Android compile SDK 37 / target SDK 36, and Xcode
26.4+. Node 26.10.0 meets its documented minimum. The local SDK currently has
only `platforms/android-37.2` and build-tools 37.0.0; do not assume that satisfies
a build requesting the exact `android-37` platform. Only Temurin JDK 27 is
registered with `java_home`; React Native recommends JDK 17 and warns about newer
versions. Use a compatible installed JDK if available or report the missing
toolchain before claiming a local Android build.
[Expo SDK requirements](https://docs.expo.dev/versions/latest/),
[React Native environment setup](https://reactnative.dev/docs/set-up-your-environment).

This note records source research and read-only local toolchain inspection.
It does not establish installation, bundling, native compilation, or rendering.
