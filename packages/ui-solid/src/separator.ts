import { separatorStyles, separatorVariants } from "@lenso/tokens/separator";
import { Separator as SdkRoot } from "@ui-sdk/solid/separator";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const SeparatorRoot: StyledPart<
  typeof SdkRoot,
  { variant?: keyof typeof separatorVariants }
> = sdkPart<ComponentProps<typeof SdkRoot>, { variant?: keyof typeof separatorVariants }>(
  SdkRoot,
  "separator",
  (props) => [
    separatorStyles.root,
    separatorStyles[props.orientation ?? "horizontal"],
    separatorVariants[props.variant ?? "default"],
  ],
  "variant",
);

export const Separator: typeof SeparatorRoot & {
  Root: typeof SeparatorRoot;
} = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});
