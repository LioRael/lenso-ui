import { tooltipStyles } from "@lenso/tokens/tooltip";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Tooltip as SdkRoot,
  TooltipTrigger as SdkTrigger,
  TooltipContent as SdkContent,
  TooltipArrow as SdkArrow,
} from "@ui-sdk/solid/tooltip";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const TooltipRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const TooltipTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "tooltip-trigger",
  () => tooltipStyles.trigger,
);
export const TooltipContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "tooltip-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.blur,
    tooltipStyles.positioner,
    tooltipStyles.popup,
  ],
);
export const TooltipArrow: StyledPart<typeof SdkArrow> = sdkPart(
  SdkArrow,
  "tooltip-arrow",
  () => tooltipStyles.arrow,
);

export const Tooltip: typeof TooltipRoot & {
  Root: typeof TooltipRoot;
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
  Arrow: typeof TooltipArrow;
} = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});
