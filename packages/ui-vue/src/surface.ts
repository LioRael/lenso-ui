import { surfaceStyles, surfaceVariants, groupStyles } from "@lenso/tokens/surface";
import { materialStyles } from "@lenso/tokens/materials";
import { htmlPart } from "./parts.js";

export const SurfaceRoot = htmlPart<"div", { variant?: keyof typeof surfaceVariants }>(
  "div",
  "surface",
  (props) => [
    props.variant === "glass" && materialStyles.root,
    props.variant === "glass" && materialStyles.thick,
    surfaceStyles.root,
    (!props.variant || props.variant === "default") && groupStyles.surface,
    surfaceVariants[props.variant ?? "default"],
    props.variant === "glass" && materialStyles.accessible,
  ],
  "variant",
);

export const Surface: typeof SurfaceRoot & {
  Root: typeof SurfaceRoot;
} = Object.assign(SurfaceRoot, {
  Root: SurfaceRoot,
});
