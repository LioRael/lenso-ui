# Toolbar

`Toolbar.Root` owns native Base UI roving focus. Use `Toolbar.Button` for actions
and label both the toolbar and its groups.

## Menus in a shared surface

Compose `Menu.Trigger render={<Toolbar.Button />}` inside `Toolbar.Group`.
When morphing is enabled, Menu uses the nearest owning glass surface as its
source, including all joined controls. An attached toolbar owns the source;
ordinary glass groups own theirs; detached controls remain individual sources.
Menu still owns open state, selection, keyboard behavior, dismissal and closing
motion. `morphTrigger={false}` retains individual anchored-popup behavior.

Pointer activation waits for release. A drag of at least 8px cancels the click,
including when the pointer returns to its original position. Keyboard and
assistive click activation remain available. This threshold is a Web interaction
choice, not a measured iOS constant.

Disabled members remain non-actionable and outside the enabled roving-focus set,
but pressing them can still deform their enabled shared glass surface. Loading
controls and explicit `elastic={false}` retain their feedback restrictions.

## Detachable glass groups

Pass a controlled `isDetached` value to `Toolbar.Group` to enable a transition
between a shared glass capsule and separate glass controls:

```tsx
const [detached, setDetached] = useState(false);

<>
  <Toolbar aria-label="Editing actions">
    <Toolbar.Group isDetached={detached} aria-label="Clipboard">
      <Toolbar.Button onClick={copy}>Copy</Toolbar.Button>
      <Toolbar.Button onClick={paste}>Paste</Toolbar.Button>
    </Toolbar.Group>
  </Toolbar>
  <Button onClick={() => setDetached(!detached)}>{detached ? "Join group" : "Split group"}</Button>
</>;
```

Keep `isDetached` present in both states. Omitting it preserves the existing
standard group. The snippet uses application-provided `copy` and `paste` handlers;
the runnable counter example is `apps/docs/src/stories/toolbar-glass-group.tsx`.
The feature applies to glass groups.
Use direct `Toolbar.Button`
children; separators are unnecessary. Default button variants automatically use
the shared glass material in this mode. Explicit variants remain available, but
matching material recipes give the most coherent join.

The 250ms transition moves existing buttons with transforms and unfolds their
inside corners. A shared geometry field starts as a complete capsule, develops
a neck, pinches apart and finishes with independent button lenses. Reversing the
state retargets the current transition. Button DOM nodes, action handlers, refs,
native disabled semantics and keyboard focus remain owned by Base UI.

The group reserves its separated extent, including a 40px final gap, so the
toolbar and optical coordinate system do not resize during the transition.
Respect that space when laying out a narrow toolbar. Horizontal, vertical and
RTL arrangements are supported. Joined members share the group’s elastic press and drag feedback; detached
members regain individual elastic feedback. Press lighting follows the held pointer across the shared surface and connecting
neck, with distance-based falloff instead of a fixed highlight per item.
Attached toolbars and ordinary glass groups use one surface light too. The light
also follows input when `elastic={false}`; native activation and roving focus
remain on the original controls.

Reduced motion switches arrangement without positional interpolation and keeps
the static joined surface. Reduced transparency and forced colors use native
accessible rendering. Use the normal unattached toolbar for separately floating
groups; `Toolbar isAttached` keeps its own background behind the group.

The Web material is an approximation. Default glass groups keep a warm material face beneath evolving refraction,
so decoding a replacement optical map cannot clear the glass. A continuously
painted exterior contour follows the same distance field in every frame; its
Web alpha composite approximates the native subtractive edge. Individual
matching controls keep the same material plane after separation, clipped as
independent islands. Crossing the fusion threshold does not replace their
material. Disabling fusion or incompatible recipes restores independent rendering. Existing marked-backdrop fallbacks still apply.
No package installation or animation library
is required, and existing toolbar groups require no migration.
