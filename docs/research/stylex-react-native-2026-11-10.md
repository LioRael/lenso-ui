# StyleX and React Strict DOM native styling reuse

Reviewed: 2026-11-10. Scope: official documentation and source inspection; no native build or runtime experiment was performed.

## Finding

The claim that StyleX-based styling can only contribute tokens to a native implementation is too restrictive. React Strict DOM (RSD) provides a supported route for sharing component style declarations, variables, themes, and conditional styles between web and native. Its public interface is `css` and `html` from `react-strict-dom`; the web implementation uses StyleX. This establishes a reuse path through RSD, rather than proving that an existing `@stylexjs/stylex` web component library runs unchanged on React Native. [RSD overview](https://react.github.io/react-strict-dom/)

## Supported shared styling

| Capability       | Official contract                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component styles | `css.create` creates reusable styles applied to the `style` prop of `html.*` elements. Arrays compose styles deterministically; conditional application and dynamic style functions are documented. |
| Variables        | `css.defineVars` defines variables consumed by `css.create` and `css.createTheme`. Definitions must be named exports in `*.css.js` / `*.css.ts` files.                                              |
| Subtree themes   | `css.createTheme` overrides a `defineVars` result and returns an opaque style object. Applying it to an `html.*` element themes its subtree; arrays can combine themes.                             |

Sources: [Styling components](https://react.github.io/react-strict-dom/learn/styles/), [defineVars](https://react.github.io/react-strict-dom/api/css/defineVars/), [createTheme](https://react.github.io/react-strict-dom/api/css/createTheme/).

The compatibility table explicitly lists `css.create`, `css.defineVars`, `css.createTheme`, custom properties, `:active`, `:focus`, `:hover`, and media queries as JavaScript-polyfilled on both Android and iOS. Therefore, native custom-property and theme support must not be dismissed merely because React Native does not use browser CSS. The native CSS implementation also contains its own style, variable, and theme handling. [Compatibility table](https://react.github.io/react-strict-dom/api/css/), [native CSS source](https://github.com/react/react-strict-dom/blob/main/packages/react-strict-dom/src/native/css/index.js)

## Boundaries

- RSD deliberately exposes a strict subset. There is no general selector API; the documented pseudo-element is `::placeholder`, limited to color. Native inheritance currently covers text properties. Shorthand properties accept one value, rather than CSS multi-value syntax. [Styling components](https://react.github.io/react-strict-dom/learn/styles/)
- Native support is property- and value-specific. The current table lists `calc`, `clamp`, `min`, `max`, CSS grid, `backdropFilter`, `clipPath`, CSS animation properties, fixed/sticky positioning, and individual `scale`/`translate` properties as unsupported. Supported `transform` does not imply support for every CSS transform form. [Compatibility table](https://react.github.io/react-strict-dom/api/css/)
- Shared RSD declarations and compiled web class-name artifacts are different integration surfaces. The documented native path applies RSD styles to RSD elements. Treat automatic compatibility of arbitrary existing StyleX objects, generated CSS, DOM elements, browser APIs, or interaction libraries as unverified. This is an integration inference from the documented API, not a runtime result. [Styling components](https://react.github.io/react-strict-dom/learn/styles/), [RSD overview](https://react.github.io/react-strict-dom/)

## Expo integration

Expo is the recommended framework in the RSD setup guide. The guide requires the latest Expo SDK and New React Native Architecture, configures `react-strict-dom/babel-preset` with platform information, and uses the RSD PostCSS plugin and `@react-strict-dom` directive for web CSS extraction. It also documents package resolution, platform-specific files, and `data-layoutconformance="strict"` on the root RSD element. This is a build integration, not simply adding a styling import to an existing native app. [Expo setup](https://react.github.io/react-strict-dom/learn/setup/)

## Consequence for Lenso UI

A credible native direction can share compatible component style declarations and the variable/theme model through RSD, with platform-specific implementations for unsupported rendering and interactions. Reducing the proposal to token export alone leaves documented reuse opportunities unused. Conversely, these sources do not establish that Lenso UI's existing components, browser interactions, or Glass rendering transfer unchanged. A representative component and theme should be compiled and exercised on native before claiming that integration works or assigning a reuse percentage.
