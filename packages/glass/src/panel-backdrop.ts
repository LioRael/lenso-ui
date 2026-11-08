import * as stylex from "@stylexjs/stylex";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { observeBackdrop } from "./backdrop-scheduler.js";

/** Native backdrop paints must blend with the page, outside isolated foreground groups. */
export function paintBackdrop(
  element: HTMLElement,
): (() => void) & { setVisible(visible: boolean): void } {
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.setAttribute("inert", "");
  container.setAttribute("data-material-live-paints", "");
  container.className = stylex.props(liquidMaterialStyles.livePaintContainer).className ?? "";
  // WebKit drops backdrop blur when the same layer also uses a blend mode.
  const layers = [0, 1, 2, 3].map(() => {
    const layer = document.createElement("div");
    layer.className = stylex.props(liquidMaterialStyles.livePaint).className ?? "";
    container.append(layer);
    return layer;
  });
  // Nested Base UI portals are siblings of the parent positioner. Keep the
  // child paints after that positioner, or its content paints over the child.
  let portal = element.closest<HTMLElement>("[data-base-ui-portal]") ?? element;
  if (portal === element)
    while (portal.parentElement && portal.parentElement !== document.body)
      portal = portal.parentElement;
  portal.before(container);
  let previous = "";
  const subscription = observeBackdrop({
    element,
    source: element,
    layer: container,
    prepare() {},
    read(_change, reads) {
      const style = reads.style(element);
      const box = reads.box(element);
      const size = reads.size(element);
      let opacity = 1;
      let zIndex = "auto";
      for (
        let node: HTMLElement | null = element;
        node && node !== document.body;
        node = node.parentElement
      ) {
        const at = reads.style(node);
        opacity *= Number(at.opacity);
        if (at.zIndex !== "auto") zIndex = at.zIndex;
      }
      const blur = style.getPropertyValue("--lg-blur").trim() || "8px";
      const colors = [1, 2, 3].map((index) => [
        style.getPropertyValue(`--lenso-panel-paint-${index}`).trim(),
        style.getPropertyValue(`--lenso-panel-blend-${index}`).trim(),
      ]);
      const radius = style.borderRadius;
      const visibility = style.visibility;
      const transform = `translate(${box.left}px, ${box.top}px) scale(${box.width / (size.width || 1)}, ${box.height / (size.height || 1)})`;
      const signature = JSON.stringify([
        size,
        opacity,
        zIndex,
        blur,
        colors,
        transform,
        radius,
        visibility,
      ]);
      return () => {
        if (signature === previous) return;
        previous = signature;
        element.setAttribute("data-material-paints", "");
        layers.forEach((layer, index) => {
          const values = {
            display: "block",
            width: `${size.width}px`,
            height: `${size.height}px`,
            transform,
            "border-radius": radius,
            opacity: String(opacity),
            visibility,
            "z-index": zIndex,
            "background-color": index === 0 ? "transparent" : colors[index - 1]![0]!,
            "mix-blend-mode": index === 0 ? "normal" : colors[index - 1]![1]!,
            "backdrop-filter": index === 0 ? `blur(${blur})` : "none",
          };
          // Retain the native filter/layer cache while only the shape moves.
          for (const [name, value] of Object.entries(values))
            if (layer.style.getPropertyValue(name) !== value) layer.style.setProperty(name, value);
        });
      };
    },
  });
  return Object.assign(
    () => {
      subscription.stop();
      container.remove();
      element.removeAttribute("data-material-paints");
    },
    {
      setVisible(visible: boolean) {
        container.style.display = visible ? "" : "none";
      },
    },
  );
}
