# Lenso UI design and component contract

This is the agent-facing guide for **shared** Lenso UI. Read it before adding or restyling a component or composing a product page. `@lenso/ui` is product-neutral: a Console direction may validate a new neutral variant, but Workspace, Agent Profile and Plugin page semantics belong to the Consumer. When available, the sibling `lenso-design/DESIGN.md` describes the current Console pilot in greater detail.

`packages/tokens/src/foundation.json`, `semantic.json`, `themes/light.json`, `themes/dark.json` and `lenso.resolver.json` are the only writable token authority. Generated CSS, StyleX, registry copies and this document are consumers. Never edit generated representations by hand or paste a prototype's hard-coded color palette into components.

## Choose the right layer

| Need                                                                             | Place it in                                                                         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Reusable color/type/space/radius/state role                                      | DTCG semantic token, with Light and Dark values and generated outputs               |
| Reusable behavior, accessibility or appearance                                   | `packages/ui/src/<component>` and its public export/registry copy                   |
| Headless state with independently useful behavior                                | `@lenso/primitives`, only if a styled adapter cannot own it                         |
| Product page, Workspace, Agent Profile, Plugin navigation, data or authorization | Consumer application                                                                |
| A specific product's density or layout choice                                    | Consumer composition or an explicit neutral component variant, not a global default |

Before adding a token, find the nearest semantic role and check both themes. Before adding a component, inspect current package subpaths and Recipe templates. A component name should describe a UI job, not a business entity.

## Visual grammar

Use typography, alignment and modest value contrast before decoration. Navigation has compact rows and a quiet persistent selected fill; text stays on one line where an item is a destination. A hover color is transient and never substitutes for selection. Controls should use consistent icon slots, pointer geometry and focus-visible states. Overlay surfaces can be slightly raised with a subtle edge/shadow; ordinary content groups use spacing and separators rather than card nesting.

Console v1 is a dark, near-neutral example of this grammar. Its accepted header tabs are 32px high with about 13.5px text and 14px glyphs; sidebar rows are 32px high with 13px text, about 14px glyphs and an 8px icon/text gap; selected surfaces are subdued charcoal. Those are pilot comparison values, **not** new global defaults. Build a Light counterpart and verify a non-Console scenario before altering shared defaults.

## Token selection by intent

| Intent                | Semantic family                                                                         | Use                                                                                |
| --------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| App/page canvas       | `color.surface.canvas`                                                                  | The base plane behind content.                                                     |
| Navigation background | `color.surface.sidebar`                                                                 | Sidebar or local navigation plane.                                                 |
| Content grouping      | `color.surface.panel` / `.surface`                                                      | A meaningful group, not every row.                                                 |
| Input/control         | `color.surface.control`, `color.border.control`                                         | Editable or operable field.                                                        |
| Floating menu/dialog  | `color.surface.popover` / `.dialog`, matching border and elevation                      | Only for an overlay.                                                               |
| Hover/selected        | `color.surface.interactiveHover` / `.selected`, `color.sidebar.*`, `color.navigation.*` | Component-specific state role where it exists; selection persists.                 |
| Hierarchy             | `color.content.primary` / `.secondary` / `.tertiary`                                    | Title/value, supporting text, metadata. Do not dim a whole container with opacity. |
| Structure             | `color.border.tertiary` / `.secondary`                                                  | Thin quiet separators; stronger boundaries only when needed.                       |
| Focus, status, danger | `color.focus.ring`, `color.status.*`, `color.action.danger`                             | Keyboard focus and truthful state, never decoration.                               |
| Geometry              | `radius.*`, `size.*`, `space.*`, `font.*`                                               | Choose by control/group role. Icon-only width must equal height.                   |

If a semantic family cannot express a new reusable role, add it to DTCG source and regenerate. Keep raw sampled hex and CSS-only prototype variables out of component source. Do not make a Console accent the default primary action color in every product.

## Component selection

