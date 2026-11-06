import * as stylex from "@stylexjs/stylex";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { observeBackdrop } from "./backdrop-scheduler.js";
import { watchCopy } from "./backdrop.js";
let nextPaintId = 0;

function ios26Paints(value: (name: string) => string, profile: string): string[][] {
  if (profile === "clear") return [[value("--lenso-glass26-clear"), "screen"]];
  if (value("--lenso-material-action-mode") !== "dark")
    return profile === "small"
      ? [
          ["rgb(255 255 255 / .65)", "normal"],
          ["#ddd", "color-burn"],
          ["rgb(96.9970703125% 96.9970703125% 96.9970703125%)", "darken"],
        ]
      : [
          [value("--lenso-glass26-light-dodge"), "color-dodge"],
          [value(`--lenso-glass26-light-${profile}`), "normal"],
        ];
  const group = Number(value("--lenso-glass26-dark-group-opacity"));
  const white = Number(value("--lenso-glass26-dark-white-opacity"));
  const black = Number(
    value(`--lenso-glass26-dark-${profile === "small" ? "medium" : profile}-opacity`),
  );
  // Figma applies 67% to the completed Burn → Black → White stack. Factor the
  // final affine source-over terms so the backdrop remains available to Burn.
  const whiteAlpha = group * white;
  const burnWeight = group * (1 - white) * (1 - black);
  const remaining = 1 - group + burnWeight;
  return [
    [
      `color-mix(in srgb, ${value("--lenso-glass26-dark-burn")} ${(100 * burnWeight * (profile === "small" ? 0.5 : 1)) / remaining}%, transparent)`,
      "color-burn",
    ],
    [`rgb(0 0 0 / ${1 - remaining / (1 - whiteAlpha)})`, "normal"],
    [`rgb(255 255 255 / ${whiteAlpha})`, "normal"],
  ];
}

