const owners = new WeakMap<Element, () => void>();

/** Observe the Exact-owned image without replacing its node or source. */
export function updateAvatar(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (data["lensoKind"] !== "avatar") return;
  owners.get(node)?.();
  const refresh = () => {
    const image = node.querySelector<HTMLImageElement>('[data-slot="avatar-image"]');
    node.toggleAttribute("data-lenso-image-loaded", !!image?.complete && image.naturalWidth > 0);
  };
  const observer = new MutationObserver(refresh);
  observer.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset"],
  });
  node.addEventListener("load", refresh, true);
  node.addEventListener("error", refresh, true);
  refresh();
  owners.set(node, () => {
    observer.disconnect();
    node.removeEventListener("load", refresh, true);
    node.removeEventListener("error", refresh, true);
    node.removeAttribute("data-lenso-image-loaded");
  });
}
export function endAvatar(node: Element) {
  owners.get(node)?.();
  owners.delete(node);
}
