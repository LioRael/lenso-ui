# Glass

`Glass` is a presentation-only native div composed with UI SDK `renderElement`.
It fits the glass optical model to its actual geometry. Native
`render`, ref cleanup, runtime `style` and caller-last `xstyle` remain available.
It does not supply activation, selection, roles or keyboard behavior.

`elastic` (default false) adds pointer-driven enlargement and spring return
without adding activation semantics. Inside `GlassContainer`, rendered geometry
including this deformation participates in the shared fusion surface. Use
`GlassContainer.Item` with `render` to keep a custom control's native element.

Chromium filters the live backdrop. WebKit and Firefox filter a copy of nearby
sibling content marked `data-lenso-backdrop`; without marked content they keep
the original blur and rim fallback. Copied layers are inert, track content,
scroll, theme and animation changes, and are released when the surface unmounts.

Set dimensions and radius with StyleX. Place a semantic control inside when the
surface needs an action; do not add click handlers to a presentation div.

The standalone surface uses the website magnifier's optical settings: bezel
25px, thickness 50px, zoom 1.13, rim saturation 9 and blur 0. Override these
existing `--lg-*` properties through caller styles when needed.

`draggable` (default false) enables pointer movement, bounded by the parent
rectangle using the lens center. `animated` (default false) independently enables
the website magnifier's press lift, velocity deformation and changing shadows.
Enable both to reproduce the interactive magnifier. At rest the animated lens
has scaleY .8, expanding to 1 when held. Use 210x150 with radius 75 for the source
geometry. Controls inside the glass retain their own interaction; dragging does
not begin on buttons, links or editable fields. Cancellation and lost capture
release the lens; reduced motion removes deformation while retaining dragging.
