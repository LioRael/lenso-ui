import { defineComponent, h } from "vue";
import { partAttributes, type HtmlPart, type StyleXArgument } from "./parts.js";

export function disclosureIndicator(slot: string, style: StyleXArgument): HtmlPart<"svg"> {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h(
          "svg",
          partAttributes(slot, style, {
            viewBox: "0 0 16 16",
            fill: "none",
            "aria-hidden": "true",
            ...attrs,
          }),
          slots["default"]?.() ?? [
            h("path", {
              d: "m4 6 4 4 4-4",
              stroke: "currentColor",
              "stroke-width": "1.5",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            }),
          ],
        );
    },
  }) as unknown as HtmlPart<"svg">;
}
