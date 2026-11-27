import { closeButtonStyles } from "@lenso/tokens/close-button";
import { h } from "vue";
import { htmlPart } from "./parts.js";
export const CloseButtonIcon = htmlPart("svg", "close-button-icon", () => closeButtonStyles.icon);
export function defaultCloseIcon() {
  return h(
    CloseButtonIcon,
    {
      viewBox: "0 0 16 16",
      fill: "none",
      "aria-hidden": "true",
    },
    {
      default: () =>
        h("path", {
          d: "m4 4 8 8M12 4l-8 8",
          stroke: "currentColor",
          "stroke-width": "1.5",
          "stroke-linecap": "round",
        }),
    },
  );
}
