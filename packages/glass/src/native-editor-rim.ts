import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { observeBackdrop } from "./backdrop-scheduler.js";
import { createLiveRim } from "./live-rim.js";
import type { Shape } from "./optical-fields.js";

// Native editors cannot display canvas children. A sibling keeps their own
// layout, selection, scrolling and resize handle intact.
export function createNativeEditorRim(
  element: HTMLElement,
  geometry: (
    style: CSSStyleDeclaration,
    size: { width: number; height: number },
  ) => { width: number; height: number; radius: number; shape: Shape } | undefined,
) {
  const output = document.createElement("span");
  output.className = stylex.props(materialStyles.editorRim).className!;
  output.setAttribute("data-lenso-editor-rim", "");
  output.setAttribute("aria-hidden", "true");
  output.setAttribute("inert", "");
  element.after(output);
  const rim = createLiveRim(element, output);
  const subscription = observeBackdrop({
    element,
    source: element,
    layer: output,
    prepare() {},
    read(_change, reads) {
      const style = reads.style(element);
      const size = reads.size(element);
      const fitted = geometry(style, size);
      if (!fitted)
        return () => {
          output.style.display = "none";
        };
      const box = reads.box(element);
      let parent = output.offsetParent as HTMLElement | null;
      if (parent === document.body) {
        const body = reads.style(parent);
        if (body.position === "static" && body.transform === "none") parent = null;
      }
      const parentBox = parent ? reads.box(parent) : null;
      const parentSize = parent ? reads.size(parent) : null;
      const sx = parentBox && parentSize?.width ? parentBox.width / parentSize.width : 1;
      const sy = parentBox && parentSize?.height ? parentBox.height / parentSize.height : 1;
      const x =
        parent && parentBox
          ? (box.left - parentBox.left) / sx + parent.scrollLeft - parent.clientLeft
          : box.left + window.scrollX;
      const y =
        parent && parentBox
          ? (box.top - parentBox.top) / sy + parent.scrollTop - parent.clientTop
          : box.top + window.scrollY;
      const transform = `translate(${x}px, ${y}px) scale(${box.width / size.width / sx}, ${box.height / size.height / sy})`;
      const opacity = style.opacity;
      const visibility = style.visibility;
      if (element.matches("[data-lenso-light-pressed], [data-lenso-key-pressed]"))
        fitted.shape.materialClarity = 1;
      return () => {
        output.style.display = "block";
        output.style.width = `${size.width}px`;
        output.style.height = `${size.height}px`;
        output.style.transform = transform;
        output.style.opacity = opacity;
        output.style.visibility = visibility;
        rim.paint(fitted.width, fitted.height, fitted.radius, fitted.shape, size);
      };
    },
  });
  return {
    invalidate: subscription.invalidate,
    destroy() {
      subscription.stop();
      rim.destroy();
      output.remove();
    },
  };
}
