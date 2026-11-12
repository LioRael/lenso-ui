# Component conventions

These are Lenso Web implementation decisions, not Apple platform requirements.
Read [DESIGN.md](../../DESIGN.md) for the decision order and
[Apple guidance](apple-guidance.md) for the source principles. Use current
exports and owning StyleX maps to resolve an API or exact value.

## Components and interaction

Use Base UI for interactive controls and native HTML for appropriate static
parts. Date, time and color controls compose native parts around shared value
models. The Lenso documentation shell composes navigation and article layout with
Fumadocs document primitives and static search, with Command for result interaction. Preserve native props, refs, render
composition, keyboard behavior and focus restoration. Apply caller `xstyle` last and retain all `stylex.props`
output, including runtime custom properties.

Use content-area `Button` variants for actions and `GlassButton` for the
corresponding glass control. `Tabs` switches associated panels; `TabBar` is
navigation. Choose variants from each component's actual public API, not from a
shared assumed variant table.

Sidebar group headings use the secondary 15px/600 text role. Disclosure panels
transition their native measured height over 250ms, clipping an unscaled,
bottom-aligned body beneath the stable heading while following groups reflow.
The shared downward chevron points toward the inline end when collapsed and
turns down when expanded, including RTL. Reduced motion settles immediately.
Base UI owns disclosure state, presence, native refs and keyboard behavior;
caller StyleX and state-dependent styles remain composable. The panel's inner
body is a layout owner, so direct-child consumer selectors must account for it.

## Command

Command exposes unstyled interaction through `@lenso/primitives/command` and
Lenso presentation through `@lenso/ui/command`. The UI parts own their semantic
StyleX defaults with caller `xstyle` last; the primitive has no styles dependency.
Base UI Autocomplete owns filtering, keyboard navigation, item registration and
active-descendant semantics. Supply a flat `items` collection and render its
filtered entries through List or Collection. The query remains text; executing
an item invokes `onSelect` without replacing the query. IME confirmation does
not execute a command. Disabled and read-only controls cannot execute items.
`data-highlighted` identifies the active item; it is not persistent selection.

Compose with Base UI Dialog when a palette is needed. Dialog owns modal focus,
scroll locking and focus restoration. Applications own shortcuts, asynchronous
search, ranking, route navigation and dismissal. The docs adapter keeps
Fumadocs static index loading and highlighting and uses `filter={false}` to
preserve its external result order. Keep the existing search material, spacing
and responsive geometry as the default Command presentation. The UI package
owns the glass surface, header, results, scrolling viewport and footer; its
Popup and Backdrop compose native Dialog placement and dismissal. Documentation
search uses those parts without a private style map. Command is an owner-authorized additive primitive;
existing primitive families remain unchanged.

Glass buttons inside Command keep the shared Small Glass backing paint. The
panel creates a Chromium backdrop root, so its buttons use the same blur/paint
fallback as buttons inside a translucent Sheet. They must remain visibly raised
over both coloured and neutral dark panels after fitted optics are ready.

## Grouped forms

`Input` and `TextArea` are content-layer fields with ordinary form surfaces.
`TextField` owns field semantics and supporting parts; its input composes
`Input`, and multiline fields compose `TextArea`. `Fieldset` owns the section
semantics and legend. `Fieldset.Group` owns the grouped-secondary background
and 26px outer corners; `TextField` and `Fieldset.Row` own 0.5px inset separators.
Interior fields stay transparent. `TextField.Group` and `FieldGroup` remain
deprecated compatibility entries. Text fields default to row layout in a group
and stacked layout outside it; use `layout="stacked"` for multiline editing.
Row labels stack in groups at most 360px wide. Keyboard focus stays visible
inside group edges. Section descriptions and actions belong outside the group.

## Focus and invalid state

Form controls share one focus language: pointer editing uses the native caret
and selection. Keyboard navigation in grouped rows uses a quaternary neutral
fill and a 2px by 18px tint marker at the logical leading edge, without an
outline around the row. Inner editing controls suppress duplicate indicators.
Standalone fields retain a single 1.5px tint outline. Auxiliary buttons retain
their own keyboard target. Focus does not add an underline, change the material
recipe or replace the independent invalid indicator. Playground parameters
consume these same component rules.

InputOTP uses separate native digit fields, 44px circles with a 1:1 aspect ratio, 22px
tabular numerals and 8px within-group spacing. The 328px row shrinks with its
container; four-digit rows retain intrinsic width. At narrow viewports, gaps tighten while the circular aspect ratio remains. Ordinary fields use grouped-secondary or tertiary fill; opt into
`glass` on the root for floating entry, applying the shared small action
material to each slot. No group adds a second material. Keyboard focus uses the
standalone outline, while an invalid inset edge remains independently visible.
Editing does not change the fill or move the fields.

## Content and control surfaces

