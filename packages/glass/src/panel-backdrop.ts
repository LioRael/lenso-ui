import { createNativePreferences } from "./native-preferences.js";
import * as stylex from "@stylexjs/stylex";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { observeBackdrop } from "./backdrop-scheduler.js";

/** Native backdrop paints must blend with the page, outside isolated foreground groups. */
export function paintBackdrop(element: HTMLElement) {
  return createBackdrop(element);
}

export function paintMovingBackdrop(element: HTMLElement) {
  return createBackdrop(element, createNativePreferences(element));
}

function createBackdrop(
  element: HTMLElement,
  preference?: ReturnType<typeof createNativePreferences>,
): (() => void) & { setVisible(visible: boolean): void } {
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.setAttribute("inert", "");
  container.setAttribute("data-material-live-paints", "");
  container.className = stylex.props(liquidMaterialStyles.livePaintContainer).className ?? "";
  // Floating navigation owns a stacking context inside the application. Hoisting
  // its paints to body lets their z-index cover that entire isolated application.
  let floating: HTMLElement | null = null;
  for (
    let node = element.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    if (["fixed", "sticky"].includes(getComputedStyle(node).position)) {
      floating = node;
      break;
    }
  }
  // WebKit drops backdrop blur when the same layer also uses a blend mode.
  const createLayer = () => {
    const layer = document.createElement("div");
    layer.className =
      stylex.props(floating ? liquidMaterialStyles.localPaint : liquidMaterialStyles.livePaint)
        .className ?? "";
    container.append(layer);
    return layer;
  };
  const layers = [createLayer()];
  // Nested Base UI portals are siblings of the parent positioner. Keep the
  // child paints after that positioner, or its content paints over the child.
  let portal = element.closest<HTMLElement>("[data-base-ui-portal]") ?? element;
  if (portal === element)
    while (portal.parentElement && portal.parentElement !== document.body)
      portal = portal.parentElement;
  if (floating) floating.prepend(container);
  else portal.before(container);
  let previous = "",
    stopped = false;
  const subscription = observeBackdrop({
    element,
    source: element,
    layer: container,
    prepare() {},
    read(_change, reads) {
      const style = reads.style(element);
      const preferred = preference?.read(style);
      if (preferred?.opaque)
        return () => {
          if (stopped) return;
          preference!.apply(preferred);
          if (!element.hasAttribute("data-material-paints"))
            element.setAttribute("data-material-paints", "");
          for (const layer of layers)
            if (layer.style.display !== "none") layer.style.display = "none";
          previous = "";
        };
      const box = reads.box(element);
      const size = reads.size(element);
      let opacity = 1;
      let zIndex = "auto";
      for (
        let node: HTMLElement | null = element;
        node && node !== (floating ?? document.body);
        node = node.parentElement
      ) {
        const at = reads.style(node);
        opacity *= Number(at.opacity);
        if (at.zIndex !== "auto") zIndex = at.zIndex;
      }
      if (floating) zIndex = "-1";
      const blur = preferred?.blur ?? (style.getPropertyValue("--lg-blur").trim() || "8px");
      const colors = [1, 2, 3]
        .map((index) => [
          style.getPropertyValue(`--lenso-panel-paint-${index}`).trim(),
          style.getPropertyValue(`--lenso-panel-blend-${index}`).trim(),
        ])
        .filter(([color, blend]) => color !== "transparent" || blend !== "normal");
      const radius = style.borderRadius;
      const visibility = style.visibility;
      const parentBox = floating ? reads.box(floating) : null;
      const parentSize = floating ? reads.size(floating) : null;
      const sx = parentBox && parentSize?.width ? parentBox.width / parentSize.width : 1;
      const sy = parentBox && parentSize?.height ? parentBox.height / parentSize.height : 1;
      const x =
        floating && parentBox
          ? (box.left - parentBox.left) / sx + floating.scrollLeft - floating.clientLeft
          : box.left;
      const y =
        floating && parentBox
          ? (box.top - parentBox.top) / sy + floating.scrollTop - floating.clientTop
          : box.top;
      const transform = `translate(${x}px, ${y}px) scale(${box.width / sx / (size.width || 1)}, ${box.height / sy / (size.height || 1)})`;
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
        if (stopped) return;
        preference?.apply(preferred);
        if (signature === previous) return;
        previous = signature;
        if (element.getAttribute("data-material-paints") !== "")
          element.setAttribute("data-material-paints", "");
        while (layers.length > colors.length + 1) layers.pop()!.remove();
        while (layers.length < colors.length + 1) layers.push(createLayer());
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
      stopped = true;
      subscription.stop();
      preference?.destroy();
      container.remove();
      element.removeAttribute("data-material-paints");
    },
    {
      setVisible(visible: boolean) {
        subscription.visible(visible);
        container.style.display = visible ? "" : "none";
      },
    },
  );
}
