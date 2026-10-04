# Overlay Storybook batch

## Authority and boundary

HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, is the source authority.
All five complete raw story files were fetched and read, not inferred from
an export inventory or documentation snippets.

Raw URL pattern:
`https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/<family>/<family>.stories.tsx`

| Source file                             | Lines | Raw SHA-256                                                        |
| --------------------------------------- | ----: | ------------------------------------------------------------------ |
| `alert-dialog/alert-dialog.stories.tsx` |   811 | `890738b77eaa837b635d92e7c31ec10ff43665a8f0c0ce7155b81c57fed4f192` |
| `drawer/drawer.stories.tsx`             |   308 | `c63851b8d7add5597e3ac657eb91ab7c8aa801786f6b10b0b2441df328197a80` |
| `modal/modal.stories.tsx`               |   832 | `6132ad86be248ff05e657ffb3891d7eed0cbb6542ace64d5fb0d2a79237fd3a4` |
| `popover/popover.stories.tsx`           |   254 | `f612f949843ec083603ce7c76edea1da803b212c69137e3eb483fef08db4f277` |
| `tooltip/tooltip.stories.tsx`           |   122 | `45a7d027bc170545fc3f50f40e85ab6614291096eff17c1948cc98287384ff80` |

Only these five stories, `stories/overlay*` fixtures/styles/proofs, and this
evidence file belong to this batch. Shared Storybook configuration, inventory,
coverage, README and smoke scripts remain parent-owned. No changes to package
implementations, styles packages, primitives, dependencies, docs, release or
landing were made by this batch.

## Exact named exports

Order matches the complete immutable source files. Every export is a live
composition, not an alias to `Default`.

| Family       |  Count | Exact exports, in source order                                                                                                                                                                               |
| ------------ | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Alert dialog |     13 | `Default`, `Statuses`, `Placements`, `Sizes`, `BackdropVariants`, `CustomIcon`, `CustomBackdrop`, `DismissBehavior`, `CloseMethods`, `Controlled`, `CustomTrigger`, `CustomAnimations`, `CustomPortal`       |
| Drawer       |      8 | `Default`, `Placements`, `BackdropVariants`, `WithForm`, `WithScrollableContent`, `NavigationDrawer`, `NonDismissable`, `Controlled`                                                                         |
| Modal        |     13 | `Default`, `Placements`, `BackdropVariants`, `Sizes`, `CustomBackdrop`, `DismissBehavior`, `CloseMethods`, `ScrollComparison`, `Controlled`, `WithForm`, `CustomTrigger`, `CustomAnimations`, `CustomPortal` |
| Popover      |      5 | `Default`, `WithArrow`, `WithCustomContent`, `SpringAnimation`, `CardWithHelptext`                                                                                                                           |
| Tooltip      |      3 | `Default`, `WithTrigger`, `CardWithTooltip`                                                                                                                                                                  |
| **Total**    | **42** | **42 source exports, 42 production-index entries**                                                                                                                                                           |

## Implementation

- Native Base UI `Root`, `Trigger`, `Portal`, `Viewport`/`Positioner`, `Popup`,
  `Title`, `Close`, and drawer `Content` own overlay interactions. Trigger and
  close buttons use native `render` composition; action callbacks use `onClick`.
- Controlled roots use native `open`/`onOpenChange`. The two modal/alert
  controlled paths retain both React state and the exported `useOverlayState`
  hook. No upstream React Aria ordinary controls are imported.
- Form field `name` remains on native `TextField`; HTML input `type` moves to
  `Input`. Native label association is exercised through accessible textbox
  names. Source form examples remain close-action forms, not invented submit
  handlers, persistence or validation flows.
- Drawer edge examples use native `swipeDirection`: bottom → down, top → up,
  left → left, right → right. They consume the parent-rebuilt drawer package
  styles and real `Content`; no shadow drawer component or package workaround
  is introduced.
- Popover and tooltip retain source `offset`/`placement` controls and all 22
  placement choices. Story-only placement translation maps to native
  `side`/`align`/`sideOffset`, including `inline-start`/`inline-end`.
  Tooltip retains `showArrow: true`; popover default args remain `{}`.
- Source destructive, status, password-reset, settings, contact/profile,
  terms/navigation, help-card, attachment, custom portal and animation content
  is retained. Prose mentioning upstream RAC APIs is reference copy, not a
  claim that Lenso supports those props.
- Source utility geometry, colors, gradients and motion are compiled StyleX.
  No Tailwind runtime or ordinary-control RAC facade is added.
  Kinematic entry/exit is 400/200 ms with the source cubic Béziers; fluid slide
  is 500/200 ms with source offsets; popover spring entry is 600 ms with
  `cubic-bezier(.36,1.66,.04,1)` and retains the native 100 ms exit.
  Reduced-motion overrides remove transition duration.

### Native differences and remaining fidelity limits

1. Upstream `Button slot="close"` is represented by native `Close` rendering a
   Button. The source Dialog child callback's imperative `renderProps.close()`
   is represented by controlled React state and native `onClick`; Base UI
   Popup children do not expose that RAC callback. Source copy is retained,
   but these are deliberate native adaptations, not API aliases.
2. Source backdrop props `isDismissable` and `isKeyboardDismissDisabled` are
   root change policies expressed with native `details.reason` and
   `details.cancel()`. `DismissBehavior` proves its explicit blocked outside
   press and blocked Escape cases. Base UI AlertDialog's ordinary default
   Escape policy is **not** the source's documented default of disabled Escape.
   Ordinary alert examples keep the native default; do not claim default
   dismissal-policy parity. No package-level normalization was added.
