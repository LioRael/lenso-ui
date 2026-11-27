import ActionSheetTrigger from "./action-sheet-trigger.svelte";
import ActionSheetBackdrop from "./action-sheet-backdrop.svelte";
import ActionSheetContent from "./action-sheet-content.svelte";
import ActionSheetTitle from "./action-sheet-title.svelte";
import ActionSheetDescription from "./action-sheet-description.svelte";
import ActionSheetClose from "./action-sheet-close.svelte";
import ActionSheetHeader from "./action-sheet-header.svelte";
import ActionSheetActions from "./action-sheet-actions.svelte";
import ActionSheetAction from "./action-sheet-action.svelte";
import ActionSheetRoot from "./action-sheet-root.svelte";

export {
  ActionSheetTrigger,
  ActionSheetBackdrop,
  ActionSheetContent,
  ActionSheetTitle,
  ActionSheetDescription,
  ActionSheetClose,
  ActionSheetHeader,
  ActionSheetActions,
  ActionSheetAction,
  ActionSheetRoot,
};
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
