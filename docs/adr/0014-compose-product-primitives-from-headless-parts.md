---
status: accepted
---

# Compose Product Primitives from headless parts

Product Primitives use compound components and children composition instead of monolithic components with proliferating boolean props. A low-level Provider receives state through a stable state, actions, and meta interface, while a convenience Root implements controlled and uncontrolled state through that same contract. Visual parts consume the interface without knowing persistence, server synchronization, or state-library implementation.

Product Primitives have no StyleX, theme-token, layout, animation, or default visual dependency. They expose semantic DOM, accessibility behavior, refs, events, necessary state attributes, and native `className` and `style`. They may compose Base UI internally, but Lenso owns the cohesive Product Primitive API rather than exposing every internal primitive. They are router-agnostic: navigation elements arrive through children or render composition, and Consumer-owned current state maps to native semantics such as `aria-current`.

Distinct product forms such as App Sidebar and Settings Sidebar are explicit Recipes composed from shared parts rather than boolean modes on one component.

`@lenso/primitives/sidebar` is scoped per Root rather than globally. Nested Roots shadow outer context; an optional Group coordinates sibling left and right instances, and Triggers target the nearest Root by default or a stable ID explicitly. Physical `side="left" | "right"` remains predictable while `dir="ltr" | "rtl"` controls directional semantics. The primitive provides no default global shortcut; Recipes may register unique shortcuts that do not fire while text input is focused and connect controls through accessible names, `aria-controls`, and `aria-expanded`.

The Sidebar borrows shadcn's composable Provider, Header, Content, Group, Menu, Submenu, Trigger, and Rail vocabulary without copying visual `floating` or `inset` variants or visual collapse modes into the headless API. Those remain explicit styled Recipes.
