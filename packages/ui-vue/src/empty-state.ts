import { emptyStateStyles } from "@lenso/tokens/empty-state";
import { htmlPart } from "./parts.js";

export const EmptyStateRoot = htmlPart("div", "empty-state", () => emptyStateStyles.root);
export const EmptyStateContent = htmlPart(
  "div",
  "empty-state-content",
  () => emptyStateStyles.content,
);
export const EmptyStateMessage = htmlPart(
  "div",
  "empty-state-message",
  () => emptyStateStyles.message,
);
export const EmptyStateTitle = htmlPart("h3", "empty-state-title", () => emptyStateStyles.title);
export const EmptyStateDescription = htmlPart(
  "p",
  "empty-state-description",
  () => emptyStateStyles.description,
);
export const EmptyStateActions = htmlPart(
  "div",
  "empty-state-actions",
  () => emptyStateStyles.actions,
);
export const EmptyStateIcon = htmlPart<"div", { variant?: "plain" | "circle" }>(
  "div",
  "empty-state-icon",
  (props) => [emptyStateStyles.icon, props.variant === "circle" && emptyStateStyles.circle],
  "variant",
);

export const EmptyState: typeof EmptyStateRoot & {
  Root: typeof EmptyStateRoot;
  Content: typeof EmptyStateContent;
  Message: typeof EmptyStateMessage;
  Title: typeof EmptyStateTitle;
  Description: typeof EmptyStateDescription;
  Actions: typeof EmptyStateActions;
  Icon: typeof EmptyStateIcon;
} = Object.assign(EmptyStateRoot, {
  Root: EmptyStateRoot,
  Content: EmptyStateContent,
  Message: EmptyStateMessage,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
  Icon: EmptyStateIcon,
});
