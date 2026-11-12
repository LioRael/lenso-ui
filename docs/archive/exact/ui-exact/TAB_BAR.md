> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# TabBar for Exact Web

TabBar is application navigation composed of real links and action buttons. It
uses a navigation role with list/listitem semantics rather than tab/tabpanel
roles. Exact's native links retain destinations and modified activation; the
caller owns current-route flags. The generated links derive from canonical Link
and retain MIT provenance. Ordinary action buttons use Exact's native button.

`TabBarState` explicitly supplies id/label, phone/tablet layout, direction,
elastic, lift, minimized, autoMinimize (`none`, `up`, `down`), named scrollTarget
(or empty for the page), and expandLabel. Root/TabBar take `minimize(bool)` and
`activate(key)` actions. Link supplies an opaque key, href, current/disabled,
separate, iconOnly and hasIcon; the app owns acceptance. Group supplies its own
stable ID and separate flag. Icon and Label are explicit content slots, so repeat
state/layout as shown in the runnable example rather than relying on React
context. Action Button has native disabled behavior and press action.

The original TabBar pointer/indicator source is adapted with its MIT notices,
label refraction, content-copy ID rewriting, variable-width geometry, native
navigation, disabled/action drag exclusion and spring return. The source minimize
spring retains velocity across controlled reversals, measuring expanded geometry
before collapsing to 44px. A minimized normal list is inert and has an expand
button; a separate action remains interactive. The original 8px scroll threshold,
direction accumulation and top-edge reset are retained. Every observer, pointer,
window event, frame and spring has an explicit Exact cleanup path.

The stock router handles links at document capture. Scoped window arbitration
therefore suppresses a drag's trailing click before the router runs, then proposes
activation for the actual destination. This adds no selected/open state owner.
Minimization is caller-controlled; rejected activation does not veto navigation.
Native Glass material and knob layers reuse the existing Exact presentation and
optics helpers. Material optics defer during resize and return at rest.

Initial minimized geometry/markers, generic native/ref/render/event forwarding,
automatic child context, reference motion/optical qualification and native/device
acceptance remain separate gates. Code reuse and matching recipes alone do not
prove animation parity or performance. Browser evidence is recorded separately.

## Focused Web acceptance

The isolated stock consumer passes Chromium/WebKit real link roles and native
fragment navigation, normal Tab order, native actions without route selection,
disabled destination exclusion, opaque keys, controlled activation/minimize
rejection, one activation after mouse dragging, inert minimized lists, expand
keyboard focus return, source scroll threshold/direction/top-edge behavior,
phone/tablet layouts, RTL and removal/remount. Decorative copies retain unique
IDs and contain no interactive descendants. Spring reversal is sampled within
one browser frame and retains position before the next frame, rather than
comparing two tool calls that can span an animation. This does not qualify the
whole reference motion curve or velocity fidelity.

Both engines pass native tap navigation/action/expand; Chromium also passes a
continuous native CDP touch drag with one activation. WebKit continuous touch and
physical devices remain open. Keyboard expansion rejection retains focus; pointer
click focus follows the browser's native button policy (WebKit can blur it).
Thirty-two captures cover phone/tablet, expanded/minimized, themes and widths,
with group-height, 44px minimized size, containment, inertness and indicator
alignment assertions. The example uses border-box on its padded stage; earlier
layout and cross-frame focus/reversal observations remain preserved.

Receipt: `.cache/acceptance/tab-bar-keyboard/acceptance.json`.
The package suite passes 70 tests / 267 assertions, typechecking covers 124 files,
and affected lint/format plus the isolated stock consumer build pass (six existing
warnings). These are selected candidate behavior/rendering checks rather than
source pixel/optical parity, native-device acceptance or performance measurements.

The same candidate passes the original Tabs focused regression in both engines:
`.cache/acceptance/tab-bar-tabs-regression/acceptance.json`. The retained motion
and minimization adapters also match a normalized mechanical extraction of the
current source with their explicit lifecycle/router projections. Source hashes
and affected production-file matches are recorded in `verification.json`.
