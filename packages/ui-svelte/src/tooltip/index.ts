import TooltipTrigger from "./tooltip-trigger.svelte";
import TooltipContent from "./tooltip-content.svelte";
import TooltipArrow from "./tooltip-arrow.svelte";
import TooltipRoot from "./tooltip-root.svelte";

export { TooltipTrigger, TooltipContent, TooltipArrow, TooltipRoot };
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
