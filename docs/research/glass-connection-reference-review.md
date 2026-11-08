# Glass connection: reference review

## Scope and conclusion

This review compares the user's original 1280×2774 Photos screenshot, its separately captured close-up, and the current bridge implementation. The user confirms that the bright left control is pressed. The screenshot does not identify the OS build or private renderer. No product rendering code was changed during this investigation.

Covering a contact border is insufficient to explain the reference's seamless material. Apple's public APIs describe shapes contributing to a combined glass effect. Our implementation still composites independently shaded buttons with a separately shaded connector. The next investigation should focus on optical continuity at the contact, not a thicker cover.

## What the supplied pixels show

- The original image's upper-right controls provide the better reference. Enlarging its crop with nearest-neighbor sampling helps inspect existing pixels but adds no detail. JPEG compression and screenshot resampling prevent subpixel or exact gradient measurements.
- The left control is circular and visibly taller than the right capsule, by roughly 1.4×. The user confirms that this size difference comes from press enlargement. The reference example therefore needs equal resting heights, with the circle enlarged during press; a permanently larger circle misrepresents the reference.
- The upper and lower neck meet the controls through concave shoulders. The visible exterior rim follows these shoulders; there is no complete dark, closed border cutting across the connection.
- The circle remains much brighter than the capsule. A seamless join does not require equal RGB values across the group. The user identifies the bright left control as a pressed highlight. Background sampling and lensing may also affect the pixels, but cannot replace pressed state as the explanation for this reference.
- A faint tonal transition near the circle's right side remains visible. This is not enough to distinguish original edge shading, backdrop variation, a compositing mask or compression. It is not proof of an opaque patch.

The reference images and diagnostic crops remain in the private chat visualization directory, outside the repository. No personal Photos screenshot was added as a public project asset.

## Public evidence and its limits

Apple's [UIKit container documentation](https://developer.apple.com/documentation/uikit/uiglasscontainereffect) describes the glass elements rendered in a combined view behind the foreground content. Its [SwiftUI container documentation](https://developer.apple.com/documentation/swiftui/glasseffectcontainer) describes approaching shape paths blending. These public contracts do not disclose a particular shader or number of rendering passes.

