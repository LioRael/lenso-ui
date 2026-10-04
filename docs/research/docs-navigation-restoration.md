# Documentation structure and navigation restoration

This change restores the component-page reading order and documentation layout,
using HeroUI 3.2.6 at `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` as the
visual and organizational reference. Guide content describes Lenso's actual
packages, StyleX build integration, native interactions and tools.

## Reader-facing changes

- Component pages use Usage, a local import snippet and the basic example,
  followed by Examples and the current native API. No example references are
  removed.
- Source and Styles pills link to the Lenso repository. Native-library pills
  identify Base UI or React Aria, without invented local Figma or Storybook URLs.
- Getting started groups its guides into Overview, Handbook and UI for Agents.
  Grouping and order come from authored frontmatter in the generated index.
  Existing tool and guide URLs remain valid.
- The TOC shows a left rail and current-section marker. Keyboard anchor
  navigation and scrolling update selection; reaching the document bottom
  selects the final section.
- Adjacent-page navigation uses borderless links with chevrons, titles and
  descriptions. A single destination fills the row; paired destinations stack
  on narrow screens.

## Migration

No React component exports, package imports or consumer stylesheet contracts
change. Documentation links remain on their existing routes. Links to the old
English `#runnable-examples` heading should use `#examples`; the new first
section is `#usage`. Chinese pages use `#示例` and `#用法`.

Tool pages now appear under Getting started's UI for Agents group rather than a
separate header tab. Their `/docs/react/tools` URLs remain available.
Static-host redirects preserve the old Dropdown-to-Menu navigation alias in
both locales.

The optional docs-index `navigationGroup` and `navigationOrder` fields describe
presentation only. Shared validation checks their types; the encoded format-2
contract and its API/document record schemas remain unchanged.

## Evidence and limits

Production browser checks cover EN/CN, light/dark, 1440px/390px: visible TOC
markers, keyboard anchors, document-bottom tracking, guide order, footer
geometry and activation, and all 30 guide routes. A deliberately hidden marker
fails the regression. The broader authored proof covers 136 route cases,
exact copied Markdown, search, sitemap and canonical Menu redirects.

The normal maintained documentation smoke also passed. Its earlier Popover
`networkidle` timeout is retained in local evidence; an unchanged bounded retry
passed. No new accessibility exclusions were added.

These checks are not full-site pixel equivalence or WCAG certification. New
RTL and reduced-motion browser matrices were not run for this documentation
change. Footer chevrons retain native `:dir(rtl)` styling, and the TOC adds no
animated transition. Primitives and the private source archive are unchanged.

Exact command logs and screenshots are retained locally under
`test-results/docs-structure/` and `test-results/docs-navigation/`.
