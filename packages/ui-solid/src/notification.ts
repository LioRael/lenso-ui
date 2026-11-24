import { notificationStyles } from "@lenso/tokens/notification";
import {
  Collapsible as SdkRoot,
  CollapsibleTrigger as SdkTrigger,
  CollapsiblePanel as SdkPanel,
} from "@ui-sdk/solid/collapsible";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const NotificationRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "notification",
  () => notificationStyles.root,
);
export const NotificationHeader = htmlPart(
  "div",
  "notification-header",
  () => notificationStyles.header,
);
export const NotificationTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "notification-trigger",
  () => notificationStyles.trigger,
);
export const NotificationIcon = htmlPart(
  "span",
  "notification-icon",
  () => notificationStyles.icon,
);
export const NotificationContent = htmlPart(
  "div",
  "notification-content",
  () => notificationStyles.content,
);
export const NotificationTitle = htmlPart(
  "div",
  "notification-title",
  () => notificationStyles.title,
);
export const NotificationDescription = htmlPart(
  "div",
  "notification-description",
  () => notificationStyles.description,
);
export const NotificationTime = htmlPart(
  "time",
  "notification-time",
  () => notificationStyles.time,
);
export const NotificationPanel: StyledPart<typeof SdkPanel> = sdkPart(
  SdkPanel,
  "notification-panel",
  () => notificationStyles.panel,
);
export const NotificationBody = htmlPart("div", "notification-body", () => notificationStyles.body);
export const NotificationPreview = htmlPart(
  "div",
  "notification-preview",
  () => notificationStyles.preview,
);
export const NotificationActions = htmlPart(
  "div",
  "notification-actions",
  () => notificationStyles.actions,
);

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
