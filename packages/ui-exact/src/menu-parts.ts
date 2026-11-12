/** Find the actual popup owned by a native menu, across an optional context layout. */
export function ownMenuPopup(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>('[data-slot="menu-popup"]')].find(
    (node) =>
      node.closest('[role="menu"]') === root && !node.closest('[data-slot="context-menu-preview"]'),
  );
}
