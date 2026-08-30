# Page Layout Design QA

## Reference

- Figma file: `H2JoXtMe808gFetAPE9tN6`
- Component set: Page Layout `565:1383`
- Contexts: Dashboard `565:399`, Data Table `565:723`, Data List `565:1040`, Settings `565:1382`
- Sidebar sources: App Sidebar `565:15`, Settings Sidebar `565:1042`
- Comparison viewport: 1280 x 720

## Visual comparison

Each implementation screenshot was compared beside its matching Figma export at the same viewport and state.

| Context    | RGB MAE | P95 per-pixel delta | Pixels over delta 12 |
| ---------- | ------: | ------------------: | -------------------: |
| Dashboard  |  0.4821 |                0.00 |              0.7496% |
| Data Table |  0.4832 |                0.00 |              0.7510% |
| Data List  |  0.5010 |                0.00 |              0.7633% |
| Settings   |  0.9474 |                0.00 |              1.1431% |

The remaining visible variance is limited to browser font and vector-edge antialiasing. Shell geometry, sidebar rhythm, selected rows, main surface, and utility placement match the reference.

## States and behavior

- Light: Passed for all four Figma contexts.
- Dark: Passed for App and Settings sidebars, including icons, selected rows, search surface, and content hierarchy.
- Narrow preview: Passed at a 720px browser viewport; the 1280 x 720 contract scales to 648 x 364.5 without clipping or reflow drift.
- Disclosure: Passed; Workspace expands and collapses with the correct accessible state.
- Navigation selection: Passed; App and Settings items move `aria-current="page"` and `data-state="selected"`.
- Settings search: Passed; filtering `billing` leaves the Administration / Billing result and clearing restores the full navigation.
- Group header hover: Passed in Light (`#e7e7e8`) and Dark (`#18181a`); the 220px header background matches Linear and the item width while the inner trigger stays transparent and label/action geometry remains stable.
- Sidebar browser test: Passed for 244px panel width, 28px rows, 29px row rhythm, nested rhythm, section-action placement, dark surface, and axe checks.

## Engineering verification

- `pnpm check`: Passed, including formatting, lint, generated artifacts, type checks, 93 UI browser tests, and the documentation production build.
- React Doctor changed-scope scan: 85 / 100, no issues found.

## Result

Passed.

---

# Tokens Tree Design QA

## Evidence

- Source visual truth: `/var/folders/hp/q9psfx3j2l58mrp6g7d8x8000000gn/T/codex-clipboard-2c80ca74-7fb2-455d-91e4-03a5dc6964d3.png`
- Browser-rendered implementation: `docs/design-qa/tokens-tree/implementation-dark-1200x737.png`
- Side-by-side comparison: `docs/design-qa/tokens-tree/reference-comparison-1200x737.png`
- Responsive evidence: `docs/design-qa/tokens-tree/implementation-responsive-720x900.png`
- Comparison viewport: 1200 x 737 CSS px at device scale factor 1.
- Source pixels: 1200 x 737. Implementation pixels: 1200 x 737. No density normalization was required.
- State: dark page theme, Semantic tokens / Color / Surface expanded, `color.surface.canvas` selected, token mode set to Dark.

The source and implementation were combined into one 2400 x 737 comparison image before review. Focused-region review covered the tree row rhythm, selected token row, mode control, preview surface, values, CSS variable, type, path, and copy actions. No separate crop was needed because these details remain legible in the 1:1 comparison.

## Required fidelity surfaces

- Fonts and typography: Passed. Existing IBM Plex Sans and IBM Plex Mono preserve Lenso's hierarchy while matching the source's sans/monospace split, compact labels, and dense tree values.
- Spacing and layout rhythm: Passed after two iterations. The source's full-height tree-plus-inspector composition now occupies the complete workspace below the existing Lenso header, and all inspector fields fit at the source viewport.
- Colors and visual tokens: Passed. The implementation uses the repository's semantic CSS properties in Light and Dark instead of hardcoded page-theme colors.
- Image quality and asset fidelity: Passed. The source contains no raster product assets; token previews are functional representations of the selected generated token, and icons use the repository's existing icon dependency.
- Copy and content: Passed. Counts, paths, types, CSS properties, and values come from the generated token contract rather than sample copy from the reference. The document hero and generated-file instruction were removed from the workspace.

## Interaction and responsive checks

- Search passed for `radius.control`, filtering 201 tokens to one result and expanding its ancestor path.
- Selection passed; choosing the result updated the inspector to `radius.control` and `8px`.
- Light/Dark token mode passed; values and tree swatches update independently of the docs page theme.
- Copy affordances are visible for resolved value, CSS variable, and token path.
- At 1200 x 737, the workspace is 625px tall from y=80 to y=705. The outer docs area has no overflow (`scrollHeight` equals `clientHeight` at 665px).
- Scrolling the tree by 476px leaves the docs scroll position at 0 and the detail panel fixed at y=80.
- At 720 x 900, the tree and inspector stack without horizontal overflow (`clientWidth` and `scrollWidth` both 720).
- Browser console errors and warnings: none.
- `pnpm --filter @lenso/docs typecheck`: passed.
- `pnpm --filter @lenso/docs build`: passed with all 41 static pages generated.
- React Doctor changed-scope scan: 100 / 100, no issues found.
- `pnpm check`: passed with all 21 Turbo tasks and 95 UI browser tests successful.

## Comparison history

1. Initial comparison found one P2: the lower inspector fields were clipped at 1200 x 737 because the detail preview and field rhythm were too tall.
2. Reduced the preview height, inspector padding, mode spacing, field gaps, and copy-row height while preserving the reference hierarchy.
3. Revised browser evidence shows Value, CSS variable, Type, Path, and all copy actions inside the source viewport. No actionable P0, P1, or P2 findings remain.
4. User review identified the document hero, generated-file instruction, page-level scrolling, and non-full-height panels as unnecessary drift from the source.
5. Removed the extra content, stretched both panels across the available workspace, disabled outer scrolling on desktop, and retained tree-local scrolling plus a stacked narrow-screen fallback.

## Follow-up polish

- None.

final result: passed
