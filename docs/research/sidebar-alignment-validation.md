# Documentation sidebar alignment

## Basis and change

Apple's [Layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout)
recommends aligning related elements for scanning and using indentation to
convey subordination. The [Sidebar guidance](https://developer.apple.com/design/human-interface-guidelines/sidebars)
provides the navigation context. The exact 24px guide is a Lenso design choice,
not a measurement prescribed by Apple.

Previously desktop group labels began at 24px, page text at 28px and section
SVG bounds at 33px. Sidebar.Item's inherited logical start padding survived
the docs row's inline shorthand, and section SVGs were centered inside a 26px
icon slot.

Docs rows now explicitly set start/end padding to 12px, overriding inherited
item indentation. Docs section icons use a 16px slot. With the existing 12px
outer inset, group labels, page text and icons all begin at 24px. Top navigation
text begins at 48px, after the icon and an 8px gap. Genuine child-page indentation
is retained. Shared component defaults are unchanged.

## Verification

| Local dev Chromium surface              | Evidence                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Getting started, light desktop, 1280px  | Both section SVGs, Overview/Handbook labels and first-level page text measured 24px. Section text measured 48px.                                             |
| Getting started, dark drawer, 390 × 844 | Icons, labels and first-level text measured 40px from the viewport edge after the drawer settled. Section text measured 64px. Document width remained 390px. |
| Mobile navigation                       | Quick start opened its installation route and dismissed the drawer.                                                                                          |
| Keyboard navigation                     | Tab from Getting started reached Components with its visible focus shadow.                                                                                   |

Affected formatting, lint, docs-framework typechecks and docs-application
typechecks passed. The generated presentation declarations were refreshed
without cleaning the running preview's output. No new test was added for this
small style correction; the rendered geometry and navigation were checked in
the browser. No WebKit, RTL rendering, production export, full-site review or
native pixel-equivalence is claimed.

Evidence images: `sidebar-alignment-light.jpg` and
`sidebar-alignment-dark-mobile.jpg` in this task's visualization directory.

## Design gate

Direction: retain the existing Apple-inspired docs sidebar, ENERGY 1, RHYTHM 1,
MOTION 1. Improve scanning through a shared leading guide.

- Hard gate PASS for the affected scope: real navigation and keyboard focus
  worked, the drawer dismissed on navigation, and the narrow page did not
  overflow. No content, assets, navigation entries or claims were added.
- Purpose gate PASS: one leading guide relates labels, text and icons;
  indentation continues to express actual hierarchy. No effects were added.
- Liveliness PASS: the existing selected row remains the focal point, with
  group spacing, typography and tint retained.
- Craft gate PASS for the recorded scope: actual geometry was measured in
  light desktop and dark mobile layouts, with inherited spacing corrected in
  the owning docs style rather than individual page overrides.