List and Accordion's surface variant share the same group surface. Accordion
joins its parent form group and resets the editing context in expanded content.
Form owns submission and 24px section spacing; the page owns the grouped-primary
background. `InputGroup` owns the surface around an input and its
adornments; opt into `glass` only for a floating input above content. Inner
controls never add a second material. A multiline shell keeps stable rounded
corners as it grows. Field editing is stationary by default; glass and elastic
motion are separate choices. Elastic text controls provide press/release feedback;
native editing owns drag selection, scrolling and resizing. `Tabs.glass` likewise selects its outer material,
while `GlassButton` retains its separate action variants and motion contract.

Floating TabBar groups and glass Tabs tracks use the same `glass-small` action
material as GlassButton, with its existing blur, transfer and refraction recipe.
Do not substitute the denser panel material or add a separate gray track fill.
Ordinary Tabs retain their standard segmented-control fill. Native Chromium
backdrop optics also apply to decorative material layers; a material background
must not silently receive only a rim and a blurred paint stack. Other engines
retain their supported fallback rather than claiming native backdrop refraction.

Tabs and SegmentedControl's lifted selection lens samples the composited track.
Its local live-backdrop boundary prevents a copied page image from bypassing
the track's material and showing sharp content through the selected segment.

Tabs motion measures fractional item bounds in list coordinates, compensating
for the list's current elastic scale. Avoid integer offset widths for indicator
placement. A constrained page's item widths must account for both list padding
and inter-item gaps. Align neighboring controls by their visible material bounds,
which can extend beyond their hit areas.

After hydration, the selected-label layer stays above the indicator surface in
Tabs and SegmentedControl. Validate painted text as well as bounds: WebKit can
retain correct label geometry while the indicator covers its pixels.
Before measurement, capsule corners clamp to the rendered indicator height;
custom tab heights must not retain a radius derived from the default height.
Native glass blur remains active until a replacement backdrop has painted.
Loading optical detail must not temporarily remove the existing material.

Horizontal Tabs use a trailing chevron menu for items that do not fit, rather
than an internal scroll viewport. Keep the selected tab visible after a menu
selection or resize, and leave hidden tabs out of indicator optics and pointer
hit geometry. The menu activates the original native tab, preserving controlled
selection, disabled state and tab/panel associations. Vertical lists keep their
scrolling behavior. This overflow presentation is a Lenso convention inspired
by the compact edit menu; it does not claim native iOS segmented-control parity.

TabBar minimization keeps its expanded row, indicator and label optics mounted.
Fade secondary destinations and labels ahead of the capsule's final contraction;
move the current icon continuously into the collapsed circle. Reverse the active
spring from its current position and velocity. Keep collapsed links inert and
transfer keyboard focus through the expand control. Reduced motion settles
immediately, including when enabled during a transition. Initial minimized markup
must retain a collapsed CSS presentation before client measurement.
Consumers must retain the group's flex sizing so the material contracts with
the current destination. Floating fallback paints live inside their fixed or
sticky positioning owner; browser-chrome movement must not depend on a script
updating a separate viewport-positioned paint.
Cache expanded geometry and the current icon's local centre before resizing;
animation frames only write the spring's interpolated values. Root height
changes caused by contraction must not trigger expanded-width measurement.
While resizing, keep the selected icon mounted, hide the indicator and suspend
its copied-label measurement and springs. Refit it after expansion. The group
uses its normal native blur and CSS contour during motion, restoring fitted
optics only when its size settles; preserve the action material recipe.

While the TabBar lens is lifted or moving between destinations, the original
current link uses the ordinary secondary label color. Only content inside the
lens receives the selected tint; `aria-current` follows navigation activation.
Consumers should use `isCurrent` rather than adding a second selected text color
that overrides this transient state.

TabBar taps and keyboard activation use a lightly underdamped position/width
spring (225/21); an actual drag uses the stiff 2500/94 spring. A pointer down
without movement remains a tap. Ignore target-box changes below 0.1 CSS px from
press-scale layout rounding so they cannot interrupt the slide. These values
are a Lenso choice adapted from the upstream Web reference, not a measured native
spring fit. Reduced motion settles immediately.

Decoded glass filters have geometry-specific pixel fields. When a material
resizes, update its filter region and decoded field bounds before paint instead
of displaying the previous circular region on an expanding capsule. Resize an
instance-owned view; never mutate a cached filter shared with another surface.
During this transition, use the existing CSS contour at the current radius,
without stretching a baked circular contour or rim. Replace the temporary view
with exact fitted optics when ready, and discard it on appearance change or
unmount. Keep the material recipe and transparency unchanged.
The foreground rim bitmap follows the same resize rule: suspend its image and
use the current CSS contour while `data-material-resizing` is present.
Continuously morphing surfaces opt into `liveGeometry`: keep the material's
geometry-independent transfer while moving, then install exact optical maps after
the geometry settles. Their eligible foreground rim paints synchronously into a
canvas, using the same pixel-area coverage as the fitted rim. Reuse unscaled
corner tiles and constant edge strips, cropping overlapping tiles to the current
half-size; update the tile recipe when radius or lighting changes. Keep this
foreground mounted at rest as well, so finishing optical work never substitutes
a different hairline. CSS contours remain the fallback for other recipes.
Scaling an old displacement map
can preserve a visible ellipse even with a correctly sized filter region.
Appearance changes during the morph must also keep the old rim suppressed.

