# @lenso/glass

Lenso's browser glass renderer. The existing `@lenso/ui` Menu uses it for its
popup and keeps its usual anchored trigger. Set `<Menu morphTrigger>` to animate
from the trigger as in the Docs example. Base UI handles filtering, selection,
focus, keyboard navigation and dismissal.

| Entry                 | Use                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `@lenso/glass`        | Attach a glass surface or a local refraction lens, prewarm maps, and prepare owned backdrops |
| `@lenso/glass/motion` | Animate a spring, a press, or velocity-based deformation                                     |
| `@lenso/glass/react`  | Bind glass and motion to React refs and provide a backdrop source                            |

The core and motion entry points support server imports. Attach surfaces in the
browser. The React entry uses React 19.2–19.x. Load `@lenso/tokens/styles.css`
and compile the tokens' StyleX rules so the renderer can read the material
recipe from the element.

## Using a surface

```ts
import { attachGlass } from "@lenso/glass";

// Attach to a mounted, sized element styled with a glass material.
const detach = attachGlass(surface, { profileKey: "glass-medium" });
// Release observers and rendering resources when the surface is removed.
detach();
```

Use one attachment per element. When the consumer knows a surface will appear
soon, `prewarmGlass(element, { signal })` can prepare its maps ahead of time.
In React, `useGlassRef` manages attachment and cleanup. For a control whose own
label or track should refract, `createControlLens` exposes `setActive`,
`update`, `refit` and `destroy`.

## Backdrop sources

An application that owns the pixels behind a lens can provide
`GlassOptions.backdropSource` or `GlassBackdropSourceContext`. The source
identifies its foreground, reports when the inputs are stable and prepares a
disposable snapshot. Call the supplied checkpoint between units of work, and
honor its abort signal. `prepareGlassBackdrop` takes a detached canvas on the
original device-pixel grid. Position, size, theme and source changes invalidate
the prepared result. Use the subscription hook for changes outside the DOM,
such as painting to a canvas.

The Docs Menu registers its root popup for this path. Other backgrounds keep
the browser's live material. Chromium can apply SVG refraction to a live
backdrop. Safari can use the shared GPU renderer for eligible image sources,
and uses its native material when input cannot be captured faithfully. The
material recipes support increased contrast and reduced transparency.

## Development and licensing

Build with `pnpm --filter @lenso/glass build` and typecheck with
`pnpm --filter @lenso/glass typecheck`. The workspace's installed-consumer
check exercises the packed Glass, UI and tokens packages.

Glass adaptations retain their MIT attribution. The optional WebKit-derived
WGSL backend retains its LGPL-2.0-or-later terms. The package includes the
license texts and the corresponding runtime sources and build configuration
in `dist/source`. [Glass notices](../../third-party/glass/NOTICE.md)
