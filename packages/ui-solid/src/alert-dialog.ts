import { alertDialogStyles } from "@lenso/tokens/alert-dialog";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { modalStyles } from "@lenso/tokens/modal";
import {
  AlertDialog as SdkRoot,
  AlertDialogTrigger as SdkTrigger,
  AlertDialogBackdrop as SdkBackdrop,
  AlertDialogContent as SdkContent,
  AlertDialogTitle as SdkTitle,
  AlertDialogDescription as SdkDescription,
  AlertDialogClose as SdkClose,
  AlertDialogClose as SdkAction,
} from "@ui-sdk/solid/alert-dialog";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const AlertDialogRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const AlertDialogTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "alert-dialog-trigger",
  () => alertDialogStyles.trigger,
);
export const AlertDialogBackdrop: StyledPart<
  typeof SdkBackdrop,
  { variant?: "transparent" | "opaque" | "blur" }
> = sdkPart<ComponentProps<typeof SdkBackdrop>, { variant?: "transparent" | "opaque" | "blur" }>(
  SdkBackdrop,
  "alert-dialog-backdrop",
  (props) => [alertDialogStyles.backdrop, modalStyles[props.variant ?? "opaque"]],
  "variant",
);
export const AlertDialogContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "alert-dialog-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    liquidMaterialStyles.small,
    liquidMaterialStyles.medium,
    alertDialogStyles.popup,
    alertDialogStyles.nativeContent,
  ],
);
export const AlertDialogTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "alert-dialog-title",
  () => alertDialogStyles.title,
);
export const AlertDialogDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "alert-dialog-description",
  () => alertDialogStyles.description,
);
export const AlertDialogClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "alert-dialog-close",
  () => alertDialogStyles.close,
);
export const AlertDialogHeader = htmlPart(
  "div",
  "alert-dialog-header",
  () => alertDialogStyles.header,
);
export const AlertDialogBody = htmlPart("div", "alert-dialog-body", () => alertDialogStyles.body);
export const AlertDialogFooter = htmlPart(
  "div",
  "alert-dialog-footer",
  () => alertDialogStyles.footer,
);
export const AlertDialogAction: StyledPart<typeof SdkAction> = sdkPart(
  SdkAction,
  "alert-dialog-action",
  () => alertDialogStyles.action,
);
export const AlertDialogFields = htmlPart(
  "div",
  "alert-dialog-fields",
  () => alertDialogStyles.fields,
);
export const AlertDialogIcon = htmlPart("div", "alert-dialog-icon", () => alertDialogStyles.icon);

export const AlertDialog: typeof AlertDialogRoot & {
  Root: typeof AlertDialogRoot;
  Trigger: typeof AlertDialogTrigger;
  Backdrop: typeof AlertDialogBackdrop;
  Content: typeof AlertDialogContent;
  Title: typeof AlertDialogTitle;
  Description: typeof AlertDialogDescription;
  Close: typeof AlertDialogClose;
  Header: typeof AlertDialogHeader;
  Body: typeof AlertDialogBody;
  Footer: typeof AlertDialogFooter;
  Action: typeof AlertDialogAction;
  Fields: typeof AlertDialogFields;
  Icon: typeof AlertDialogIcon;
} = Object.assign(AlertDialogRoot, {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Backdrop: AlertDialogBackdrop,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Close: AlertDialogClose,
  Header: AlertDialogHeader,
  Body: AlertDialogBody,
  Footer: AlertDialogFooter,
  Action: AlertDialogAction,
  Fields: AlertDialogFields,
  Icon: AlertDialogIcon,
});
