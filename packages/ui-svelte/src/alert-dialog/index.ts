import AlertDialogTrigger from "./alert-dialog-trigger.svelte";
import AlertDialogBackdrop from "./alert-dialog-backdrop.svelte";
import AlertDialogContent from "./alert-dialog-content.svelte";
import AlertDialogTitle from "./alert-dialog-title.svelte";
import AlertDialogDescription from "./alert-dialog-description.svelte";
import AlertDialogClose from "./alert-dialog-close.svelte";
import AlertDialogHeader from "./alert-dialog-header.svelte";
import AlertDialogBody from "./alert-dialog-body.svelte";
import AlertDialogFooter from "./alert-dialog-footer.svelte";
import AlertDialogAction from "./alert-dialog-action.svelte";
import AlertDialogFields from "./alert-dialog-fields.svelte";
import AlertDialogIcon from "./alert-dialog-icon.svelte";
import AlertDialogRoot from "./alert-dialog-root.svelte";

export {
  AlertDialogTrigger,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogFields,
  AlertDialogIcon,
  AlertDialogRoot,
};
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