An eligible foreground rim also owns its fitted shadow; medium materials prefer
that shadow to the fallback panel outline and broad drop shadow. Initialize live
foreground shadows with the first contour, so installing decoded optics does not
change elevation later. Explicit caller shadow overrides remain first.
Status face washes, including Toast Pill's accent/progress tint, paint beneath
the foreground reflection rather than over it. They retain their color transition
without recoloring the white crest. Light medium surfaces use the Rex reference's
1px white crest and bright inward decay instead of the small-control upper dark
band. This is a measured Lenso Web calibration; dark and small-control rim
recipes retain their existing light distribution.

An owning glass Toolbar or Toolbar.Group also supplies the visual source for
nested morphing Menus. Menu keeps its actual trigger for activation and focus,
but uses the nearest owning surface for placement, shape and temporary masking.
Detached controls remain individual sources. Standalone glass actions have a mild
release overshoot; members of a fusion plane and joined groups keep a damped
return so their shared contour does not repeatedly cross a contact threshold.
GlassButton and GlassToggleButton use pointer-specific enlargement: 6 CSS px on
the longer side for a mouse, 16 CSS px for touch/pen, regardless of component
size. Fusion touch release uses a faster critically damped return (342/37),
while standalone touch retains the reference rebound (342/13.5). Held drags
continue beyond the original hit box without changing native activation rules.
Re-pressing during release measures the resting dimensions and carries spring
velocity into the new target. Reduced motion keeps scale/translation neutral,
including when the preference changes during a gesture; pressed light remains.
Eligible standalone glass foreground rims also brighten while held by pointer or
keyboard, including when elastic motion is disabled. The rim uses clear-profile
light strength without changing backdrop optics, material tone or the saved
clarity preference. Release and cancellation restore the resting rim. Fused
surfaces retain their shared contour and lighting owner.
The generic touch response is faster than the mouse response. Disabled members can deform an
enabled shared surface without becoming actionable. Menu pointer activation
waits for release and rejects a drag, while keyboard/assistive activation stays
with Base UI.

Stacked Menu navigation moves the real child heading between the source row and
its final layout. Interpolate its source weight to the shared semibold heading
weight with the same progress as its position, and reverse both on return.
Preserve glyph proportions when parent and child menu widths differ. Returning
navigation and released menu feedback use critically damped springs. Overlapping
sibling submenus share ownership of parent dimming, scale and interaction;
restore the parent only after its last child returns. Base UI retains focus,
activation and dismissal ownership throughout.

Cascading submenus share Menu's reversible timeline, continuous shape progress
and ink softness. Keep their growing panel attached to the adjoining
edge and source-row height; do not reuse a root Menu's travelling circular
source. The parent row remains visible and undeformed. Content stays anchored
near that row and is clipped to the moving contour. Settled and reduced-motion
states clear transient ink effects; release the parent once after the child's
return, including interrupted or nested dismissal.

Select shares the root Menu morph timeline for both selected-item alignment and
ordinary anchored placement. Base UI still chooses the final placement and owns
selection, scrolling, keyboard operation and focus restoration. Refresh the
returning label from the live trigger when selection changes. Trigger glyphs
stay anchored at their measured size and fade/soften without an additional
ballooning transform. Closing contracts the whole panel toward the source;
width must not collapse ahead of a still-tall body. The returning label follows
the shrinking glass centre. Select keeps its native placement anchor stationary
throughout the return, including touch selection.

Menu and Select openings share continuous width, height and centre trajectories
interpolated from compact Files and tall twelve-action physical iPhone captures.
Roundness settles independently; it must never gate an extra height expansion.
Use monotone cubic interpolation through measured knots to avoid velocity jumps.
Wide labels retain their early narrowing, while circular sources can briefly
neck before blooming. Content follows the moving centre and current contour.
Closing shares compact/tall physical capture profiles across circular, text and
Select sources. Width, height and centre contract together, independently of
corner settling. Glass hands back to source paint at 299ms. Morphing Menu
sources retain a small rebound and lift through 533ms (uniform for circles); Select and
stationary sources finish at the handoff without that rebound. These are sampled Web approximations, not recovered native spring constants.

Menu and Select retain their time-based ink softness, clipping and shape
trajectories while using a lighter glass treatment during motion. Moving panels
use native backdrop blur, the material fill and simple inset/outer shadows;
they do not refract foreground content, paint a live rim or fit panel optics.
Install the existing fitted material after opening settles, and suspend it
again before the closing or reversed morph. Reduced motion reaches the resting
material directly. Cascading submenus use the same policy. This adopts the
upstream Menu's motion-time rendering strategy without changing Base UI
interaction ownership or Lenso's motion profiles.
Once the glass becomes invisible during closing, stop its background painter and
leave only the source's remaining rebound. Closed Select items may stay mounted
for label resolution; their hidden material must not retain background paints.
Resume painting at the current pose when an interrupted return opens again.

