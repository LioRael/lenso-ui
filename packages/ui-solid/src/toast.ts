import { toastStyles } from "@lenso/tokens/toast";
import {
  Toast as SdkRoot,
  ToastRegion as SdkRegion,
  ToastTitle as SdkTitle,
  ToastDescription as SdkDescription,
  ToastAction as SdkAction,
  ToastClose as SdkClose,
} from "@ui-sdk/solid/toast";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ToastRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "toast",
  () => toastStyles.root,
);
export const ToastRegion: StyledPart<typeof SdkRegion> = sdkPart(
  SdkRegion,
  "toast-region",
  () => toastStyles.viewport,
);
export const ToastTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "toast-title",
  () => toastStyles.title,
);
export const ToastDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "toast-description",
  () => toastStyles.description,
);
export const ToastAction: StyledPart<typeof SdkAction> = sdkPart(
  SdkAction,
  "toast-action",
  () => toastStyles.action,
);
export const ToastClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "toast-close",
  () => toastStyles.close,
);
export const ToastContent = htmlPart("div", "toast-content", () => toastStyles.content);
export const ToastIndicator = htmlPart("span", "toast-indicator", () => toastStyles.indicator);

export { createToaster, toast, type ToastData, type Toaster } from "@ui-sdk/solid/toast";

export const Toast: typeof ToastRoot & {
  Root: typeof ToastRoot;
  Region: typeof ToastRegion;
  Title: typeof ToastTitle;
  Description: typeof ToastDescription;
  Action: typeof ToastAction;
  Close: typeof ToastClose;
  Content: typeof ToastContent;
  Indicator: typeof ToastIndicator;
} = Object.assign(ToastRoot, {
  Root: ToastRoot,
  Region: ToastRegion,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Content: ToastContent,
  Indicator: ToastIndicator,
});