/** Paint beside the isolated foreground, in its parent's original clipping/stacking scope. */
export function paintMaterialBackdrop(
  element: HTMLElement,
  liquid = false,
  clipMask = false,
  onReady?: () => void,
): () => void {
  const foreground =
    liquid && element.hasAttribute("data-material-lens") ? element.parentElement! : element;
  let anchor = foreground;
  let branch = foreground;
  const target = element.getBoundingClientRect();
  for (
    let node = foreground.parentElement;
    node && node !== document.body;
    branch = node, node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    // Keep paints inside the clipping owner; hoisting across an isolated
    // scroller places them beneath its content.
    if (style.overflowX !== "visible" || style.overflowY !== "visible") break;
    // A painted ancestor supplies the blend backdrop. Transparent positioning
    // scopes (notably Toast.Viewport) must not isolate it again.
    if (
      style.backgroundImage !== "none" ||
      !["transparent", "rgba(0, 0, 0, 0)"].includes(style.backgroundColor)
    )
      break;
    let painted = false;
    for (
      let sibling = branch.previousElementSibling;
      sibling;
      sibling = sibling.previousElementSibling
    ) {
      if (sibling.hasAttribute("data-material-local-paints")) continue;
      const paint = getComputedStyle(sibling);
      if (
        paint.backgroundImage === "none" &&
        ["transparent", "rgba(0, 0, 0, 0)"].includes(paint.backgroundColor) &&
        !["IMG", "VIDEO", "CANVAS", "SVG"].includes(sibling.tagName.toUpperCase())
      )
        continue;
      const box = sibling.getBoundingClientRect();
      if (
        box.left <= target.left &&
        box.top <= target.top &&
        box.right >= target.right &&
        box.bottom >= target.bottom
      ) {
        painted = true;
        break;
      }
    }
    if (painted) break;
    if (
      style.isolation === "isolate" ||
      style.zIndex !== "auto" ||
      ["fixed", "sticky"].includes(style.position) ||
      style.transform !== "none" ||
      Number(style.opacity) !== 1 ||
      style.filter !== "none"
    )
      anchor = node;
  }
  const container = document.createElement("div");
  const paintId = `material-${++nextPaintId}`;
  container.setAttribute("aria-hidden", "true");
  container.setAttribute("inert", "");
  container.setAttribute("data-material-local-paints", paintId);
  container.className = stylex.props(liquidMaterialStyles.livePaintContainer).className ?? "";
  // Fixed and pinned sticky surfaces keep their paints in viewport coordinates.
  // Document-positioned paints otherwise trail compositor scrolling until JS catches up.
  const fixed = ["fixed", "sticky"].includes(getComputedStyle(anchor).position);
  const layers = Array.from({ length: 4 }, () => {
    const layer = document.createElement("div");
    layer.className =
      stylex.props(fixed ? liquidMaterialStyles.livePaint : liquidMaterialStyles.localPaint)
        .className ?? "";
    container.append(layer);
    return layer;
  });
  anchor.before(container);
  let previous = "";
  let stopped = false;
  let notified = false;
  const subscription = observeBackdrop({
    element,
    source: foreground,
    layer: container,
    prepare() {},
    read(_change, reads) {
      const style = reads.style(element);
      const rootStyle = reads.style(foreground);
      const anchorStyle = reads.style(anchor);
      const value = (name: string) => style.getPropertyValue(name).trim();
      const ios26 = value("--lenso-material-version") === "ios26";
      const profile = value("--apple-material-profile");
      const paints = !liquid
        ? [
            [value("--material-upper"), value("--lenso-material-upper-blend")],
            [value("--material-lower"), value("--material-lower-blend")],
          ]
        : ios26
          ? ios26Paints(value, profile)
          : profile === "small"
            ? value("--lenso-material-action-mode") === "dark"
              ? [["rgb(153 153 153 / .17)", "luminosity"]]
              : [
                  // Fused black 25%, white 25%, then #444 Linear Dodge 60%.
                  ["rgb(238.9714285714 238.9714285714 238.9714285714 / .4375)", "normal"],
                  ["rgb(248 248 248 / .2)", "luminosity"],
                ]
            : profile === "clear"
              ? [
                  [value("--lenso-clear-paint-1"), "luminosity"],
                  [value("--lenso-clear-paint-2"), "plus-lighter"],
                ]
              : [1, 2, 3].map((index) => [
                  value(`--lenso-panel-paint-${index}`),
                  value(`--lenso-panel-blend-${index}`),
                ]);
      const box = reads.box(element);
      const size = reads.size(element);
      let parent = layers[0]!.offsetParent as HTMLElement | null;
      if (parent === document.body) {
        const body = reads.style(parent);
        if (body.position === "static" && body.transform === "none" && body.filter === "none")
          parent = null;
      }
      const parentBox = parent ? reads.box(parent) : null;
      const parentSize = parent ? reads.size(parent) : null;
      const sx = parentBox && parentSize?.width ? parentBox.width / parentSize.width : 1;
      const sy = parentBox && parentSize?.height ? parentBox.height / parentSize.height : 1;
      const x =
        parent && parentBox
          ? (box.left - parentBox.left) / sx + parent.scrollLeft - parent.clientLeft
          : box.left + (fixed ? 0 : window.scrollX);
      const y =
        parent && parentBox
          ? (box.top - parentBox.top) / sy + parent.scrollTop - parent.clientTop
          : box.top + (fixed ? 0 : window.scrollY);
      const transform = `translate(${x}px, ${y}px) scale(${box.width / sx / (size.width || 1)}, ${box.height / sy / (size.height || 1)})`;
      const blur = value(liquid ? "--lg-blur" : "--material-blur");
      let opacity =
        Number(rootStyle.opacity) * (liquid && foreground !== element ? Number(style.opacity) : 1);
      if (liquid)
        opacity *=
          Number(style.getPropertyValue("--lenso-glass-face-opacity").trim() || 1) *
          Number(style.getPropertyValue("--lenso-fusion-opacity").trim() || 1);
      let top = box.top,
        left = box.left,
        right = box.right,
        bottom = box.bottom;
      for (
        let node = foreground.parentElement;
        node && node !== anchor.parentElement;
        node = node.parentElement
      ) {
        const ancestorStyle = reads.style(node);
        opacity *= Number(ancestorStyle.opacity);
        const clip = reads.box(node);
        if (ancestorStyle.overflowX !== "visible") {
          left = Math.max(left, clip.left);
          right = Math.min(right, clip.right);
        }
        if (ancestorStyle.overflowY !== "visible") {
          top = Math.max(top, clip.top);
          bottom = Math.min(bottom, clip.bottom);
        }
      }
      const clipX = box.width / (size.width || 1) || 1;
      const clipY = box.height / (size.height || 1) || 1;
      const vectorClip = clipMask && style.clipPath !== "none";
      const clipped =
        top !== box.top || right !== box.right || bottom !== box.bottom || left !== box.left;
      const values = {
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform,
        "border-radius": style.borderRadius,
        "mask-image":
          vectorClip && clipped
            ? "linear-gradient(white, white)"
            : clipMask
              ? style.maskImage
              : "none",
        "mask-position":
          vectorClip && clipped
            ? `${(left - box.left) / clipX}px ${(top - box.top) / clipY}px`
            : "0 0",
        "mask-size":
          vectorClip && clipped
            ? `${Math.max(0, right - left) / clipX}px ${Math.max(0, bottom - top) / clipY}px`
            : "auto",
        "mask-repeat": "no-repeat",
        "color-scheme": style.colorScheme,
        "z-index": clipMask ? rootStyle.zIndex : anchorStyle.zIndex,
        "clip-path": vectorClip
          ? style.clipPath
          : !clipped
            ? "none"
            : `inset(${Math.max(0, top - box.top) / clipY}px ${Math.max(0, box.right - right) / clipX}px ${Math.max(0, box.bottom - bottom) / clipY}px ${Math.max(0, left - box.left) / clipX}px)`,
        opacity: String(opacity),
        visibility: style.visibility,
      };
      const signature = JSON.stringify([paints, blur, values]);
      return () => {
        if (stopped) return;
        if (signature === previous) return;
        previous = signature;
        if (element.getAttribute("data-material-paints") !== paintId)
          element.setAttribute("data-material-paints", paintId);
        layers.forEach((layer, index) => {
          const paint = paints[index - 1];
          const properties = {
            ...values,
            display: index === 0 || paint ? "block" : "none",
            "background-color": paint?.[0] || "transparent",
            "mix-blend-mode": paint?.[1] || "normal",
            "backdrop-filter": index === 0 ? `blur(${blur || "0px"})` : "none",
          };
          for (const [name, value] of Object.entries(properties))
            if (layer.style.getPropertyValue(name) !== value) layer.style.setProperty(name, value);
        });
        if (!notified) {
          notified = true;
          onReady?.();
        }
      };
    },
  });
  const stopVisibility = watchCopy(element, (active) => {
    subscription.visible(active);
    // Empty paint layers still blend their own backgrounds when only their contents are hidden.
    if (!active) container.style.display = "none";
    else if (container.style.display === "none") {
      container.style.removeProperty("display");
      subscription.invalidate();
    }
  });
  return () => {
    stopped = true;
    stopVisibility();
    subscription.stop();
    container.remove();
    element.removeAttribute("data-material-paints");
  };
}