With `morphTrigger={false}`, Menu and Select keep their trigger visible and
stationary. Their popups unfold from a compact source near that trigger with
the same lightweight glass and ink softness, without masking or rebounding the source.
Text Menu sources retain their early opening neck, while their content follows
the shared contour. Closing uses the same whole-panel contraction. Base UI retains placement,
selection, keyboard operation and focus restoration in both modes.

Menu panels have a 250px minimum width, 10px block/8px inline outer padding and
42px minimum action rows with 6px block/20px inline inner padding. Icons occupy
24px with a 12px gap. Keep descriptions, checkmarks and constrained scrolling
functional when composing this geometry. Quick action groups own a separate
10px inline inset and 6px inter-action gap. Cancel the content wrapper's inherited
inline padding before applying that group inset; do not preserve a fixed negative
margin tied to an older content padding. Action rows retain a 56px height, 6px
block/4px inline padding and 5px icon-label gap. These horizontal actions do not
inherit the ordinary row's 20px inline padding.

Offscreen glass pauses background observation work while retaining its decoded
source and output. Re-entry alone must not replace a source copy or clear its
paint. Each paused consumer retains real source edits even if a visible sibling
has already consumed that shared source's update.
Prepared shared GPU batches also retain their mounted owners across visibility
changes; an offscreen member must not recreate a visible sibling's canvas.
All-offscreen batches stop drawing, and actual unmounts release their resources.

## Navigation and page controls

Content List and option ListBox have separate interaction contracts. List editing
adds checkbox selection and reorder handles to native content rows, without
changing them into options. List owns the grouped surface and row spacing;
SwipeActions borrows its opaque row fill through `--lenso-list-surface` and only
owns reveal behavior. Use List.Item actions for coordinated rows and List.Section
for group-local reorder boundaries. RefreshControl.Viewport owns vertical
scrolling; disable refresh during list editing. See
[list composition](list-composition.md) for ownership and the integrated example.

SwipeActions is an inline row, not a modal Drawer. Base UI buttons own action
activation; the public useRender contract owns root composition. Horizontal
pointer intent reveals logical leading/trailing actions, while native vertical
scrolling retains ownership. Canceled gestures restore the accepted open side.
Every action group has a visible reveal control and is inert while closed.
Full-swipe execution requires an explicit per-action opt-in. The application owns
removal, confirmation and undo. List.Item composes it within its native `li`;
standalone composition inside a list must also retain native list items.
Touch capture belongs to the root only after transfer: ignore a descendant's
bubbled `lostpointercapture` during that transfer. Non-editable row text suppresses
selection and callout, while focused native editors retain both. Release selection
projects recent movement by 150ms and discards velocity after a 100ms pause; these
are Lenso choices matching the observed slow/fast cases, not a native spring fit.
Actions use 4.5px vertical inset, 10px gap/edge spacing, 63px minimum width and 16px
corners, adapted from the 68pt-row device reference. Solid destructive/tint fills
retain white labels; neutral actions keep readable semantic labels.

WheelPicker composes the existing ListBox selection model with native scrolling
and CSS snap alignment. Single selection follows keyboard focus and stops at the
ends. Geometry scales in rem units and centers measured option bounds. Multiple
wheels remain separate labelled listboxes; the application owns linked values.
After scroll-end selection, center the accepted value in the React commit;
an animation-frame fallback can run before that commit and flash the old value.
Do not write scroll position when the accepted option is already centered.
Keep wheel content on an ordinary surface, without a glass material layer.
The physical-device pass uses a 216px viewport, 32px slots and a 34px band with
9px inline insets at the default 16px root font. The measured band uses quaternary
fill. Project only decorative labels into the wheel; preserve linear scroll and
option semantics and explicit accessible labels. Center emphasis reaches 23px
from a 20px base. The cylinder projection is a Web approximation calibrated to
the observed glyph centers/heights, not Apple's rendering algorithm. Prefer
`scrollend` to avoid prematurely ending browser momentum; retain a debounce
fallback and allow passing intermediate snap positions. Non-editable wheel text
cannot start selection or callout. Reduced motion adds no timed visual animation.

SegmentedControl is a single-value RadioGroup, not a TabList. Base UI owns radio
semantics, directional keyboard selection, disabled/read-only state, native inputs
and validation. Native form reset restores the uncontrolled default after reset
cancellation is resolved. Preserve native change details and cancellation.
It shares Tabs' segmented styles, track/highlight/lens markup and spring/press
controller. `size="sm"` uses 28px segments and `lg` uses 46px segments; `glass`,
`elastic` and `lift` have the same defaults and rendering as Tabs. Short labels
truncate in constrained segments without changing accessible names. Held lens
lift, label refraction, drag release, cancellation and reduced-motion behavior
share one implementation. Radio state and native inputs remain Base UI-owned;
decorative copies are inert, hidden from assistive technology and carry no form
names. Empty options clear decorative copies and display the localizable
emptyLabel. Tabs retain their own tab/panel associations and overflow navigation.

