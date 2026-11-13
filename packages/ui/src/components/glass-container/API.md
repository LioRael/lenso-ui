# GlassContainer

`GlassContainer` combines nearby glass surfaces into one fluid silhouette. Import
it from `@lenso/ui` or `@lenso/ui/glass-container`. Existing `Glass`, `GlassButton`
and `GlassToggleButton` participate automatically. A custom element uses
`GlassContainer.Item`, an alias of `Glass` with native UI SDK `render` composition.

```tsx
<GlassContainer spacing={18} style={{ display: "flex", gap: 12, padding: 24 }}>
  <GlassButton>Save</GlassButton>
  <GlassContainer.Item
    elastic
    render={<button type="button" onClick={addItem} />}
    style={{ width: 64, height: 50, borderRadius: 16 }}
  >
    Add
  </GlassContainer.Item>
</GlassContainer>
```

`spacing` defaults to 20 CSS px and is the smooth-union blend radius.
Curvature and element size affect the exact point of connection; it is not a
layout gap or a guaranteed edge-to-edge threshold. The blend is bounded by the
smallest member. Zero disables bridges.
It does not set layout gap. Animate layout, CSS transforms or individual scale
normally: the surface follows rendered geometry, including elastic enlargement
and spring return. `Glass.elastic` defaults to false; `GlassButton.elastic` keeps
its existing true default. No separate animation library is required.

`disabled` removes the connecting bridges. `tint` colors only the bridge.
Custom and mixed materials retain their recipes; matching untinted iOS 27
small/clear controls use the shared group material described below. Native
control state and activation remain on each member. While connected, its lens
uses the combined outline for refraction and edge lighting. Compatible members
keep the same shared material plane when separated, clipped into independent
islands; proximity changes geometry without swapping material ownership. Keep matching materials within a group so
the bridge meets compatible surfaces. Content, hit
targets, focus rings, refs and native events remain on the original DOM; the
decorative connecting neck is not a hit target. Nested containers are independent.

Compatible untinted iOS 27 small/clear members share a group surface with the
reference's large-surface linear tone, while standalone controls retain their
size-fitted tone. The group omits per-button inner shading and uses one exterior
hairline, directional rim and outer shadow. Tinted and other material
profiles retain their existing recipes. Matching members use a combined distance field in both separated and connected states. Their separate background copies and internal
rims are suppressed while content stays on the controls. Pressed state stays on each native control. Pointer lighting is centered on the
held touch or pointer and moves continuously across the shared union, fading
with distance through the shoulder and into adjoining members. Item boundaries
do not restart or recenter the light. The same falloff is used on independent
buttons, even when elastic movement is disabled. Keyboard lighting starts at
the focused control. No duplicate local fill is painted beneath the shared light. One exterior contour follows
the concave shoulders; no closed member border crosses the neck.
Decoded geometry maps fit local shading to member height.
Different recipes retain individual lenses driven by the combined geometry,
with a bridge extending 2px over the contact to cover rasterization seams.
Pressed lighting fades from the pressed control into the neck. Marked backdrop
content supplies the material without sampling
the border being covered. Chromium otherwise filters the live backdrop;
WebKit filters marked `data-lenso-backdrop` content using the existing inert
backdrop-copy renderer. Without marked content, WebKit uses the existing Small
Glass material-paint fallback. Matching marked-backdrop controls keep a warm,
fully shaded material transfer beneath the optical output in both engines.
It uses the same local-height shading as the complete lens. Vector clipping and
the exterior contour follow geometry immediately; prepared optics remain visible
while replacement maps encode, without clearing the face or waiting for motion
to stop. The independent member lens
stays available throughout and is restored when the group is disabled or its
recipes no longer match. Separation alone keeps the prepared material plane.
The combined outline changes edges near the neck while distant geometry retains
its isolated form. This remains a Web approximation of native merging. Use small
groups. Idle and offscreen groups stop measuring; style changes, resize, scrolling,
pointer interaction and CSS/WAAPI animations wake them. Inherited changes to the
container's theme/preferences are observed. Ancestor transforms driven by script
without a descendant change are not a supported animation source.

Members use axis-aligned bounds. Toolbar.Group's detachable mode also tracks
each corner while morphing a joined capsule into independent round controls.
Rotated/skewed shapes, elliptical corners, images melting together and velocity
trails are outside this API. Reserve container
padding for the full travel of the surfaces; the mask is bounded by the container.
Reduced motion removes ordinary proximity necks while preserving separate surfaces
and native controls; detachable toolbar groups retain their static joined shape.
Reduced transparency, increased contrast and forced colors restore
the independent member rendering. CSP must permit `data:` SVG and PNG images for
masks and optical maps.

This is additive: existing components outside the container keep their original
rendering and motion defaults. GlassButton and GlassToggleButton now show a
transient pressed surface fill and touch-position glow, independently of elastic
movement. Persistent toggle selection does not hold that glow on. No prop or
import migration is required.

During fusion, press feedback stays visible. The native pressed state drives
one lighting field across the shared lens and connecting shoulder. A warm shared material face remains underneath changing
refraction maps; exterior contour coverage is painted directly rather than
replacing an image inside the active optical filter.

### Material-alignment migration

The proximity default changed from 12 to 20. Explicit `spacing` values now name
the actual smooth-union radius; the previous 1.9 multiplier was removed. To retain
an older explicit blend, multiply its spacing by 1.9 (subject to the existing
smallest-member limit). For example, the previous default 12 corresponds to an
explicit 22.8. This does not change layout gaps or grouped-toolbar morphing.
Group and standalone surfaces have distinct material roles; splitting a group
into islands retains its shared group tone until membership ends.