In [WWDC25 session 284, around 23:53–25:01](https://developer.apple.com/videos/play/wwdc2025/284/?time=1433), Apple explains proximity merging, overlapping shapes becoming one shape, and coordinated adaptation. [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) identifies lensing as a defining material cue. See the separate [primary evidence note](liquid-glass-container-primary-evidence.md) for source boundaries.

Masking may be part of Apple's private compositing pipeline. Public evidence does not establish whether it is, and certainly does not establish that Apple's join is made by painting a fixed-width, finished-material patch over two finished buttons. SDFs, smooth-min formulas, normal reconstruction and render-pass details are possible web implementation choices, not verified Apple internals.

## Why the reviewed bridge implementation looked attached

These findings describe the bridge implementation before the subsequent shared
geometry change, not deductions about Apple's code:

| Area                | Current behavior                                                                                                                               | Consequence                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Button optics       | `packages/glass/src/refraction.ts` computes distance, normals and displacement from each original rounded rectangle and its lens profile.      | Each button continues to behave optically as a separate original shape near the contact.         |
| Connector optics    | `packages/glass/src/fusion-optics.ts` reconstructs a field from a 2px-blurred silhouette and convolutions, with a separate displacement scale. | Matching color-transfer recipes does not match the buttons' displacement direction or magnitude. |
| Interior shading    | The connector passes a constant `neutralShade`; the original material uses fitted shade and contour maps.                                      | A join can change shading abruptly even after its dark stroke is hidden.                         |
| Highlight           | The connector generates its own erosion/offset rim instead of using the original lens highlight model.                                         | Exterior lighting and its apparent width can change at the shoulder.                             |
| Contact composition | `packages/glass/src/fusion.ts` subtracts button silhouettes, expands the bridge by 2px, and paints it above the controls.                      | The old border is covered, but the nearby normals, lensing and shadows are not made continuous.  |

The previous checks proved useful properties: unchanged button classes/lens identities, unchanged sampled interior pixels, contact-mask coverage, and working elastic separation. They did **not** prove continuous edge optics or Apple visual fidelity. They must not be reported as evidence of those qualities.

## Direction for the next implementation experiment

This is a proposed web approach, not a description of Apple's algorithm:

1. Keep the existing GlassButton material recipe and lens model as the baseline. Preserve DOM content, semantics, hit targets, refs and states.
2. Represent the interacting outline before shading. A smooth distance/height-field union is one candidate. It must reduce to the original isolated geometry when no interaction is present.
3. Derive the contact region's displacement, highlight and shadow response from the same evolving geometry. Blend the nearby edge geometry over a finite transition band instead of overlaying a finished strip. Its width should follow shape size and interaction, not simply increase the current 2px cover.
4. Eliminate internal rims as an outcome of the combined boundary. Allow the contact edge to change while preserving the distant parts and the original material character. A unified effect can still have strongly varying local brightness from its backdrop.
5. Reuse one backdrop coordinate system and consistent sampling/material parameters across the interacting area. Reusing only `appendAppleMaterial` while supplying a different field and constant shade is insufficient.

## Visual acceptance to add

Use the reference's unequal circle/capsule geometry, not only equal pills. Test patterned and photographic backgrounds, light/dark adaptation, approach, first contact, a narrow neck, overlap and separation. Observe moving background details crossing the join: they should not jump in position, brightness or blur width. Inspect shoulder tangents and highlight width, not just disappearance of a black stroke.

Keep isolated and distant-region baseline checks. Permit intentional changes in the contact transition band. Treat exact optical parity, native frame timing and the private Apple technique as unverified until supported by matching evidence.

## Pressed-state comparison with the Glisse fork

The repository credits `onlymoein/glisse`. Its current inspected revision is `57800a31d9da3ed2170e5ca9e4cce9d736ff448b`.

The fork's [glass styles](https://github.com/onlymoein/glisse/blob/57800a31d9da3ed2170e5ca9e4cce9d736ff448b/src/styles.css#L108) show a pointer-position white radial highlight on press, with immediate onset and a 220ms fade. Its button active state also immediately changes surface fill (`rgb(236 236 240 / .85)` in light appearance and `rgb(70 70 70 / .62)` in dark appearance).

At review time, our `GlassButton` consumed elastic scale and translation, with hover/focus inset fills, but had no equivalent pressed optical selector. The press runtime supplied `data-lenso-pressed` and pointer coordinates without a corresponding GlassButton optical layer. Generic Glass and Button already had their own pressed treatments, so this gap did not apply to the entire library.

The fork therefore has a closer behavioral mechanism for the user-confirmed pressed highlight. Source inspection alone cannot establish overall visual closeness to Apple. A matched background, geometry and pressed-state comparison remains necessary.

The fork's [toolbar styles](https://github.com/onlymoein/glisse/blob/57800a31d9da3ed2170e5ca9e4cce9d736ff448b/src/styles.css#L882) share a parent material and suppress child optics. That is not evidence of dynamic proximity fusion; no such multi-shape fusion implementation was found in the inspected source. Pressed-highlight fidelity and connection continuity are separate findings.

## Subsequent implementation

GlassButton and GlassToggleButton now share a dedicated pressed-light layer,
using the existing light/dark active-fill tokens and pointer glow. This layer
does not consume persistent toggle selection or replace fallback contours.

Matching members now share a surface with a smooth combined distance field
through the existing refraction/material pipeline, including directional rim
lighting and contour maps. Local-height shading replaces the neutral connector
shade. Mixed recipes keep individual geometry-aware lenses. Native independent
lens handles remain intact and are restored when
members separate. The two-pixel overlap covers rasterization seams rather than
standing in for the optical transition. The bridge also receives a fading
contribution from a pressed control's lighting.

This is the proposed Web approach implemented locally, not evidence about
Apple's private algorithm. Matching native appearance and native Safari
performance remain separate acceptance questions.
