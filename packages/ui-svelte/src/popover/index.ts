import PopoverTrigger from "./popover-trigger.svelte";
import PopoverContent from "./popover-content.svelte";
import PopoverTitle from "./popover-title.svelte";
import PopoverDescription from "./popover-description.svelte";
import PopoverClose from "./popover-close.svelte";
import PopoverArrow from "./popover-arrow.svelte";
import PopoverRoot from "./popover-root.svelte";

export {
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
  PopoverArrow,
  PopoverRoot,
};
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
