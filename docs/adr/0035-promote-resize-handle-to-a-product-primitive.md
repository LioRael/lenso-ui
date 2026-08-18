---
status: accepted
---

# Promote Resize Handle to a Product Primitive

Lenso UI will expose a layout-independent `ResizeHandle` from `@lenso/primitives/resize-handle`. The primitive owns controlled bounded values, pointer capture, keyboard adjustment, optional collapse activation, and WAI-ARIA window-splitter semantics. Consumers continue to own pane layout, persistence, responsive constraints, and product-specific collapse state.

Base UI's Separator is a static semantic divider and does not provide resize interaction. Adopting a panel-layout library would move pane ownership into the design-system boundary. A focused Product Primitive fits the existing Console evidence instead: Story list, services, and inspector panes already need the same behavior across both axes.

`@lenso/ui/resize-handle` is the canonical visual adapter. It owns the stable seven-pixel hit target, half-pixel gradient indicator, semantic colors, and hover, focus, and dragging feedback. The primitive remains style-free, and the registry projects both the headless and styled sources from their package owners.