3. `UNSTABLE_portalContainer` becomes native `Portal container`. Custom portal
   containment is proved inside a transformed host. This is not proof of every
   stacking-context, nested overlay, clipping or pointer-device permutation.
4. Actual mobile-sized geometry is tested at 390×844; physical mobile keyboard,
   virtual-keyboard resize behavior, touch swipe/snap physics and device Safari
   were not tested in this batch.
5. All source placement choices are offered, but focused floating-placement
   proof covers right side with offset and arrow; it is not an exhaustive
   RTL/collision/22-placement geometry matrix.
6. No rendered upstream comparison was performed. Production screenshots,
   geometry and motion assertions are reconstruction evidence, **not full
   pixel parity**, font parity, color-contrast certification or upstream
   animation-curve visual equivalence.

## Source assets and licenses

HeroUI-derived source retains Apache-2.0 notices; the existing full license is
`../../third-party/heroui/LICENSE.txt`. Gravity UI shapes remain MIT,
YANDEX LLC, with the existing full notice in `GRAVITY-ICONS-LICENSE.txt`.

The original Gravity UI icon IDs are used as actual SVG masks from Iconify,
not substitute drawings. Source sparkles/confetti occur only in the original
animation and backdrop examples. No new branding assets were generated.
These remotely served icons are not immutable to the HeroUI source SHA.

Zoe's original image URL is unchanged:
`https://img.heroui.chat/image/avatar?w=400&h=400&u=5`.
The proof's optional read-only transport replay fulfills original curl-fetched
bytes, with no placeholders or fallback image substitution. It prints and
writes URL, byte-count and SHA-256 evidence. This run decoded the real avatar:
31,949 bytes, SHA-256
`f2aa48ec3a5738d3bbb370396d4de87225f467cb7a96d947611fbf0ed601fcad`.
All 16 used Gravity icon SVG URLs also returned original bytes and were
decoded before screenshots. The real avatar is decoded before profile captures.

## Verification and rerun

The concrete failures guarded here are missing source exports, inert overlay
stories, failure to open individual variant examples, wrong theme/role,
nonfunctional close/focus return, broken controlled state or custom portal,
ignored dismissal policies, misplaced edges/sizes, non-scrollable content,
mobile form overflow, and lost custom/reduced-motion transitions. Existing
non-overlay Storybook smoke coverage did not prove these failures.

Validated with **Node 24.18.0** and the workspace's **pnpm 11.5.0** installation:

- Fresh tokens distribution from current styles source, then fresh UI
  distribution from current React source, built exclusively in scratch.
- Strict full Storybook TypeScript check against those fresh distributions.
- Full production Storybook build with the existing compiled StyleX plugin.
  Expected bundler warnings about third-party `"use client"` directives and
  plugin timings remain; build succeeded.
- Scoped oxfmt and oxlint; source emoji image-role suppression is deliberate:
  an emoji has an accessible image name but no HTML image URL.
- Production index count and exact exports checked against the raw source pin.
- **84 distinct story/theme combinations**, all **154 variant/composition
  popup openings** across both themes; all popups really opened and closed.
- Focused keyboard Enter/Escape and focus return; explicit nondismissal;
  controlled closing; custom portal containment; follow/unfollow state;
  native right-side placement/arrow/offset control; custom animation durations;
  all dialog size widths, all drawer edges, desktop dialog placements;
  opaque/blur/transparent backdrops; mobile forms and auto bottom placement;
  scrollable modal/drawer bodies with stationary footers; reduced motion.
- Zero page runtime errors. Settled, font-ready light/dark screenshots emitted
  for all defaults plus selected advanced examples. React Doctor's local,
  explicit six-file scan reported no issues; numeric score was unavailable
  with telemetry/score API disabled. No score-regression claim is made.

Rerun without adding links or dependencies to the repository:

```sh
# SCRATCH must be a new empty directory outside the checkout.
# DEPS is an existing read-only checkout with installed workspace dependencies.
# Set PATH to the Node 24.18.0 installation first.
node packages/storybook/stories/overlay-build.fixture.mjs "$SCRATCH" "$DEPS"

PLAYWRIGHT=$(node -p "require.resolve('playwright', {paths: [process.argv[1] + '/packages/react']})" "$DEPS")
OVERLAY_VERIFY_PIN=1 OVERLAY_ASSET_REPLAY=1 \
  node packages/storybook/stories/overlay-proof.mjs \
  "$SCRATCH/overlay-storybook-static" "$PLAYWRIGHT"

"$DEPS/node_modules/.bin/oxfmt" --config packages/standard/oxfmt.json --check \
  packages/storybook/stories/{alert-dialog,drawer,modal,popover,tooltip}.stories.tsx \
  packages/storybook/stories/overlay* packages/storybook/OVERLAY-EVIDENCE.md
"$DEPS/node_modules/.bin/oxlint" --config packages/standard/oxlint.json --deny-warnings \
  packages/storybook/stories/{alert-dialog,drawer,modal,popover,tooltip}.stories.tsx \
  packages/storybook/stories/overlay*
```

Set `DELTA_SCRATCH_DIR` for screenshots and `overlay-proof.json`; otherwise
browser assertions and console evidence still run. The build script uses
scratch-only dependency links, local fresh workspace package links and caches.
No parent writes, repository dependency links, production serving writes,
commits, releases or landing operations are performed.
