import { sheetStyles } from "@lenso/tokens/sheet";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
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

export const SheetRoot = (props: ComponentProps<typeof SdkRoot>) => createComponent(SdkRoot, props);
export const SheetTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "sheet-trigger",
  () => modalStyles.trigger,
);
export const SheetBackdrop: StyledPart<typeof SdkBackdrop, { dim?: boolean }> = sdkPart<
  ComponentProps<typeof SdkBackdrop>,
  { dim?: boolean }
>(
  SdkBackdrop,
  "sheet-backdrop",
  (props) => [sheetStyles.backdrop, props.dim === false && sheetStyles.undimmed],
  "dim",
);
export const SheetContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "sheet-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    liquidMaterialStyles.small,
    liquidMaterialStyles.medium,
    sheetStyles.popup,
    sheetStyles.nativeContent,
  ],
);
export const SheetTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "sheet-title",
  () => sheetStyles.title,
);
export const SheetDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "sheet-description",
  () => undefined,
);
export const SheetClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "sheet-close",
  () => sheetStyles.close,
);
export const SheetHeader = htmlPart("div", "sheet-header", () => sheetStyles.header);
export const SheetBody = htmlPart("div", "sheet-body", () => sheetStyles.body);
export const SheetFooter = htmlPart("div", "sheet-footer", () => sheetStyles.footer);
export const SheetHandle: StyledPart<typeof SdkHandle> = sdkPart(
  SdkHandle,
  "sheet-handle",
  () => sheetStyles.handle,
);
export const SheetSurface = htmlPart("div", "sheet-surface", () => [
  materialStyles.root,
  materialStyles.accessible,
  sheetStyles.surface,
]);

export const Sheet: typeof SheetRoot & {
  Root: typeof SheetRoot;
  Trigger: typeof SheetTrigger;
  Backdrop: typeof SheetBackdrop;
  Content: typeof SheetContent;
  Title: typeof SheetTitle;
  Description: typeof SheetDescription;
  Close: typeof SheetClose;
  Header: typeof SheetHeader;
  Body: typeof SheetBody;
  Footer: typeof SheetFooter;
  Handle: typeof SheetHandle;
  Surface: typeof SheetSurface;
} = Object.assign(SheetRoot, {
  Root: SheetRoot,
  Trigger: SheetTrigger,
  Backdrop: SheetBackdrop,
  Content: SheetContent,
  Title: SheetTitle,
  Description: SheetDescription,
  Close: SheetClose,
  Header: SheetHeader,
  Body: SheetBody,
  Footer: SheetFooter,
  Handle: SheetHandle,
  Surface: SheetSurface,
});
