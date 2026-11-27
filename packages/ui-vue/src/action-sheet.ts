import { actionSheetStyles } from "@lenso/tokens/action-sheet";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { modalStyles } from "@lenso/tokens/modal";
import {
  Dialog as SdkRoot,
  DialogTrigger as SdkTrigger,
  DialogBackdrop as SdkBackdrop,
  DialogContent as SdkContent,
  DialogTitle as SdkTitle,
  DialogDescription as SdkDescription,
  DialogClose as SdkClose,
  DialogClose as SdkAction,
} from "@ui-sdk/vue/dialog";
import { forwardPart, htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ActionSheetRoot: typeof SdkRoot = forwardPart(SdkRoot);
export const ActionSheetTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "action-sheet-trigger",
  () => modalStyles.trigger,
);
export const ActionSheetBackdrop: StyledPart<typeof SdkBackdrop, { dim?: boolean }> = sdkPart<
  typeof SdkBackdrop,
  { dim?: boolean }
>(
  SdkBackdrop,
  "action-sheet-backdrop",
  (props) => [actionSheetStyles.backdrop, props.dim === false && actionSheetStyles.undimmed],
  "dim",
);
export const ActionSheetContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "action-sheet-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    liquidMaterialStyles.small,
    liquidMaterialStyles.medium,
    actionSheetStyles.popup,
    actionSheetStyles.nativeContent,
  ],
);
export const ActionSheetTitle: StyledPart<typeof SdkTitle> = sdkPart(
  SdkTitle,
  "action-sheet-title",
  () => actionSheetStyles.title,
);
export const ActionSheetDescription: StyledPart<typeof SdkDescription> = sdkPart(
  SdkDescription,
  "action-sheet-description",
  () => actionSheetStyles.description,
);
export const ActionSheetClose: StyledPart<typeof SdkClose> = sdkPart(
  SdkClose,
  "action-sheet-close",
  () => actionSheetStyles.action,
);
export const ActionSheetHeader = htmlPart(
  "div",
  "action-sheet-header",
  () => actionSheetStyles.header,
);
export const ActionSheetActions = htmlPart(
  "div",
  "action-sheet-actions",
  () => actionSheetStyles.actions,
);
export const ActionSheetAction: StyledPart<typeof SdkAction, { destructive?: boolean }> = sdkPart<
  typeof SdkAction,
  { destructive?: boolean }
>(
  SdkAction,
  "action-sheet-action",
  (props) => [actionSheetStyles.action, props.destructive && actionSheetStyles.destructive],
  "destructive",
);

export const ActionSheet: typeof ActionSheetRoot & {
  Root: typeof ActionSheetRoot;
  Trigger: typeof ActionSheetTrigger;
  Backdrop: typeof ActionSheetBackdrop;
  Content: typeof ActionSheetContent;
  Title: typeof ActionSheetTitle;
  Description: typeof ActionSheetDescription;
  Close: typeof ActionSheetClose;
  Header: typeof ActionSheetHeader;
  Actions: typeof ActionSheetActions;
  Action: typeof ActionSheetAction;
} = Object.assign(ActionSheetRoot, {
  Root: ActionSheetRoot,
  Trigger: ActionSheetTrigger,
  Backdrop: ActionSheetBackdrop,
  Content: ActionSheetContent,
  Title: ActionSheetTitle,
  Description: ActionSheetDescription,
  Close: ActionSheetClose,
  Header: ActionSheetHeader,
  Actions: ActionSheetActions,
  Action: ActionSheetAction,
});
