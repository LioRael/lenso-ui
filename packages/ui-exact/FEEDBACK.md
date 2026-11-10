# Progress and loading feedback

These components use the existing Lenso StyleX recipes. Values and geometry
are derived in Contract; no Web callback owns a second progress value. Pass
every declared prop at a call site, as required by the pinned Exact compiler.

## Shared range state

`RangeState(id, label, value, min, max, valueText, size, color, disabled)` describes
a finite numeric range. `id` supplies the root DOM/test id and the namespace for
its track and fill. `label` is the root's accessible name. `size` accepts `sm`,
`md` or `lg`; `color` accepts `default`, `accent`, `success`, `warning` or `danger`.

The effective upper bound is `max(min, max)`. Values are clamped between that
bound and `min`. The fill is the clamped fraction of the range; an empty or
reversed range becomes an empty fill with equal effective bounds. Visual fill,
`aria-valuenow`, `aria-valuemin` and `aria-valuemax` use the same normalization.
Nonempty `valueText` supplies a localized description and output; an empty
string requests a rounded percentage. Updating state updates the existing
visual and accessibility values. `disabled` supplies the shared disabled
presentation and ARIA state; these indicators are never keyboard controls.

`ProgressState(range, indeterminate)` adds the unknown-progress state. Its
indeterminate root has no `aria-valuenow`. Set `range.valueText` to a useful
localized message, or leave it empty for no output. It never invents a numeric
percentage for an unknown value. Switching between known and unknown progress
reconstructs that root and its slot content, so these slots should contain
presentation parts rather than stateful editors.

## Linear progress and meters

`ProgressBar(state: ProgressState)` accepts these children:

- `ProgressBarLabel()` accepts rich visible label content.
- `ProgressBarOutput(state)` displays the normalized percentage, custom text or
  unknown-progress message.
- `ProgressBarTrack(state)` contains `ProgressBarFill(state)`.

`Meter(state: RangeState)` exposes `MeterLabel`, `MeterOutput`, `MeterTrack` and
`MeterFill` with the same composition, without an indeterminate state. Use a
meter for a measurement such as storage; use progress for task completion.
Their `progressbar`/`meter` roles and accessible names are present before hatch.
Tracks and fills are decorative. Label/output occupy the shared two-column
header, with a full-width track beneath it.

```text
use RangeState, ProgressState, ProgressBar, ProgressBarLabel, ProgressBarOutput, ProgressBarTrack, ProgressBarFill from "@lenso/ui-exact"

component UploadProgress
  derive range = RangeState(id="upload", label="Upload", value=35, min=10, max=110, valueText="", size="md", color="accent", disabled=false)
  derive progress = ProgressState(range=range, indeterminate=false)
  view
    ProgressBar(state=progress)
      ProgressBarLabel()
        text "Upload"
      ProgressBarOutput(state=progress)
      ProgressBarTrack(state=progress)
        ProgressBarFill(state=progress)
```

The source snippet illustrates the API. The installed-consumer browser build
executes [example/feedback.contract](example/feedback.contract), including live
state changes and all parts.

## Circular progress

`ProgressCircle(state: ProgressState)` accepts `ProgressCircleTrack(state)`.
The track is a decorative SVG with view box `0 0 36 36`. Compose its two circles:

- `ProgressCircleTrackCircle(state, cx, cy, radius, thickness)`.
- `ProgressCircleFillCircle(state, cx, cy, radius, thickness)`.

The standard geometry is `cx=18`, `cy=18`, `radius=16`, `thickness=4`. A custom
radius updates circumference and dash offset together; the fill begins at the
top. `ProgressCircleLabel()` accepts a visible label, including as a sibling
of the compact root. The explicit `RangeState.label` names the progressbar.
The indeterminate ring paints a quarter arc and rotates its SVG track.

Exact does not admit hatch callbacks or data words on SVG leaf nodes. The
circle parts use reserved DOM id suffixes `--lenso-progress-track` and
`--lenso-progress-fill` to receive declarative alternatives generated from the
shared StyleX classes. Reserve those suffixes for these parts. These rules stay
active for the circles after initialization; no callback replaces their nodes
or overwrites the Contract geometry. Root and track use the normal hatch. Exact
may serialize SVG presentation attributes as CSS, so browser checks inspect
computed geometry and paint rather than requiring a specific serialization.

## Spinner and skeleton

`Spinner(id, label, size, color)` exposes a named `status`. Sizes are `sm`, `md`,
`lg` and `xl`; colors are `secondary`, `current`, `accent`, `success`, `warning`
and `danger`. Its decorative SVG uses the existing eight-spoke geometry and
stepped rotation. The small size uses its distinct 22-unit geometry; larger
sizes use the 30-unit drawing. Use a meaningful localized `label` and mark the
actual loading region busy in the caller when appropriate.

`Skeleton(id, width, height, animation)` accepts layout children and uses
`shimmer`, `pulse` or `none`. Supply dimensions using Exact's supported CSS
length strings. Nested skeletons retain the shared parent shimmer composition;
only the parent paints the moving overlay. The placeholder subtree is hidden
from accessibility and inert, so it cannot leave invisible focus stops. Keep
meaningful loading status outside it. The shared semantic radius is the default. Registered caller StyleX maps can
set a custom radius or clear a background; see STYLING.md for the first-frame
and initialized composition path.

Motion is owned by shared CSS. Reduced Motion stops infinite rotation, shimmer
and pulse and disables progress width/dash transitions. Removing an indicator
releases its CSS animations; no observer or animation timer is installed by
these components. This Web adapter does not establish native Exact or physical
Safari behavior.

## Verification

The package consumer passes in Chromium 156 and Playwright WebKit 27.2. Checks
cover normalized range semantics, determinate/indeterminate changes, output,
track sizes and colors, SVG dash geometry, RTL fills, spinner geometry and sizes,
nested skeleton composition, Reduced Motion and removal/recreation. Initial
style comparisons include the new families among 1055 composed consumer cases (900 core recipes).
Light/dark screenshots cover 390 and 820 px. Dynamic inline-value adapters and native
platform acceptance remain open in COMPONENTS.md.
