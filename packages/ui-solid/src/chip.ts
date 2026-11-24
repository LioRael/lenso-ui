import {
  chipStyles,
  chipPrimary,
  chipSoft,
  chipColors,
  chipSizes,
  chipVariants,
} from "@lenso/tokens/chip";
import { htmlPart } from "./parts.js";

export const ChipRoot = htmlPart<
  "span",
  {
    color?: keyof typeof chipColors;
    size?: keyof typeof chipSizes;
    variant?: "primary" | "secondary" | "soft" | "tertiary";
  }
>(
  "span",
  "chip",
  (props) => [
    chipStyles.root,
    chipSizes[props.size ?? "md"],
    chipColors[props.color ?? "default"],
    props.variant === "primary" && chipPrimary[props.color ?? "default"],
    props.variant === "soft" && chipSoft[props.color ?? "default"],
    props.variant === "tertiary" && chipVariants.tertiary,
  ],
  "color",
  "size",
  "variant",
);
export const ChipLabel = htmlPart("span", "chip-label", () => chipStyles.label);

export const Chip = Object.assign(ChipRoot, {
  Root: ChipRoot,
  Label: ChipLabel,
});
