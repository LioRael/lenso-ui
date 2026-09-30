# Actions and navigation live-source reconstruction

Authority: HeroUI **v3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Source adaptations retain
Apache-2.0 attribution. `m3-ripple` retains its dependency's MIT license.

## Exact scenario inventory

All **98** registered paths in these families have runnable React modules.
This work supplied **82** previously missing paths and audited the existing 16. The basic audit removed invented counters, clipboard status, dismiss/restore
flows, alternate breadcrumb content and extra pagination output.

| Family              | Source-record basenames                                                                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| button              | basic, custom-styles, custom-variants, disabled, full-width, icon-only, loading, loading-state, release-outline-variant, render-function, ripple-effect, sizes, social, variants, with-icons |
| button-group        | basic, custom-styles, disabled, full-width, orientation, sizes, variants, with-icons, without-separator                                                                                      |
| close-button        | custom-styles, default, interactive, with-custom-icon                                                                                                                                        |
| toggle-button       | basic, controlled, custom-styles, disabled, icon-only, sizes, variants                                                                                                                       |
| toggle-button-group | attached, basic, controlled, custom-styles, disabled, full-width, orientation, selection-mode, sizes, without-separator                                                                      |
| toolbar             | attached, basic, custom-styles, vertical, with-button-group                                                                                                                                  |
| link                | basic, custom-icon, custom-styles, icon-placement, render-function, underline-and-offset                                                                                                     |
| accordion           | basic, controlled, custom-indicator, custom-styles, disabled, faq, multiple, render-function, surface, without-separator                                                                     |
| disclosure          | basic, custom-styles, render-function                                                                                                                                                        |
| disclosure-group    | basic, controlled, custom-styles                                                                                                                                                             |
| breadcrumbs         | basic, custom-separator, custom-styles, disabled, level-2, level-3, render-function                                                                                                          |
| tabs                | basic, custom-styles, disabled, overflow, render-function, secondary, secondary-vertical, vertical, vertical-alignment, with-separator                                                       |
| pagination          | basic, controlled, custom-icons, custom-styles, disabled, simple-prev-next, sizes, with-ellipsis, with-summary                                                                               |

There are **94 code-bearing source records**. Four records remain classified
as excluded Native-product source content: `disclosure/{basic,render-function}`
and `disclosure-group/{basic,controlled}`. Their local modules are independently
adapted React compositions, preserving the QR image, preview/download controls,
and expansion model from the pinned raw source. They do **not** implement or
claim a Native runtime.

## Native interaction translations

- Ordinary widgets use Base UI or native HTML, not React Aria.
- Loading actions use focusable `isLoading`, explicit spinner/content state,
  and native `onClick`; an unmount cleanup owns the source's two-second timer.
- Button render composition keeps pointer/keyboard pressed feedback without
  inventing an activation counter.
- Link and breadcrumb compositions keep real anchors and valid navigation/list
  semantics rather than replacing interactive anchors with inert spans or
  nesting list items.
- Tabs have explicit initial values and automatic keyboard activation. A
  single Base UI indicator is measured per list; the source overflow list uses
  the local ScrollShadow and scroll controls.
- Toggle groups translate selected sets into Base UI value arrays. Toolbar
  actions compose native Toolbar buttons with the styled action buttons.
- The source's disabled ButtonGroup child override requires inherited
  per-button disabled state, not native fieldset disabling, which cannot be
  overridden by a descendant.
- Stateful pagination renders native buttons. Examples that supply actual
  navigation destinations retain native anchors.
- The split merge menus use native menu parts and non-field label/description
  spans. Field-context labels are not valid menu-item children.
- Source Iconify identifiers, Gravity SVG icons, remote 3D images, QR artwork,
  and the actual `m3-ripple@1.1.3` pointer animation are retained.

## Verification

Strict TypeScript checked every owned module and all 98 source-record export
names against the local React/styles sources in a scratch consumer using the
parent's read-only dependency graph. Standard oxlint and oxfmt checks pass.

A production Vite consumer compiled all 98 modules with JS source maps, StyleX
`dev: false`, no CSS layers, and Lightning CSS `exclude: 4`. Style constants
resolve through the preserved `.stylex.const` bridge.

`packages/react/src/components/button/source-scenarios.browser.test.tsx`
contains eight real Chromium workflows:

1. Pending upload keeps focus, blocks reactivation, and returns to its source label.
2. Ripple pointer activation produces an actual Web Animation.
3. Disabled action-group override and disabled toggle keyboard skipping.
4. Overflow tabs scroll and their measured indicator follows keyboard selection.
5. Pagination keyboard activation updates its summary; composed links retain hrefs.
6. Split merge menu keyboard open/close and controlled accordion navigation.
7. Composed toolbar roving focus and independent multiple-toggle selection.
8. React Native-reference disclosure bounded previous/next expansion.

The existing button, accordion, and navigation suites also pass. Browser proofs
do not constitute a complete side-by-side visual review of every scenario in
both themes, RTL, mobile, and reduced motion. The parent owns final global docs
smoke and generated registrations.

React Doctor was run locally with telemetry/scoring and supply-chain requests
disabled. Its reconstruction-wide comparison reports advisory duplication,
static array keys, and branching-complexity findings in scenario code, plus
pre-existing component-context findings. No owned-source error was reported;
this is not a claim of a numeric health-score improvement.