SectionIndex uses real same-page fragment links inside a labelled nav. Arrow
Up/Down and Home/End move focus only; Enter follows a link. Keep one enabled tab
stop, skip disabled entries and leave Tab to the browser. Its 44px-wide strip
owns touch scrubbing, while adjacent content retains native scrolling. Prevent
native link dragging, preserve normal modified clicks, ignore descendant capture
transfer and suppress only the pointer-generated click after a scrub. value is
a current-location marker; application scroll-spy state and section targets remain
application-owned. Anchor the index at the inline end, centered on the list's
viewport, independently of content scrolling. The visible 16px letter column
retains a 44px gesture strip, with 13.8px minimum letter pitch and 11px semibold type.
Do not draw a persistent background behind the current letter. Pointer-down
activates immediately, captures the pointer and tracks every new letter without
a drag threshold; releasing does not activate it again. These dimensions are
Lenso Web choices informed by the iOS 27.2 Contacts reference, not native parity.
The demo uses A–Z/# data with 45px leading avatars, 77px minimum rows, 16px vertical
padding and a 16px avatar-to-text gap. Body text is 17px/22px, weight 400;
36px section headings use 17px/22px, weight 600. Ordinary 1px row dividers start
at the 77px text guide and end 16px from the trailing edge. Section dividers are
also 1px but inset 16px on both sides; the last row has no divider of its own.
The pinned title sits beneath NavigationBar and is pushed out by the next group.
One shared soft ScrollEdge extends behind both navigation and the pinned title;
neither adds a second opaque background. A subdued, full-width device-pixel line
replaces the inset divider at the pinned edge. The visual pinned copy is
aria-hidden; the original heading retains the section's accessible name.
Keep the backdrop at full strength through the combined 96px navigation/title
region, then fade over a further 24px. Stretching a zero-to-clear mask to 96px
instead places the title in its transparent tail and exposes sharp content.
The viewport scrolls instantly and updates the location marker on ordinary scrolling.
Keep scrollbars out of the index's hit area; an overlapping WebKit scrollbar can
intercept input even when the underlying letters remain visible.
Small index text uses the native tint in dark appearance and the darker semantic
tint-text role in light appearance for default-surface contrast.

NavigationBar composes Toolbar with a sticky inline title and an optional large
heading in the scrolling content. Its leading/trailing slots use Toolbar parts;
the application owns routing, history and focus/scroll restoration. `scrollRef`
identifies the scroll owner; otherwise the nearest scrolling ancestor or document
is used. The shared ScrollEdge owns the bar background. Only one title is exposed
as a heading. Long inline titles truncate while large titles wrap; back chevrons
follow direction. The 34px/41px and 17px/22px title roles and 12px collapse threshold
are Lenso Web choices adapted from upstream, not measured native parity.

PageControl defaults to `variant="prominent"`, using the existing small Glass
surface with its rim and shadow in a 26px capsule. Ultrathin paint alone blends
into flat backgrounds and does not provide the intended prominent presentation.
`plain` keeps the same dots and hit areas without a material layer. Only the
selected page is in the Tab sequence. Arrow keys select and focus adjacent pages;
Left/Right follow direction and Home/End reach the first/last page, including
outside the nine-dot window. Selection clamps at the ends. Controlled owners
accept `onPageChange` before keyboard focus moves to the requested page.

## Joined actions and toggles

`ToggleButton` follows the ordinary `Button` family; `GlassToggleButton` follows
`GlassButton`. Both expose a persistent pressed state independently of hover,
pointer press and keyboard focus. `ButtonGroup` accepts action buttons from
either family, and `ToggleButtonGroup` accepts either toggle family. Keep one
family within each group. Joined members have automatic seams and only outside
corners; glass members suppress individual elastic movement while joined.
Detached groups preserve separate shapes and glass elasticity. A shared group
does not imply a single continuous glass optical surface.

## Typography and color implementation

Use `--lenso-font-body` and the typography components for product content.
The documentation framework supplies its licensed Inter presentation. Use
semantic `--lenso-*` roles for backgrounds, labels, tint and status. Theme scopes
support light/dark, standard/increased contrast and base/elevated contexts;
measure the actual foreground and background when changing a pairing.

Color derivation lives in the owning sources below, including explicitly marked
fallbacks. Theme editing and scoping contracts are documented in
[the token package](../../packages/tokens/README.md) and the authored theming guide.

## Dialog and panel roles

Modal is the general-purpose dialog for forms, content inspection and full-screen
work. AlertDialog is for a decision requiring an explicit response. Drawer is
primarily a supporting side panel; Sheet owns bottom presentations with vertical
dragging and detents. ActionSheet presents a focused choice of operations, while
ShareSheet composes Sheet for sharing targets and grouped actions. Keep those
semantic roles distinct; there is no separate public Dialog alias.

Sheet delegates drag and scroll arbitration to Base UI. A scrollable body can
scroll upward at a partial detent; it does not expand the sheet before scrolling.
At full height, downward drags scroll existing content toward its top before the
sheet can move from the scroll edge. Keep horizontal scrollers and Slider/text
editing gestures native. Do not layer a second pointer-capture or manual
scroll-handoff implementation over Drawer.Viewport.

