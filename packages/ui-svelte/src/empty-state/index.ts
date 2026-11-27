import EmptyStateRoot from "./empty-state-root.svelte";
import EmptyStateContent from "./empty-state-content.svelte";
import EmptyStateMessage from "./empty-state-message.svelte";
import EmptyStateTitle from "./empty-state-title.svelte";
import EmptyStateDescription from "./empty-state-description.svelte";
import EmptyStateActions from "./empty-state-actions.svelte";
import EmptyStateIcon from "./empty-state-icon.svelte";

export {
  EmptyStateRoot,
  EmptyStateContent,
  EmptyStateMessage,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  EmptyStateIcon,
};
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
