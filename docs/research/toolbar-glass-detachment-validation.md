# Detachable toolbar glass groups

The follow-up [material continuity review](glass-material-continuity-validation.md)
supersedes this initial check's material conclusions after user-reported visual
defects. The checks below establish the original behavioral scope.

`Toolbar.Group isDetached={state}` controls a shared capsule that separates into
individual `Toolbar.Button` controls. Keep the prop present in both states;
existing groups without it require no migration. The runnable example lives in
`apps/docs/src/stories/toolbar-glass-group.tsx` and is included in the glass
container demonstration.

The transition communicates a spatial relationship between persistent actions.
It takes 250ms using the existing in-out easing token. Transforms reserve the
final 40px separation so the toolbar and optical canvas remain stationary.
Inside corners unfold while one distance field changes from a full capsule to
a neck and then separate lenses. This avoids drawing internal button borders
through the joined material. Reversing state retargets the current transition.
Default glass materials use an immediately available material paint during
movement, then hand off to full optics after the replacement backdrop is ready.

Native Base UI controls own actions, disabled state, render callbacks, refs and
roving focus throughout. Joined buttons suppress independent press movement;
detached buttons regain elastic feedback. Reduced motion changes arrangement
immediately while preserving the static joined material.

## Verification

- Chromium and WebKit: full capsule, paused intermediate neck, separate lenses,
  reverse joining and interruption passed. Intermediate mask center alpha was
  255 with a 36px neck through 44px controls. The group stayed 267.875px wide;
  final gap was 40px. Button DOM identity and keyboard focus persisted.
- Both engines: horizontal, vertical, RTL, light/dark, reduced motion and 390px
  layout checks passed. Arrow navigation and action clicks updated the counter.
  There were no page or console errors in the toolbar checks.
- Thirteen glass tests, fifteen component/fusion/toolbar DOM checks and the
  installed-consumer production test passed. Affected formatting/lint, glass,
  tokens and UI type checks, package builds and docs contract generation passed.
- Testing-package typecheck still reports the existing unsupported `variant`
  prop at `packages/ui/test/components.dom.test.tsx:199`; the new test has
  no type diagnostics. A full production docs export and native iOS device
  acceptance were not run. This is a Web material approximation.

## Scoped delivery gate

- Hard Gate PASS: the built demo has working split/join and counter actions;
  both engines verified keyboard operation, both themes and no mobile overflow.
  It introduces no fabricated content, navigation, assets or async flows.
- Purpose Gate PASS: the glass treatment is the requested component subject;
  a single shared field makes the intermediate connection one material, and
  reserved spacing prevents surrounding controls from moving during separation.
- Liveliness PASS: the existing docs direction remains energy 1, rhythm 1,
  motion 2. The toolbar group is the focus; split/join is its deliberate motion
  accent. Existing tokens, typography and surrounding layout are retained.
- Craftsmanship PASS for this scope: native controls and action handlers persist
  across state changes; checked geometry, disabled state, caller rendering,
  callback refs, interruption and reduced motion have concrete coverage above.

Rendered evidence remains outside the repository in the session visualization
directory. No commit, publication or deployment is part of this change.