Modal and side Drawer share the desktop Sheet content surface: primary in light
appearance, secondary in dark appearance, 32px corners and the same panel shadow.
Their shared constants live in `packages/tokens/src/shared/presentation.stylex.const.ts`.
Material follows the reference/state map in [Presentation materials](presentation-materials.md).
A solid frame can contain separate Glass navigation controls; partially presented
mobile sheets and compact decision panels retain their referenced Glass surfaces.
Modal/Drawer titles use 20px/25px semibold type, descriptions 15px/20px secondary
type and body content 17px/22px primary type. Headers reserve a dismissal slot;
body regions own scrolling, while headers and footers remain stationary. Use
ordinary Button peers with matching sizes for content actions.

Side Drawer panels have 8px viewport spacing below 640px and 12px above it, with
rounded corners on all sides. Existing physical swipe directions remain supported;
up/down presentations retain their edge-attached geometry. Modal keeps its sizes,
placements and inside/outside scroll contracts; full size remains edge-to-edge.
These are Lenso Web choices aligning the existing content panel family, not an
exact reconstruction of every native presentation.

## Material implementation

`@lenso/glass` owns shared backdrop sampling, refraction and motion; tokens own
material recipes. UI components own semantics and composition. Use the
component's existing material profile and state transitions before creating a
new recipe. Liquid Glass uses the iOS 27 recipe; `ThemeScope` scopes appearance
and glass tint without a material version selector. Backdrop sampling uses the
documented `data-lenso-backdrop` marker; unmarked surfaces use the supported
fallback. Browser rendering differs, so
verify the relevant engine and avoid claiming native or cross-browser pixel
identity. Respect reduced motion, disabled and loading states.

Popover and Tooltip bodies and default arrows share one local Thick-material silhouette and
one backdrop filter. Keep its geometry attached to the native popup during
scaling; independently positioned body paints and separately blended arrows
break continuity. Custom arrow content retains its own presentation.

Soft scroll edges use six overlapping live backdrop filters with variance-corrected
incremental radii and smooth cosine falloff, including a near-clear tail and an
independently masked tint. Their
five broad bands reach a nominal accumulated radius of 3.4 CSS pixels, with
87.5% transitions. A sixth strengthens the bar edge to 4.2 CSS pixels and clears
within its nearest 25%; the merged near-clear tail begins at 0.2125 CSS pixels. The tint uses a cosine raised to 1.35 and default
opacity 0.42 in light mode / 0.81 in dark mode. These values were calibrated against
a controlled iOS 27.2 soft edge, not every native content or bar configuration.
Their outer group stays transparent and unfiltered so it does not isolate child
backdrop sampling. Put bar color in the soft tint, never an unmasked background
that recreates a hard boundary. Photos use this recipe.
Below the desktop TOC breakpoint, the documentation TOC lives inside the sticky
header. Its trigger and expanded contents share the header's single hard edge;
they have no separate backdrop or opaque row background. The edge follows the
combined header height as the TOC opens and closes. The uniform hard material
keeps underlying article text from competing with navigation and TOC links.
Hard edges use a 4.5px uniform blur. Light appearance preserves the actual
backdrop color: no brightness filter or primary-background wash. The previous
brightness 1.1 / 50% fill calibration clipped light-gray surfaces to white and
washed out colored backgrounds in the docs header. Dark appearance applies saturation 1.15 and
59% fill using the primary background raised by 10/255 per channel, clamped.
The initial values were calibrated against a public UIKit hard edge on iPhone 15 Pro
Max / iOS 27.2 with a 96-point bar; photos were held out from fitting. They
supersede the earlier macOS/MyGo recipe. Historical light-mode optical metrics predate the
backdrop-color correction and do not describe the current light default.
Soft-edge tints retain their own earlier values.
Hard edges include one hairline on the content-facing boundary: 0.5 CSS
pixels on high-density displays, black at 10% in light appearance and white at
10% in dark appearance. At lower density a 1px line uses half that opacity. It
shares the material's scroll visibility and follows the full header/TOC bounds,
including when the TOC expands; it is absent from soft edges.
The Web hairline paints just inside the bounds so Safari and clipped scroll
containers retain it. The unfiltered owner holds a separate frosted paint and
the hairline, without applying the backdrop filter to the line itself.
The Web implementation approximates native variable blur; it is not Apple's shader.

## Documentation shell

`apps/docs` is the product documentation and interactive review surface;
`packages/docs` provides the reusable content framework and shell. A component
page should expose its real API, usage and meaningful live examples. Imported
reference snippets are not proof of runnable examples. Keep navigation, search,
source views and locale behavior aligned with the authored content.

