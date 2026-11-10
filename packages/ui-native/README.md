# Lenso UI Native

Private React Native / Expo implementation slice. This is source code for development,
not a published package or a claim of native visual acceptance.

## Platform contract

| Feature            | iOS                                                                       | Android                                                                                  |
| ------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Glass / GlassGroup | Expo's system `GlassView` / `GlassContainer` on supported iOS 26+ devices | Explicit backdrop replay, RenderEffect blur, AGSL refraction on API 33+                  |
| GlassButton        | UIKit `UIButton`, `.glass()` / `.prominentGlass()` on iOS 26+             | React Native Pressable with Lenso material and shared press springs                      |
| Switch / Slider    | UIKit `UISwitch` / `UISlider`                                             | Lenso controls using native views, accessibility actions and glass thumbs                |
| Earlier systems    | Standard UIKit controls and opaque surface fallback                       | API 31–32 blur only; earlier versions or unavailable backdrop use a translucent fallback |

Reduce Transparency selects opaque surfaces. Reduce Motion disables custom press springs.
System UIKit controls retain system behavior. `glassCapabilities` reports platform API
support, not whether a particular backdrop was captured or a GPU render succeeded.
The first slice selects the platform renderer automatically; iOS custom rendering,
TabBar, Menu and Sheet are not implemented here yet. Web Base UI components and
`packages/primitives` remain separately owned.

## Styles and themes

`xstyle` accepts compatible React Strict DOM StyleX declarations. `NativeStyle`
resolves them with RSD's native compatibility bridge on the actual native host.
Use `style` for platform-specific React Native layout. Theme values are generated
from the existing Apple semantic color data, and the Android tone shader is generated
from `packages/glass/src/material-tone.ts`. Press springs share the Web motion model.

This shares compatible declarations, variables and themes. Existing Web classes,
CSS selectors, browser shaders and Base UI DOM behavior do not become native controls.
RSD's compatibility bridge is experimental and pinned to version 0.0.55.

## Backdrop ownership

Provide a nonempty `sourceID` for each Backdrop and its Glass consumers. On Android,
IDs must be unique within a native root. Mount the source before the consumers in
drawing order. Glass must be outside its source subtree, to prevent recursive capture.
The iOS adapter accepts the same ID but lets the operating system sample the backdrop.

A group fuses at most eight direct, untinted, non-lens Glass children sharing its
source, material, held state and appearance. Rotated or nonuniformly scaled children draw individually. Other children draw individually. Use rounded
rectangles with uniform corner radii; arbitrary native masks are not supported.
Android video, WebView and other independently composed surfaces are not guaranteed
to appear in the replay. Render sources and effects are released on native detach.

## Example and checks

From the repository root:

```sh
bun install
bun run --filter @lenso/native-example ios
# Or use an Android device / emulator:
bun run --filter @lenso/native-example android
```

This requires an Expo development build; Expo Go cannot load the custom module.
Use the repository's pinned Node and Bun versions. Android additionally requires a
compatible JDK (17 is the intended baseline) and the Expo SDK's Android platform.
Generated iOS and Android app projects are ignored; regenerate with Expo prebuild.
The example includes appearance, transparency and controlled-value rejection controls.

```sh
bun run --filter @lenso/ui-native generate:check
bun run --filter @lenso/ui-native typecheck
bun run --filter @lenso/ui-native test
bun run --filter @lenso/native-example typecheck
bun run --filter @lenso/native-example export:ios
bun run --filter @lenso/native-example export:android
```

Value-boundary tests cover snapping and overshoot; they do not establish touch,
VoiceOver/TalkBack, rendering, fusion or performance correctness. See the native
[validation report](../../docs/research/native-glass-runtime-validation-2026-11-10.md) for actual build and device coverage.

## Attribution

See [NOTICE.md](NOTICE.md) and [LICENSE](LICENSE). Native rendering and UIKit hosting
retain MIT source from onlymoein/liquidglass, adapted to explicit source ownership,
Lenso material data, lifecycle cleanup and controlled values. Existing Lenso material
and motion sources retain their original notices.
