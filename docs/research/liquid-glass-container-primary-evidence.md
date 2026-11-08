# Liquid Glass containers: primary evidence

Checked 2026-11-02 against Apple's public documentation and WWDC25 transcripts. This note describes public behavior, not Apple's private rendering implementation.

## Answer

Apple's documented model is coordinated shape blending and combined rendering. Describing the seamless join as simply painting over the original borders is unsupported. A screenshot alone cannot establish the algorithm used to produce it.

## Direct evidence

- [UIKit: UIGlassContainerEffect](https://developer.apple.com/documentation/uikit/uiglasscontainereffect) renders multiple glass elements as a combined effect. Its overview explicitly describes rendering their glass in one combined view behind the container's content view. Its `spacing` property controls the distance at which elements begin merging. This is a public rendering contract, not a disclosure of render passes or shaders.
- [SwiftUI: GlassEffectContainer](https://developer.apple.com/documentation/swiftui/glasseffectcontainer) combines glass shapes and renders their effects together. As shapes approach, their paths blend; increasing container spacing makes blending begin sooner. Apple connects this shared rendering to both interaction/morphing and performance. The documentation's Markdown versions were retrieved directly from Apple's corresponding `.md` URLs.
- [WWDC25: Build a UIKit app with the new design, container segment around 23:53–25:01](https://developer.apple.com/videos/play/wwdc2025/284/?time=1433): Apple's transcript explains placing individual glass views inside a `UIGlassContainerEffect` content view. Separated views begin merging as they approach, and overlapping frames combine into one shape. Spacing controls their interaction distance. The container also coordinates background adaptation so the group retains a consistent appearance. Earlier examples describe size-dependent opacity and contrast adaptation. These statements support group behavior beyond merely hiding a seam.
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/): Apple describes lensing as a defining visual cue; highlights respond to geometry and define silhouettes. Shadows and material layers adapt to background content, while larger forms change optical character. Consequently, a fixed border is an incomplete material model. The talk's scroll edge treatment is a separate legibility effect on underlying scrolling content, not evidence of a technique for covering internal glass borders. Apple also advises avoiding stacked glass and using fills/transparency/vibrancy for elements placed on glass. Regular and Clear have different adaptation behavior; do not generalize Regular's behavior to Clear.

## Inference and implementation recommendation

For a web approximation, treat a merged group as one evolving material silhouette. Evaluate its outer highlights, shadows and edge refraction from that silhouette, and avoid independently retaining each child's internal rim after merging. Keep content and interaction targets distinct from the shared visual surface. This is an engineering recommendation inferred from the documented behavior, not a claim about Apple's code.

Removing an internal stroke may be necessary in an approximation, but an opaque patch alone does not reproduce a continuous silhouette, coordinated adaptation or coherent optics. Review moving shapes over patterned backgrounds: separate, approaching, bridged, overlapping, then separating again. Check that the seam disappears without introducing a flat patch, a doubled lens or a shadow discontinuity.

## Limits

These sources do not establish an SDF representation, smooth-union formula, blur kernel, normal reconstruction, shader structure, number of GPU passes, or absence of masking/compositing inside Apple's renderer. Do not present any such technique as verified Apple internals. This review inspected public text/transcripts; it did not measure native pixels or independently inspect the user's screenshot or video frames. Exact timestamp boundaries are approximate; the container claims are verified in the transcript.