Documentation search uses SearchField for native editing and clearing,
CloseButton for dismissal and Kbd for keyboard hints. Fumadocs retains search,
result selection and navigation ownership. Escape dismisses the dialog even with
a query; clearing keeps focus in the field. The search input composes directly
into the panel without a second field surface. A shared medium Liquid Glass plane
is bound to the actual dialog element inside an explicit live-page backdrop scope;
it must not live in a negative-layer child isolated from the page. This keeps
homepage image sources from changing the material's backdrop ownership. The material
and 24px outer corners give the launcher one continuous boundary. The panel is
content-sized up to 640px wide and 460px high. Single-line results use 36px rows;
matched body summaries expand their row to 48px without reducing text legibility.
Result-driven height changes use the renderer's live geometry and continuous
foreground rim; resizing must not swap to the fallback CSS contour. Search
scrolls only its results viewport and restores focus with `preventScroll`.
The panel's entry scales from 0.94 to 1 while fading in over 180ms with ease-out;
exit reverses that presentation over 120ms with ease-in. This Web interpretation
uses Tinycast's general panel entrance scale and duration tokens; its native
launcher itself delegates motion to AppKit. Layout size and query updates do
not animate. Preserve the query until exit completes, then clear it during
close autofocus cleanup so the panel does not change height while fading out.
Reduced motion disables the panel and backdrop animations.
While Radix locks page scrolling, docs use `overflow: clip` on the positioned
body so the header and sidebar remain sticky to the viewport; Radix retains
wheel/touch isolation and scrollbar compensation.
Result rows use a neutral selected fill without individual glass layers. Type icons have no opaque
backing. The backdrop only dims the page, leaving blur and refraction to the
glass planes. Increased contrast and reduced transparency retain the renderer's
opaque fallback. The input has no leading blue marker. Page rows combine titles and matched body
summaries, while indented headings retain independent deep links. Type icons and
trailing labels distinguish pages and sections. One scrolling result region sits
between the input and a floating GlassButton that opens the selected result.
Optional `links` supply real quick-access pages before typing. Existing consumers
need no changes; optional labels localize the result types, sections and actions.
The result viewport uses ScrollShadow with 24px scroll-driven edge fades. Fades
disappear at the corresponding resting edge and when content fits. The mask
belongs only to the scroll region, keeping the panel glass and floating action
outside its compositing boundary. Matching scroll padding keeps keyboard-selected
rows out of the fade bands.

The documentation sidebar aligns section labels, first-level page text and
top-level navigation icons on one leading guide. On desktop this guide is 24px
from the pane edge. Section icons occupy 16px with an 8px gap before their text.
Reserve indentation for genuine child pages. Use logical start/end padding so
inherited item indentation cannot shift the page text independently of labels.

## Ownership and evidence

| Decision                                     | Owning source                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Semantic colors and appearance               | `packages/tokens/src/apple-colors.ts`, `color-system.ts`, generated `themes/default/`      |
| Shared grouped surface and keyboard cue      | `packages/tokens/src/components/surface/surface.styles.ts`                                 |
| Input surfaces and independent invalid state | `packages/tokens/src/components/input/input.styles.ts`                                     |
| Form context and field semantics             | `packages/ui/src/components/fieldset/`, `textfield/`, `form/`                              |
| Optical materials and press behavior         | `packages/glass/` and the token material recipes                                           |
| Documentation row and icon alignment         | `packages/docs/presentation/styles/sidebar.stylex.ts`, `packages/docs/src/site-layout.tsx` |

See [release notes](../../RELEASE.md) for consumer changes. Historical checks
do not verify later source revisions.

## Glass interaction review surface

Ordinary WebKit glass uses native CSS backdrop blur, tone and foreground rims.
It does not automatically copy marked page backgrounds. Menu and Select retain
one native paint owner across moving, resting and submenu states; they do not
switch to owned snapshots on WebKit. Chromium retains its moving paint until the
fitted optical images decode. Other explicitly owned backdrop snapshots,
foreground content lenses and Fusion remain separate rendering paths.

Registered Menu scenes include the root and its native submenu ownership chain,
including portals across a preview shadow root. A complete owned material retires
the hoisted native panel paints until invalidation; the two must never stack.
Keep the fitted clear-end optics when the analytic material cannot represent it.

The bilingual `/en/glass-lab` and `/cn/glass-lab` routes provide a focused
review surface for shared materials and motion. Drag the glass members or use
arrow keys after focusing one, change their layout gap, open the photo menu,
and vary local appearance/tint. At the clear end, tint reduces blur and changes
the brightness, contrast and saturation transfer; changing the preference invalidates fitted optics
without requiring a resize. Existing `glassTransparency` semantics remain
independent: opacity covers the selected appearance without resetting its blur
or transfer, including through portals and shared fusion washes. In WebKit's
copied-source path, interpolate the regular post-refraction softness with the
sharp source as clarity increases; tiny Gaussian radii alone quantize into an
endpoint jump. Keep source blur, refraction, tone and foreground light enabled.
Standalone untinted iOS 27 materials interpolate fitted tone by control size
(60–120 CSS pixels). SVG and GPU renderers share the dark luminance/chroma tables;
the CSS fallback uses an approximate contrast/brightness/saturation chain.
The dark SVG tone graph evaluates straight RGB on opaque backdrop input; blur
coverage must not multiply through its arithmetic stages. The lens owns the
finished material's clipping. Verify partially covered input as well as opaque
color samples to catch black bands and cross-engine material differences.
When a marked photo no longer covers a copied lens, retire that copy and restore
the native page material, including the small material's backing paints. Retain
the input for scrolling back into the photo, hide the fallback while the copy
owns the face, and fade the regular backing with the existing clarity preference.

