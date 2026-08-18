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
