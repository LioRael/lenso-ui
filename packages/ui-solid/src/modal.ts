import { modalStyles } from "@lenso/tokens/modal";
import {
  Dialog as SdkRoot,
  DialogTrigger as SdkTrigger,
  DialogBackdrop as SdkBackdrop,
  DialogContent as SdkContent,
  DialogTitle as SdkTitle,
  DialogDescription as SdkDescription,
  DialogClose as SdkClose,
} from "@ui-sdk/solid/dialog";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ModalRoot = (props: ComponentProps<typeof SdkRoot>) => createComponent(SdkRoot, props);
export const ModalTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "modal-trigger",
  () => modalStyles.trigger,
);
export const ModalBackdrop: StyledPart<
  typeof SdkBackdrop,
  { variant?: "transparent" | "opaque" | "blur" }
> = sdkPart<ComponentProps<typeof SdkBackdrop>, { variant?: "transparent" | "opaque" | "blur" }>(
  SdkBackdrop,
  "modal-backdrop",
  (props) => [modalStyles.backdrop, modalStyles[props.variant ?? "opaque"]],
  "variant",
);
export const ModalContent: StyledPart<
  typeof SdkContent,
  { size?: "xs" | "sm" | "md" | "lg" | "cover" | "full"; scroll?: "inside" | "outside" }
> = sdkPart<
  ComponentProps<typeof SdkContent>,
  { size?: "xs" | "sm" | "md" | "lg" | "cover" | "full"; scroll?: "inside" | "outside" }
>(
  SdkContent,
  "modal-content",
  (props) => [
    modalStyles.popup,
    modalStyles.nativeContent,
    modalStyles[props.size ?? "md"],
    modalStyles[props.scroll ?? "inside"],
  ],
  "size",
  "scroll",
);
export const ModalTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "modal-title",
  () => modalStyles.title,
);
export const ModalDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "modal-description",
  () => modalStyles.description,
);
export const ModalClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "modal-close",
  () => modalStyles.close,
);
export const ModalHeader = htmlPart("div", "modal-header", () => modalStyles.header);
export const ModalBody = htmlPart("div", "modal-body", () => modalStyles.body);
export const ModalFooter = htmlPart("div", "modal-footer", () => modalStyles.footer);
export const ModalIcon = htmlPart("div", "modal-icon", () => modalStyles.icon);

export const Modal: typeof ModalRoot & {
  Root: typeof ModalRoot;
  Trigger: typeof ModalTrigger;
  Backdrop: typeof ModalBackdrop;
  Content: typeof ModalContent;
  Title: typeof ModalTitle;
  Description: typeof ModalDescription;
  Close: typeof ModalClose;
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
  Icon: typeof ModalIcon;
} = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Icon: ModalIcon,
});
