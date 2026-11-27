import { drawerStyles } from "@lenso/tokens/drawer";
import { modalStyles } from "@lenso/tokens/modal";
import {
  Drawer as SdkRoot,
  DrawerTrigger as SdkTrigger,
  DrawerBackdrop as SdkBackdrop,
  DrawerContent as SdkContent,
  DrawerTitle as SdkTitle,
  DrawerDescription as SdkDescription,
  DrawerClose as SdkClose,
  DrawerHandle as SdkHandle,
} from "@ui-sdk/solid/drawer";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const DrawerRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const DrawerTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "drawer-trigger",
  () => modalStyles.trigger,
);
export const DrawerBackdrop: StyledPart<
  typeof SdkBackdrop,
  { variant?: "transparent" | "opaque" | "blur" }
> = sdkPart<ComponentProps<typeof SdkBackdrop>, { variant?: "transparent" | "opaque" | "blur" }>(
  SdkBackdrop,
  "drawer-backdrop",
  (props) => [drawerStyles.backdrop, modalStyles[props.variant ?? "opaque"]],
  "variant",
);
export const DrawerContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "drawer-content",
  () => [drawerStyles.popup, drawerStyles.nativeContent],
);
export const DrawerTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "drawer-title",
  () => modalStyles.title,
);
export const DrawerDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "drawer-description",
  () => modalStyles.description,
);
export const DrawerClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "drawer-close",
  () => modalStyles.close,
);
export const DrawerHeader = htmlPart("div", "drawer-header", () => modalStyles.header);
export const DrawerBody = htmlPart("div", "drawer-body", () => modalStyles.body);
export const DrawerFooter = htmlPart("div", "drawer-footer", () => modalStyles.footer);
export const DrawerHandle: StyledPart<typeof SdkHandle> = sdkPart(
  SdkHandle,
  "drawer-handle",
  () => drawerStyles.handle,
);

export const DrawerLayout = htmlPart("div", "drawer-layout", () => drawerStyles.content);
export const Drawer: typeof DrawerRoot & {
  Layout: typeof DrawerLayout;
  Root: typeof DrawerRoot;
  Trigger: typeof DrawerTrigger;
  Backdrop: typeof DrawerBackdrop;
  Content: typeof DrawerContent;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Close: typeof DrawerClose;
  Header: typeof DrawerHeader;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
  Handle: typeof DrawerHandle;
} = Object.assign(DrawerRoot, {
  Layout: DrawerLayout,
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Backdrop: DrawerBackdrop,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
});
