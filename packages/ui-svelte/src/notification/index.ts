import NotificationRoot from "./notification-root.svelte";
import NotificationHeader from "./notification-header.svelte";
import NotificationTrigger from "./notification-trigger.svelte";
import NotificationIcon from "./notification-icon.svelte";
import NotificationContent from "./notification-content.svelte";
import NotificationTitle from "./notification-title.svelte";
import NotificationDescription from "./notification-description.svelte";
import NotificationTime from "./notification-time.svelte";
import NotificationPanel from "./notification-panel.svelte";
import NotificationBody from "./notification-body.svelte";
import NotificationPreview from "./notification-preview.svelte";
import NotificationActions from "./notification-actions.svelte";

export {
  NotificationRoot,
  NotificationHeader,
  NotificationTrigger,
  NotificationIcon,
  NotificationContent,
  NotificationTitle,
  NotificationDescription,
  NotificationTime,
  NotificationPanel,
  NotificationBody,
  NotificationPreview,
  NotificationActions,
};
export const Notification: typeof NotificationRoot & {
  Root: typeof NotificationRoot;
  Header: typeof NotificationHeader;
  Trigger: typeof NotificationTrigger;
  Icon: typeof NotificationIcon;
  Content: typeof NotificationContent;
  Title: typeof NotificationTitle;
  Description: typeof NotificationDescription;
  Time: typeof NotificationTime;
  Panel: typeof NotificationPanel;
  Body: typeof NotificationBody;
  Preview: typeof NotificationPreview;
  Actions: typeof NotificationActions;
} = Object.assign(NotificationRoot, {
  Root: NotificationRoot,
  Header: NotificationHeader,
  Trigger: NotificationTrigger,
  Icon: NotificationIcon,
  Content: NotificationContent,
  Title: NotificationTitle,
  Description: NotificationDescription,
  Time: NotificationTime,
  Panel: NotificationPanel,
  Body: NotificationBody,
  Preview: NotificationPreview,
  Actions: NotificationActions,
});
