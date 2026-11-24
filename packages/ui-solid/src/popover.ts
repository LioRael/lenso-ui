import { popoverStyles } from "@lenso/tokens/popover";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Popover as SdkRoot,
  PopoverTrigger as SdkTrigger,
  PopoverContent as SdkContent,
  PopoverTitle as SdkTitle,
  PopoverDescription as SdkDescription,
  PopoverClose as SdkClose,
  PopoverArrow as SdkArrow,
} from "@ui-sdk/solid/popover";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const PopoverRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const PopoverTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "popover-trigger",
  () => popoverStyles.trigger,
);
export const PopoverContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "popover-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.anchored,
    popoverStyles.positioner,
    popoverStyles.popup,
  ],
);
export const PopoverTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "popover-title",
  () => popoverStyles.title,
);
export const PopoverDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "popover-description",
  () => popoverStyles.description,
);
export const PopoverClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "popover-close",
  () => undefined,
);
export const PopoverArrow: StyledPart<typeof SdkArrow> = sdkPart(
  SdkArrow,
  "popover-arrow",
  () => popoverStyles.arrow,
);

export const Popover: typeof PopoverRoot & {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
  Title: typeof PopoverTitle;
  Description: typeof PopoverDescription;
  Close: typeof PopoverClose;
  Arrow: typeof PopoverArrow;
} = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Title: PopoverTitle,
  Description: PopoverDescription,
  Close: PopoverClose,
  Arrow: PopoverArrow,
});