| Task                                | Start with                                                       | Decision rule                                                                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary/secondary action            | `Button`                                                         | One primary per decision area; quieter actions recede.                                                                                                                                          |
| Icon-only action                    | `IconButton`                                                     | Square box, smaller centered glyph, accessible name.                                                                                                                                            |
| Local destinations                  | `Sidebar` / `SidebarItem`                                        | One-line ellipsis, optical icon center, selected current destination. Use `density="compact"` for the Console-like 32px row; default density remains available elsewhere.                       |
| Peer views                          | `Tabs`                                                           | Use `density="compact"` on both list and tabs for the quiet 32px navigation treatment. Overflow/layout belongs to page shell.                                                                   |
| Action/selection popup              | `Menu` / `Popover`                                               | Concise rows with label, optional description, icon and check; `layout="stacked"` plus `Menu.Copy`/`Menu.Description` when one context line helps distinguish choices. No decorative tile grid. |
| Global or contextual command search | `CommandMenu`                                                    | Search results with clear label, group/provenance and empty state. Position of its trigger belongs to the Consumer shell.                                                                       |
| Text input                          | `TextField`, `TextArea`, `Select`, `Combobox`                    | Choose by input shape and option count. A chat composer is a Consumer composition around shared input/button mechanics.                                                                         |
| Boolean or multi-choice input       | `Switch`, `Checkbox`, `Radio`, `SegmentedControl`                | Switch for immediate setting; checkbox for independent selection; radio/segment for one-of-many.                                                                                                |
| Settings group                      | `SettingsRow`                                                    | Label, supporting explanation, value/control and validation stay aligned.                                                                                                                       |
| Data/description and status         | `DescriptionList`, `StatusMarker`, `ContentState`, `InlineAlert` | Facts and errors must name their source/action.                                                                                                                                                 |
| Independent media/object            | `Surface`                                                        | Use only when the object needs its own boundary. Plain related rows are usually clearer.                                                                                                        |

The package intentionally has no all-components root barrel. Import the exact family subpath. Treat `xstyle` as a bounded integration seam; if Consumers repeatedly recreate the same state or geometry, make an explicit neutral variant rather than proliferating page-local CSS.

For a compact navigation item and a two-line workspace choice, compose the public parts rather than recreating their geometry:

```tsx
<SidebarItem density="compact" icon={<FolderIcon size={14} />} selected={current}>
  Projects
</SidebarItem>

<Menu.RadioItem layout="stacked" value="projects">
  <Menu.Leading><FolderIcon size={16} /></Menu.Leading>
  <Menu.Copy>
    <Menu.Label>Projects</Menu.Label>
    <Menu.Description>Boards and schedules</Menu.Description>
  </Menu.Copy>
  <Menu.RadioItemIndicator />
</Menu.RadioItem>
```

The Consumer supplies real labels, selection state and placement. Menu descriptions are for disambiguation; omit them when choices are already clear.

## States and responsive behavior

Every interactive component needs distinct default, hover, focus-visible, selected/open, disabled and error/pending states where relevant. Keyboard activation and Escape dismissal are part of the visual contract. ThemeScope must carry Light/Dark values into portalled overlays. Text and icons need readable contrast in both themes.

At narrow widths, keep navigation and search reachable, truncate long labels, and preserve square icon-only targets. Do not rely on desktop hover. Test 320/375px mobile, a middle width and a wide desktop width for changed navigation or overlays. Use realistic long labels and translated text. Respect reduced motion.

## Generated-UI review

Reject a generic KPI/card dashboard for a collection, settings, trace or Agent task. Reject oversized controls, blue/purple selected pills used indiscriminately, repeated context labels, invented data, decorative copy, nested panels without meaning, and icon-only controls without names. A passing build is not visual approval: run the relevant component/Recipe in a browser and compare it with an accepted product direction. If a recurring mistake is mechanical, enforce it in component code or a focused check; if it is a composition judgment, improve this guide or the relevant product `DESIGN.md`.
