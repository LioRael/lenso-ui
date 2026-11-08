# Shared Glass core in documentation

Date: 2026-11-06

The production `@lenso/glass` integration now discovers documentation backdrop sources after the control is near the viewport. The docs use the existing component API and retain the iOS/iPadOS material styling; no separate demo or backend selector is required.

## Observed behavior

Checked the live documentation server at `http://127.0.0.1:3000` in the in-app Chromium browser:

- `/en/docs/react/components/glass-button`: one `data-glass-renderer="shared-core"` surface in the live preview, no console errors. The surface remained active after resetting the desktop viewport override to the normal narrow pane.
- `/en/docs/react/components/toolbar`: two shared-core surfaces in the live preview. Toolbar is now classified as a material scene so its groups can sample the preview background.
- `/en/docs/react/components/menu`: live playground now registers the same explicit page backdrop owner as the existing example. Scroll timeline animations no longer prevent static captures forever. The follow-up now records the relevant Tabs/ScrollShadow masks and clipping and displays a shared-core root popup in Chromium and native Safari. See [Menu and Safari validation](glass-menu-safari-validation.md) for scope and remaining opening performance issues.

Owned pixel captures have a shared-core rendering path before the legacy SVG snapshot path. Unsupported input retains the existing material. Menu capture coordinates now preserve raster phase for negative offsets and include the optical sampling margin. The follow-up supports the gradient masks and path/inset clips used by this page; it does not add general DOM capture support.

## Verification

- Glass typecheck: 57 files, passed.
- Docs typecheck: 2,245 files, passed.
- Affected files: formatting and lint passed.
- Glass unit tests: 22 passed.
- Targeted DOM tests: 4 passed, including a new regression showing document-time animation blocks capture while scroll-time animation permits capture and scrolling invalidates the snapshot.
- Installed-package consumer: passed (exports, types, SSR and production assets).

Screenshots: `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1afcc-7814-7cd3-a626-6dd7915f00d9/glass-core/docs-integration/` (`glass-button.png`, `toolbar.png`). Desktop checks used 1280 × 900 and the override was reset afterward.

The initial pass did not establish Safari rendering. The linked follow-up verifies native Safari for the default Menu; iOS behavior, production-docs acceptance, and comparative performance results remain unverified. No release, deployment or landing was performed.
