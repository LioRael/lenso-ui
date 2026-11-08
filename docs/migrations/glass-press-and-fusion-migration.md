# Glass pressed lighting and connected optics

No prop or import changes are required.

GlassButton and GlassToggleButton now show a bright neutral pressed fill in both
light and dark appearance, with a dark pressed label for default controls, and
touch-position glow immediately on pointer or keyboard press, fading out over
220ms. Reduced motion removes the fade. Disabled and pending buttons do not
light up. The feedback works with `elastic={false}` and joined button groups;
persistent toggle selection remains independent. Prominent controls retain a
tinted pressed fill. Existing generic Glass retains its lighter hotspot.

Elastic enlargement is stronger for this family: icon-only sm/md/lg controls
grow by approximately 12/14/20px. The example's 50px circle therefore reaches
about 70px when held. The damped return does not undershoot the rest size, avoiding
repeated fusion-threshold crossings. Other elastic control families retain their
existing motion settings.

The glow is limited to actionable glass controls. Menus and floating content
panels do not acquire an entire-panel pressed fill.

GlassContainer now derives refraction, contour and neck lighting from a combined
distance field through the existing optical pipeline. Matching recipes share one
surface behind their content and one continuous press-light field; mixed recipes
keep separate geometry-aware lenses. A separate exterior contour follows both
concave neck shoulders, including while motion uses lighter paints. Its native
member lenses remain available and are restored on separation, disabling or preference
changes. Matching material recipes and a marked `data-lenso-backdrop` source
give the most coherent result. Different tints/profiles and the unmarked WebKit
material-paint fallback cannot guarantee identical optics across a join.

The reference review uses equal resting heights for the circle and capsule. The
circle is taller only during press. Activating it updates a counter; a separate
spacing control handles separation, so pointer release cannot change layout.
It does not establish Apple's private rendering technique or native pixel parity.
Use small groups; optical-map generation is asynchronous and coalesces intermediate
geometry updates. WebKit uses a lighter material-paint path during motion for
matching untinted Small Glass, restoring full optics after 100ms of stable
geometry. Both paths retain the exact same outline and fixed container coordinate
system; stale asynchronous optical frames are discarded. Rotated/skewed shapes and unequal
corner radii remain unsupported.

Visual decisions: the active fill communicates direct manipulation; the touch
glow locates the press; the shared distance field removes internal lens boundaries;
the unequal-shape example exercises the geometry in the supplied reference.
The existing documentation design stays at energy 1, rhythm 1 and motion 2.

## Light medium surfaces and Toast Pill

Eligible modern medium surfaces now use their fitted foreground shadow instead
of combining the foreground rim with the older panel outline and broad drop
shadow. Explicit `--lenso-glass-panel-shadow` and `--lenso-glass-shadow` overrides
retain precedence. Consumers that intentionally need the previous elevation can
continue to provide an explicit shadow; no component prop changes are required.

Toast Pill's accent/progress wash now belongs to the material face beneath its
foreground reflection. The tint no longer recolors the white crest. Light medium
rims follow the supplied Rex reference's 1px white crest and bright inward decay;
dark and small-control rims retain their existing light distribution. The live
foreground and its shadow are available before decoded optics and remain mounted
during state/size changes. This changes appearance, not native toast management,
focus, dismissal, actions or reduced-motion behavior.
