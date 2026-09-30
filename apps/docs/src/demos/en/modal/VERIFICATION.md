# Modal and alert-dialog live scenarios

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` (Apache-2.0).
The registered JSON records remain reference snippets; the adjacent TSX files
are the native live implementations.

## Implemented

- Modal: **14/14** registered source paths, including the existing default.
- Alert dialog: **14/14** registered source paths, including the existing default.
- Total: **28/28**. No generic-basic re-exports or placeholder scenarios.
- Only these two demo directories changed. No primitives, package code, shared
  helpers, generated registries, imported snippets, or configuration changed.

Each file retains the source scenario, content hierarchy, trigger labels and
distinct actions. Geometry, backdrop variants, portal containers, form fields,
status tones and animation examples use native parts and compiled StyleX.
Custom icons retain the upstream Gravity icon imports.

The interaction contract is deliberately native:

- Controlled state lives on `Root`, not `Backdrop`.
- The second controlled example uses `useReducer` for open/close/toggle actions,
  rather than recreating the React Aria `useOverlayState` compatibility API.
- Explicit close controls compose `Close` with `Button`. Programmatic close
  examples use the native Root `actionsRef`, rather than emulating Dialog child
  render props.
- Dismissal examples cancel the appropriate native open-change reason.
- The contact form has five associated labels and real browser email validation;
  a valid submit closes its controlled Root.

## Evidence

Checks used an isolated scratch copy of the implementations and the parent's
read-only dependency graph. Consumer StyleX used `dev: false` and no CSS layers.
The browser loaded extracted consumer rules plus the parent's compiled package
CSS, including its theme imports and assets.

- Focused strict TypeScript: pass.
- oxlint: zero warnings/errors across all 28 TSX files.
- oxfmt: all 28 TSX files pass.
- StyleX Babel extraction: all 28 consumers compile.
- Chromium: **112 scenario/theme/viewport cases** pass, covering all 28 examples
  at 1280 × 800 and 390 × 844 in both light and dark themes. Every available
  trigger opens an overlay, a real action closes it, popup geometry is nonzero,
  and there is no horizontal overflow. The complete-theme run was split into
  97 cases and the remaining 15 after a terminal timeout.
- Four distinct backdrop/Escape dismissal assertions pass.
- Targeted checks: **12/13 pass**. Both families pass custom portal containment,
  top/center/bottom positions, cover bounds, focus containment/return, and reduced
  motion with RTL. Modal passes inside-body scrolling and actual form
  label/email-validation/submit behavior.

## Native blockers handed to the parent

These are not claimed complete:

1. Modal outside scrolling centers a popup taller than the viewport, putting
   its beginning above the scroll origin. At `scrollTop = 0`, the 30-paragraph
   source scenario had popup top `-1388px` in an 800px-high viewport. This is the
   one failing targeted check and requires a native viewport/style fix.
2. `AlertDialog.Icon` has no source default status glyph when children are
   omitted. Source scenarios intentionally specify the status variant without
   substituting unrelated consumer artwork.
3. Bare `Modal.Close` and `AlertDialog.Close` have no source close glyph. The
   composed footer actions work; the native close-trigger default needs recovery.

The parent owns native fixes, full docs integration/browser verification and
the other four overlay families. The scratch checks are not a claim of final
side-by-side visual parity at every breakpoint or nested overlay combination.
