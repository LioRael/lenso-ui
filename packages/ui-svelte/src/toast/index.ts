import ToastRoot from "./toast-root.svelte";
import ToastRegion from "./toast-region.svelte";
import ToastProgress from "./toast-progress.svelte";
import ToastMarquee from "./toast-marquee.svelte";
import ToastTitle from "./toast-title.svelte";
import ToastDescription from "./toast-description.svelte";
import ToastAction from "./toast-action.svelte";
import ToastClose from "./toast-close.svelte";
import ToastContent from "./toast-content.svelte";
import ToastIndicator from "./toast-indicator.svelte";

export { createToaster, toast, type ToastData, type Toaster } from "@ui-sdk/svelte/toast";
export {
  ToastProgress,
  ToastMarquee,
  ToastRoot,
  ToastRegion,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastIndicator,
};
export const Toast: typeof ToastRoot & {
  Progress: typeof ToastProgress;
  Marquee: typeof ToastMarquee;
  Root: typeof ToastRoot;
  Region: typeof ToastRegion;
  Title: typeof ToastTitle;
  Description: typeof ToastDescription;
  Action: typeof ToastAction;
  Close: typeof ToastClose;
  Content: typeof ToastContent;
  Indicator: typeof ToastIndicator;
} = Object.assign(ToastRoot, {
  Progress: ToastProgress,
  Marquee: ToastMarquee,
  Root: ToastRoot,
  Region: ToastRegion,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  Indicator: ToastIndicator,
});

export type { ToastRootProps } from "./toast-root.svelte";
export type { ToastRegionProps } from "./toast-region.svelte";
