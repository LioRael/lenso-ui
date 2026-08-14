---
status: accepted
---

# Keep Lenso components thin over Base UI

Lenso UI components will remain thin styled wrappers that inherit and expose Base UI composition and props as fully as practical. Package artifacts declare a bounded Base UI peer range and pin the exact development version; each immutable registry artifact installs the exact Base UI version recorded by its Release Snapshot. An upstream breaking change visible through the inherited public API requires a Lenso UI major release.

The shared customization surface preserves Base UI `className`, `style`, state callbacks, and part props, with semantic variables as the guaranteed theme-level escape hatch. These props are always forwarded, but arbitrary external classes are not promised to outrank every compiled StyleX atomic rule. Lenso UI does not add a public `stylex` prop because package consumers do not run the StyleX compiler; package consumers map durable visual changes through semantic variables, while registry consumers that need deeper structural or StyleX changes own and can edit their installed source. This favors Base UI familiarity and cross-channel API parity over insulating Lenso UI from upstream API changes.

Figma hover, active, focus, and disabled variants define runtime visual acceptance states rather than a public `state` prop. DOM and Base UI interaction drive those states; only meaningful controlled state such as open, checked, selected, value, and loading belongs in component APIs. Base UI state attributes such as `data-open`, `data-checked`, `data-disabled`, and `data-highlighted` remain unchanged. Lenso-owned structure uses small generic attributes such as `data-slot`, `data-variant`, and `data-size` without duplicating upstream state under branded names.
