> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# ButtonGroup for Exact Web

`ButtonGroup(state)` groups independent actions. Every enabled action retains its
native Tab stop; arrow keys do not select or move focus. Use ToggleButtonGroup
for pressed values and SegmentedControl for a single radio value.

`ButtonGroupState` contains `id`, `label`, `direction`, `orientation`, `size`,
`variant`, `glass`, `detached`, `fullWidth`, `disabled`, `destructive`, `tint`.
Pass the same explicit state to the root, items and separators. Exact slots keep
the caller's scope; this API does not depend on inherited React context.

- Direction is ltr/rtl, orientation horizontal/vertical, and size sm/md/lg.
- Ordinary variants are prominent/bordered/borderless; default maps to bordered.
  Glass uses prominent when requested, otherwise default, matching Lenso's group
  variant normalization.
- Joined members use the shared outside corners, automatic internal seams and
  inset keyboard outline. A separator remains a hidden compatibility part.
  Detached groups have a 4px gap and preserve individual shapes.
- Full-width groups distribute available content space across members; icon-only
  members retain their smaller padding. Group and own disabled states are
  combined. Destructive colors use the shared semantic tokens; tint is empty or
  a valid CSS color. Native tint data writes a private variable, leaving caller
  StyleX composition of public tint variables available.

`ButtonGroupItem(state, id, label, disabled, loading, iconOnly, elastic, type,
press)` accepts rich children. Supply an accessible label independently of the
visible content. `ButtonGroupIcon(glass)` supplies a decorative icon viewport;
caller SVGs retain their own paths and should fill that viewport.

Items use native buttons and the Exact press action. Loading exposes aria-busy
and pending presentation, keeps the button focusable and blocks click, double
click, activation keys and pointer activation. Disabled items use native
disabled. Explicit type supports the native button type declaration; form
composition and full native button prop forwarding remain separate coverage.

Glass items reuse the shared small optical material and press highlight. Joined
items suppress independent elastic movement; detached enabled, non-loading
items can use the same source press motion. Each button owns its own optics;
the group does not represent a fused continuous glass surface. Reapplying or
ending a hatch removes its owned motion, guards, variables and optics.

See the compiled [example](example/button-group.contract) and browser checks in
`test/button-group.mjs`. Checks cover native activation and Tab order, group/own
disabled states, focusable pending actions, sizes/icon geometry, variants,
destructive/tint and caller overrides, RTL and horizontal/vertical geometry,
joined/detached/full-width composition, dynamic first-item removal, Glass
elastic guards, forced colors and disposal. Initial stylesheet and registered
recipe parity checks accompany browser acceptance.

The lifecycle check also disables and re-enables Glass items, then removes a
detached item during an active pointer press. It verifies optical markers,
press state and motion variables are released before recreating the group.

The family remains Partial: implicit inheritance through arbitrary Button or
GlassButton wrappers, per-item option override precedence, native fieldset
semantics, extended native/ref/render/event contracts, optical/motion reference
acceptance and physical touch remain open. WebKit automated Glass captures
remain unqualified; see VISUAL_CAPTURE.md. No native adapter or relative
performance claim is established by these Web checks.
