# Search material ownership across home and docs

## Change

Search previously bound its glass renderer to a negative-layer child of an
isolated dialog. Its source selection also depended on route ancestry: the home
route could select a marked showcase image, while the docs header declared a live
page backdrop. A flat documentation background concealed these differences.

The renderer and material styles now belong to the actual Fumadocs dialog root.
A display-contents live backdrop scope surrounds the dialog and overlay, so both
routes use the complete page rather than an unrelated local image source.
The redundant decorative glass child is removed. Search editing, ordinary result
selection, compact layout and result-edge masks retain their existing owners.

## Verification

- Documentation package build, documentation/app typechecks and affected lint
  and formatting passed.
- The maintained browser check is `bun run --filter @lenso/ui-docs test:search-material`.
  It covers home/docs in light/dark Chromium and WebKit, tests that an isolated
  child cannot own the material, checks fallback paints remain outside the dialog's
  backdrop root, and compares rendered detail against a native blur control.
- Chromium passed rendered high-frequency backdrop checks in all four cases.
- Headless WebKit passed backdrop ownership checks. Its native CSS blur control
  also left the test stripes sharp, so this backend does not establish material
  pixel acceptance. The test reports that limitation rather than treating CSS
  properties or missing pixel evidence as visual success.
- Actual Safari was inspected through its native UI at the owner's existing
  `http://127.0.0.1:3000` preview. Both the Button documentation page and home page
  displayed a frosted search panel after the change. The original Button page was
  restored after review. This native inspection covered light appearance.

The new regression targets route-dependent material ownership, which the prior
docs-only interaction checks did not exercise. It uses an independent native blur
control so an unavailable rendering backend cannot masquerade as an application
regression or a passing visual check. Screenshots are inspected in memory and
are not retained by the test. No production build or release was performed.