Untinted standalone iOS 27 glass paints its fitted directional rim above the
preference wash, with a 1px outside hairline. Inner depth must survive maximum
tint without changing foreground ink opacity. This foreground also owns edge shading:
do not stack the legacy rectangular post-tone shade or contour beneath it. Carry
that ownership through SVG, fitted GPU and analytic core renderers. Inner shade
must fade from the rim, without a detached crest or a flat-sided inset frame on
pale backgrounds. Check delivered rim pixels as well as filter ownership. Reuse decoded rim output with its
lens; do not regenerate it per animation frame. Integrate pixel coverage in the
narrow dark/light boundary using premultiplied color and alpha; a center-only
sample makes oblique hairlines break into isolated dark pixels. Keep internal
shading and texture resolution independent of this edge antialiasing. Suppress this local paint while
a shared fusion contour is visible. Colored and knob recipes retain their
own ownership. Standalone default shadows follow fitted size; explicit caller
shadows retain priority.

Generic Glass starts with neutral pre-material saturation, matching GlassButton.
For compatible fused members, the shared surface owns the preference wash once,
including the connecting neck. Suppress each member's local wash only while that
shared surface is visible, and restore it when fusion ends. Different preference
paints cannot share one material plane. Matching flat face colors does not
establish matching edge optics or interaction highlights.

Compatible untinted iOS 27 small/clear fusion groups use the reference's
large-surface linear transfer, without per-button inner shading. Standalone
controls retain their size-fitted transfer. Tinted and other profiles
retain their existing material recipes. Group outlines use the reference's 1px
hairline, .67px directional rim and 4px-offset/4px-blur shadow, with
24px contour padding. A live vector shadow sits behind the material; copied
backgrounds include only that pure shadow before blur/refraction/material tone.
Never sample the completed glass as its own input. Source-shadow copies share
the live path and are positioned relative to each retained optical plane.
Generated shadow writes must not wake the fusion geometry observer. Other
material roles keep their existing input/backend ownership.

GlassContainer uses a bounded smooth union with `spacing` as its actual blend
radius (default 20 CSS px, without the old 1.9 multiplier), so its
neck broadens as members approach. Its continuous vector contour is shared
with optical clipping; a surrounding paint margin accommodates the swelling.
Publish each decoded optical field together with the coordinate plane it was
fitted against. While the next field prepares, retain that plane and translate
the live contour into its coordinates, intersected with the preceding silhouette
so stale optical pixels cannot cover newly exposed areas. Unchanged tracking frames must not
overwrite the retained plane. A geometry-independent backing covers newly
exposed areas; exact shading belongs to the decoded lens. The browser regression
`apps/docs/test/glass-fusion-continuity.mjs` holds image decoding to verify that
moving one member does not change a stationary member's background.
Optical field preparation shares one module worker across fusion planes. Each
plane permits one in-flight field and retains only its latest pending geometry;
the live contour stays on the presentation path. The worker uses the same
full-resolution field and material equations as the synchronous fallback.
Disposal cancels that plane's pending publication and the final owner terminates
the worker. Unsupported or blocked workers retain the synchronous material path.
Eligible aligned planes can use worker WebGL 2 for displacement, with the
original double-precision sampler repairing uncertain quantized pixels before
encoding. Keep the CPU material path for unsupported geometry or lost contexts.
Reuse only released, detached filter graphs within their bounded cache; decode
new image inputs before publication. Generated optical SVG resources must not
recursively invalidate backdrop consumers. Exterior painting may skip pixels
outside the traced contour support, while retaining the same coverage and light.
Generate only fields consumed by the selected composition: a compatible shared
plane owns its visible rim and contour separately, but spectral edge saturation
still requires its highlight map.
Measure renderer savings separately from aggregate renderer, GPU and browser
process CPU.
Menus sample independent width, height, center, content zoom and roundness
channels on separate time-based opening and closing paths, including the closing
drop and trigger return. Interrupted motion carries the current pose and velocity
into the new trajectory. Base UI still owns interaction and placement; touch
scrolling in constrained menus and modifier keys on scrub activation stay native.

GlassButton uses a white .34/.30 light/dark active wash and a .035 local
light with a 240px radius and .025 midpoint, while shared lighting continues
across the neck. Forced colors suppress these washes, including focused states.

## Documentation header controls

Home and documentation headers order utilities as search, language, appearance,
then the repository link. Keep the theme preset picker beside the light/dark/system
selector in one appearance group; the external repository link ends the sequence.
DOM order follows visual order so keyboard navigation preserves these relationships.
Peer controls have 32px outer heights on desktop and 44px below 768px. The segmented
selector includes its padding in that height. Theme presets retain text on desktop
and use an icon on narrow screens. The theme settings surface uses Popover with
Slider and ListBox; menu semantics do not fit its editable appearance controls.
