import { iconShapes } from "@lenso/tokens/icons";
import { defineComponent, h, type SVGAttributes } from "vue";
import type { HtmlPart } from "./parts.js";

export type IconProps = SVGAttributes;

function icon({
  path,
  size,
  viewBox,
}: (typeof iconShapes)[keyof typeof iconShapes]): HtmlPart<"svg"> {
  return defineComponent({
    name: "LensoIcon",
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h(
          "svg",
          {
            "aria-hidden": "true",
            role: "presentation",
            fill: "none",
            height: size,
            width: size,
            viewBox,
            xmlns: "http://www.w3.org/2000/svg",
            ...attrs,
          },
          [
            h("path", {
              d: path,
              fill: "currentColor",
              "fill-rule": "evenodd",
              "clip-rule": "evenodd",
            }),
          ],
        );
    },
  }) as unknown as HtmlPart<"svg">;
}

export const IconChevronDown = icon(iconShapes.IconChevronDown);
export const IconChevronUp = icon(iconShapes.IconChevronUp);
export const IconChevronLeft = icon(iconShapes.IconChevronLeft);
export const IconChevronRight = icon(iconShapes.IconChevronRight);
export const ExternalLinkIcon = icon(iconShapes.ExternalLinkIcon);
export const CircleDashedIcon = icon(iconShapes.CircleDashedIcon);
export const CloseIcon = icon(iconShapes.CloseIcon);
export const InfoIcon = icon(iconShapes.InfoIcon);
export const WarningIcon = icon(iconShapes.WarningIcon);
export const DangerIcon = icon(iconShapes.DangerIcon);
export const SuccessIcon = icon(iconShapes.SuccessIcon);
export const IconMinus = icon(iconShapes.IconMinus);
export const IconPlus = icon(iconShapes.IconPlus);
export const IconSearch = icon(iconShapes.IconSearch);
export const IconCalendar = icon(iconShapes.IconCalendar);
