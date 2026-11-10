# Avatar and AvatarGroup for Exact Web

`AvatarState(id, label, size, color, variant)` supplies the named image root and
its fallback appearance. Sizes are `sm`, `md`, `lg`; colors are `default`,
`accent`, `success`, `warning`, `danger`; variants are `default`, `soft`.
Compose `Avatar(state)` with optional `AvatarImage(src)` and
`AvatarFallback(state, clipped)` containing initials or a decorative glyph.
The root owns the accessible name; image and fallback are decorative children.
Use ordinary controls around an avatar when an action is required.

Exact owns the native `img` and its source. The Web hatch observes load/error,
cached completion, child changes and source replacement. A successful image hides
the fallback and fades in using the shared motion rule; failure restores the
fallback. Observer/listener ownership ends with the root. An empty-image avatar
shows its fallback immediately. This adapter does not implement Base UI's
configurable fallback delay or image loading status callback yet.

`AvatarGroup(id, label, grid)` is a named group. Wrap each avatar in
`AvatarGroupItem(size, overlap, ring, clipped)`. Pass the same size to item and
avatar. For a stack, set overlap on all items after the first; select either ring
or clipping, and clip all non-final ordinary avatars. Pass `clipped` to their
fallbacks as well. A grid disables overlap/ring/clipping in caller state and uses
the shared 12px gap. The example shows a named `+3` avatar as the final count.
Logical margins and the shared directional mask support RTL.

Appearance inheritance, automatic `max` truncation, automatic remaining-count
calculation, a dedicated `AvatarGroupCount` part, and render/ref/event parity
remain open. The explicit composition does not claim those behaviors. Both
families remain Partial.

## Evidence

The compiled consumer browser regression checks accessible names, cached image
load, failed source, recovery to another source, persistent root identity, all
three sizes, ring/clip/grid geometry and LTR/RTL stacking. Recipe parity covers
all color/size/variant/clipping combinations. The suite saves ordinary avatar
screenshots independently of the glass capture gate. These checks are not a
performance benchmark or native-platform acceptance.
