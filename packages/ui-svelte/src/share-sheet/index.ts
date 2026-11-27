import { Sheet } from "../sheet/index.js";
import ShareSheetTrigger from "./share-sheet-trigger.svelte";
import ShareSheetBackdrop from "./share-sheet-backdrop.svelte";
import ShareSheetContent from "./share-sheet-content.svelte";
import ShareSheetSurface from "./share-sheet-surface.svelte";
import ShareSheetHeader from "./share-sheet-header.svelte";
import ShareSheetTitle from "./share-sheet-title.svelte";
import ShareSheetDescription from "./share-sheet-description.svelte";
import ShareSheetThumbnail from "./share-sheet-thumbnail.svelte";
import ShareSheetMetadata from "./share-sheet-metadata.svelte";
import ShareSheetBody from "./share-sheet-body.svelte";
import ShareSheetTargets from "./share-sheet-targets.svelte";
import ShareSheetTarget from "./share-sheet-target.svelte";
import ShareSheetTargetIcon from "./share-sheet-target-icon.svelte";
import ShareSheetContact from "./share-sheet-contact.svelte";
import ShareSheetActionGroup from "./share-sheet-action-group.svelte";
import ShareSheetActionRow from "./share-sheet-action-row.svelte";
import ShareSheetAction from "./share-sheet-action.svelte";
import ShareSheetRoot from "./share-sheet-root.svelte";

export {
  ShareSheetTrigger,
  ShareSheetBackdrop,
  ShareSheetContent,
  ShareSheetSurface,
  ShareSheetHeader,
  ShareSheetTitle,
  ShareSheetDescription,
  ShareSheetThumbnail,
  ShareSheetMetadata,
  ShareSheetBody,
  ShareSheetTargets,
  ShareSheetTarget,
  ShareSheetTargetIcon,
  ShareSheetContact,
  ShareSheetActionGroup,
  ShareSheetActionRow,
  ShareSheetAction,
  ShareSheetRoot,
};
export const ShareSheet: typeof ShareSheetRoot & {
  Handle: typeof Sheet.Handle;
  Close: typeof Sheet.Close;
  Root: typeof ShareSheetRoot;
  Trigger: typeof ShareSheetTrigger;
  Backdrop: typeof ShareSheetBackdrop;
  Content: typeof ShareSheetContent;
  Surface: typeof ShareSheetSurface;
  Header: typeof ShareSheetHeader;
  Title: typeof ShareSheetTitle;
  Description: typeof ShareSheetDescription;
  Thumbnail: typeof ShareSheetThumbnail;
  Metadata: typeof ShareSheetMetadata;
  Body: typeof ShareSheetBody;
  Targets: typeof ShareSheetTargets;
  Target: typeof ShareSheetTarget;
  TargetIcon: typeof ShareSheetTargetIcon;
  Contact: typeof ShareSheetContact;
  ActionGroup: typeof ShareSheetActionGroup;
  ActionRow: typeof ShareSheetActionRow;
  Action: typeof ShareSheetAction;
} = Object.assign(ShareSheetRoot, {
  Handle: Sheet.Handle,
  Close: Sheet.Close,
  Root: ShareSheetRoot,
  Trigger: ShareSheetTrigger,
  Backdrop: ShareSheetBackdrop,
  Content: ShareSheetContent,
  Surface: ShareSheetSurface,
  Header: ShareSheetHeader,
  Title: ShareSheetTitle,
  Description: ShareSheetDescription,
  Thumbnail: ShareSheetThumbnail,
  Metadata: ShareSheetMetadata,
  Body: ShareSheetBody,
  Targets: ShareSheetTargets,
  Target: ShareSheetTarget,
  TargetIcon: ShareSheetTargetIcon,
  Contact: ShareSheetContact,
  ActionGroup: ShareSheetActionGroup,
  ActionRow: ShareSheetActionRow,
  Action: ShareSheetAction,
});
