# Sidebar behavior

Sidebar is a non-modal navigation panel. Its root names the SDK agent entry;
its aside names the complementary landmark. Toggle buttons expose expanded state
and control the panel ID. Links retain browser navigation and `aria-current`.

Opening does not move focus. Tab visits native controls and links in DOM order;
there is no roving selection or focus trap. Escape from a panel descendant
requests closing; a prevented event or canceled change leaves it open. Nested
panels consume their own Escape. On an accepted close that actually commits,
SDK panel binding restores focus from inside the panel to its trigger.

Controlled state remains authoritative. Every open change reports native
reason, event and source and supports `details.cancel()`. Each root owns one
SDK instance; external controls use a controller for that instance. Direction
inherits through the DOM. Layout, responsive presentation and modal drawers
remain the caller's responsibility.
